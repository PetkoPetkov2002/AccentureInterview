export async function editChat(threadId, message) {
    try {
      const response = await fetch(`${API_URL}/edit_chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          thread_id: threadId,
          message: message
        }),
      });
  
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
  
      const data = await response.json();
      return data; // Return full response object
    } catch (error) {
      console.error('Error editing chat:', error);
      return {
        response: "Sorry, I couldn't connect to the edit_chat service.",
        isGenerated: false
      };
    }
} 