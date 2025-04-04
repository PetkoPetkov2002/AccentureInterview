"use client";

import React, { useState, useEffect } from 'react';
import Metric from './components/Metric';
import styles from './Metrics.module.css';

export default function Metrics({ jobDescription = {} }) {
  const [readabilityScoreRounded, setReadabilityScoreRounded] = useState(1);
  const [lengthScoreRounded, setLengthScoreRounded] = useState(1);

  useEffect(() => {
    console.log("jobDescription", jobDescription);
    // Calculate metrics based on job description
    const description = jobDescription.description || "";
    
    // Text stats
    const wordCount = description ? description.split(/\s+/).filter(Boolean).length : 0;
    const characterCount = description ? description.length : 0;
    
    // Calculate readability score (simple algorithm - can be replaced with more sophisticated one)
    // Using a simple algorithm that gives score out of 10
    const words = description.split(/\s+/).filter(Boolean);
    const sentences = description.split(/[.!?]+/).filter(Boolean);
    const avgWordsPerSentence = sentences.length ? words.length / sentences.length : 0;
    const longWords = words.filter(word => word.length > 6).length;
    const longWordPercentage = words.length ? (longWords / words.length) * 100 : 0;
    
    // Lower avgWordsPerSentence and longWordPercentage is better for readability
    // Simple formula - can be replaced with a proper readability index
    const readabilityScore = Math.min(10, Math.max(1, 
      10 - (avgWordsPerSentence / 5) - (longWordPercentage / 10)
    ));
    
    // Length score - ideal job description is between 300-700 words
    let lengthScore = 10;
    if (wordCount < 200) {
      lengthScore = Math.max(1, wordCount / 200 * 10); // Too short
    } else if (wordCount > 800) {
      lengthScore = Math.max(1, 10 - ((wordCount - 800) / 200)); // Too long
    }
    console.log("readabilityScore", readabilityScore);
    console.log("lengthScore", lengthScore);
    // Round scores to nearest whole number
    setReadabilityScoreRounded(Math.round(readabilityScore));
    setLengthScoreRounded(Math.round(lengthScore));
  }, [jobDescription]); // Re-run whenever jobDescription changes

  return (
    <div className={styles.metricsContainer}>
      <div className={styles.header}>
        <h2 className={styles.title}>Metrics</h2>
      </div>
      <div className={styles.content}>
        <Metric title="Readability" score={readabilityScoreRounded} maxScore={10} />
        <Metric title="Length" score={lengthScoreRounded} maxScore={10} />
      </div>
    </div>
  );
} 