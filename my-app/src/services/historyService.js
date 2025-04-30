const API_URL = 'http://localhost:8000'; // or wherever your backend is
//const API_URL = process.env.NEXT_PUBLIC_API_URL; // fallback to default if env var is not set

export async function fetchJobDescription(threadId) {
  try {
    const response = await fetch(`${API_URL}/api/threads/${threadId}/version-histories`);
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching job description:', error);
    throw error;
  }
}