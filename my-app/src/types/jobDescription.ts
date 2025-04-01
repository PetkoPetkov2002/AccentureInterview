export interface JobDescription {
  title: string;
  description: string;
  version: number;
}

export interface SingleRecommendation {
  gendered_item: string;
  recommendation: string;
}

export interface GenderRecommendations {
  responses: SingleRecommendation[];
}

export interface EditedJobDescription {
  job_description: JobDescription;
  gender_recommendations: GenderRecommendations | null;
}

export interface EditChatResponse {
  response: string;
  thread_id: string;
  chat_history: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  }>;
  timestamp: string;
  job_description: JobDescription | null;
  gender_recommendations: GenderRecommendations | null;
}

export interface EditChatRequest {
  query: string;
  thread_id: string | null;
  current_job_description: JobDescription;
} 