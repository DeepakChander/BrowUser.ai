const express = require('express');
const dotenv = require('dotenv');
const { google } = require('googleapis');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables from .env file
dotenv.config({ path: './.env' });

const app = express();
const PORT = process.env.PORT || 5000;

// Supabase Client (using Service Role Key for server-side security)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Google OAuth Configuration
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_CALLBACK_URL // http://localhost:5000/auth/google/callback
);

// Define the scopes needed for your agent
const SCOPES = [
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/gmail.send', // Agent can send emails
  'https://www.googleapis.com/auth/drive'       // Agent can access Docs/Sheets
];

// 1. Initiates the Google login process
app.get('/auth/google', (req, res) => {
  const authorizationUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline', // THIS IS CRITICAL TO GET THE REFRESH TOKEN
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
    // Exchange the authorization code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens); // Set credentials on the client for user info lookup

    // Fetch user profile information
    const userinfo = google.oauth2({ version: 'v2', auth: oauth2Client });
    const profile = await userinfo.userinfo.get();

    // --- 🔑 Secure Storage Logic ---

    // 1. Store/Update User in Users Table
    // Note: Using lowercase table names to match standard SQL creation
    const { data: userData, error: userError } = await supabase
      .from('users')
      .upsert({
        google_id: profile.data.id,
        email: profile.data.email,
        display_name: profile.data.name,
      }, { onConflict: 'google_id' }) // Update if Google ID exists
      .select('id')
      .single();

    if (userError) throw userError;
    const user_id = userData.id;

    // 2. Store the Refresh Token in the OAuthTokens Table
    if (tokens.refresh_token) {
      // NOTE: In a production environment, tokens.refresh_token MUST be encrypted
      const { error: tokenError } = await supabase
        .from('oauth_tokens')
        .upsert({
          user_id: user_id,
          service: 'google',
          // Assuming you implement encryption: encrypt(tokens.refresh_token)
          refresh_token: tokens.refresh_token,
          // access_token: tokens.access_token, // Removed as it was not in the initial schema
          expires_at: new Date(tokens.expiry_date).toISOString(),
        }, { onConflict: 'user_id' }); // Only one Google token per user

      if (tokenError) throw tokenError;
    }

    // Redirect to the frontend success page (e.g., the chat UI)
    res.redirect('http://localhost:3000/chat?status=success');

  } catch (error) {
    console.error('OAuth Error:', error);
    // Redirect to frontend error page
    res.redirect('http://localhost:3000/login?status=error');
  }
});

app.listen(PORT, () => {
  console.log(`Backend Server running on port ${PORT}`);
  console.log(`OAuth Initiator: http://localhost:${PORT}/auth/google`);
});
