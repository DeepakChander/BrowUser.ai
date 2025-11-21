from fastapi import FastAPI, Request, HTTPException, Depends, WebSocket, WebSocketDisconnect
from fastapi.responses import RedirectResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import json
import base64
import asyncio
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

# --- � WebSocket Connection Manager ---
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

    async def send_image(self, user_id: str, base64_image: str):
        if user_id in self.active_connections:
            try:
                await self.active_connections[user_id].send_text(base64_image)
            except Exception as e:
                print(f"[WS] Error sending image to {user_id}: {e}")

manager = ConnectionManager()

# --- �🛠️ Tool Definitions ---
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
    }
]

# --- ⚡ Execution Engine with Live Preview ---

async def capture_and_stream(page, user_id: str):
    """Captures screenshot and streams to frontend via WebSocket"""
    try:
        screenshot_bytes = await page.screenshot(type='jpeg', quality=50)
        base64_str = base64.b64encode(screenshot_bytes).decode('utf-8')
        await manager.send_image(user_id, f"data:image/jpeg;base64,{base64_str}")
    except Exception as e:
        print(f"[Stream] Capture Error: {e}")

async def execute_action_plan(action_plan: list, access_token: str, user_id: str):
    """
    Executes actions and streams visual updates.
    """
    results = []
    browser = None
    page = None

    try:
        needs_browser = any(action['name'].startswith('browser_') for action in action_plan)
        
        if needs_browser:
            print("[Executor] Launching Browser...")
            playwright = await async_playwright().start()
            browser = await playwright.chromium.launch(headless=False) # Keep visible for server-side debug too
            context = await browser.new_context()
            page = await context.new_page()
            
            # Initial blank capture
            await capture_and_stream(page, user_id)

        for action in action_plan:
            tool_name = action['name']
            args = action['arguments']
            print(f"[Executor] Running: {tool_name} with {args}")

            if tool_name == "send_gmail":
                message = MIMEText(args['body'])
                message['to'] = args['recipient']
                message['subject'] = args['subject']
                raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode('utf-8')
                
                res = requests.post(
                    'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
                    headers={'Authorization': f'Bearer {access_token}'},
                    json={'raw': raw_message}
                )
                if res.status_code == 200:
                    results.append(f"✅ Email sent to {args['recipient']}")
                else:
                    results.append(f"❌ Failed to send email: {res.text}")

            elif tool_name == "create_google_doc":
                res = requests.post(
                    'https://docs.googleapis.com/v1/documents',
                    headers={'Authorization': f'Bearer {access_token}'},
                    json={'title': args['title']}
                )
                if res.status_code == 200:
                    doc_id = res.json().get('documentId')
                    requests.post(
                        f'https://docs.googleapis.com/v1/documents/{doc_id}:batchUpdate',
                        headers={'Authorization': f'Bearer {access_token}'},
                        json={
                            "requests": [
                                {
                                    "insertText": {
                                        "text": args['content'],
                                        "endOfSegmentLocation": {"segmentId": ""}
                                    }
                                }
                            ]
                        }
                    )
                    results.append(f"✅ Created Google Doc: {args['title']}")
                else:
                    results.append(f"❌ Failed to create doc: {res.text}")

            elif tool_name == "browser_navigate":
                if page:
                    await page.goto(args['url'])
                    await capture_and_stream(page, user_id)
                    results.append(f"✅ Navigated to {args['url']}")

            elif tool_name == "browser_click":
                if page:
                    await page.click(args['selector'])
                    await capture_and_stream(page, user_id)
                    results.append(f"✅ Clicked {args['selector']}")

            elif tool_name == "browser_type":
                if page:
                    await page.fill(args['selector'], args['text'])
                    await capture_and_stream(page, user_id)
                    results.append(f"✅ Typed into {args['selector']}")
            
            # Small delay to make the stream perceivable
            await asyncio.sleep(0.5)

        if browser:
            await browser.close()
            await playwright.stop()

        return results

    except Exception as e:
        print(f"[Executor] Error: {e}")
        if browser:
            await browser.close()
        return [f"❌ Critical Execution Error: {str(e)}"]


# --- 🤖 Agent Planner ---
async def agent_planner(access_token: str, query: str):
    print(f"[Agent] Planning Action for: {query}")
    
    try:
        system_prompt = f"""
You are BrowUser.ai, an intelligent automation agent.
You have access to a user's Google account via an Access Token.
Your goal is to decompose the user's request into a series of executable actions using the provided tools.
Generate a structured JSON Action Plan.
        """

        completion = openai.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": query}
            ],
            tools=tools,
            tool_choice="auto"
        )

        response_message = completion.choices[0].message

        if response_message.tool_calls:
            action_plan = []
            for tool_call in response_message.tool_calls:
                action_plan.append({
                    "name": tool_call.function.name,
                    "arguments": json.loads(tool_call.function.arguments)
                })
            return action_plan
        else:
            return None

    except Exception as e:
        print(f"OpenAI Error: {str(e)}")
        return None

# --- Routes ---

@app.get("/")
def read_root():
    return {"status": "BrowUser.ai Backend is Running (Python)"}

@app.websocket("/ws/live-preview/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    await manager.connect(websocket, user_id)
    try:
        while True:
            # Keep connection alive
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
        
        # 2. Plan Actions
        action_plan = await agent_planner(access_token, chat_req.query)
        
        response_text = ""
        
        if action_plan:
            # 3. Execute Actions (passing user_id for streaming)
            print(f"Executing Plan: {action_plan}")
            execution_results = await execute_action_plan(action_plan, access_token, chat_req.userId)
            response_text = "Automation Completed:\n" + "\n".join(execution_results)
        else:
            response_text = "I understood your request, but I didn't generate any specific actions to execute."

        return {"response": {"message": response_text}}
        
    except Exception as e:
        print(f"Chat Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)
