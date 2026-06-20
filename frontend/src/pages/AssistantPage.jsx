import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import './AssistantPage.css';

const LANGUAGES = [
  { code: 'en', label: '🇮🇳 English' },
  { code: 'hi', label: 'हि Hindi' },
  { code: 'ta', label: 'த Tamil' },
  { code: 'te', label: 'తె Telugu' },
  { code: 'bn', label: 'বাং Bengali' },
  { code: 'mr', label: 'म Marathi' },
  { code: 'gu', label: 'ગુ Gujarati' },
];

const QUICK_PROMPTS = [
  'How do I file a water supply complaint?',
  'What is the status of my complaint?',
  'How to get a birth certificate?',
  'Report a road pothole issue',
  'Electricity outage in my area',
];

export default function AssistantPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState(() => {
    const saved = sessionStorage.getItem('assistant_chat');
    if (saved) return JSON.parse(saved);
    return [{
      role: 'assistant',
      content: `Hello ${user?.name?.split(' ')[0] || 'there'}! 👋 I'm CivicConnect AI, your government services assistant. I can help you:\n\n• File and track complaints\n• Find government services\n• Navigate processes\n• Support in multiple languages\n\nHow can I help you today?`
    }];
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState(user?.language_pref || 'en');
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    sessionStorage.setItem('assistant_chat', JSON.stringify(messages));
  }, [messages]);

  const sendMessage = useCallback(async (text) => {
    if (!text.trim() || loading) return;
    const userMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/assistant/chat', {
        messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
        language,
        context: 'citizen_portal'
      });
      const aiMsg = { role: 'assistant', content: res.data.response };
      setMessages(prev => [...prev, aiMsg]);
      
      // Text-to-speech
      if (voiceEnabled && 'speechSynthesis' in window) {
        setIsSpeaking(true);
        const utterance = new SpeechSynthesisUtterance(res.data.response);
        utterance.lang = language === 'hi' ? 'hi-IN' : language === 'ta' ? 'ta-IN' : 'en-IN';
        utterance.rate = 0.9;
        utterance.onend = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  }, [messages, language, loading, voiceEnabled]);

  const startVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { alert('Voice not supported in this browser'); return; }
    
    const langMap = { hi: 'hi-IN', ta: 'ta-IN', te: 'te-IN', bn: 'bn-IN', mr: 'mr-IN', en: 'en-IN' };
    const recognition = new SpeechRecognition();
    recognition.lang = langMap[language] || 'en-IN';
    recognition.interimResults = false;
    
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      sendMessage(transcript);
    };
    recognition.onend = () => setIsRecording(false);
    recognition.start();
    recognitionRef.current = recognition;
    setIsRecording(true);
  };

  const stopVoice = () => {
    recognitionRef.current?.stop();
    setIsRecording(false);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  return (
    <div className="page-container assistant-page">
      <div className="assistant-layout">
        {/* Sidebar */}
        <div className="assistant-sidebar">
          <div className="glass-card">
            <h3>⚙️ Settings</h3>
            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label className="form-label">Language</label>
              <select className="form-select" value={language} onChange={e => setLanguage(e.target.value)}>
                {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
              </select>
            </div>
            <div className="voice-toggle">
              <label className="toggle-label">
                <input type="checkbox" checked={voiceEnabled} onChange={e => setVoiceEnabled(e.target.checked)} />
                <span>🔊 Voice Responses</span>
              </label>
            </div>
          </div>

          <div className="glass-card quick-prompts-card">
            <h3>💬 Quick Questions</h3>
            <div className="quick-prompts">
              {QUICK_PROMPTS.map(p => (
                <button key={p} className="quick-prompt-btn" onClick={() => sendMessage(p)}>
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="glass-card accessibility-card">
            <h3>♿ Accessibility</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              This assistant supports voice input and output in 7 Indian languages for inclusive access.
            </p>
            <div className="lang-pills">
              {LANGUAGES.map(l => (
                <span key={l.code} className={`lang-pill ${language === l.code ? 'active' : ''}`} onClick={() => setLanguage(l.code)}>
                  {l.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Chat Window */}
        <div className="chat-window glass-card">
          {/* Chat Header */}
          <div className="chat-header">
            <div className="chat-avatar-wrap">
              <div className="chat-avatar">🤖</div>
              <div className="chat-status-dot" />
            </div>
            <div>
              <div className="chat-name">CivicConnect AI</div>
              <div className="chat-status">Online · {isSpeaking ? '🔊 Speaking...' : 'Ready to help'}</div>
            </div>
            {isSpeaking && (
              <button className="btn btn-secondary btn-sm" onClick={stopSpeaking}>⏹ Stop</button>
            )}
          </div>

          {/* Messages */}
          <div className="chat-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`chat-bubble ${msg.role}`}>
                {msg.role === 'assistant' && <div className="bubble-avatar">🤖</div>}
                <div className="bubble-content">
                  <div className="bubble-text">{msg.content}</div>
                </div>
                {msg.role === 'user' && <div className="bubble-avatar user-avatar-chat">{user?.name?.[0]?.toUpperCase()}</div>}
              </div>
            ))}
            {loading && (
              <div className="chat-bubble assistant">
                <div className="bubble-avatar">🤖</div>
                <div className="bubble-content">
                  <div className="typing-indicator">
                    <span /><span /><span />
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="chat-input-area">
            <button
              className={`voice-btn ${isRecording ? 'recording' : ''}`}
              onClick={isRecording ? stopVoice : startVoice}
              title="Voice input"
            >
              {isRecording ? '⏹' : '🎙️'}
            </button>
            <textarea
              className="chat-input"
              placeholder="Type your message or click the mic to speak..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(input);
                }
              }}
              rows={2}
            />
            <button
              className="send-btn"
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading}
            >
              ➤
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
