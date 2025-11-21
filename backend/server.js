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

// Supabase Client
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

const SCOPES = [
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/drive'
];

// --- 🔒 Encryption Placeholders ---
function encryptToken(token) { return token; }
function decryptToken(encryptedToken) { return encryptedToken; }

// --- 🔄 Token Refresh Utility ---
async function getValidAccessToken(userId) {
  try {
    const { data: tokenData, error: dbError } = await supabase
      .from('oauth_tokens')
      .select('refresh_token')
      .eq('user_id', userId)
      .single();

    if (dbError || !tokenData) throw new Error('User token not found');

    const refreshToken = decryptToken(tokenData.refresh_token);
    oauth2Client.setCredentials({ refresh_token: refreshToken });

    const { token: newAccessToken, res: tokenResponse } = await oauth2Client.getAccessToken();

    if (!newAccessToken) throw new Error('Failed to refresh access token');

    if (tokenResponse && tokenResponse.data && tokenResponse.data.expiry_date) {
      await supabase
        .from('oauth_tokens')
        .update({ expires_at: new Date(tokenResponse.data.expiry_date).toISOString() })
        .eq('user_id', userId);
    }

    return newAccessToken;
  } catch (error) {
    console.error('Token Refresh Error:', error.message);
    throw error;
  }
}

// --- 🤖 Agent Executor (Gemini Placeholder) ---
async function agentExecutor(accessToken, query) {
  // Placeholder for Gemini API integration
  console.log(`[Agent] Executing with Token: ${accessToken.substring(0, 10)}...`);

  return {
    message: `Agent received valid token. Preparing to execute task: "${query}"`,
    accessToken: `${accessToken.substring(0, 15)}...[truncated]`
  };
}

// --- Routes ---

app.get('/auth/google', (req, res) => {
  const authorizationUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    include_granted_scopes: true,
    prompt: 'consent'
  });
  res.redirect(authorizationUrl);
});

app.get('/auth/google/callback', async (req, res) => {
  const { code } = req.query;
  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const userinfo = google.oauth2({ version: 'v2', auth: oauth2Client });
    const profile = await userinfo.userinfo.get();

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

    res.redirect(`http://localhost:3000/?status=success&uid=${user_id}`);
  } catch (error) {
    console.error('OAuth Error:', error);
    res.redirect('http://localhost:3000/?status=error');
  }
});

app.get('/api/token/refresh', async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'Missing userId' });

  try {
    const accessToken = await getValidAccessToken(userId);
    res.json({ accessToken });
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized' });
  }
});

// --- New Chat Route ---
app.post('/api/chat/query', async (req, res) => {
  const { query, userId } = req.body;

  if (!userId || !query) {
    return res.status(400).json({ error: 'Missing userId or query' });
  }

  try {
    // 1. Credential Check (Server-side validation)
    // Even if client sent a token, we verify/refresh it here to be safe
    const validAccessToken = await getValidAccessToken(userId);

    // 2. Execute Agent
    const response = await agentExecutor(validAccessToken, query);

    res.json({ response });

  } catch (error) {
    console.error('Chat Processing Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend Server running on port ${PORT}`);
  console.log(`OAuth Initiator: http://localhost:${PORT}/auth/google`);
});
