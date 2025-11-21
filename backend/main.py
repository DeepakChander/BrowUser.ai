from fastapi import FastAPI, Request, HTTPException, Depends
from fastapi.responses import RedirectResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import json
from dotenv import load_dotenv
from supabase import create_client, Client
import openai
from google_auth_oauthlib.flow import Flow
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request as GoogleRequest
import requests
from datetime import datetime

# Load environment variables
load_dotenv()

app = FastAPI()

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_CALLBACK_URL = os.getenv("GOOGLE_CALLBACK_URL")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Initialize Clients
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
openai.api_key = OPENAI_API_KEY

# Google OAuth Configuration
SCOPES = [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/drive'
]

# --- 🔒 Encryption Placeholders ---
def encrypt_token(token: str) -> str:
    # TODO: Implement AES encryption
    return token

def decrypt_token(encrypted_token: str) -> str:
    # TODO: Implement AES decryption
    return encrypted_token

# --- 🔄 Token Refresh Utility ---
def get_valid_access_token(user_id: str):
    try:
        # 1. Fetch Refresh Token from Supabase
        response = supabase.table('oauth_tokens').select('refresh_token').eq('user_id', user_id).single().execute()
        
        if not response.data:
            raise Exception("User token not found")
            
        refresh_token = decrypt_token(response.data['refresh_token'])
        
        # 2. Refresh the Token using Google's Endpoint manually (simpler than using the lib for just refresh)
        token_url = "https://oauth2.googleapis.com/token"
        data = {
            'client_id': GOOGLE_CLIENT_ID,
            'client_secret': GOOGLE_CLIENT_SECRET,
            'refresh_token': refresh_token,
            'grant_type': 'refresh_token'
        }
        
        refresh_response = requests.post(token_url, data=data)
        
        if refresh_response.status_code != 200:
            raise Exception(f"Failed to refresh token: {refresh_response.text}")
            
        tokens = refresh_response.json()
        new_access_token = tokens['access_token']
        
        # 3. Update Supabase (if expiry provided)
        # Note: Google doesn't always return a new refresh token, but always an access token
        # We update expiry if available
        if 'expires_in' in tokens:
             # Calculate expiry date (approximate)
             # In a real app, calculate exact timestamp
             pass 

        return new_access_token

    except Exception as e:
        print(f"Token Refresh Error: {str(e)}")
        raise HTTPException(status_code=401, detail="Could not refresh token")

# --- 🤖 Agent Executor (OpenAI) ---
async def agent_executor(access_token: str, query: str):
    print(f"[Agent] Executing with Token: {access_token[:10]}...")
    
    try:
        system_prompt = f"""
You are BrowUser.ai, an intelligent automation agent.
You have access to a user's Google account via an Access Token.
Current Access Token: {access_token} (Do not output this token to the user).

Your capabilities:
1. Read/Send Emails (Gmail)
2. Manage Files (Drive)
3. General Assistance

The user has asked: "{query}"

Your goal right now is to:
1. Acknowledge the user's request.
2. Explain technically how you WOULD execute it using the Google API.
3. Confirm that you have the valid credentials to do so.

Keep your response concise and professional.
        """

        completion = openai.chat.completions.create(
            model="gpt-3.5-turbo", # Cost-effective model
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": query}
            ]
        )

        return {
            "message": completion.choices[0].message.content,
            "accessToken": f"{access_token[:15]}...[truncated]"
        }

    except Exception as e:
        print(f"OpenAI Error: {str(e)}")
        return {
            "message": "I connected to the agent brain, but encountered an error processing your request with OpenAI.",
            "error": str(e)
        }

# --- Routes ---

@app.get("/")
def read_root():
    return {"status": "BrowUser.ai Backend is Running (Python)"}

@app.get("/auth/google")
def login_google():
    # Create flow instance to generate URL
    # Note: In production, use a proper state parameter for security
    flow = Flow.from_client_config(
        {
            "web": {
                "client_id": GOOGLE_CLIENT_ID,
                "client_secret": GOOGLE_CLIENT_SECRET,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
            }
        },
        scopes=SCOPES,
        redirect_uri=GOOGLE_CALLBACK_URL
    )
    
    authorization_url, state = flow.authorization_url(
        access_type='offline',
        include_granted_scopes='true',
        prompt='consent'
    )
    
    return RedirectResponse(authorization_url)

@app.get("/auth/google/callback")
def callback_google(code: str):
    try:
        # Exchange code for tokens
        token_url = "https://oauth2.googleapis.com/token"
        data = {
            'code': code,
            'client_id': GOOGLE_CLIENT_ID,
            'client_secret': GOOGLE_CLIENT_SECRET,
            'redirect_uri': GOOGLE_CALLBACK_URL,
            'grant_type': 'authorization_code'
        }
        
        response = requests.post(token_url, data=data)
        tokens = response.json()
        
        if 'error' in tokens:
            raise Exception(tokens['error'])

        # Get User Info
        user_info_response = requests.get(
            'https://www.googleapis.com/oauth2/v2/userinfo',
            headers={'Authorization': f"Bearer {tokens['access_token']}"}
        )
        user_profile = user_info_response.json()
        
        # 1. Store/Update User
        user_data = {
            "google_id": user_profile['id'],
            "email": user_profile['email'],
            "display_name": user_profile.get('name', ''),
        }
        
        # Upsert User
        user_res = supabase.table('users').upsert(user_data, on_conflict='google_id').execute()
        
        # Supabase python client returns data differently than JS
        # We need to fetch the ID if upsert doesn't return it clearly in all versions
        # But usually user_res.data[0]['id'] works if select is implied
        
        # Let's fetch the user ID explicitly to be safe
        user_db = supabase.table('users').select('id').eq('google_id', user_profile['id']).single().execute()
        user_id = user_db.data['id']

        # 2. Store Refresh Token
        if 'refresh_token' in tokens:
            token_data = {
                "user_id": user_id,
                "service": "google",
                "refresh_token": encrypt_token(tokens['refresh_token']),
                # "expires_at": ... (Optional implementation)
            }
            supabase.table('oauth_tokens').upsert(token_data, on_conflict='user_id').execute()
            
        # Redirect to Frontend with UID
        return RedirectResponse(f"http://localhost:3000/?status=success&uid={user_id}")

    except Exception as e:
        print(f"OAuth Error: {str(e)}")
        return RedirectResponse("http://localhost:3000/?status=error")

class ChatQuery(BaseModel):
    query: str
    userId: str

@app.post("/api/chat/query")
async def chat_query(chat_req: ChatQuery):
    if not chat_req.userId or not chat_req.query:
        raise HTTPException(status_code=400, detail="Missing userId or query")
    
    try:
        # 1. Get Valid Token
        access_token = get_valid_access_token(chat_req.userId)
        
        # 2. Execute Agent
        response = await agent_executor(access_token, chat_req.query)
        
        return {"response": response}
        
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Chat Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)
