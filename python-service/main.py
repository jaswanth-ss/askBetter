from dotenv import load_dotenv
load_dotenv()

import os
from groq import Groq
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional

api_key = os.getenv("GROQ_API_KEY")
if not api_key:
    raise ValueError("GROQ_API_KEY environment variable is not set")

app = FastAPI()
client = Groq(api_key=api_key)


class ContextItem(BaseModel):
    topic: str
    user_experience_level: str
    response_format: str
    reason_for_asking: str
    preferred_tone: str
    response_length: str
    use_external_resources: str
    additional_context: str


class PromptRequest(BaseModel):
    prompt: str
    context: Optional[ContextItem] = None

class SuggestPromptRequest(BaseModel):
    prompts: str

@app.get("/")
async def read_root():
    return {"message": "Welcome to the askBetter API"}

@app.post("/improve-prompt")
async def improve_prompt(request: PromptRequest):
    if not request.prompt:
        return {"error": "Prompt is required"}

    if request.context:
        user_message = f"""Prompt: {request.prompt}
Context:
    topic: {request.context.topic}
    user_experience_level: {request.context.user_experience_level}
    response_format: {request.context.response_format}
    reason_for_asking: {request.context.reason_for_asking}
    preferred_tone: {request.context.preferred_tone}
    response_length: {request.context.response_length}
    user_external_resources: {request.context.use_external_resources}
    additional_context: {request.context.additional_context}"""
    else:
        user_message = request.prompt

    try:
        chat_completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": """Act as an expert prompt engineer. Your role is to rewrite a user's simple or unclear prompt into a clear, structured, and well-defined version that improves the quality and accuracy of responses from large language models.

You may receive:
- A standalone prompt, or
- A prompt along with additional context describing the user's requirements

While rewriting, follow these rules:
- Preserve the original intent and meaning exactly
- Include all relevant details provided by the user without omitting anything
- Do not add any new or unnecessary information
- Ensure the prompt is clear, specific, and well-structured
- Keep the prompt concise — neither too long nor too short
- Check for and correct any grammatical errors or ambiguities

Return only the improved prompt, without any explanations or additional text."""
                },
                {
                    "role": "user",
                    "content": user_message
                }
            ]
        )
        improved_prompt = chat_completion.choices[0].message.content
        return {"improved_prompt": improved_prompt}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.post("/suggest-prompt")
async def suggest_prompt(request: SuggestPromptRequest):
    if not request.prompts:
        return {"error": "Prompts are required"}

    try:
        chat_completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": """Act as an expert prompt engineer. Your role is to analyze the user's original prompts and provide suggestions for improving them. You may receive input as multiple prompts from a chat session separated by &&&. Understand what is the reason for user to ask the next prompt.Understand what the LLM might be missing that led user to ask the next prompt and suggest a prompt that addresses all the needs of user. Analyze all the prompts and understand what the user is trying to achieve and recreate the prompt that best captures their intent. Focus on identifying any missing details, ambiguities, or areas where the prompt could be more specific. Your suggestions should help the user enhance the quality and clarity of their prompts for better responses from large language models.
                    
                    Return only the suggested prompt, without any explanations or additional text."""
                },
                {
                    "role": "user",
                    "content": request.prompts
                }
            ]
        )
        suggested_prompt = chat_completion.choices[0].message.content
        return {"suggested_prompt": suggested_prompt}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        