"use client";

import { useState } from 'react';
import ChatWindow from './ChatWindow';
import MessageInput from './MessageInput';
import styles from './ChatContainer.module.css';

export default function ChatContainer() {
  const [messages, setMessages] = useState([
    { text: "Hello! How can I help you today?", isUser: false }
  ]);

  const handleSendMessage = (messageText) => {
    // Add user message
    setMessages(prev => [...prev, { text: messageText, isUser: true }]);
    
    // Simulate response (in a real app, this would come from an API)
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        text: "This is a simulated response to your message.", 
        isUser: false 
      }]);
    }, 1000);
  };

  return (
    <div className={styles.chatContainer}>
      <ChatWindow messages={messages} />
      <div className={styles.inputWrapper}>
        <MessageInput onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
} 