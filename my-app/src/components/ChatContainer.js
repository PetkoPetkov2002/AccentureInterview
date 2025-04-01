"use client";

import { useState, useRef , useEffect} from 'react';
import { useRouter } from 'next/navigation';
import ChatWindow from './ChatWindow';
import MessageInput from './MessageInput';
import styles from './ChatContainer.module.css';
import { sendMessage } from '@/services/api';

export default function ChatContainer() {
  const router = useRouter();
  const [messages, setMessages] = useState([
    { text: "Hello! How can I help you today?", isUser: false }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const chatWindowRef = useRef(null);
  const [threadId, setThreadId] = useState(null);
  const handleSendMessage = async (messageText) => {
    // Add user message
    setMessages(prev => [...prev, { text: messageText, isUser: true }]);
    
    // Set loading state
    setIsLoading(true);
    
    try {
      // Call backend API
      const response = await sendMessage(messageText, threadId);
      if (response.thread_id) {
        setThreadId(response.thread_id);
      }
      // Add response from API
      setMessages(prev => [...prev, { 
        text: response.response || "Sorry, I didn't get a proper response.", 
        isUser: false 
      }]);

      // Check if we should redirect
      if (response.isGenerated) {
        // You can pass any data you need via query parameters
        const queryParams = new URLSearchParams({
          jobTitle: response.jobTitle || '',
          description: response.description || '',
          threadId: threadId || ''
        }).toString();
        
        router.push(`/generated?${queryParams}`);
      }
    } catch (error) {
      console.error("Error getting response:", error);
      // Add error message
      setMessages(prev => [...prev, { 
        text: "Sorry, there was an error connecting to the backend.", 
        isUser: false 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollToBottom();
    }
  }, [messages]);

  return (
    <div className={styles.chatContainer}>
      <ChatWindow messages={messages} isLoading={isLoading} ref ={chatWindowRef} />
      <div className={styles.inputWrapper}>
        <MessageInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
} 