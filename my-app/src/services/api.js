const API_URL = 'http://localhost:8000'; 

export async function sendMessage(message) {
  try {
    const response = await fetch(`${API_URL}/chatendpoint`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        query: message,
        thread_id: null // Optional, will be handled by backend if not provided
      }),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data = await response.json();
    return data; // The backend returns a response field in the JSON
  } catch (error) {
    console.error('Error sending message:', error);
    // Return fallback response if API call fails
    return "Sorry, I couldn't connect to the backend service.";
  }
} 