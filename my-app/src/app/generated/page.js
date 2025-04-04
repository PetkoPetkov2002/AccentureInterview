"use client";

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, createContext, useContext } from 'react';
import { fetchJobDescription } from '@/services/historyService';
import CanvasChatContainer from './CanvasChatContainer';
import JobDescriptionContainer from './JobDescriptionContainer';
import VersionAndMetrics from './VersionAndMetrics';
import styles from './Canvas.module.css';

// Create context for suggestions
export const SuggestionContext = createContext();

// Custom hook to use the suggestion context
export function useSuggestionContext() {
  return useContext(SuggestionContext);
}

export default function CanvasContainer() {
  const searchParams = useSearchParams();
  
  const [loading, setLoading] = useState(false);
  const [threadId, setThreadID] = useState(searchParams.get('threadId'));
  const [error, setError] = useState(null);
  const [descriptionState, setDescription] = useState({
    title: "",
    description: "",
    version: 1,
    gender_recommendations: []
  });
  const [descriptions, setDescriptions] = useState([]);
  
  useEffect(() => {
    const getJobDescription = async () => {
      const threadIdParam = searchParams.get('threadId');
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
              version: latestVersion.version || 1,
              gender_recommendations: latestVersion.gender_recommendations || []
            };
            
            // Update current description state
            setDescription(initialDescription);
            
            // Set all versions as the descriptions history
            if (data.versions.length > 0) {
              // Map each version to our expected format
              const formattedVersions = data.versions.map(ver => ({
                title: ver.title || "",
                description: ver.description || "",
                version: ver.version || 1,
                gender_recommendations: ver.gender_recommendations || []
              }));
              setDescriptions(formattedVersions);
            }
          } else {
            // Fallback for backward compatibility
            const initialDescription = {
              title: data.jobTitle || data.title || "",
              description: data.description || "",
              version: data.version || 1,
              gender_recommendations: data.gender_recommendations || []
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
  },[]);

  function addDescription(description) {
    // Only add if it has actual content
    if (description && description.description) {
      // Add to the history of descriptions
      setDescriptions(prevDescriptions => [...prevDescriptions, description]);
      console.log("Description added:", description);
      
      setDescription(description);
    }
  }
  
  // Function to apply a gender suggestion
  function applySuggestion(originalText, suggestedText, jobDescription) {
    // Create updated description object
    setDescription(jobDescription);
    const updatedDescription = {
      ...jobDescription,
      description: jobDescription.description.replace(originalText, suggestedText),
      gender_recommendations: {
        ...jobDescription.gender_recommendations,
        responses: jobDescription.gender_recommendations?.responses?.filter(
          recommendation => recommendation.gendered_item !== originalText
        ) || []
      }
    };
    
    // Update the descriptions array by replacing the matching version
    const updatedDescriptions = descriptions.map(desc => 
      desc.version === jobDescription.version ? updatedDescription : desc
    );
    
    // Update descriptions state
    setDescriptions(updatedDescriptions);
    
    // If this is the currently displayed description, update that too
    if (descriptionState.version === jobDescription.version) {
      setDescription(updatedDescription);
    }
  }
  
  // Create context value
  const suggestionContextValue = {
    applySuggestion
  };
  
  return (
    <SuggestionContext.Provider value={suggestionContextValue}>
      <div className={styles.canvasContainer}>
        {/* Strip 1: Chat */}
        <div className={styles.strip}>
          <CanvasChatContainer threadId={threadId} addDescription={addDescription} jobDescription={descriptionState} />
        </div>
        
        {/* Strip 2: Job Description */}
        <div className={styles.strip}>
          <JobDescriptionContainer 
            jobDescription={descriptionState}
            loading={loading}
            error={error}
          />
        </div>
        
        {/* Strip 3: Version History and Metrics */}
        <div className={styles.strip}>
          <VersionAndMetrics 
            descriptions={descriptions} 
            jobDescription={descriptionState}
          />
        </div>
      </div>
    </SuggestionContext.Provider>
  );
} 