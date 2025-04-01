const API_URL = 'http://localhost:8000'; // or wherever your backend is

export async function fetchJobDescription(threadId) {
  try {
    const response = await fetch(`${API_URL}/api/descriptions/${threadId}`);
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching job description:', error);
    throw error;
  }
}