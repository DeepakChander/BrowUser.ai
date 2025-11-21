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

# Global Playwright Instance
playwright_instance = None

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    global playwright_instance
    print("[System] Starting Global Playwright Engine...")
    playwright_instance = await async_playwright().start()
    yield
    print("[System] Stopping Global Playwright Engine...")
    if playwright_instance:
        await playwright_instance.stop()

app = FastAPI(lifespan=lifespan)

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
            "parameters": {
                "type": "object",
                "properties": {
                    "final_answer": {
                        "type": "string",
                        "description": "A summary of what was done or the answer to the user's question."
                    }
                },
                "required": ["final_answer"]
            }
        }
    }
]

# --- ⚡ Execution Engine with ReAct Loop & Stealth Mode ---

async def capture_and_stream(page, user_id: str):
    """Captures screenshot and streams to frontend via WebSocket"""
    try:
        if not page.is_closed():
            screenshot_bytes = await page.screenshot(type='jpeg', quality=50)
            base64_str = base64.b64encode(screenshot_bytes).decode('utf-8')
            await manager.send_payload(user_id, {"type": "image", "data": base64_str})
    except Exception as e:
        print(f"[Stream] Capture Error: {e}")

async def execute_react_loop(user_id: str, initial_query: str, access_token: str):
    """
    Executes the continuous ReAct loop: Think -> Act -> Observe -> Repeat
    """
    global playwright_instance
    browser = None
    context = None
    page = None
    
    # Conversation History
    messages = [
        {"role": "system", "content": """
You are BrowUser.ai, an autonomous agent.
You have access to a browser and Google APIs.
Your goal is to complete the user's request by executing a series of actions.

IMPORTANT:
1. You must call 'task_complete' when you are finished.
2. If you need to read a page, use 'browser_get_content'.
3. If you need to search, navigate to google.com, type the query, click search, AND THEN READ THE RESULTS.
4. Be persistent. If an action fails, try a different approach.
5. If you encounter a CAPTCHA or Anti-Bot page, call 'task_complete' with a failure message.
6. If the user asks to 'log in' or 'wait', use the 'wait_for_user' tool.
        """},
        {"role": "user", "content": initial_query}
    ]

    try:
        print("[ReAct] Starting Loop...")
        
        # Use global instance
        if not playwright_instance:
             print("[ReAct] Error: Playwright not initialized")
             return "❌ System Error: Browser Engine not ready."
        
        # --- 🕵️ Browser Launch Strategy ---
        user_data_dir = os.path.join(os.path.expanduser("~"), "AppData", "Local", "Google", "Chrome", "User Data")
        using_real_profile = False

        try:
            print(f"[ReAct] Attempting to launch Real Chrome Profile from: {user_data_dir}")
            context = await playwright_instance.chromium.launch_persistent_context(
                user_data_dir,
                channel="chrome",
                headless=False,
                args=["--disable-blink-features=AutomationControlled", "--no-sandbox"],
                viewport={"width": 1920, "height": 1080}
            )
            using_real_profile = True
            print("[ReAct] ✅ Successfully attached to Real Chrome Profile!")
            await manager.send_payload(user_id, {"type": "status", "data": "✅ Using your Real Chrome Profile"})
            
        except Exception as e:
            print(f"[ReAct] ⚠️ Could not use Real Profile (Chrome likely open). Falling back to Stealth Mode. Error: {e}")
            await manager.send_payload(user_id, {"type": "status", "data": "⚠️ Main Chrome is busy. Close it to use your saved login, or log in manually here."})
            
            # Fallback: Launch fresh browser
            user_agents = [
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            ]
            browser = await playwright_instance.chromium.launch(
                headless=False,
                args=["--disable-blink-features=AutomationControlled", "--no-sandbox", "--disable-infobars", "--start-maximized"]
            )
            context = await browser.new_context(
                user_agent=random.choice(user_agents),
                viewport={"width": 1920, "height": 1080},
                java_script_enabled=True
            )
            # Inject stealth script
            await context.add_init_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")

        # Get the page
        if context.pages:
            page = context.pages[0]
        else:
            page = await context.new_page()
            
        await capture_and_stream(page, user_id)

        loop_count = 0
        max_loops = 15 

        while loop_count < max_loops:
            loop_count += 1
            print(f"[ReAct] Step {loop_count}")
            
            # 1. THINK (Call LLM)
            completion = openai.chat.completions.create(
                model="gpt-4o",
                messages=messages,
                tools=tools,
                tool_choice="auto"
            )
            
            response_message = completion.choices[0].message
            messages.append(response_message) 

            # 2. ACT (Check for tool calls)
            if response_message.tool_calls:
                for tool_call in response_message.tool_calls:
                    tool_name = tool_call.function.name
                    args = json.loads(tool_call.function.arguments)
                    call_id = tool_call.id
                    
                    print(f"[ReAct] Action: {tool_name} args: {args}")
                    await manager.send_payload(user_id, {"type": "status", "data": f"Step {loop_count}: {tool_name}..."})

                    observation = ""
                    
                    # 3. OBSERVE (Execute Tool)
                    try:
                        if tool_name == "task_complete":
                            final_answer = args['final_answer']
                            await manager.send_payload(user_id, {"type": "status", "data": "✅ Task Completed"})
                            
                            # Cleanup
                            if context: await context.close()
                            if browser: await browser.close()
                            # DO NOT STOP PLAYWRIGHT HERE
                            return final_answer

                        elif tool_name == "wait_for_user":
                            seconds = args.get('seconds', 30)
                            for i in range(seconds):
                                if i % 5 == 0: await capture_and_stream(page, user_id)
                                await asyncio.sleep(1)
                            observation = f"Waited for {seconds} seconds."

                        elif tool_name == "send_gmail":
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
                                observation = f"Email sent successfully to {args['recipient']}"
                            else:
                                observation = f"Failed to send email: {res.text}"

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
                                observation = f"Created Google Doc '{args['title']}' with ID: {doc_id}"
                            else:
                                observation = f"Failed to create doc: {res.text}"

                        elif tool_name == "browser_navigate":
                            await page.goto(args['url'])
                            await capture_and_stream(page, user_id)
                            observation = f"Navigated to {args['url']}"

                        elif tool_name == "browser_click":
                            await page.click(args['selector'], timeout=5000)
                            await capture_and_stream(page, user_id)
                            observation = f"Clicked element {args['selector']}"

                        elif tool_name == "browser_type":
                            await page.fill(args['selector'], args['text'], timeout=5000)
                            await capture_and_stream(page, user_id)
                            observation = f"Typed '{args['text']}' into {args['selector']}"

                        elif tool_name == "browser_get_content":
                            content = await page.evaluate("document.body.innerText")
                            truncated = content[:3000] 
                            observation = f"Page Content: {truncated}..."
                        
                        await asyncio.sleep(1)

                    except Exception as e:
                        observation = f"Error executing {tool_name}: {str(e)}"
                        print(f"[ReAct] Error: {observation}")

                    # 4. FEEDBACK (Add observation to history)
                    messages.append({
                        "tool_call_id": call_id,
                        "role": "tool",
                        "name": tool_name,
                        "content": observation
                    })
            else:
                print("[ReAct] LLM replied without tool.")
                return response_message.content

        if context: await context.close()
        if browser: await browser.close()
        # DO NOT STOP PLAYWRIGHT HERE
        return "❌ Task timed out (max steps reached)."

    except Exception as e:
        print(f"[ReAct] Critical Error: {e}")
        try:
            if context: await context.close()
            if browser: await browser.close()
        except: pass
        return f"❌ Critical Error: {str(e)}"


# --- Routes ---

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
    except Exception as e:
        print(f"[WS] Error: {e}")
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
