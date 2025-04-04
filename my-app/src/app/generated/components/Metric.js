"use client";

import React from 'react';
import MetricGauge from './MetricGauge';
import MetricIndicator from './MetricIndicator';
import styles from './Metric.module.css';

export default function Metric({ title, score, maxScore = 10 }) {
  return (
    <div className={styles.metricContainer}>
      <h3 className={styles.metricTitle}>{title}</h3>
      <div className={styles.gaugeWrapper}>
        <MetricIndicator score={score} maxScore={maxScore} />
        <MetricGauge />
      </div>
    </div>
  );
} 