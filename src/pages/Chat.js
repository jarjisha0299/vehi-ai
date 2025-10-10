import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Loader2, Image, Mic, MicOff, Moon, Sun, Copy, Download, Trash2, LogOut } from 'lucide-react';
import { useAuth } from '../utils/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Chat() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    { role: 'assistant', content: `Hello ${user?.user_metadata?.name || 'there'}! I'm Vehi, your intelligent AI assistant. How can I help you today?`, timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: Date.now()
    };

    setInput('');
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const demoResponse = `Thanks for your message! This is a demo response. Once you connect the Gemini API in the backend, Vehi will provide intelligent AI-powered responses with multi-language support and image analysis!`;
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: demoResponse,
        timestamp: Date.now()
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'I apologize, but I encountered an issue. Please try again.',
        timestamp: Date.now()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const clearChat = () => {
    if (window.confirm('Clear all messages?')) {
      setMessages([{
        role: 'assistant',
        content: 'Chat cleared! How can I help you?',
        timestamp: Date.now()
      }]);
    }
  };

  const bgClass = isDark 
    ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
    : 'bg-gradient-to-br from-indigo-50 via-white to-purple-50';
  
  const headerClass = isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const textClass = isDark ? 'text-gray-100' : 'text-gray-800';
  const mutedTextClass = isDark ? 'text-gray-400' : 'text-gray-500';
  const inputClass = isDark 
    ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' 
    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: isDark ? '#111827' : '#f9fafb', transition: 'background 0.3s' }}>
      <div style={{ background: isDark ? '#1f2937' : 'white', borderBottom: '1px solid', borderColor: isDark ? '#374151' : '#e5e7eb', padding: '12px 16px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles style={{ color: 'white', width: '24px', height: '24px' }} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: isDark ? '#f3f4f6' : '#1f2937' }}>Vehi AI</h1>
              <p style={{ margin: 0, fontSize: '12px', color: isDark ? '#9ca3af' : '#6b7280' }}>
                {user?.email}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setIsDark(!isDark)}
              style={{ padding: '8px', background: isDark ? '#374151' : '#f3f4f6', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
            >
              {isDark ? <Sun style={{ width: '20px', height: '20px', color: '#fbbf24' }} /> : <Moon style={{ width: '20px', height: '20px', color: '#6b7280' }} />}
            </button>

            <button
              onClick={clearChat}
              style={{ padding: '8px', background: isDark ? '#374151' : '#f3f4f6', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
            >
              <Trash2 style={{ width: '20px', height: '20px', color: isDark ? '#ef4444' : '#dc2626' }} />
            </button>

            <button
              onClick={handleLogout}
              style={{ padding: '8px 16px', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: '600' }}
            >
              <LogOut style={{ width: '16px', height: '16px' }} />
              Logout
            </button>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 16px' }}>
        <div style={{ maxWidth: '1024px', margin: '0 auto' }}>
          {messages.map((message, index) => (
            <div
              key={index}
              style={{ display: 'flex', justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: '16px' }}
            >
              <div style={{ maxWidth: '85%' }}>
                <div style={{
                  padding: '12px 16px',
                  borderRadius: '16px',
                  background: message.role === 'user' 
                    ? 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)'
                    : isDark ? '#1f2937' : 'white',
                  color: message.role === 'user' ? 'white' : (isDark ? '#f3f4f6' : '#1f2937'),
                  border: message.role === 'assistant' ? '1px solid' : 'none',
                  borderColor: isDark ? '#374151' : '#e5e7eb',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                  <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{message.content}</p>
                </div>
                <span style={{ fontSize: '11px', color: isDark ? '#9ca3af' : '#6b7280', marginTop: '4px', display: 'block', textAlign: message.role === 'user' ? 'right' : 'left' }}>
                  {new Date(message.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <div style={{ padding: '12px 16px', background: isDark ? '#1f2937' : 'white', border: '1px solid', borderColor: isDark ? '#374151' : '#e5e7eb', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Loader2 style={{ width: '20px', height: '20px', color: '#6366f1', animation: 'spin 1s linear infinite' }} />
                <span style={{ fontSize: '14px', color: isDark ? '#9ca3af' : '#6b7280' }}>Vehi is thinking...</span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div style={{ background: isDark ? '#1f2937' : 'white', borderTop: '1px solid', borderColor: isDark ? '#374151' : '#e5e7eb', padding: '16px' }}>
        <div style={{ maxWidth: '1024px', margin: '0 auto', display: 'flex', gap: '8px' }}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask Vehi anything..."
            disabled={isLoading}
            rows={1}
            style={{
              flex: 1,
              padding: '12px 16px',
              border: '2px solid',
              borderColor: isDark ? '#374151' : '#e5e7eb',
              borderRadius: '12px',
              fontSize: '14px',
              background: isDark ? '#111827' : 'white',
              color: isDark ? '#f3f4f6' : '#1f2937',
              resize: 'none',
              outline: 'none'
            }}
          />

          <button
            onClick={handleSubmit}
            disabled={isLoading || !input.trim()}
            style={{
              padding: '12px 24px',
              background: (isLoading || !input.trim()) ? '#9ca3af' : 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              cursor: (isLoading || !input.trim()) ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Send style={{ width: '20px', height: '20px' }} />
          </button>
        </div>

        <p style={{ textAlign: 'center', marginTop: '12px', fontSize: '12px', color: isDark ? '#9ca3af' : '#6b7280' }}>
          ✨ Powered by Advanced AI
        </p>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
