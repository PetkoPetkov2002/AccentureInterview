"use client";

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { fetchJobDescription } from '@/services/historyService';
import CanvasChatContainer from './CanvasChatContainer';
import styles from './Canvas.module.css';

export default function CanvasContainer() {
  const searchParams = useSearchParams();
  

  const [loading, setLoading] = useState(false);
  const [threadId, setThreadID] = useState();
  const [error, setError] = useState(null);
  const [jobTitleState, setJobTitle] = useState();
  const [descriptionState, setDescription] = useState();
  const [descriptions, setDescriptions] = useState([]);
  
  useEffect(() => {
    const getJobDescription = async () => {
      setThreadID(searchParams.get('threadId'));
      if (threadId) {
        setLoading(true);
        try {
          const data = await fetchJobDescription(threadId);
          setJobTitle(data.jobTitle);
          setDescription(data.description);
        } catch (error) {
          setError('Failed to load job description');
        } finally {
          setLoading(false);
        }
      }
    };

    getJobDescription();
  }, [threadId]);
  return (
    <div className={styles.canvasContainer}>
      {/* Strip 1: Chat */}
      <div className={styles.strip}>
        <CanvasChatContainer threadId={threadId} />
      </div>
      
      {/* Strip 2: Content will be implemented later */}
      <div className={styles.strip}>
        <div className={styles.contentContainer}>
          <h1 className="text-2xl font-bold mb-4">Generated Job Description</h1>
          {loading && <p>Loading...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {jobTitleState && <h2 className="text-xl mb-4">{jobTitleState}</h2>}
          {descriptionState && <p className="whitespace-pre-wrap">{descriptionState}</p>}
        </div>
      </div>
      
      {/* Strip 3: Content will be implemented later */}
      <div className={styles.strip}>
        <div className={styles.placeholderContent}>
          <h2>Strip 3</h2>
          <p>Content for strip 3 will be implemented later</p>
        </div>
      </div>
    </div>
  );
} 