import os
import json
from typing import Optional, Any, cast
from groq import Groq
from groq.types.chat import ChatCompletionMessageParam


def _get_client() -> Groq:
    """Lazily create the Groq client so env vars are loaded first."""
    return Groq(api_key=os.environ.get('GROQ_API_KEY', ''))


DEPARTMENTS: list[str] = [
    "Water Supply", "Electricity", "Roads & Infrastructure", "Sanitation",
    "Public Health", "Education", "Police", "Municipal Services",
    "Revenue Department", "Housing", "Transport", "Environment"
]

CATEGORIES: list[str] = [
    "Infrastructure", "Utilities", "Public Safety", "Health & Sanitation",
    "Education", "Environment", "Administration", "Transport", "Housing", "Other"
]


def _parse_json(text: str) -> dict:
    """Strip markdown code fences and parse JSON."""
    text = text.strip()
    if text.startswith('```'):
        parts = text.split('```')
        text = parts[1] if len(parts) > 1 else text
        if text.startswith('json'):
            text = text[4:]
    return json.loads(text.strip())


def classify_complaint(title: str, description: str) -> dict:
    """Use Groq AI to classify complaint, detect priority and route to department."""
    prompt = f"""You are an AI complaint classification system for a government citizen services portal.

Analyze this complaint and return a JSON response with these exact fields:
- category: one of {CATEGORIES}
- sub_category: specific sub-topic within the category
- priority: one of ["low", "medium", "high", "urgent"]
- department: one of {DEPARTMENTS}
- priority_reason: brief explanation of why this priority was assigned
- tags: array of 3-5 relevant keywords

Complaint Title: {title}
Complaint Description: {description}

Rules for priority:
- urgent: life-threatening, major infrastructure failure, public safety risk
- high: significant disruption, health hazard, affects many people
- medium: service degradation, moderate inconvenience
- low: minor issues, suggestions, informational

Return ONLY valid JSON, no markdown, no explanation."""

    try:
        client = _get_client()
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
            max_tokens=500,
        )
        content = response.choices[0].message.content or ""
        return _parse_json(content)
    except Exception as e:
        print(f"[GROQ ERROR] classify_complaint: {e}")
        return {
            "category": "Other",
            "sub_category": "General",
            "priority": "medium",
            "department": "Municipal Services",
            "priority_reason": "Auto-classified due to AI error",
            "tags": []
        }


def generate_chat_response(messages: list[ChatCompletionMessageParam], user_language: str = 'en', context: str = '') -> str:
    """Generate conversational AI response for the voice/text assistant."""
    context_line = f"Additional context: {context}" if context else ""
    lang_label = user_language if user_language != 'en' else 'English'

    system_prompt = f"""You are CivicConnect AI Assistant - a helpful, multilingual government services chatbot.
You help citizens:
1. File and track complaints/grievances
2. Find information about government services
3. Understand their rights and available schemes
4. Navigate bureaucratic processes

Current language preference: {user_language}
{context_line}

Be empathetic, concise, and action-oriented. If the user is in distress, acknowledge it first.
Always respond in {lang_label}.
Keep responses under 150 words unless detailed explanation is needed."""

    try:
        client = _get_client()
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=cast(Any, [{'role': 'system', 'content': system_prompt}] + list(messages)),
            temperature=0.7,
            max_tokens=600,
        )
        return response.choices[0].message.content or ""
    except Exception as e:
        print(f"[GROQ ERROR] generate_chat_response: {e}")
        return "I'm sorry, I'm having trouble responding right now. Please try again in a moment."


def voice_to_complaint(transcript: str, language: str = 'en') -> dict:
    """Convert a voice transcript into a structured complaint."""
    prompt = f"""Extract a structured complaint from this voice transcript.

Transcript: {transcript}
Language: {language}

Return JSON with:
- title: concise complaint title (max 100 chars)
- description: full description cleaned up
- location: extracted location if mentioned
- category: best matching category from {CATEGORIES}

Return ONLY valid JSON."""

    try:
        client = _get_client()
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
            max_tokens=400,
        )
        content = response.choices[0].message.content or ""
        return _parse_json(content)
    except Exception as e:
        print(f"[GROQ ERROR] voice_to_complaint: {e}")
        return {
            "title": transcript[:100] if transcript else "Voice Complaint",
            "description": transcript,
            "location": "",
            "category": "Other"
        }


def translate_text(text: str, target_language: str) -> str:
    """Translate text to target language using Groq."""
    lang_map: dict[str, str] = {
        'hi': 'Hindi', 'ta': 'Tamil', 'te': 'Telugu',
        'bn': 'Bengali', 'mr': 'Marathi', 'gu': 'Gujarati', 'en': 'English'
    }
    target = lang_map.get(target_language, 'English')

    if target_language == 'en':
        return text

    prompt = f"Translate this text to {target}. Return ONLY the translation:\n\n{text}"

    try:
        client = _get_client()
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
            max_tokens=1000,
        )
        return response.choices[0].message.content or text
    except Exception as e:
        print(f"[GROQ ERROR] translate_text: {e}")
        return text
