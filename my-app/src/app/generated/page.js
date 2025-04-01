"use client";

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { fetchJobDescription } from '@/services/historyService';
import CanvasChatContainer from './CanvasChatContainer';
import JobDescriptionContainer from './JobDescriptionContainer';
import styles from './Canvas.module.css';

export default function CanvasContainer() {
  const searchParams = useSearchParams();
  
  const [loading, setLoading] = useState(false);
  const [threadId, setThreadID] = useState();
  const [error, setError] = useState(null);
  const [descriptionState, setDescription] = useState({
    title: "",
    description: "",
    version: 1
  });
  const [descriptions, setDescriptions] = useState([]);
  
  useEffect(() => {
    const getJobDescription = async () => {
      const threadIdParam = searchParams.get('threadId');
      setThreadID(threadIdParam);
      if (threadIdParam) {
        setLoading(true);
        try {
          const data = await fetchJobDescription(threadIdParam);
          
          // Check if versions is an array and has entries
          if (Array.isArray(data.versions) && data.versions.length > 0) {
            // Get the most recent version (last entry in the array)
            const latestVersion = data.versions[data.versions.length - 1];
            
            // Create description object from the latest version
            const initialDescription = {
              title: latestVersion.title || "",
              description: latestVersion.description || "",
              version: latestVersion.version || 1
            };
            
            // Update current description state
            setDescription(initialDescription);
            
            // Set all versions as the descriptions history
            if (data.versions.length > 0) {
              // Map each version to our expected format
              const formattedVersions = data.versions.map(ver => ({
                title: ver.title || "",
                description: ver.description || "",
                version: ver.version || 1
              }));
              setDescriptions(formattedVersions);
            }
          } else {
            // Fallback for backward compatibility
            const initialDescription = {
              title: data.jobTitle || data.title || "",
              description: data.description || "",
              version: data.version || 1
            };
            
            // Update current description state
            setDescription(initialDescription);
            
            // Add to descriptions history if we have actual content
            if (initialDescription.description) {
              setDescriptions([initialDescription]);
            }
          }
        } catch (error) {
          console.error("Error fetching job description:", error);
          setError('Failed to load job description');
        } finally {
          setLoading(false);
        }
      }
    };

    getJobDescription();
  }, [threadId]);

  function addDescription(description) {
    // Only add if it has actual content
    if (description && description.description) {
      // Add to the history of descriptions
      setDescriptions(prevDescriptions => [...prevDescriptions, description]);
      // Update the current description state
      setDescription(description);
    }
  }
  
  return (
    <div className={styles.canvasContainer}>
      {/* Strip 1: Chat */}
      <div className={styles.strip}>
        <CanvasChatContainer threadId={threadId} addDescription={addDescription} jobDescription={descriptionState} />
      </div>
      
      {/* Strip 2: Content will be implemented later */}
      <div className={styles.strip}>
        <JobDescriptionContainer 
          jobTitle={descriptionState.title}
          description={descriptionState.description}
          version={descriptionState.version}
          loading={loading}
          error={error}
        />
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