"use client";

import React from 'react';
import styles from './Metrics.module.css';

export default function Metrics({ jobDescription = {} }) {
  // Calculate metrics based on job description
  const wordCount = jobDescription.description ? jobDescription.description.split(/\s+/).length : 0;
  const characterCount = jobDescription.description ? jobDescription.description.length : 0;
  const paragraphCount = jobDescription.description ? 
    jobDescription.description.split(/\n\s*\n/).length : 0;
  
  const metrics = [
    { label: 'Words', value: wordCount },
    { label: 'Characters', value: characterCount },
    { label: 'Paragraphs', value: paragraphCount },
    { label: 'Version', value: jobDescription.version || 1 }
  ];

  return (
    <div className={styles.metricsContainer}>
      <div className={styles.header}>
        <h2 className={styles.title}>Metrics</h2>
      </div>
      <div className={styles.content}>
        {metrics.map((metric, index) => (
          <div key={index} className={styles.metricItem}>
            <div className={styles.metricLabel}>{metric.label}</div>
            <div className={styles.metricValue}>{metric.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
} 