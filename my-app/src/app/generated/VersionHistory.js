"use client";

import React from 'react';
import VersionItem from './VersionItem';
import { VersionProvider } from './VersionContext';
import styles from './VersionHistory.module.css';

export default function VersionHistory({ versions = [], currentVersion = 1, setDescription }) {
  return (
    <VersionProvider initialVersions={versions} setDescription={setDescription}>
      <div className={styles.versionHistoryContainer}>
        <div className={styles.header}>
          <h2 className={styles.title}>Version History</h2>
        </div>
        <div className={styles.content}>
          {versions.length === 0 ? (
            <p className={styles.emptyState}>No version history available</p>
          ) : (
            <div className={styles.versionList}>
              {versions.map((version) => (
                <VersionItem 
                  key={version.version}
                  jobDescription={version}
                  isCurrentVersion={version.version === currentVersion}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </VersionProvider>
  );
} 