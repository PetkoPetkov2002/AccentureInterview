"use client";

import { useState } from 'react';
import styles from './MessageInput.module.css';

export default function MessageInput({ onSendMessage, isLoading = false }) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message);
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className={styles.messageInputContainer}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={isLoading ? "Waiting for response..." : "Type your message..."}
          className={styles.messageInput}
          disabled={isLoading}
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