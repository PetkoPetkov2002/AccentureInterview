"use client";

import UserMessage from './UserMessage';
import AssistantMessage from './AssistantMessage';
import styles from './ChatWindow.module.css';

export default function ChatWindow({ messages = [] }) {
  return (
    <div className={styles.chatWindow}>
      <div className={styles.messagesContainer}>
        {messages.length > 0 ? (
          messages.map((message, index) => (
            message.isUser ? (
              <UserMessage key={index} message={message} />
            ) : (
              <AssistantMessage key={index} message={message} />
            )
          ))
        ) : (
          <div className="text-center text-gray-500">
            No messages yet. Start a conversation!
          </div>
        )}
      </div>
    </div>
  );
} 