"use client";

import { useState, useRef, useLayoutEffect } from 'react';
import styles from './MessageInput.module.css';

export default function MessageInput({ onSendMessage, isLoading = false }) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef(null);

  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [message]);

  const handleInputChange = (e) => {
    setMessage(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message);
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.messageForm}>
      <div className={styles.messageInputContainer}>
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={isLoading ? "Waiting for response..." : "Type your message..."}
          className={styles.messageInput}
          disabled={isLoading}
          rows="1"
          style={{ overflowY: 'hidden' }}
        />
        <button
          type="submit"
          className={`${styles.sendButton} ${isLoading ? styles.disabled : ''}`}
          disabled={isLoading}
        >
          {isLoading ? "..." : "Send"}
        </button>
      </div>
    </form>
  );
} 