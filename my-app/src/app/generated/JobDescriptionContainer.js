"use client";

import styles from './JobDescriptionContainer.module.css';

export default function JobDescriptionContainer({ 
  jobDescription,
  loading, 
  error 
}) {
  return (
    <div className={styles.jobDescriptionContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>Generated Job Description</h1>
       
      </div>
      <div className={styles.content}>
        {loading && <p className={styles.loading}>Loading...</p>}
        {error && <p className={styles.error}>{error}</p>}
        {jobDescription?.title && <h2 className={styles.jobTitle}>{jobDescription.title}</h2>}
        {jobDescription?.description && <p className={styles.description}>{jobDescription.description}</p>}
      </div>
    </div>
  );
} 