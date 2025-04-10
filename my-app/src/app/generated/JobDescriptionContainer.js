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
  setAiEditing,
  setJobDescription,
  addDescription,
  saveVersion
}) {
  // Extract gendered phrases to highlight
  const genderedPhrases = 
    jobDescription?.gender_recommendations?.responses?.map(r => r.gendered_item) || [];
  const [text, setText] = useState(jobDescription.description);
  const [isEditing, setIsEditing] = useState(false);
  useEffect(() => {
    // Set the local edit text based on the prop description when not editing
    // or when the component initially loads with a description
    if (jobDescription?.description) {
        setText(jobDescription.description);
    }
  }, [jobDescription?.description]); // Rerun if the source description changes

  const handleSelect = (event) => {
    const { selectionStart, selectionEnd, value } = event.target;
    const currentSelection = value.substring(selectionStart, selectionEnd);
    console.log("Current selection:", currentSelection);
    onSelectText(currentSelection);
  };
  const saveJobDescription = () => {
    saveVersion();
  };
  const handleChange = (event) => {
    console.log("Job description:", jobDescription);
    setText(event.target.value);
    const newJobDescription = {
      ...jobDescription,
      description: event.target.value
    };
    setJobDescription(newJobDescription);
  
  }
  const createNewVersion = () => {
    addDescription();
  }

  const editClick = () => {
    setAiEditing(true);
  }

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
              <button 
                onClick={() => {
                  saveJobDescription(); // Call your save function
                  setIsEditing(false); // Then exit editing mode
                }} 
                className={styles.editButton}
              >
                Save
              </button>
              <button onClick={createNewVersion} className={styles.editButton}>
                Create New Version
              </button>
              {/* AI Edit button also shown only when editing */}
              <button onClick={(editClick())} className={styles.editButton}>
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
              onChange={(event) => {
                handleChange(event, jobDescription);
                onSelectText('');
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