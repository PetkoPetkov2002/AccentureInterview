"use client";

import styles from './AssistantMessage.module.css';

export default function AssistantMessage({ message }) {
  return (
    <div className={styles.assistantMessage}>
      {message.text}
    </div>
  );
} 