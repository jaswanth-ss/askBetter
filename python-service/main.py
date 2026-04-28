from dotenv import load_dotenv
load_dotenv()

import os
from groq import Groq
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

api_key = os.getenv("GROQ_API_KEY")
if not api_key:
    raise ValueError("GROQ_API_KEY environment variable is not set")

app = FastAPI()
client = Groq(api_key=api_key)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


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
                    "content": """Act as an expert prompt engineer and intent analyst. Your task is to analyze a sequence of user prompts separated by &&& and reconstruct a single, highly effective prompt that best represents the user’s true underlying intent.

                    Step 1: Identify the explicit request in each prompt (what the user is directly asking).
                    Step 2: Infer the implicit intent behind the sequence (what the user is really trying to achieve, such as career guidance, confidence building, decision-making, or skill improvement).
                    Step 3: Detect missing context that would materially improve the quality of an LLM response, including but not limited to:

                    user experience level (assumed or required for specificity)
                    domain or role context
                    end goal or outcome the user is aiming for
                    constraints (time, competition, job market, tools, etc.)
                    emotional or motivational factors if relevant to intent clarity (e.g., uncertainty, career anxiety, transition pressure)

                    Step 4: Resolve ambiguity by converting vague terms into concrete, actionable framing without making unsupported assumptions.

                    Step 5: Rewrite a single optimized prompt that:

                    preserves original meaning
                    integrates inferred intent and missing context
                    improves specificity, clarity, and actionability
                    is structured in a way that produces high-quality, tailored LLM responses

                    The final output must be a single refined prompt only. Do not include explanations, reasoning, or meta commentary."""
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
        