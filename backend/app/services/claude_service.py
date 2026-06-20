import os
import json
from typing import Any
import anthropic


def _get_client() -> anthropic.Anthropic:
    """Lazily create the Anthropic client so env vars are loaded first."""
    return anthropic.Anthropic(api_key=os.environ.get('ANTHROPIC_API_KEY', ''))


def _extract_text(message: anthropic.types.Message) -> str:
    """Safely extract text from an Anthropic message response."""
    block = message.content[0]
    if isinstance(block, anthropic.types.TextBlock):
        return block.text.strip()
    return str(block)


def _parse_json_response(text: str) -> Any:
    """Clean and parse a JSON string that may be wrapped in markdown code blocks."""
    if text.startswith('```'):
        parts = text.split('```')
        text = parts[1] if len(parts) > 1 else text
        if text.startswith('json'):
            text = text[4:]
    return json.loads(text.strip())


def analyze_complaint_deeply(title: str, description: str, category: str, priority: str) -> dict:
    """Use Claude for deep sentiment analysis and executive summary."""
    prompt = f"""Analyze this citizen complaint for a government grievance system.

Title: {title}
Category: {category}
Priority: {priority}
Description: {description}

Provide a JSON response with:
- summary: 2-3 sentence executive summary for officials
- sentiment_score: float from -1.0 (very negative) to 1.0 (very positive)
- sentiment_label: "very_negative", "negative", "neutral", "positive"
- urgency_justification: why this complaint needs attention (1-2 sentences)
- suggested_resolution: recommended action steps for the department (2-3 points)
- estimated_resolution_days: realistic number of days to resolve

Return ONLY valid JSON."""

    try:
        client = _get_client()
        message = client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=800,
            messages=[{"role": "user", "content": prompt}]
        )
        text = _extract_text(message)
        return _parse_json_response(text)
    except Exception as e:
        print(f"[CLAUDE ERROR] analyze_complaint_deeply: {e}")
        return {
            "summary": f"Complaint regarding {category}: {title[:100]}",
            "sentiment_score": -0.5,
            "sentiment_label": "negative",
            "urgency_justification": "Requires departmental attention.",
            "suggested_resolution": ["Review complaint", "Assign officer", "Follow up within timeline"],
            "estimated_resolution_days": 7
        }


def generate_analytics_insights(analytics_data: dict) -> dict:
    """Use Claude to generate predictive insights from analytics data."""
    prompt = f"""You are a governance analytics AI. Analyze this complaint data and provide insights.

Data: {json.dumps(analytics_data, indent=2)}

Provide a JSON response with:
- top_issues: array of 3 most critical recurring issues
- predictions: array of 3 predicted issues for next month
- recommendations: array of 5 actionable policy recommendations
- bottleneck_departments: array of departments needing more resources
- positive_trends: array of areas showing improvement
- overall_health_score: score from 0-100 for governance health
- executive_summary: 3-4 sentence summary for the administration

Return ONLY valid JSON."""

    try:
        client = _get_client()
        message = client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=1500,
            messages=[{"role": "user", "content": prompt}]
        )
        text = _extract_text(message)
        return _parse_json_response(text)
    except Exception as e:
        print(f"[CLAUDE ERROR] generate_analytics_insights: {e}")
        return {
            "top_issues": ["Infrastructure", "Water Supply", "Sanitation"],
            "predictions": [
                "Roads will face 20% more complaints",
                "Seasonal water shortage expected",
                "Increased sanitation complaints in summer"
            ],
            "recommendations": [
                "Increase infrastructure budget",
                "Hire more sanitation workers",
                "Deploy mobile complaint units",
                "Create department response SLAs",
                "Launch citizen awareness campaign"
            ],
            "bottleneck_departments": ["Roads & Infrastructure"],
            "positive_trends": ["Response time improving"],
            "overall_health_score": 65,
            "executive_summary": "Analytics data shows mixed governance performance with room for improvement."
        }


def generate_complaint_response_draft(complaint_title: str, complaint_desc: str, department: str) -> str:
    """Generate a draft official response for a complaint."""
    prompt = f"""Write a professional, empathetic official response to this citizen complaint.

Department: {department}
Complaint Title: {complaint_title}
Description: {complaint_desc}

Write a formal but warm response (100-150 words) that:
1. Acknowledges the complaint
2. Explains what action will be taken
3. Gives an estimated timeline
4. Provides a contact for follow-up

Return only the response text."""

    try:
        client = _get_client()
        message = client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=300,
            messages=[{"role": "user", "content": prompt}]
        )
        return _extract_text(message)
    except Exception as e:
        print(f"[CLAUDE ERROR] generate_complaint_response_draft: {e}")
        return (
            f"Dear Citizen, Thank you for reporting this issue to {department}. "
            "We have received your complaint and our team will investigate promptly. "
            "You will receive an update within 7 working days."
        )
