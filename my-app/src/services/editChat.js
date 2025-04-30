const API_URL = 'http://localhost:8000';
//const API_URL = process.env.NEXT_PUBLIC_API_URL ; // fallback to default if env var is not set

export async function editChat(threadId, message, jobDescription) {
    try {
      // Add console logs to debug the data being sent
      const requestData = {
        query: message,
        thread_id: threadId,
        current_job_description: jobDescription
      };
      
      console.log("Request data:", requestData);
      console.log("Stringified data:", JSON.stringify(requestData));
      
      const response = await fetch(`${API_URL}/edit_chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestData)
      });
  
      if (!response.ok) {
        // Try to get more detailed error information
        const errorText = await response.text();
        console.error("Server error response:", errorText);
        throw new Error(`Error: ${response.status} - ${errorText}`);
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