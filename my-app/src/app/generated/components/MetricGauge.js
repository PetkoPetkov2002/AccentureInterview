"use client";

import React from 'react';
import styles from './MetricGauge.module.css';

export default function MetricGauge() {
  return (
    <div className={styles.gaugeContainer}>
      <div className={styles.gaugeBar}>
        {/* Gradient colored bar */}
        <div className={styles.gradientBar}></div>
      </div>
      <div className={styles.gaugeLabels}>
        <span className={styles.poorLabel}>Poor</span>
        <span className={styles.bestLabel}>Best</span>
      </div>
    </div>
  );
} 