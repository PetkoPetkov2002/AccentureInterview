"use client";

import React, { useEffect, useState } from 'react';
import styles from './MetricIndicator.module.css';

export default function MetricIndicator({ score, maxScore = 10 }) {
  const [position, setPosition] = useState(0);
  
  useEffect(() => {
    // Calculate position based on score (percentage of width)
    const calculatedPosition = (score / maxScore) * 100;
    
    // Add slight delay before animating to position
    const timer = setTimeout(() => {
      setPosition(calculatedPosition);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [score, maxScore]);
  
  return (
    <div className={styles.indicatorContainer}>
      <div 
        className={styles.indicator} 
        style={{ left: `${position}%` }}
      >
        <div className={styles.scoreValue}>{score}/{maxScore}</div>
        <div className={styles.arrow}>
          {/* Triangle arrow pointing down */}
          <svg width="18" height="9" viewBox="0 0 18 9" fill="none" xmlns="http://www.w3.org/2000/svg" 
               style={{ transform: 'matrix(-1, 0, 0, -1, 0, 0)' }}>
            <path d="M9 0L18 9H0L9 0Z" fill="#000000"/>
          </svg>
        </div>
      </div>
    </div>
  );
} 