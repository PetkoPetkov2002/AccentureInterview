"use client";

import { useSearchParams } from 'next/navigation';

export default function GeneratedPage() {
  const searchParams = useSearchParams();
  const jobTitle = searchParams.get('jobTitle');
  const description = searchParams.get('description');
  const threadId = searchParams.get('threadId');

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Generated Job Description</h1>
      {jobTitle && <h2 className="text-xl mb-4">{jobTitle}</h2>}
      {description && <p className="whitespace-pre-wrap">{description}</p>}
      {threadId && <p>Thread ID: {threadId}</p>}
    </div>
  );
} 