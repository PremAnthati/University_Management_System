import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import ReactMarkdown from 'react-markdown';
import './Chat.css';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: `Hello! I'm your AI assistant. I can help you with academic questions, university information, study tips, and general guidance. How can I assist you today?`,
      sender: 'bot',
      timestamp: new Date()
    }
  ]);

  useEffect(() => {
    console.log('Gemini API Key in Chat:', process.env.REACT_APP_GEMINI_API_KEY);
    // Update the welcome message with API key status
    setMessages(prev => prev.map(msg =>
      msg.id === '1'
        ? {
            ...msg,
            text: `Hello! I'm your AI assistant. I can help you with academic questions, university information, study tips, and general guidance. How can I assist you today?

${process.env.REACT_APP_GEMINI_API_KEY ? '✅ API key configured' : '❌ API key not configured'}`
          }
        : msg
    ));
  }, []);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
      if (!API_KEY) {
        throw new Error('Gemini API key not found');
      }

      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      // Create context from previous messages
      const context = messages.slice(-5).map(msg =>
        `${msg.sender === 'user' ? 'Student' : 'Assistant'}: ${msg.text}`
      ).join('\n');

      const prompt = `You are an AI assistant for university students. Help with academic questions, study advice, university procedures, and general guidance.

Previous conversation:
${context}

Student: ${inputMessage}

Assistant: Provide a helpful, well-structured response as a university student assistant. Use markdown formatting with:
- **Headings** for main topics (## Heading)
- **Bullet points** for lists (- item)
- **Numbered lists** for steps (1. step)
- **Bold text** for emphasis (**text**)
- **Code blocks** for examples
Keep responses friendly, supportive, and organized for easy reading.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const botResponse = response.text();

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      let errorText = "Sorry, I'm having trouble connecting right now. Please try again later.";
      if (error instanceof Error) {
        if (error.message.includes('API key')) {
          errorText = "API key not configured. Please check your Gemini API key.";
        } else if (error.message.includes('fetch')) {
          errorText = "Network error. Please check your internet connection.";
        } else {
          errorText = `Error: ${error.message}`;
        }
      }
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: errorText,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>🤖 AI Assistant</h2>
        <p>Your personal academic helper</p>
      </div>

      <div className="chat-messages">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`message ${message.sender === 'user' ? 'user-message' : 'bot-message'}`}
          >
            <div className="message-content">
              {message.sender === 'bot' ? (
                <ReactMarkdown
                  components={{
                    h1: ({ children }) => <h1 style={{ fontSize: '1.2em', margin: '0 0 8px 0', fontWeight: 'bold' }}>{children}</h1>,
                    h2: ({ children }) => <h2 style={{ fontSize: '1.1em', margin: '0 0 6px 0', fontWeight: 'bold' }}>{children}</h2>,
                    h3: ({ children }) => <h3 style={{ fontSize: '1em', margin: '0 0 4px 0', fontWeight: 'bold' }}>{children}</h3>,
                    p: ({ children }) => <p style={{ margin: '0 0 8px 0', lineHeight: '1.4' }}>{children}</p>,
                    ul: ({ children }) => <ul style={{ margin: '0 0 8px 0', paddingLeft: '20px' }}>{children}</ul>,
                    ol: ({ children }) => <ol style={{ margin: '0 0 8px 0', paddingLeft: '20px' }}>{children}</ol>,
                    li: ({ children }) => <li style={{ margin: '4px 0' }}>{children}</li>,
                    strong: ({ children }) => <strong style={{ fontWeight: 'bold' }}>{children}</strong>,
                    em: ({ children }) => <em style={{ fontStyle: 'italic' }}>{children}</em>,
                    code: ({ children }) => <code style={{
                      background: '#f1f1f1',
                      padding: '2px 4px',
                      borderRadius: '3px',
                      fontFamily: 'monospace',
                      fontSize: '0.9em'
                    }}>{children}</code>,
                    pre: ({ children }) => <pre style={{
                      background: '#f1f1f1',
                      padding: '8px',
                      borderRadius: '4px',
                      overflow: 'auto',
                      fontSize: '0.9em',
                      margin: '8px 0'
                    }}>{children}</pre>
                  }}
                >
                  {message.text}
                </ReactMarkdown>
              ) : (
                <p>{message.text}</p>
              )}
              <span className="message-time">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message bot-message">
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        <div className="chat-input-wrapper">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about your studies..."
            rows={1}
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="send-button"
          >
            {isLoading ? '⏳' : '📤'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;