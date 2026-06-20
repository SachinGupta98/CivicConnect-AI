from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
# pyrefly: ignore [missing-import]
from ..models.user import User
# pyrefly: ignore [missing-import]
from ..services import groq_service
from groq.types.chat import ChatCompletionMessageParam

assistant_bp = Blueprint('assistant', __name__)

GOVERNMENT_SERVICES = [
    {"name": "Birth Certificate", "dept": "Municipal Services", "description": "Apply for birth certificate online", "url": "https://pehchan.rajasthan.gov.in/pehchan5/Mainpage.aspx"},
    {"name": "Aadhaar / Identity", "dept": "UIDAI", "description": "Update or download your Aadhaar card", "url": "https://uidai.gov.in/en/"},
    {"name": "Driving License", "dept": "Transport", "description": "Apply or renew driving license", "url": "https://sarathi.parivahan.gov.in/sarathiservice/stateSelection.do"},
    {"name": "Ration Card", "dept": "Revenue Department", "description": "Apply or update your ration card", "url": "https://food.rajasthan.gov.in/"},
    {"name": "Water Connection", "dept": "Water Supply", "description": "New water connection or repair request", "url": "https://rajneer.rajasthan.gov.in/phed/portal/"},
    {"name": "Electricity Bill", "dept": "Electricity", "description": "Pay bills or report outages", "url": "https://bijlimitra.com/custumerLoginPage"},
    {"name": "Road Pothole", "dept": "Roads & Infrastructure", "description": "Report road damage", "url": "https://www.india.gov.in/services"},
    {"name": "Garbage Collection", "dept": "Sanitation", "description": "Schedule or report missed collection", "url": "https://www.jaipurmc.org/"},
    {"name": "Police Complaint", "dept": "Police", "description": "File FIR or non-emergency report", "url": "https://police.rajasthan.gov.in/old/citizenservices.aspx"},
    {"name": "Health Certificate", "dept": "Public Health", "description": "Obtain health/fitness certificates", "url": "https://www.eiconline.in/EIC/UserLogin/login.aspx"},
    {"name": "Building Permit", "dept": "Housing", "description": "Apply for construction permits", "url": "https://www.india.gov.in/services"},
    {"name": "Scholarship", "dept": "Education", "description": "Apply for government scholarships", "url": "https://scholarships.gov.in/"},
    {"name": "Environment Complaint", "dept": "Environment", "description": "Report pollution or environmental violations", "url": "https://environment.rajasthan.gov.in/content/environment/en.html#"},
]


@assistant_bp.route('/chat', methods=['POST'])
@jwt_required()
def chat():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    data = request.get_json()
    
    messages = data.get('messages', [])
    language = data.get('language', user.language_pref if user else 'en')
    context = data.get('context', '')
    
    if not messages:
        return jsonify({'success': False, 'message': 'Messages are required'}), 400
    
    # Format for Groq — ensure proper message structure
    formatted_messages: list[ChatCompletionMessageParam] = []
    for msg in messages:
        role = msg.get('role', '')
        content = msg.get('content', '')
        if role in ('user', 'assistant') and isinstance(content, str):
            formatted_messages.append({'role': role, 'content': content})  # type: ignore[misc]

    response = groq_service.generate_chat_response(formatted_messages, language, context)
    
    return jsonify({
        'success': True,
        'response': response,
        'language': language
    })


@assistant_bp.route('/voice-to-complaint', methods=['POST'])
@jwt_required()
def voice_to_complaint():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    data = request.get_json()
    
    transcript = data.get('transcript', '')
    language = data.get('language', user.language_pref if user else 'en')
    
    if not transcript:
        return jsonify({'success': False, 'message': 'Transcript is required'}), 400
    
    structured = groq_service.voice_to_complaint(transcript, language)
    
    return jsonify({
        'success': True,
        'structured': structured,
        'original_transcript': transcript
    })


@assistant_bp.route('/translate', methods=['POST'])
@jwt_required()
def translate():
    data = request.get_json()
    text = data.get('text', '')
    target_language = data.get('target_language', 'en')
    
    if not text:
        return jsonify({'success': False, 'message': 'Text is required'}), 400
    
    translated = groq_service.translate_text(text, target_language)
    
    return jsonify({
        'success': True,
        'original': text,
        'translated': translated,
        'target_language': target_language
    })


@assistant_bp.route('/services', methods=['GET'])
def get_services():
    query = request.args.get('q', '').lower()
    services = GOVERNMENT_SERVICES
    
    if query:
        services = [s for s in services if query in s['name'].lower() or query in s['description'].lower()]
    
    return jsonify({'success': True, 'services': services})
