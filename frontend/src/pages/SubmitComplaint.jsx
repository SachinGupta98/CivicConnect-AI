import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './SubmitComplaint.css';

const STEPS = ['Details', 'Review AI Analysis', 'Submitted'];

export default function SubmitComplaint() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [submittedComplaint, setSubmittedComplaint] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceProcessing, setVoiceProcessing] = useState(false);
  const recognitionRef = useRef(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    voice_transcript: '',
  });

  // Voice Recording
  const startVoice = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice input is not supported in this browser. Please use Chrome.');
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-IN';
    
    recognition.onresult = (e) => {
      const transcript = Array.from(e.results).map(r => r[0].transcript).join(' ');
      setForm(f => ({ ...f, description: transcript, voice_transcript: transcript }));
    };
    recognition.onend = () => setIsRecording(false);
    recognition.start();
    recognitionRef.current = recognition;
    setIsRecording(true);
  };

  const stopVoice = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  const processVoiceToComplaint = async () => {
    if (!form.description) return;
    setVoiceProcessing(true);
    try {
      const res = await api.post('/complaints/voice-submit', {
        transcript: form.description,
        language: 'en'
      });
      const structured = res.data.structured_complaint;
      setForm(f => ({
        ...f,
        title: structured.title || f.title,
        description: structured.description || f.description,
        location: structured.location || f.location,
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setVoiceProcessing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description) {
      alert('Title and description are required');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/complaints/submit', form);
      setAiResult(res.data.ai_insights);
      setSubmittedComplaint(res.data.complaint);
      setStep(1);
    } catch (err) {
      alert(err.response?.data?.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  const priorityColors = { urgent: '#f97316', high: '#ef4444', medium: '#f59e0b', low: '#10b981' };

  return (
    <div className="page-container">
      <div className="submit-header">
        <div>
          <h1 className="page-title">📝 File a Complaint</h1>
          <p className="page-subtitle">AI will automatically classify and route your complaint</p>
        </div>
        {/* Steps */}
        <div className="steps-indicator">
          {STEPS.map((s, i) => (
            <div key={s} className={`step-indicator ${i <= step ? 'active' : ''}`}>
              <div className="step-dot">{i < step ? '✓' : i + 1}</div>
              <span>{s}</span>
            </div>
          ))}
        </div>
      </div>

      {step === 0 && (
        <div className="submit-grid">
          <form className="glass-card submit-form" onSubmit={handleSubmit}>
            {/* Voice Input */}
            <div className="voice-section">
              <h3>🎤 Voice Input</h3>
              <p>Describe your complaint by voice — AI will structure it for you</p>
              <div className="voice-controls">
                {!isRecording ? (
                  <button type="button" className="btn-voice" onClick={startVoice}>
                    🎙️ Start Recording
                  </button>
                ) : (
                  <button type="button" className="btn-voice recording" onClick={stopVoice}>
                    ⏹️ Stop Recording
                    <span className="rec-indicator" />
                  </button>
                )}
                {form.description && (
                  <button type="button" className="btn btn-secondary btn-sm" onClick={processVoiceToComplaint} disabled={voiceProcessing}>
                    {voiceProcessing ? '⏳ Processing...' : '✨ Auto-fill from voice'}
                  </button>
                )}
              </div>
            </div>

            <div className="divider"><span>or type manually</span></div>

            <div className="form-group">
              <label className="form-label">Complaint Title *</label>
              <input
                className="form-input"
                placeholder="Brief title of your issue"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description *</label>
              <textarea
                className="form-textarea"
                rows={5}
                placeholder="Describe your issue in detail. Include what happened, when, and how it affects you..."
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">📍 Location (optional)</label>
              <input
                className="form-input"
                placeholder="Area, city, landmark..."
                value={form.location}
                onChange={e => setForm({ ...form, location: e.target.value })}
              />
            </div>

            <button className="btn btn-primary btn-lg" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
              {loading ? '🧠 AI is analyzing...' : '🚀 Submit Complaint'}
            </button>
            {loading && <div className="ai-loading-msg">Groq AI is classifying · Claude AI is analyzing...</div>}
          </form>

          {/* Tips */}
          <div className="submit-tips glass-card">
            <h3>💡 Tips for Better Results</h3>
            <ul className="tips-list">
              <li>Be specific about the location and time</li>
              <li>Describe the impact on daily life</li>
              <li>Mention any previous complaints if applicable</li>
              <li>AI automatically detects urgency — describe severity clearly</li>
            </ul>
            <div className="priority-guide">
              <h4>Priority Levels</h4>
              {Object.entries(priorityColors).map(([p, color]) => (
                <div key={p} className="priority-guide-item">
                  <span className="pguide-dot" style={{ background: color }} />
                  <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{p}:</span>
                  <span>
                    {p === 'urgent' && ' Life/safety risk, major disruption'}
                    {p === 'high' && ' Significant issue, many affected'}
                    {p === 'medium' && ' Service disruption'}
                    {p === 'low' && ' Minor issue or suggestion'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {step === 1 && aiResult && submittedComplaint && (
        <div className="ai-result">
          <div className="success-header">
            <div className="success-icon">✅</div>
            <h2>Complaint #{submittedComplaint.complaint_number} Submitted!</h2>
            <p>AI has analyzed and routed your complaint</p>
          </div>

          <div className="ai-grid">
            {/* Classification */}
            <div className="glass-card">
              <h3>🧠 Groq AI Classification</h3>
              <div className="ai-field"><span>Category</span><strong>{aiResult.classification?.category}</strong></div>
              <div className="ai-field"><span>Sub-Category</span><strong>{aiResult.classification?.sub_category}</strong></div>
              <div className="ai-field"><span>Department Routed To</span><strong>{aiResult.classification?.department}</strong></div>
              <div className="ai-field">
                <span>Priority</span>
                <span className={`badge badge-${aiResult.classification?.priority}`}>
                  {aiResult.classification?.priority?.toUpperCase()}
                </span>
              </div>
              <div className="ai-field"><span>Tags</span><span>{aiResult.classification?.tags?.join(', ')}</span></div>
            </div>

            {/* Claude Analysis */}
            <div className="glass-card">
              <h3>🤖 Claude AI Deep Analysis</h3>
              <div className="ai-summary">{aiResult.analysis?.summary}</div>
              <div className="ai-field">
                <span>Sentiment</span>
                <span style={{ color: aiResult.analysis?.sentiment_score < 0 ? '#ef4444' : '#10b981' }}>
                  {aiResult.analysis?.sentiment_label?.replace('_', ' ')} ({aiResult.analysis?.sentiment_score?.toFixed(2)})
                </span>
              </div>
              <div className="ai-field"><span>Est. Resolution</span><strong>{aiResult.analysis?.estimated_resolution_days} days</strong></div>
              <div className="urgency-note">⚡ {aiResult.analysis?.urgency_justification}</div>
            </div>
          </div>

          <div className="result-actions">
            <button className="btn btn-primary" onClick={() => navigate('/my-complaints')}>
              📋 Track My Complaints
            </button>
            <button className="btn btn-secondary" onClick={() => { setStep(0); setForm({ title:'', description:'', location:'', voice_transcript:'' }); }}>
              + File Another
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
