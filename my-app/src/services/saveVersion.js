const API_URL = 'http://localhost:8000';
export async function saveVersion(threadId,jobDescription) {
    try {
        const jobDescriptionTemp = {
            title: jobDescription.title,
            description: jobDescription.description,
            version: jobDescription.version
        };
      // Add console logs to debug the data being sent
        const requestData = {
        thread_id: threadId,
        current_job_description: jobDescriptionTemp,
        gender_recommendations: jobDescription.gender_recommendations
        };
        
        console.log("Request data:", requestData);
        console.log("Stringified data:", JSON.stringify(requestData));
        
        const response = await fetch(`${API_URL}/save_version`, {
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