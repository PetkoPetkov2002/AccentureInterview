"use client";

import React, { useState, useEffect } from 'react';
import Metric from './components/Metric';
import styles from './Metrics.module.css';
import { calculateReadability } from '@/services/calculateReadability';
export default function Metrics({ jobDescription = {} }) {
  const [readabilityScoreRounded, setReadabilityScoreRounded] = useState(1);
  const [lengthScoreRounded, setLengthScoreRounded] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    console.log("jobDescription", jobDescription);
    // Calculate metrics based on job description
    const description = jobDescription.description || "";
    const wordCount = description ? description.split(/\s+/).filter(Boolean).length : 0;
    // Text stats
    
    // Length score - ideal job description is between 300-700 words
    let lengthScore = 10;
    if (wordCount < 200) {
      lengthScore = Math.max(1, wordCount / 200 * 10); // Too short
    } else if (wordCount > 800) {
      lengthScore = Math.max(1, 10 - ((wordCount - 800) / 200)); // Too long
    }
    setLengthScoreRounded(Math.round(lengthScore));
    if (description) {
      setIsLoading(true);
      setError(null);
      const getReadability = async () => {
        const result = await calculateReadability(description);
        setReadabilityScoreRounded(result.rounded_score);
        setIsLoading(false);
      };
      getReadability().catch(err => {
        setError(err.message);
        setIsLoading(false);
      });
      
    } else {
      setReadabilityScoreRounded(1);
    }
  }, [jobDescription]); // Re-run whenever jobDescription changes

  return (
    <div className={styles.metricsContainer}>
      <div className={styles.header}>
        <h2 className={styles.title}>Metrics</h2>
      </div>
      <div className={styles.content}>
      <Metric 
          title="Readability" 
          score={readabilityScoreRounded} 
          maxScore={10} 
        />
        <Metric 
          title="Length" 
          score={lengthScoreRounded} 
          maxScore={10} 
        />
        {isLoading && <p className={styles.loading}>Calculating readability...</p>}
        {error && <p className={styles.error}>Error: {error}</p>}
      </div>
    </div>
  );
} 