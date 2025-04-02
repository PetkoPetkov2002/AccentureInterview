"use client";

import React from 'react';
import styles from './VersionHistory.module.css';

export default function VersionHistory({ versions = [], currentVersion = 1 }) {
  return (
    <div className={styles.versionHistoryContainer}>
      <div className={styles.header}>
        <h2 className={styles.title}>Version History</h2>
      </div>
      <div className={styles.content}>
        {versions.length === 0 ? (
          <p className={styles.emptyState}>No version history available</p>
        ) : (
          <ul className={styles.versionList}>
            {versions.map((version, index) => (
              <li 
                key={index} 
                className={`${styles.versionItem} ${version.version === currentVersion ? styles.currentVersion : ''}`}
              >
                <div className={styles.versionNumber}>
                  <span>v{version.version}</span>
                </div>
                <div className={styles.versionInfo}>
                  <h3 className={styles.versionTitle}>{version.title}</h3>
                  <p className={styles.versionDescription}>
                    {version.description.length > 100 
                      ? `${version.description.substring(0, 100)}...` 
                      : version.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
} 