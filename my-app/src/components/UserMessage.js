"use client";

import styles from './UserMessage.module.css';

export default function UserMessage({ message }) {
  return (
    <div className={styles.userMessage}>
      {message.text}
    </div>
  );
} 