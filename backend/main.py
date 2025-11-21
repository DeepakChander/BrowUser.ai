from fastapi import FastAPI, Request, HTTPException, Depends, WebSocket, WebSocketDisconnect
from fastapi.responses import RedirectResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import json
import base64
import asyncio
import traceback
from email.mime.text import MIMEText
from dotenv import load_dotenv
from supabase import create_client, Client
import openai
from google_auth_oauthlib.flow import Flow
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request as GoogleRequest
import requests
from datetime import datetime
from playwright.async_api import async_playwright
import random

# Load environment variables
load_dotenv()

app = FastAPI()

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
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
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/documents'
]

# --- 🔒 Encryption Placeholders ---
def encrypt_token(token: str) -> str:
    return token

def decrypt_token(encrypted_token: str) -> str:
    return encrypted_token

# --- 🔄 Token Refresh Utility ---
def get_valid_access_token(user_id: str):
    try:
        response = supabase.table('oauth_tokens').select('refresh_token').eq('user_id', user_id).single().execute()
        if not response.data:
            raise Exception("User token not found")
            
        refresh_token = decrypt_token(response.data['refresh_token'])
        
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
        return tokens['access_token']

    except Exception as e:
        print(f"Token Refresh Error: {str(e)}")
        raise HTTPException(status_code=401, detail="Could not refresh token")

# --- 📡 WebSocket Connection Manager ---
class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        self.active_connections[user_id] = websocket
        print(f"[WS] User {user_id} connected")

    def disconnect(self, user_id: str):
        if user_id in self.active_connections:
            del self.active_connections[user_id]
            print(f"[WS] User {user_id} disconnected")

    async def send_payload(self, user_id: str, payload: dict):
        if user_id in self.active_connections:
            try:
                await self.active_connections[user_id].send_json(payload)
            except Exception as e:
                print(f"[WS] Error sending payload to {user_id}: {e}")

manager = ConnectionManager()

# --- 🛠️ Tool Definitions ---
tools = [
    {
        "type": "function",
        "function": {
            "name": "send_gmail",
            "description": "Sends an email using the user's Gmail account.",
            "parameters": {
                "type": "object",
                "properties": {
                    "recipient": {"type": "string"},
                    "subject": {"type": "string"},
                    "body": {"type": "string"}
                },
                "required": ["recipient", "subject", "body"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "create_google_doc",
            "description": "Creates a new Google Document in the user's Drive.",
            "parameters": {
                "type": "object",
                "properties": {
                    "title": {"type": "string"},
                    "content": {"type": "string"}
                },
                "required": ["title", "content"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "browser_navigate",
            "description": "Navigates the browser to a specific URL.",
            "parameters": {
                "type": "object",
                "properties": {
                    "url": {"type": "string"}
                },
                "required": ["url"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "browser_click",
            "description": "Clicks a specific element on the current page using a CSS selector.",
            "parameters": {
                "type": "object",
                "properties": {
                    "selector": {"type": "string"}
                },
                "required": ["selector"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "browser_type",
            "description": "Types text into an input field identified by a CSS selector.",
            "parameters": {
                "type": "object",
                "properties": {
                    "selector": {"type": "string"},
                    "text": {"type": "string"}
                },
                "required": ["selector", "text"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "browser_get_content",
            "description": "Extracts the text content from the current web page. Use this to read search results or page info.",
            "parameters": {
                "type": "object",
                "properties": {},
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "wait_for_user",
            "description": "Pauses execution for a specified number of seconds to allow the user to manually interact with the browser (e.g., to log in).",
            "parameters": {
                "type": "object",
                "properties": {
                    "seconds": {"type": "integer", "description": "Number of seconds to wait."}
                },
                "required": ["seconds"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "task_complete",
            "description": "Call this tool when the user's request has been fully satisfied.",

@app.get("/")
def read_root():
    return {"status": "BrowUser.ai Backend is Running (Python)"}

@app.websocket("/ws/live-preview/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    await manager.connect(websocket, user_id)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(user_id)

@app.get("/auth/google")
def login_google():
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

        user_info_response = requests.get(
            'https://www.googleapis.com/oauth2/v2/userinfo',
            headers={'Authorization': f"Bearer {tokens['access_token']}"}
        )
        user_profile = user_info_response.json()
        
        user_data = {
            "google_id": user_profile['id'],
            "email": user_profile['email'],
            "display_name": user_profile.get('name', ''),
        }
        
        supabase.table('users').upsert(user_data, on_conflict='google_id').execute()
        
        user_db = supabase.table('users').select('id').eq('google_id', user_profile['id']).single().execute()
        user_id = user_db.data['id']

        if 'refresh_token' in tokens:
            token_data = {
                "user_id": user_id,
                "service": "google",
                "refresh_token": encrypt_token(tokens['refresh_token']),
            }
            supabase.table('oauth_tokens').upsert(token_data, on_conflict='user_id').execute()
            
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
        
        # 2. Execute ReAct Loop
        final_response = await execute_react_loop(chat_req.userId, chat_req.query, access_token)
        
        return {"response": {"message": final_response}}
        
    except Exception as e:
        print(f"Chat Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

class SaveAutomationRequest(BaseModel):
    user_id: str
    name: str
    description: str

@app.post("/api/automation/save")
async def save_automation(req: SaveAutomationRequest):
    try:
        data = {
            "user_id": req.user_id,
            "name": req.name,
            "description": req.description,
            "created_at": datetime.now().isoformat(),
            "usage_count": 1
        }
        # Assuming table 'saved_automations' exists
        supabase.table('saved_automations').insert(data).execute()
        return {"status": "success", "message": "Automation saved successfully"}
    except Exception as e:
        print(f"Save Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to save automation")

@app.get("/api/automation/list/{user_id}")
async def list_automations(user_id: str):
    try:
        response = supabase.table('saved_automations').select('*').eq('user_id', user_id).execute()
        return {"automations": response.data}
    except Exception as e:
        # Check if it's a "relation not found" error (PGRST205)
        if "PGRST205" in str(e) or "relation" in str(e) and "does not exist" in str(e):
            print(f"List Warning: Table 'saved_automations' not found. Returning empty list.")
            return {"automations": []}
        print(f"List Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch automations")

@app.get("/api/automation/analyze/{user_id}")
async def analyze_automations(user_id: str):
    try:
        # Fetch saved automations
        saved_automations = []
        try:
            saved_response = supabase.table('saved_automations').select('*').eq('user_id', user_id).execute()
            saved_automations = saved_response.data
        except Exception as e:
             if "PGRST205" in str(e) or "relation" in str(e) and "does not exist" in str(e):
                print(f"Analyze Warning: Table 'saved_automations' not found. Using defaults.")
                saved_automations = []
             else:
                 raise e
        
        # In a real scenario, we would also fetch a 'task_history' table.
        # For now, we will simulate history based on saved automations to generate suggestions.
        
        prompt = f"""
        You are an Automation Consultant. Analyze the user's saved workflows and suggest 2 new optimizations.
        
        User's Saved Workflows:
        {json.dumps(saved_automations)}
        
        If the list is empty, suggest general productivity workflows (e.g., "Daily News Summary", "Meeting Prep").
        
        Return ONLY a JSON array of objects with keys: "suggestion_title", "estimated_time_saved".
        Example: [{{"suggestion_title": "Automate Weekly Report", "estimated_time_saved": "15 mins"}}]
        """
        
        completion = openai.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "system", "content": prompt}]
        )
        
        content = completion.choices[0].message.content
        # Clean up markdown code blocks if present
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0]
        elif "```" in content:
            content = content.split("```")[1].split("```")[0]
            
        suggestions = json.loads(content)
        return {"suggestions": suggestions}

    except Exception as e:
        print(f"Analysis Error: {e}")
        # Fallback suggestions
        return {"suggestions": [
            {"suggestion_title": "Daily News Summary", "estimated_time_saved": "10 mins"},
            {"suggestion_title": "Competitor Research", "estimated_time_saved": "30 mins"}
        ]}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)
