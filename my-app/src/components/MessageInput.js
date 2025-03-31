"use client";

import { useState } from 'react';
import styles from './MessageInput.module.css';

export default function MessageInput({ onSendMessage }) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
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
          placeholder="Type your message..."
          className={styles.messageInput}
        />
        <button
          type="submit"
          className={styles.sendButton}
        >
          Send
        </button>
      </div>
    </form>
  );
} 