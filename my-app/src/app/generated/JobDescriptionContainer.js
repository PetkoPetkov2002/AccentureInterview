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
  error,
  onSelectText,
  handleAiEditClick
}) {
  // Extract gendered phrases to highlight
  const genderedPhrases = 
    jobDescription?.gender_recommendations?.responses?.map(r => r.gendered_item) || [];

  const [isEditing, setIsEditing] = useState(false);

  const handleSelect = (event) => {
    const { selectionStart, selectionEnd, value } = event.target;
    const currentSelection = value.substring(selectionStart, selectionEnd);
    console.log("Current selection:", currentSelection);
    onSelectText(currentSelection);
  };

  // Placeholder for AI Edit button click
 

  return (
    <div className={styles.jobDescriptionContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>Generated Job Description</h1>
        <div className={styles.actionsContainer}>
          {jobDescription?.version && <span className={styles.version}>Version: {jobDescription.version}</span>}

          {/* Buttons displayed when editing */}
          {isEditing ? (
            <> {/* Use a Fragment to group buttons */}
              <button onClick={() => setIsEditing(false)} className={styles.editButton}>Save</button>
              {/* AI Edit button also shown only when editing */}
              <button onClick={handleAiEditClick} className={styles.editButton}>
                AI Edit
              </button>
            </>
          ) : (
            /* Button displayed when not editing */
            <button onClick={() => setIsEditing(true)} className={styles.editButton}>Edit</button>
          )}

        </div>
      </div>
      <div className={styles.content}>
        {loading && <p className={styles.loading}>Loading...</p>}
        {error && <p className={styles.error}>{error}</p>}
        {jobDescription?.title && <h2 className={styles.jobTitle}>{jobDescription.title}</h2>}
        {jobDescription?.description && (
          isEditing ? (
            <textarea
              className={styles.editTextarea}
              value={jobDescription.description}
              onSelect={handleSelect}
              onChange={(e) => {
                setSelectedText('');
              }}
              
              rows={10}
            />
          ) : (
            <HighlightedJobDescription 
              text={jobDescription.description} 
              highlightPhrases={genderedPhrases} 
            />
          )
        )}
      </div>
    </div>
  );
}