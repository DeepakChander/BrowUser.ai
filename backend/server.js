const express = require('express');
const dotenv = require('dotenv');
const { google } = require('googleapis');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables from .env file
dotenv.config({ path: './.env' });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to parse JSON bodies
app.use(express.json());

// Supabase Client (using Service Role Key for server-side security)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Google OAuth Configuration
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_CALLBACK_URL
);

// Define the scopes needed for your agent
const SCOPES = [
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/drive'
];

// --- 🔒 Encryption Placeholders ---
// In a production environment, use 'crypto' module with AES-256-GCM
function encryptToken(token) {
  // TODO: Implement robust encryption
  return token;
}

function decryptToken(encryptedToken) {
  // TODO: Implement robust decryption
  return encryptedToken;
}

// --- 🔄 Token Refresh Utility ---
async function getValidAccessToken(userId) {
  try {
    // 1. Fetch the encrypted refresh token from Supabase
    const { data: tokenData, error: dbError } = await supabase
      .from('oauth_tokens')
      .select('refresh_token')
      .eq('user_id', userId)
      .single();

    if (dbError || !tokenData) {
      throw new Error('User token not found');
    }

    // 2. Decrypt the refresh token
    const refreshToken = decryptToken(tokenData.refresh_token);

    // 3. Set credentials on the OAuth client
    oauth2Client.setCredentials({
      refresh_token: refreshToken
    });

    // 4. Request a new Access Token
    // getAccessToken() automatically refreshes if needed using the refresh_token
    const { token: newAccessToken, res: tokenResponse } = await oauth2Client.getAccessToken();

    if (!newAccessToken) {
      throw new Error('Failed to refresh access token');
    }

    // 5. Update Supabase with new token details if they changed (optional but good practice)
    // Note: getAccessToken might not always return a new refresh_token, but it returns expiry
    if (tokenResponse && tokenResponse.data && tokenResponse.data.expiry_date) {
      await supabase
        .from('oauth_tokens')
        .update({
          // access_token: newAccessToken, // Uncomment if you decide to store access_token
          expires_at: new Date(tokenResponse.data.expiry_date).toISOString()
        })
        .eq('user_id', userId);
    }

    return newAccessToken;

  } catch (error) {
    console.error('Token Refresh Error:', error.message);
    throw error;
  }
}

// --- Routes ---

// 1. Initiates the Google login process
app.get('/auth/google', (req, res) => {
  const authorizationUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline', // CRITICAL: Ensures we get a refresh token
    scope: SCOPES,
    include_granted_scopes: true,
    prompt: 'consent' // Forces consent screen to ensure refresh token is returned
  });
  res.redirect(authorizationUrl);
});

// 2. Handles the redirect from Google
app.get('/auth/google/callback', async (req, res) => {
  const { code } = req.query;

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const userinfo = google.oauth2({ version: 'v2', auth: oauth2Client });
    const profile = await userinfo.userinfo.get();

    // 1. Store/Update User
    const { data: userData, error: userError } = await supabase
      .from('users')
      .upsert({
        google_id: profile.data.id,
        email: profile.data.email,
        display_name: profile.data.name,
      }, { onConflict: 'google_id' })
      .select('id')
      .single();

    if (userError) throw userError;
    const user_id = userData.id;

    // 2. Store Refresh Token
    if (tokens.refresh_token) {
      const { error: tokenError } = await supabase
        .from('oauth_tokens')
        .upsert({
          user_id: user_id,
          service: 'google',
          refresh_token: encryptToken(tokens.refresh_token),
          expires_at: new Date(tokens.expiry_date).toISOString(),
        }, { onConflict: 'user_id' });

      if (tokenError) throw tokenError;
    }

    res.redirect('http://localhost:3000/?status=success');

  } catch (error) {
    console.error('OAuth Error:', error);
    res.redirect('http://localhost:3000/?status=error');
  }
});

// 3. API Endpoint to get a fresh token (Protected)
app.get('/api/token/refresh', async (req, res) => {
  const { userId } = req.query; // In production, extract this from a session/JWT

  if (!userId) {
    return res.status(400).json({ error: 'Missing userId' });
  }

  try {
    const accessToken = await getValidAccessToken(userId);
    res.json({ accessToken });
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized: Could not refresh token' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend Server running on port ${PORT}`);
  console.log(`OAuth Initiator: http://localhost:${PORT}/auth/google`);
});
