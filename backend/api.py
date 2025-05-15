import os
import json
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import uuid4

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from langchain_openai import ChatOpenAI
from pydantic import BaseModel, Field
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, firestore
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.agents import AgentExecutor, create_react_agent
from langchain.tools import Tool
from langchain.prompts import PromptTemplate
from langchain.memory import ConversationBufferMemory

# Load environment variables from project root
load_dotenv(
    dotenv_path=os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env"
    )
)

# Initialize Firebase
try:
    if not firebase_admin._apps:
        # Try different paths for credentials
        current_dir = os.path.dirname(os.path.abspath(__file__))
        root_dir = os.path.dirname(current_dir)
        default_cred_path = os.path.join(current_dir, "firebase-credentials.json")
        root_cred_path = os.path.join(root_dir, "firebase-credentials.json")

        # Check environment variable, then try root directory, then backend directory
        cred_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS", None)
        if cred_path and not os.path.isabs(cred_path):
            cred_path = os.path.join(root_dir, cred_path)

        if not cred_path or not os.path.exists(cred_path):
            if os.path.exists(root_cred_path):
                cred_path = root_cred_path
            elif os.path.exists(default_cred_path):
                cred_path = default_cred_path

        if os.path.exists(cred_path):
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred)
            db = firestore.client()
        else:
            print(
                f"Warning: Firebase credentials not found at {cred_path}. Chat history will not be saved."
            )
            db = None
except Exception as e:
    print(f"Firebase initialization error: {e}")
    db = None

# Replace the existing LLM initialization
llm = ChatOpenAI(
    model="gpt-4o1-",  # You can use "gpt-3.5-turbo" for a more affordable option
    openai_api_key=os.getenv("OPENAI_API_KEY"),
    temperature=0.7,
)

# Initialize FastAPI app
app = FastAPI(
    title="Decryptify API",
    description="AI-powered crypto analysis and trust assessment system",
    version="2.0.0",
)

# Add CORS middleware
allowed_origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)


# Data Models
class ChatMessage(BaseModel):
    role: str
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class ChatRequest(BaseModel):
    chat_id: str
    message: str


class ChatResponse(BaseModel):
    chat_id: str
    message: ChatMessage
    status: str = "success"


class CreateChatRequest(BaseModel):
    initial_message: str
    user_id: Optional[str] = None


class CreateChatResponse(BaseModel):
    chat_id: str
    status: str = "success"


# Import agent tools - use relative imports
from agents.coin_info import coin_info_tool
from agents.crypto_scam import crypto_scam_tool
from agents.certik import certik_tool
from agents.chainbroker import chainbroker_tool
from agents.founder_info import founder_info_tool
from agents.project_info import project_info_tool
from agents.trust_score import trust_score_tool
from agents.decryptify import decryptify_tool

# Create the agent tools list
tools = [
    decryptify_tool,  # Main orchestrator as primary tool
    coin_info_tool,
    crypto_scam_tool,
    certik_tool,
    chainbroker_tool,
    founder_info_tool,
    project_info_tool,
    trust_score_tool,
]

# Agent prompt template
agent_prompt = PromptTemplate.from_template(
    """You are Decryptify, an AI-powered crypto trust assessment system. You help users evaluate the trustworthiness of cryptocurrency projects by analyzing various aspects.

Available tools:
{tools}

When a user asks about a cryptocurrency project, use the decryptify_orchestrator tool FIRST for a comprehensive analysis. Only use individual tools if the user specifically asks for targeted information.

For general crypto questions, use your knowledge to provide helpful information.

Current conversation:
{chat_history}

User: {input}

{agent_scratchpad}
"""
)


# Firestore helper functions
def create_chat_session(user_id: Optional[str], initial_message: str) -> str:
    """Create a new chat session in Firestore"""
    chat_id = str(uuid4())

    if db:
        chat_data = {
            "chat_id": chat_id,
            "user_id": user_id,
            "created_at": firestore.SERVER_TIMESTAMP,
            "updated_at": firestore.SERVER_TIMESTAMP,
            "messages": [
                {
                    "role": "user",
                    "content": initial_message,
                    "timestamp": datetime.utcnow(),
                }
            ],
        }
        db.collection("chats").document(chat_id).set(chat_data)

    return chat_id


def add_message_to_chat(chat_id: str, message: ChatMessage) -> None:
    """Add a message to an existing chat session"""
    if db:
        chat_ref = db.collection("chats").document(chat_id)
        chat_ref.update(
            {
                "messages": firestore.ArrayUnion([message.model_dump()]),
                "updated_at": firestore.SERVER_TIMESTAMP,
            }
        )


def get_chat_history(chat_id: str) -> List[Dict[str, Any]]:
    """Retrieve chat history from Firestore"""
    if not db:
        return []

    chat_ref = db.collection("chats").document(chat_id)
    chat_doc = chat_ref.get()

    if not chat_doc.exists:
        raise HTTPException(status_code=404, detail="Chat not found")

    chat_data = chat_doc.to_dict()
    return chat_data.get("messages", [])


# Create agent memory store
memory_store = {}


def get_or_create_memory(chat_id: str) -> ConversationBufferMemory:
    """Get or create a conversation memory for a chat session"""
    if chat_id not in memory_store:
        # Using the updated API to address deprecation warning
        memory = ConversationBufferMemory(return_messages=True)
        memory_store[chat_id] = memory
    return memory_store[chat_id]


# API Endpoints
@app.get("/")
async def root():
    return {
        "message": "Welcome to Decryptify API",
        "version": "2.0.0",
        "description": "AI-powered crypto analysis and trust assessment",
    }


@app.get("/api/agents")
async def list_agents():
    """List all available agents and their capabilities"""
    agents = [
        {
            "name": "Decryptify Main Agent",
            "description": "Orchestrates all agents for comprehensive crypto trust assessment",
        },
        {
            "name": "Coin Info Agent",
            "description": "Provides comprehensive cryptocurrency market data and analysis",
        },
        {
            "name": "Crypto Scam Agent",
            "description": "Detects and analyzes cryptocurrency scam risks",
        },
        {
            "name": "ChainBroker Agent",
            "description": "Analyzes cryptocurrency broker and exchange data",
        },
        {
            "name": "CertiK Agent",
            "description": "Analyzes smart contract security audits and vulnerabilities",
        },
        {
            "name": "Founder Info Agent",
            "description": "Investigates founder background and credibility",
        },
        {
            "name": "Project Info Agent",
            "description": "Gathers and analyzes project information from various sources",
        },
        {
            "name": "Trust Agent",
            "description": "Synthesizes all information to provide a trust score (0-10)",
        },
    ]

    return {"agents": agents, "status": "success"}


@app.get("/api/model")
async def get_model_info():
    """Get current model configuration"""
    return {
        "model": "gemini-1.5-pro",
        "api_key_set": bool(os.getenv("GOOGLE_API_KEY")),
        "status": "success",
    }


@app.post("/api/chats/create", response_model=CreateChatResponse)
async def create_chat(request: CreateChatRequest):
    """Create a new chat session"""
    try:
        chat_id = create_chat_session(
            user_id=request.user_id, initial_message=request.initial_message
        )

        # Process the initial message
        response_content = await process_message(chat_id, request.initial_message)

        # Add assistant response to chat
        assistant_message = ChatMessage(role="assistant", content=response_content)
        add_message_to_chat(chat_id, assistant_message)

        return CreateChatResponse(chat_id=chat_id, status="success")

    except Exception as e:
        print(f"Error creating chat: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/chats/message", response_model=ChatResponse)
async def send_message(request: ChatRequest):
    """Send a message to an existing chat"""
    try:
        # Add user message to chat
        user_message = ChatMessage(role="user", content=request.message)
        add_message_to_chat(request.chat_id, user_message)

        # Process message
        response_content = await process_message(request.chat_id, request.message)

        # Add assistant response to chat
        assistant_message = ChatMessage(role="assistant", content=response_content)
        add_message_to_chat(request.chat_id, assistant_message)

        return ChatResponse(
            chat_id=request.chat_id, message=assistant_message, status="success"
        )

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error processing message: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/chats/{chat_id}/history")
async def get_chat(chat_id: str):
    """Get chat history"""
    try:
        messages = get_chat_history(chat_id)
        return {"chat_id": chat_id, "messages": messages, "status": "success"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error retrieving chat history: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


async def process_message(chat_id: str, message: str) -> str:
    """Process a message using the Decryptify agent"""
    try:
        # Get or create memory for this chat
        memory = get_or_create_memory(chat_id)

        # Check if message is asking for crypto analysis
        crypto_keywords = [
            "bitcoin",
            "btc",
            "ethereum",
            "eth",
            "crypto",
            "coin",
            "token",
            "trust",
            "score",
            "analysis",
            "check",
            "evaluate",
            "assess",
        ]
        message_lower = message.lower()

        # If it's clearly asking about a specific crypto, extract the project name
        is_crypto_query = any(keyword in message_lower for keyword in crypto_keywords)

        if is_crypto_query:
            # Extract project name from queries like "What's the trust score for Bitcoin?"
            # or "Analyze Ethereum" or just "Bitcoin"
            project_name = message
            for phrase in [
                "what's the trust score for",
                "what is the trust score of",
                "analyze",
                "check",
                "evaluate",
                "assess",
                "tell me about",
            ]:
                if phrase in message_lower:
                    project_name = message_lower.split(phrase)[-1].strip()
                    break

            # Clean up the project name
            project_name = project_name.strip("?.,!").strip()

            # If it's a simple project name query, use the decryptify tool directly
            if (
                len(project_name.split()) <= 3
            ):  # Simple queries like "Bitcoin" or "Ethereum Classic"
                # Pass the LLM to the decryptify tool so it can calculate the trust score & find related projects
                from agents.decryptify import decryptify_analysis

                response = decryptify_analysis(project_name, llm=llm)
                memory.chat_memory.add_user_message(message)
                memory.chat_memory.add_ai_message(response)
                return response

        # For all other queries, use the agent
        agent = create_react_agent(llm=llm, tools=tools, prompt=agent_prompt)

        # Create agent executor
        agent_executor = AgentExecutor(
            agent=agent,
            tools=tools,
            memory=memory,
            verbose=True,
            handle_parsing_errors=True,
            max_iterations=3,
            tool_names=[
                tool.name for tool in tools
            ],  # Add missing tool_names parameter
        )

        # Run the agent
        response = agent_executor.run(input=message)

        return response

    except Exception as e:
        print(f"Error in agent processing: {str(e)}")
        return f"I encountered an error processing your request: {str(e)}. Please try again."


# Vercel handler
app = app

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
