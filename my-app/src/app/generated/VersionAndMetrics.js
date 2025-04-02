"use client";

import React from 'react';
import VersionHistory from './VersionHistory';
import Metrics from './Metrics';
import styles from './VersionAndMetrics.module.css';

export default function VersionAndMetrics({ descriptions = [], jobDescription = {} }) {
  return (
    <div className={styles.versionAndMetricsContainer}>
      <div className={styles.versionHistoryWrapper}>
        <VersionHistory 
          versions={descriptions} 
          currentVersion={jobDescription.version} 
        />
      </div>
      <div className={styles.metricsWrapper}>
        <Metrics jobDescription={jobDescription} />
      </div>
    </div>
  );
} 