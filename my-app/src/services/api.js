const API_URL = 'http://localhost:8000'; 
//const API_URL = 'https://jobfair-chat-bot-cke5dsaqdhbdbbeq.ukwest-01.azurewebsites.net/'; // fallback to default if env var is not set

export async function sendMessage(message,thread_id) {
  try {
    const response = await fetch(`${API_URL}/chatendpoint`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        query: message,
        thread_id: thread_id // Optional, will be handled by backend if not provided
      }),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data = await response.json();
    return data; // Return full response object
  } catch (error) {
    console.error('Error sending message:', error);
    return {
      response: "Sorry, I couldn't connect to the backend service.",
      isGenerated: false
    };
  }
}

