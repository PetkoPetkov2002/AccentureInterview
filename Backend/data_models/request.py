from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional, Literal, Union, Annotated


class QuestionGeneratorRequest(BaseModel):
    question_1: str = Field(..., description="First interview question")
    answer_1: str = Field(..., description="Answer to first question")
    question_2: str = Field(..., description="Second interview question")
    answer_2: str = Field(..., description="Answer to second question")


    class Config:
        schema_extra = {
            "example": {
                "question_1": "What is your greatest strength?",
                "answer_1": "I am highly organized and detail-oriented.",
                "question_2": "Describe a challenging project you've worked on.",
                "answer_2": "I led a team to develop a scalable web application...", 
            }
        }

class JobDescriptionRequest(BaseModel):
    question_1: str = Field(..., description="First question about the role")
    answer_1: str = Field(..., description="Answer describing the role")
    question_2: str = Field(..., description="Second question about requirements")
    answer_2: str = Field(..., description="Answer describing requirements")
    question_3: str = Field(..., description="Third question about responsibilities")
    answer_3: str = Field(..., description="Answer describing responsibilities")

    class Config:
        schema_extra = {
            "example": {
                "question_1": "What skills are essential for this role?",
                "answer_1": "Proficiency in Python and experience with FastAPI.",
                "question_2": "What are the primary responsibilities?",
                "answer_2": "Developing backend services and APIs.",
                "question_3": "What is the team structure?",
                "answer_3": "A team of 5 developers reporting to the Lead Engineer."
            }
        }


class JobDescriptionUpdateRequest(BaseModel):
    job_description_id: int
    job_description: str
    recommendations: List[Dict[str, Any]]

    class Config:
        schema_extra = {
            "example": {
                "job_description_id": 123,
                "job_description": "Initial job description content...",
                "recommendations": [
                    {"gendered_item": "Fast paced company culture",
                    "recommendation": "Add information about company culture."
                    }
                ]
            }
        }
class BaseJobDescription(BaseModel):
    user_id: str
    type: Literal["upload", "question"]
    content: str  # Either file text or Q&A JSON
    recommendations: Dict[str, Any]
class UploadJobDescription(BaseJobDescription):
    type: Literal["upload"]
    old_file: str
    file_type:str
    # Any upload-specific fields

class QuestionJobDescription(BaseJobDescription):
    type: Literal["question"]
    questions: Dict[str, str]  # Store original Q&A structure
    # Any question-specific fields

# Union type for internal service
JobDescriptionRequestInternal = [
    Union[UploadJobDescription, QuestionJobDescription],
    
]

class GetJobDescriptionRequest(BaseModel):
    tags: List[str] = [None]  # Default empty list
    archived: Optional[bool] = None
    class Config:
        schema_extra = {
            "example": {
                "tags": ["python", "backend"]  # Example with tags
            }
        }

class UpdateUserRequest(BaseModel):
    first_name: str
    last_name: str
    email: str

    class Config:
        schema_extra = {
            "example": {
                "first_name": "John",
                "last_name": "Doe",
                "email": "john.doe@example.com"
            }
        }

class UpdateJobDescriptionContentRequest(BaseModel):
    job_description_id: str
    updated_description: str

    class Config:
        schema_extra = {
            "example": {
                "job_description_id": "0ad2f671-bd4e-4723-9a61-307626056afd",
                "updated_description": "Updated job description content here"
            }
        }

class ArchiveJobDescriptionRequest(BaseModel):
    job_description_id: str
    archived: bool

    class Config:
        schema_extra = {
            "example": {
                "job_description_id": "123e4567-e89b-12d3-a456-426614174000",
                "archived": True
            }
        }

class TagsRequest(BaseModel):
    job_description_id: str
    tags: List[str]

    class Config:
        schema_extra = {
            "example": {
                "job_description_id": "123e4567-e89b-12d3-a456-426614174000",
                "tags": ["python", "backend"]
            }
        }