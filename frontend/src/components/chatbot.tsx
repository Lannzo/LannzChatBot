import React, { useState, useEffect, useRef } from 'react';
import { Send, User} from 'lucide-react';

import StaticAvatar from "../assets/MYCHIBI.png";
import TalkingAvatar from "../assets/talking_chibi.png";

// Define types
type Message = {
  id: string;
  role: 'user' | 'bot';
  content: string;
  timestamp: Date;
};

type ApiResponse = {
  answer: string;
};

function Chatbot() {
  const [message, setMessage] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<boolean>(false);

  // Reference to the end of the chat
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to the bottom of the chat when new messages are added
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, isTyping]);

  /*
  const getMockResponse = async (userMessage: string): Promise<ApiResponse> => {
    return new Promise(resolve => {
      setTimeout(() => {
        let botAnswer = "I'm here to help! Could you please rephrase your question?";
        
        const msg = userMessage.toLowerCase();
        
        if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
          botAnswer = 'Hello! How can I assist you today?';
        } else if (msg.includes('name')) {
          botAnswer = 'Hi! My name is Michael Lannz Salalima, but you can call me Lannz. Nice to meet you!';
        } else if (msg.includes('how are you')) {
          botAnswer = "I'm doing great, thank you for asking! How are you doing today?";
        } else if (msg.includes('help')) {
          botAnswer = "I'm here to help! You can ask me about my name, say hello, or just chat with me.";
        } else if (msg.includes('bye') || msg.includes('goodbye')) {
          botAnswer = "Goodbye! It was nice chatting with you. Have a great day!";
        } else if (msg.includes('thank')) {
          botAnswer = "You're very welcome! Is there anything else I can help you with?";
        } else if (msg.includes('weather')) {
          botAnswer = "I don't have access to real-time weather data, but I hope it's beautiful where you are!";
        } else if (msg.includes('time')) {
          botAnswer = `The current time is ${new Date().toLocaleTimeString()}.`;
        }
        
        resolve({ answer: botAnswer });
      }, Math.random() * 1500 + 500); // Random delay between 0.5-2 seconds
    });
  }; */

  // Generate unique ID for messages
  const generateId = () => Math.random().toString(36).substr(2, 9);

  // Event handler for sending a message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!message.trim() || isLoading) return;

    const newUserMessage: Message = { 
      id: generateId(),
      role: 'user', 
      content: message,
      timestamp: new Date()
    };
    
    setChatHistory(prev => [...prev, newUserMessage]);
    const currentMessage = message;
    setMessage('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      const response = await fetch('http://localhost:5000/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: currentMessage }),
      });
      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`);
      }
      
      const data: ApiResponse = await response.json();
      const botResponse: Message = { 
        id: generateId(),
        role: 'bot', 
        content: data.answer,
        timestamp: new Date()
      };
      
      setChatHistory(prev => [...prev, botResponse]);

    } catch (error) {
      console.error('Error getting response:', error);
      const errorResponse: Message = {
        id: generateId(),
        role: 'bot',
        content: 'Sorry, I encountered an error connecting to AI. Please try again.',
        timestamp: new Date()
      };

      setChatHistory(prev => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Format timestamp
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-96 w-full max-w-md mx-auto bg-white rounded-lg shadow-lg border border-gray-300 overflow-hidden">
      
      {/* Header */}
      <div className="bg-blue-600 p-4 text-white">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full overflow-hidden mr-3 border-2 border-white">
            <img 
              src={isLoading ? TalkingAvatar : StaticAvatar} 
              alt="Lannz Avatar"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-semibold">Lannz ChatBot</h1>
            <p className="text-sm text-blue-100">Always here to help</p>
          </div>
          <div className={`w-3 h-3 rounded-full ${isLoading ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`}></div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
        
        {/* Welcome message */}
        {chatHistory.length === 0 && (
          <div className="text-center py-8">
            <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-4 border-4 border-blue-200">
              <img 
                src={StaticAvatar} 
                alt="Lannz Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Welcome to Lannz ChatBot!</h3>
            <p className="text-gray-600 text-sm">Start a conversation by typing a message below.</p>
          </div>
        )}

        {/* Chat Messages */}
        <div className="space-y-4">
          {chatHistory.map((msg) => (
            <div key={msg.id} className={`flex items-start ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full overflow-hidden flex-shrink-0 ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white ml-2' 
                  : 'mr-2'
              }`}>
                {msg.role === 'user' ? (
                  <User className="w-full h-full p-1 bg-blue-600 text-white rounded-full" />
                ) : (
                  <img 
                    src={StaticAvatar} 
                    alt="Lannz"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              {/* Message bubble */}
              <div className={`flex flex-col max-w-xs ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`px-4 py-2 rounded-lg ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-800 shadow-sm border border-gray-200'
                }`}>
                  <p className="text-sm">{msg.content}</p>
                </div>
                <span className="text-xs text-gray-500 mt-1 px-2">
                  {formatTime(msg.timestamp)}
                </span>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex items-start">
              <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 mr-2">
                <img 
                  src={TalkingAvatar} 
                  alt="Lannz thinking"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="bg-white rounded-lg px-4 py-3 shadow-sm border border-gray-200">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="relative flex items-center">
          <input
            type="text"
            value={message}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMessage(e.target.value)}
            onKeyUp={handleKeyPress}
            placeholder={isLoading ? "Lannz is thinking..." : "Type your message..."}
            disabled={isLoading}
            className="w-full rounded-full py-3 pl-4 pr-12 text-gray-700 bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white disabled:opacity-50"
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !message.trim()}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        
        {/* Message count */}
        {chatHistory.length > 0 && (
          <div className="text-center mt-2">
            <span className="text-xs text-gray-500">
              {chatHistory.length} message{chatHistory.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default Chatbot;