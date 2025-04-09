"use client";

import { useState, useRef, useEffect } from 'react';
import ChatWindow from '../../components/ChatWindow';
import MessageInput from '../../components/MessageInput';
import styles from './CanvasChatContainer.module.css';
import { editChat } from '../../services/editChat';
import { selectionEdit } from '../../services/selectionEdit';

export default function CanvasChatContainer({ threadId, addDescription, jobDescription, selectedText, aiEditing }) {
  const [messages, setMessages] = useState([
    { text: "Hello! I'm here to help with your job description. What would you like to modify?", isUser: false }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentThreadId, setCurrentThreadId] = useState(threadId);
  const chatWindowRef = useRef(null);
  
  useEffect(() => {
    console.log("Current jobDescription in CanvasChatContainer:", jobDescription);
  }, [jobDescription]);
  
  const handleSendMessage = async (messageText) => {
    // Add user message
    setMessages(prev => [...prev, { text: messageText, isUser: true }]);
    const formattedJobDescription = {
      title: jobDescription?.title || "",
      description: jobDescription?.description || "",
      version: jobDescription?.version || 1
    };
    let response;
    // Set loading state
    setIsLoading(true);
    if (aiEditing){
     
      console.log("AI Editing is true");
      console.log("Selected text:", selectedText);
      response = await selectionEdit(currentThreadId, messageText, selectedText, formattedJobDescription);
      
    } else {

    
      try {
        // Make sure jobDescription has the required fields with correct types
        
        
        console.log("Sending formatted job description:", formattedJobDescription);
        
        // Call backend API with the current threadId
        console.log("Current threadId:", currentThreadId);
        const response = await editChat(currentThreadId, messageText, formattedJobDescription);
        
        // Store the thread_id returned from the backend
        if (response.thread_id) {
          setCurrentThreadId(response.thread_id);
        }
        
      } catch (error) {
        console.error("Error getting response:", error);
        // Add error message
        setMessages(prev => [...prev, { 
          text: "Sorry, there was an error connecting to the backend.", 
          isUser: false 
        }]);
      } 
    }
    setMessages(prev => [...prev, { 
      text: response.response || "Sorry, I didn't get a proper response.", 
      isUser: false 
    }]);
  
    // Add the job description to the canvas if it exists in the response
    if (response.job_description) {
      // Create a complete job description object with all parameters
      const newJobDescription = {
        title: response.job_description.title || "",
        description: response.job_description.description || "",
        version: response.job_description.version || 1,
        gender_recommendations: response.gender_recommendations || []
      };
      addDescription(newJobDescription);
    }
      
     
    
   
  };

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollToBottom();
    }
  }, [messages]);

  return (
    <div className={styles.canvasChatContainer}>
      <div className={styles.chatHeader}>
        <h2>Chat Assistant</h2>
      </div>
      <ChatWindow messages={messages} isLoading={isLoading} ref={chatWindowRef} />
      <div className={styles.inputWrapper}>
        <MessageInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
} 