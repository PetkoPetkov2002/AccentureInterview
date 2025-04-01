"use client";

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { fetchJobDescription } from '@/services/descriptionsService';

export default function CanvasContainer() {
  const searchParams = useSearchParams();
  

  const [loading, setLoading] = useState(false);
  const [threadId, setThreadID] = useState();
  const [error, setError] = useState(null);
  const [jobTitleState, setJobTitle] = useState(jobTitle || '');
  const [descriptionState, setDescription] = useState(description || '');
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
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Generated Job Description</h1>
      {jobTitleState && <h2 className="text-xl mb-4">{jobTitleState}</h2>}
      {descriptionState && <p className="whitespace-pre-wrap">{descriptionState}</p>}
      {threadId && <p>Thread ID: {threadId}</p>}
    </div>
  );
} 