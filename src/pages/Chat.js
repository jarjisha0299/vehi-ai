import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Loader2, Moon, Sun, Trash2, LogOut, Save, Download, History } from 'lucide-react';
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
      content: `Hello ${user?.user_metadata?.name || 'there'}! 👋\n\nI'm **Vehi**, your intelligent AI assistant powered by advanced technology.\n\nI can help you with:\n- Answering questions\n- Writing code\n- Creative writing\n- Problem solving\n- And much more!\n\nHow can I assist you today?`,
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [savedChats, setSavedChats] = useState([]);
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

  const loadChatHistory = async () => {
    // Ensuring user.id is available before fetching
    if (!user || !user.id) return;
    const result = await getChatHistory(user.id);
    if (result.success) {
      setSavedChats(result.data || []);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  // Helper function to safely replace alert/confirm with console logs (Crucial for Canvas environments)
  const showModalMessage = (message, isConfirm = false) => {
    console.log(`[Modal Message]: ${message}`);
    // In a real application, you would replace this with a custom modal/toast UI.
    return isConfirm ? window.confirm(message) : alert(message);
  };
  
  // Note: I am replacing window.confirm/alert with a safer placeholder (though leaving the original behavior for now, since I can't implement a full modal UI without more context, but adding a console log guard).

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
      // Get only last 10 messages for context
      const contextMessages = newMessages.slice(-10);

      const result = await sendMessage(userMessage.content, contextMessages.slice(0, -1));

      if (result.success) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: result.text,
          timestamp: Date.now()
        }]);
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: result.error || 'Sorry, I encountered an error. Please try again.',
          timestamp: Date.now()
        }]);
      }
    } catch (error) {
      console.error('Chat error:', error);
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

  const saveChat = async () => {
    if (!user || !user.id) {
        showModalMessage('Authentication required to save chat.');
        return;
    }
    const result = await saveChatHistory(user.id, messages);
    if (result.success) {
      showModalMessage('Chat saved successfully! ✅');
      loadChatHistory();
    } else {
      showModalMessage('Failed to save chat. Please try again.');
    }
  };

  const loadSavedChat = (chat) => {
    try {
      const parsedMessages = JSON.parse(chat.messages);
      setMessages(parsedMessages);
      setShowHistory(false);
    } catch (error) {
      showModalMessage('Failed to load chat');
    }
  };

  const clearChat = async () => {
    // Note: window.confirm should be replaced by a custom modal in a real app
    if (showModalMessage('Clear current conversation?', true)) {
      setMessages([{
        role: 'assistant',
        content: 'Chat cleared! How can I help you?',
        timestamp: Date.now()
      }]);
    }
  };

  const deleteAllHistory = async () => {
    if (!user || !user.id) return;
    // Note: window.confirm should be replaced by a custom modal in a real app
    if (showModalMessage('Delete all saved chats? This cannot be undone.', true)) {
      const result = await deleteChatHistory(user.id);
      if (result.success) {
        showModalMessage('All chat history deleted! ✅');
        setSavedChats([]); // Clear local state immediately
      } else {
         showModalMessage('Failed to delete history. Please try again.');
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
    document.body.appendChild(a); // Append to trigger download in all browsers
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url); // Clean up the URL object
  };

  const bgClass = isDark ? '#111827' : '#f9fafb';
  const headerClass = isDark ? '#1f2937' : 'white';
  const borderClass = isDark ? '#374151' : '#e5e7eb';
  const textClass = isDark ? '#f3f4f6' : '#1f2937';
  const mutedTextClass = isDark ? '#9ca3af' : '#6b7280';

  // Custom component for message rendering
  const MarkdownRenderer = ({ message, isDark }) => (
      <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
              code({node, inline, className, children, ...props}) {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline && match ? (
                      <SyntaxHighlighter
                          style={isDark ? vscDarkPlus : vs}
                          language={match[1]}
                          PreTag="div"
                          {...props}
                      >
                          {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                  ) : (
                      <code className={className} {...props}>
                          {children}
                      </code>
                  );
              }
          }}
      >
          {message.content}
      </ReactMarkdown>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: bgClass, transition: 'background 0.3s' }}>
      {/* Header */}
      <div style={{ background: headerClass, borderBottom: '1px solid ' + borderClass, padding: '12px 16px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles style={{ color: 'white', width: '24px', height: '24px' }} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: textClass }}>Vehi AI</h1>
              <p style={{ margin: 0, fontSize: '12px', color: mutedTextClass }}>
                {user?.email}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setShowHistory(!showHistory)}
              style={{ padding: '8px', background: isDark ? '#374151' : '#f3f4f6', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
              title="Chat History"
            >
              <History style={{ width: '20px', height: '20px', color: mutedTextClass }} />
            </button>

            <button
              onClick={saveChat}
              style={{ padding: '8px', background: isDark ? '#374151' : '#f3f4f6', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
              title="Save Chat"
            >
              <Save style={{ width: '20px', height: '20px', color: '#10b981' }} />
            </button>

            <button
              onClick={exportChat}
              style={{ padding: '8px', background: isDark ? '#374151' : '#f3f4f6', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
              title="Export Chat"
            >
              <Download style={{ width: '20px', height: '20px', color: '#3b82f6' }} />
            </button>

            <button
              onClick={() => setIsDark(!isDark)}
              style={{ padding: '8px', background: isDark ? '#374151' : '#f3f4f6', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
            >
              {isDark ? <Sun style={{ width: '20px', height: '20px', color: '#fbbf24' }} /> : <Moon style={{ width: '20px', height: '20px', color: mutedTextClass }} />}
            </button>

            <button
              onClick={clearChat}
              style={{ padding: '8px', background: isDark ? '#374151' : '#f3f4f6', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
              title="Clear Chat"
            >
              <Trash2 style={{ width: '20px', height: '20px', color: '#ef4444' }} />
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

      {/* History Sidebar */}
      {showHistory && (
        <div style={{
          position: 'fixed',
          top: '64px',
          right: 0,
          width: '300px',
          height: 'calc(100vh - 64px)',
          background: headerClass,
          borderLeft: '1px solid ' + borderClass,
          padding: '16px',
          overflowY: 'auto',
          zIndex: 1000
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, color: textClass, fontSize: '16px' }}>Saved Chats</h3>
            <button
              onClick={deleteAllHistory}
              style={{ padding: '6px 12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
            >
              Delete All
            </button>
          </div>

          {savedChats.length === 0 ? (
            <p style={{ color: mutedTextClass, fontSize: '14px' }}>No saved chats yet</p>
          ) : (
            savedChats.map((chat, index) => (
              <div
                key={chat.id}
                onClick={() => loadSavedChat(chat)}
                style={{
                  padding: '12px',
                  background: isDark ? '#374151' : '#f3f4f6',
                  borderRadius: '8px',
                  marginBottom: '8px',
                  cursor: 'pointer',
                  border: '1px solid ' + borderClass
                }}
              >
                <p style={{ margin: 0, fontSize: '12px', color: mutedTextClass }}>
                  {new Date(chat.created_at).toLocaleString()}
                </p>
                <p style={{ margin: '4px 0 0', fontSize: '14px', color: textClass, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  Chat #{savedChats.length - index}
                </p>
              </div>
            ))
          )}
        </div>
      )}

      {/* Messages */}
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
                  color: message.role === 'user' ? 'white' : textClass,
                  border: message.role === 'assistant' ? '1px solid ' + borderClass : 'none',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                  {message.role === 'assistant' ? (
                    <MarkdownRenderer message={message} isDark={isDark} />
                  ) : (
                    <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{message.content}</p>
                  )}
                </div>
                <span style={{ fontSize: '11px', color: mutedTextClass, marginTop: '4px', display: 'block', textAlign: message.role === 'user' ? 'right' : 'left' }}>
                  {new Date(message.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}

          {isLoading && (
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <div style={{ padding: '12px 16px', background: isDark ? '#1f2937' : 'white', border: '1px solid ' + borderClass, borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Loader2 style={{ width: '20px', height: '20px', color: '#6366f1', animation: 'spin 1s linear infinite' }} />
                <span style={{ fontSize: '14px', color: mutedTextClass }}>Vehi is thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div style={{ background: headerClass, borderTop: '1px solid ' + borderClass, padding: '16px' }}>
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
              border: '2px solid ' + borderClass,
              borderRadius: '12px',
              fontSize: '14px',
              background: isDark ? '#111827' : 'white',
              color: textClass,
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

        <p style={{ textAlign: 'center', marginTop: '12px', fontSize: '12px', color: mutedTextClass }}>
          vehi can make mistakes!
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
} // <--- FIX: This closes the 'export default function Chat() {' component

