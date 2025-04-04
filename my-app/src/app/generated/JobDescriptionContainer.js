"use client";

import { useState, useEffect } from 'react';
import styles from './JobDescriptionContainer.module.css';

// Component to render text with highlighted portions
function HighlightedJobDescription({ text, highlightPhrases = [] }) {
  // If no phrases to highlight or no text, return plain text
  if (!highlightPhrases.length || !text) {
    return <p className={styles.description}>{text}</p>;
  }

  // Escape special regex characters
  const escapedPhrases = highlightPhrases.map(phrase => 
    phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  );
  
  // Create regex pattern for all phrases
  const pattern = new RegExp(`(${escapedPhrases.join('|')})`, 'gi');
  
  // Split text into segments (alternating normal and highlighted)
  const segments = text.split(pattern);

  return (
    <p className={styles.description}>
      {segments.map((segment, i) => {
        // Check if this segment matches any of the phrases to highlight (case insensitive)
        const isHighlighted = highlightPhrases.some(phrase => 
          segment.toLowerCase() === phrase.toLowerCase()
        );
        
        return isHighlighted ? (
          <span key={i} className={styles.highlighted} title="Gendered language">
            {segment}
          </span>
        ) : (
          <span key={i}>{segment}</span>
        );
      })}
    </p>
  );
}

export default function JobDescriptionContainer({ 
  jobDescription,
  loading, 
  error 
}) {
  // Extract gendered phrases to highlight
  const genderedPhrases = 
    jobDescription?.gender_recommendations?.responses?.map(r => r.gendered_item) || [];

  return (
    <div className={styles.jobDescriptionContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>Generated Job Description</h1>
        {jobDescription?.version && <span className={styles.version}>Version: {jobDescription.version}</span>}
      </div>
      <div className={styles.content}>
        {loading && <p className={styles.loading}>Loading...</p>}
        {error && <p className={styles.error}>{error}</p>}
        {jobDescription?.title && <h2 className={styles.jobTitle}>{jobDescription.title}</h2>}
        {jobDescription?.description && (
          <HighlightedJobDescription 
            text={jobDescription.description} 
            highlightPhrases={genderedPhrases} 
          />
        )}
      </div>
    </div>
  );
} 