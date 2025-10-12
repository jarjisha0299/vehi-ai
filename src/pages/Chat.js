import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Loader2, Moon, Sun, Trash2, LogOut, Save, Download, History, Copy, Check } from 'lucide-react';
import { useAuth } from '../utils/AuthContext';
import { useNavigate } from 'react-router-dom';
import { sendMessage } from '../services/geminiService';
import { saveChatHistory, getChatHistory, deleteChatHistory } from '../services/chatHistoryService';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function Chat() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    { 
      role: 'assistant', 
      content: `Hello **${user?.user_metadata?.name || 'there'}**! 👋\n\nI'm **Vehi AI**, your intelligent assistant powered by Google Gemini.\n\n**I can help you with:**\n- Answering questions\n- Writing code\n- Creative writing\n- Problem solving\n- Explanations\n- And much more!\n\nHow can I assist you today?`, 
      timestamp: Date.now() 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDark, setIsDark] = useState(localStorage.getItem('theme') === 'dark');
  const [showHistory, setShowHistory] = useState(false);
  const [savedChats, setSavedChats] = useState([]);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadChatHistory();
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const loadChatHistory = async () => {
    const result = await getChatHistory(user.id);
    if (result.success) {
      setSavedChats(result.data || []);
    }
  };

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      await signOut();
      navigate('/login');
    }
  };

  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: Date.now()
    };

    setInput('');
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);

    try {
const result = await sendMessage(userMessage.content);      
      if (result.success) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: result.text,
          timestamp: Date.now()
        }]);
      } else {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: `⚠️ ${result.error}`,
          timestamp: Date.now()
        }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: '⚠️ Sorry, something went wrong. Please try again.',
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

  const saveChat = async () => {
    const result = await saveChatHistory(user.id, messages);
    if (result.success) {
      alert('✅ Chat saved successfully!');
      loadChatHistory();
    } else {
      alert('❌ Failed to save chat. Please try again.');
    }
  };

  const loadSavedChat = (chat) => {
    try {
      const parsedMessages = JSON.parse(chat.messages);
      setMessages(parsedMessages);
      setShowHistory(false);
      alert('✅ Chat loaded!');
    } catch (error) {
      alert('❌ Failed to load chat');
    }
  };

  const clearChat = () => {
    if (window.confirm('Clear current conversation?')) {
      setMessages([{
        role: 'assistant',
        content: '✨ Chat cleared! How can I help you?',
        timestamp: Date.now()
      }]);
    }
  };

  const deleteAllHistory = async () => {
    if (window.confirm('⚠️ Delete ALL saved chats? This cannot be undone.')) {
      const result = await deleteChatHistory(user.id);
      if (result.success) {
        alert('✅ All chat history deleted!');
        loadChatHistory();
      } else {
        alert('❌ Failed to delete history');
      }
    }
  };

  const exportChat = () => {
    const text = messages.map(m => 
      `[${new Date(m.timestamp).toLocaleString()}] ${m.role.toUpperCase()}:\n${m.content}\n`
    ).join('\n---\n\n');
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vehi-chat-${Date.now()}.txt`;
    a.click();
    alert('✅ Chat exported!');
  };

  const copyMessage = (content, index) => {
    navigator.clipboard.writeText(content);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const bgClass = isDark ? '#0f172a' : '#f8fafc';
  const headerClass = isDark ? '#1e293b' : 'white';
  const borderClass = isDark ? '#334155' : '#e2e8f0';
  const textClass = isDark ? '#f1f5f9' : '#0f172a';
  const mutedTextClass = isDark ? '#94a3b8' : '#64748b';
  const cardClass = isDark ? '#1e293b' : 'white';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: bgClass, transition: 'all 0.3s' }}>
      {/* Header */}
      <div style={{ background: headerClass, borderBottom: `1px solid ${borderClass}`, padding: '12px 16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '44px', height: '44px', background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)' }}>
              <Sparkles style={{ color: 'white', width: '24px', height: '24px' }} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '700', color: textClass }}>Vehi AI</h1>
              <p style={{ margin: 0, fontSize: '12px', color: mutedTextClass }}>
                {user?.email}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <button onClick={() => setShowHistory(!showHistory)} style={{ padding: '8px 12px', background: isDark ? '#334155' : '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '500', color: textClass }} title="Chat History">
              <History style={{ width: '16px', height: '16px' }} />
              <span style={{ display: window.innerWidth > 640 ? 'inline' : 'none' }}>History</span>
            </button>

            <button onClick={saveChat} style={{ padding: '8px 12px', background: isDark ? '#334155' : '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '500', color: textClass }} title="Save Chat">
              <Save style={{ width: '16px', height: '16px', color: '#10b981' }} />
              <span style={{ display: window.innerWidth > 640 ? 'inline' : 'none' }}>Save</span>
            </button>

            <button onClick={exportChat} style={{ padding: '8px 12px', background: isDark ? '#334155' : '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '500', color: textClass }} title="Export">
              <Download style={{ width: '16px', height: '16px', color: '#3b82f6' }} />
            </button>

            <button onClick={() => setIsDark(!isDark)} style={{ padding: '8px 12px', background: isDark ? '#334155' : '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer' }} title={isDark ? 'Light Mode' : 'Dark Mode'}>
              {isDark ? <Sun style={{ width: '16px', height: '16px', color: '#fbbf24' }} /> : <Moon style={{ width: '16px', height: '16px', color: mutedTextClass }} />}
            </button>

            <button onClick={clearChat} style={{ padding: '8px 12px', background: isDark ? '#334155' : '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer' }} title="Clear Chat">
              <Trash2 style={{ width: '16px', height: '16px', color: '#ef4444' }} />
            </button>

            <button onClick={handleLogout} style={{ padding: '8px 16px', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: '600' }}>
              <LogOut style={{ width: '16px', height: '16px' }} />
              <span style={{ display: window.innerWidth > 640 ? 'inline' : 'none' }}>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* History Sidebar */}
      {showHistory && (
        <div style={{ 
          position: 'fixed', 
          top: '72px', 
          right: 0, 
          width: '320px', 
          maxWidth: '90vw',
          height: 'calc(100vh - 72px)', 
          background: cardClass, 
          borderLeft: `1px solid ${borderClass}`, 
          padding: '16px',
          overflowY: 'auto',
          zIndex: 1000,
          boxShadow: '-4px 0 12px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, color: textClass, fontSize: '18px', fontWeight: '600' }}>Saved Chats</h3>
            <button onClick={deleteAllHistory} style={{ padding: '6px 12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}>
              Delete All
            </button>
          </div>

          {savedChats.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <p style={{ color: mutedTextClass, fontSize: '14px' }}>No saved chats yet</p>
              <p style={{ color: mutedTextClass, fontSize: '12px', marginTop: '8px' }}>Click "Save" to store conversations</p>
            </div>
          ) : (
            savedChats.map((chat, index) => (
              <div
                key={chat.id}
                onClick={() => loadSavedChat(chat)}
                style={{
                  padding: '12px',
                  background: isDark ? '#334155' : '#f8fafc',
                  borderRadius: '8px',
                  marginBottom: '8px',
                  cursor: 'pointer',
                  border: `1px solid ${borderClass}`,
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <p style={{ margin: 0, fontSize: '12px', color: mutedTextClass }}>
                  📅 {new Date(chat.created_at).toLocaleDateString()} {new Date(chat.created_at).toLocaleTimeString()}
                </p>
                <p style={{ margin: '4px 0 0', fontSize: '14px', color: textClass, fontWeight: '500' }}>
                  Chat #{savedChats.length - index}
                </p>
              </div>
            ))
          )}
        </div>
      )}

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 16px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          {messages.map((message, index) => (
            <div key={index} style={{ display: 'flex', justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: '20px', animation: 'fadeIn 0.3s' }}>
              <div style={{ maxWidth: '85%' }}>
                <div style={{
                  padding: '14px 18px',
                  borderRadius: '16px',
                  background: message.role === 'user' 
                    ? 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)'
                    : cardClass,
                  color: message.role === 'user' ? 'white' : textClass,
                  border: message.role === 'assistant' ? `1px solid ${borderClass}` : 'none',
                  boxShadow: message.role === 'user' ? '0 4px 12px rgba(99, 102, 241, 0.3)' : '0 2px 8px rgba(0,0,0,0.05)',
                  position: 'relative'
                }}>
                  {message.role === 'assistant' ? (
                    <div style={{ fontSize: '15px', lineHeight: '1.7' }}>
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          code({node, inline, className, children, ...props}) {
                            const match = /language-(\w+)/.exec(className || '');
                            return !inline && match ? (
                              <div style={{ marginTop: '12px', marginBottom: '12px', borderRadius: '8px', overflow: 'hidden' }}>
                                <div style={{ background: isDark ? '#1e293b' : '#f1f5f9', padding: '8px 12px', fontSize: '12px', color: mutedTextClass, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span>{match[1]}</span>
                                  <button onClick={() => copyMessage(String(children), `code-${index}`)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: mutedTextClass, fontSize: '12px' }}>
                                    {copiedIndex === `code-${index}` ? '✓ Copied' : 'Copy'}
                                  </button>
                                </div>
                                <SyntaxHighlighter
                                  style={isDark ? vscDarkPlus : vs}
                                  language={match[1]}
                                  PreTag="div"
                                  customStyle={{ margin: 0, fontSize: '13px' }}
                                  {...props}
                                >
                                  {String(children).replace(/\n$/, '')}
                                </SyntaxHighlighter>
                              </div>
                            ) : (
                              <code style={{ background: isDark ? '#334155' : '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontSize: '14px' }} {...props}>
                                {children}
                              </code>
                            );
                          },
                          p: ({children}) => <p style={{ margin: '0 0 12px 0', lineHeight: '1.7' }}>{children}</p>,
                          ul: ({children}) => <ul style={{ marginLeft: '20px', marginBottom: '12px' }}>{children}</ul>,
                          ol: ({children}) => <ol style={{ marginLeft: '20px', marginBottom: '12px' }}>{children}</ol>,
                          h1: ({children}) => <h1 style={{ fontSize: '24px', marginBottom: '12px', fontWeight: '700' }}>{children}</h1>,
                          h2: ({children}) => <h2 style={{ fontSize: '20px', marginBottom: '10px', fontWeight: '600' }}>{children}</h2>,
                          h3: ({children}) => <h3 style={{ fontSize: '18px', marginBottom: '8px', fontWeight: '600' }}>{children}</h3>,
                          blockquote: ({children}) => <blockquote style={{ borderLeft: '4px solid #6366f1', paddingLeft: '16px', marginLeft: 0, color: mutedTextClass, fontStyle: 'italic' }}>{children}</blockquote>
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p style={{ margin: 0, fontSize: '15px', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{message.content}</p>
                  )}

                  {message.role === 'assistant' && (
                    <button
                      onClick={() => copyMessage(message.content, index)}
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        background: isDark ? '#334155' : '#f1f5f9',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '6px 10px',
                        cursor: 'pointer',
                        fontSize: '11px',
                        color: mutedTextClass,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        opacity: 0.7,
                        transition: 'opacity 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                      onMouseLeave={(e) => e.currentTarget.style.opacity = 0.7}
                    >
                      {copiedIndex === index ? <Check style={{ width: '12px', height: '12px' }} /> : <Copy style={{ width: '12px', height: '12px' }} />}
                      {copiedIndex === index ? 'Copied!' : 'Copy'}
                    </button>
                  )}
                </div>
                <span style={{ fontSize: '11px', color: mutedTextClass, marginTop: '6px', display: 'block', textAlign: message.role === 'user' ? 'right' : 'left' }}>
                  {new Date(message.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '20px' }}>
              <div style={{ padding: '14px 18px', background: cardClass, border: `1px solid ${borderClass}`, borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <Loader2 style={{ width: '18px', height: '18px', color: '#6366f1', animation: 'spin 1s linear infinite' }} />
                <span style={{ fontSize: '14px', color: mutedTextClass }}>Vehi is thinking...</span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div style={{ background: headerClass, borderTop: `1px solid ${borderClass}`, padding: '16px', boxShadow: '0 -1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask Vehi anything... (Press Enter to send)"
            disabled={isLoading}
            rows={1}
            style={{
              flex: 1,
              padding: '14px 16px',
              border: `2px solid ${borderClass}`,
              borderRadius: '12px',
              fontSize: '15px',
              background: isDark ? '#0f172a' : 'white',
              color: textClass,
              resize: 'none',
              outline: 'none',
              transition: 'border-color 0.2s',
              minHeight: '52px',
              maxHeight: '150px'
            }}
            onFocus={(e) => e.target.style.borderColor = '#6366f1'}
            onBlur={(e) => e.target.style.borderColor = borderClass}
          />

          <button
            onClick={handleSubmit}
            disabled={isLoading || !input.trim()}
            style={{
              padding: '14px 24px',
              background: (isLoading || !input.trim()) ? '#94a3b8' : 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: (isLoading || !input.trim()) ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: '600',
              fontSize: '15px',
              minHeight: '52px',
              boxShadow: (isLoading || !input.trim()) ? 'none' : '0 4px 12px rgba(99, 102, 241, 0.3)',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              if (!isLoading && input.trim()) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(99, 102, 241, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = (isLoading || !input.trim()) ? 'none' : '0 4px 12px rgba(99, 102, 241, 0.3)';
            }}
          >
            {isLoading ? (
              <>
                <Loader2 style={{ width: '18px', height: '18px', animation: 'spin 1s linear infinite' }} />
                <span style={{ display: window.innerWidth > 640 ? 'inline' : 'none' }}>Sending...</span>
              </>
            ) : (
              <>
                <Send style={{ width: '18px', height: '18px' }} />
                <span style={{ display: window.innerWidth > 640 ? 'inline' : 'none' }}>Send</span>
              </>
            )}
          </button>
        </div>

        <p style={{ textAlign: 'center', marginTop: '12px', fontSize: '12px', color: mutedTextClass }}>
          ✨ Powered by Gemini AI • Made with ❤️ by Jarjish
        </p>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
