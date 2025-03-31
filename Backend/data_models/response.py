from typing import List
from pydantic import BaseModel, Field


class SingleRecommendationResponse(BaseModel):
    gendered_item: str = Field(description="A gendered word, phrase or sentence that should be made gender neutral")
    recommendation: str = Field(description="A recommendation on how to make the language gender neutral")

class RecommendationResponse(BaseModel):
    responses: List[SingleRecommendationResponse] = Field(description="A list of word/phrase/sentence responses that have been gendered with the recommendation of how to change it")

class SingleNeutralisedResponse(BaseModel):
    items: str = Field(description="an item that shows that the language has been neutralised in someway")
    reasoning: str = Field(description="a reasoning as to how the language has been made gender neutral")

class NeutralisedResponse(BaseModel):
    responses: List[SingleNeutralisedResponse] = Field(description="A list of items that show that the language has been neutralised in someway along with their reasoning")

class RecruiterInitialResponse(BaseModel):
    requirements: List[str] = Field(description="A list of requirements that the recruiter has listed out from the job description")

class RecruiterCheckerResponse(BaseModel):
    requirements_met: bool = Field(description="Whether the requirements are still met in the revised job description")
    reasoning: str = Field(description="The reasoning for whether the requirements are met")

class CopywriterResponse(BaseModel):
    text: str = Field(description="The revised job description based on the expert analysis")

class QuestionGeneratorResponse(BaseModel):
    question: str = Field(description="A question that helps the next agent understand how to write a Job Description")

class FinalResponse(BaseModel):
    copywriter_response: CopywriterResponse = Field(description="The final response from the copywriter")
    gender_expert_response: RecommendationResponse = Field(description="The final response from the gender expert")

class JobDescriptionResponse(BaseModel):
    job_description_id: int
    generated_description: str

class JobDescriptionUpdateResponse(BaseModel):
    updated_job_description: str
    job_description_id: int