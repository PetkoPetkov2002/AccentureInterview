from dataclasses import dataclass
from pydantic import BaseModel, Field
from pydantic_ai import Agent, RunContext
from openai import OpenAI
from dotenv import load_dotenv
import os
from typing import List, Optional, Union, Annotated, Dict, Any, Literal
import asyncio
import json
import os
import textstat
import re
from supabase import create_client, Client
from fastapi import FastAPI, HTTPException, Request, Body
from fastapi.middleware.cors import CORSMiddleware
import uuid
from datetime import datetime
from pydantic_ai.models.groq import GroqModel
import difflib
from typing import List, Tuple
from chatbot_prompts import (
    CHAT_AGENT_PROMPT,
    EDITOR_AGENT_PROMPT,
    JOB_DESCRIPTION_AGENT_PROMPT,
    JUDGE_AGENT_PROMPT,
    SELECTION_EDIT_PROMPT
)
from chatbot_generation_prompts import (
    CHAT_AGENT_QUERY_PROMPT,
    JOB_DESCRIPTION_GENERATION_PROMPT,
    APPLY_CHANGE_AGENT_PROMPT,
    APPLY_CHANGE_USER_PROMPT,
    SELECTION_EDIT_PROMPT_USER_PROMPT
)

# Load environment variables first
load_dotenv()

class SingleRecommendationResponse(BaseModel):
    gendered_item: str = Field(description="A gendered word, phrase or sentence that should be made gender neutral")
    recommendation: str = Field(description="A recommendation on how to make the language gender neutral")
    change_snippet: str = Field(description="An updated gender neutral snippet of the gendered item that was found")

class RecommendationResponse(BaseModel):
    responses: List[SingleRecommendationResponse] = Field(description="A list of word/phrase/sentence responses that have been gendered with the recommendation of how to change it")

from prompts.coded_example import single_prompt, copywriter_prompt, gender_expert_prompt_2_0
from data_models.response import (
                                          NeutralisedResponse, 
                                          RecruiterInitialResponse, 
                                          RecruiterCheckerResponse, 
                                          CopywriterResponse, 
                                          QuestionGeneratorResponse
                                          )


load_dotenv()
from pydantic_ai.messages import (
    ModelMessage,
    ModelMessagesTypeAdapter,
    ModelRequest,
    ModelResponse,
    TextPart,
    UserPromptPart,
    SystemPromptPart,
    ToolCallPart,
)

app = FastAPI()

# Add CORS middleware to allow requests from the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# In-memory storage for development
threads = {}
assistants = {}
runs = {}

# Models
class Message(BaseModel):
    user_input: str
    assistant_response: str

class SkillRequirement(BaseModel):
    type: str = "skill_requirement"
    requirement: str = Field(description="The skill that is an essential skill, MUST BE SPECIFIED BY THE USER")

class SoftSkillRequirement(BaseModel):
    type: str = "soft_skill_requirement"
    requirement: str = Field(description="The skill that is a soft skill, MUST BE SPECIFIED BY THE USER")

class NiceToHaveRequirement(BaseModel):
    type: str = "nice_to_have_requirement"
    requirement: str = Field(description="The skill that is a nice to have, MUST BE SPECIFIED BY THE USER")

class UpdatedRequirements(BaseModel):
    essential_skills: List[SkillRequirement]
    soft_skills: List[SoftSkillRequirement]
    nice_to_have: List[NiceToHaveRequirement]

class Requirements(BaseModel):
    essential_skills: List[SkillRequirement]
    soft_skills: List[SoftSkillRequirement]
    nice_to_have: List[NiceToHaveRequirement]

class JobRequirements(BaseModel):
    job_title: str = Field(description="Seniority level for the specified role, MUST BE SPECIFIED BY THE USER")
    seniority_level: str = Field(description="Seniority level for the specified role, MUST BE SPECIFIED BY THE USER")
    responsibilities: str = Field(description="The responsibilities of the job, i.e day in the life of the role, MUST BE SPECIFIED BY THE USER")
    job_requirements: Requirements
    job_salary: str = Field(description="The salary range for the job, MUST BE SPECIFIED BY THE USER")
    job_location: str = Field(description="The location of the job, MUST BE SPECIFIED BY THE USER")
    job_type: str = Field(description="The type of job (e.g. full-time, part-time, contract, etc.), MUST BE SPECIFIED BY THE USER")

class JobDescription(BaseModel):
    """Generated job description based on requirements analysis."""
    title: str = Field(description="Job title with seniority level")
    description: str = Field(description="Full job description")
    version: int = Field(description="Version number of the job description")

class EditedJobDescription(BaseModel):
    """Job description with gender recommendations."""
    job_description: JobDescription = Field(description="The job description")
    gender_recommendations: Optional[RecommendationResponse] = Field(description="Gender recommendations for this job description", default=None)

class Thread(BaseModel):
    id: str
    created_at: str
    chat_history: List[Message] = []
    edit_history: List[Message] = []
    chat_model_history: List[ModelMessage] = []
    edit_model_history: List[ModelMessage] = []
    descriptions: List[EditedJobDescription] = []

class FeedbackItem(BaseModel):
    category: str = Field(description="The evaluation criterion or category (e.g., 'Inclusivity', 'Technical Accuracy')")
    item: str = Field(description="Specific area that needs improvement")
    reasoning: str = Field(description="Detailed reasoning behind flagging this area for improvement")
    recommendation: str = Field(description="Actionable recommendation for improvement")

class JudgeResult(BaseModel):
    score: float = Field(ge=0, le=10, description="Score out of 10")
    passed: bool = Field(description="Whether the job description meets requirements")
    feedback: str = Field(description="General summary feedback for improvement")
    improvement_items: List[FeedbackItem] = Field(default_factory=list, description="List of specific improvement items with detailed reasoning")

@dataclass
class Deps:
    openai_client: OpenAI
    supabase: create_client

# Define result type
AgentResult = Union[str, JobRequirements]
apply_change_agent: Agent[Deps, JobDescription] = Agent(
    'openai:o3-mini',
    deps_type=Deps,
    result_type=JobDescription,
    system_prompt=APPLY_CHANGE_AGENT_PROMPT
)
# Type hint the agent with proper result type and use type: ignore for result_type
chat_agent=Agent(
    model="openai:gpt-4o",
    result_type=Union[JobRequirements,str], # type: ignore
    deps_type=Deps,
    system_prompt=CHAT_AGENT_PROMPT
)


# Add with other agent definitions
editor_agent: Agent[Deps, JobDescription] =Agent(
    'openai:gpt-4o',
    deps_type=Deps,
    result_type=JobDescription,
    system_prompt=EDITOR_AGENT_PROMPT
)
selection_edit_agent: Agent[Deps, JobDescription] = Agent(
    'openai:gpt-4o',
    deps_type=Deps,
    result_type=JobDescription,
    system_prompt=SELECTION_EDIT_PROMPT
)

# Gender Expert Agent for detecting gendered language
gender_expert_agent: Agent[Deps, RecommendationResponse] = Agent(
    'openai:o3-mini',
    deps_type=Deps,
    result_type=RecommendationResponse
)

# Copywriter Agent for rewriting job descriptions
copywriter_agent: Agent[Deps, CopywriterResponse] = Agent(
    'groq:llama-3.3-70b-versatile',
    deps_type=Deps,
    result_type=CopywriterResponse,
    system_prompt=copywriter_prompt
)


job_description_agent = Agent[Deps, JobDescription](
    'openai:o3-mini',
    deps_type=Deps,
    result_type=JobDescription,
    system_prompt=JOB_DESCRIPTION_AGENT_PROMPT
)

judge_agent = Agent[Deps, JudgeResult](  # Changed from Agent[Deps, JudgeResult]
    'openai:gpt-4o',
    deps_type=Deps,
    result_type=JudgeResult,
    system_prompt=JUDGE_AGENT_PROMPT
)

@job_description_agent.tool
async def evaluate_job_description(ctx: RunContext[Deps], description: str) -> JudgeResult:
    """
    Evaluate the quality of a job description using expert judge.
    Returns detailed score and feedback.
    Args:
       description: The compelete job description you have produced as a string, i.e NOT JSON
    """
   
    # Clean the input to prevent JSON validation errors
   
    
    evaluation_prompt = f"""
    Please evaluate this job description:
    Description: {description}
    """
    
    result = await judge_agent.run(evaluation_prompt,deps = ctx.deps)  
    return result.data

@judge_agent.tool_plain
async def evaluate_readability(description: str) -> str:
    """
    Evaluates the Flesch reading ease score of the job description.
    Args:
        description: The complete job description as a string
    """
    score = textstat.flesch_reading_ease(description)
    return f"Flesch Reading Ease Score: {score:.1f}"

def identify_changes(original_text: str, updated_text: str) -> List[Tuple[str, str]]:
    """
    Identify changed sections between original and updated text.
    Returns a list of tuples containing (changed_section, context).
    """
    # Split texts into lines
    original_lines = original_text.splitlines()
    updated_lines = updated_text.splitlines()
    
    # Get diff
    diff = list(difflib.unified_diff(original_lines, updated_lines, n=3))
    
    # Process diff to extract changed sections with context
    changes = []
    current_change = []
    in_change = False
    
    for line in diff[3:]:  # Skip header lines
        if line.startswith('+') or line.startswith('-'):
            in_change = True
            current_change.append(line[1:])  # Remove the +/- prefix
        elif in_change and line.startswith(' '):
            # This is context after a change
            current_change.append(line[1:])
            if len(current_change) >= 3:  # Collect a few lines of context
                changes.append(('\n'.join(current_change[:-3]), '\n'.join(current_change[-3:])))
                current_change = current_change[-3:]
                in_change = False
    
    # Add any remaining change
    if current_change:
        changes.append(('\n'.join(current_change), ''))
    
    return changes
async def analyze_requirements(
    deps: Deps,
    requirements: JobRequirements
) -> UpdatedRequirements:
    """Analyzes and validates job requirements from collected data."""
    
    final_essential_skills: List[SkillRequirement] = []
    final_soft_skills: List[SoftSkillRequirement] = []
    final_nice_to_have: List[NiceToHaveRequirement] = []
    print("we're about to go to supabase")
    # Process all skills in one loop
    for skill in (requirements.job_requirements.essential_skills + 
                 requirements.job_requirements.soft_skills + 
                 requirements.job_requirements.nice_to_have):
        
        embedding_response = deps.openai_client.embeddings.create(
            model="text-embedding-3-small",
            input=skill.requirement,
        )
        skill_embedding = embedding_response.data[0].embedding
        
        similar_skills = deps.supabase.rpc(
            'match_requirements',
            {
                'query_embedding': skill_embedding,
                'match_count': 2,
                'job_title_filter': requirements.job_title,
                'requirement_type': skill.type
            }
        ).execute()
        
        # Create new requirement objects from raw data
        for result in similar_skills.data:
            data = result['requirement']
            similarity = result['similarity']
            print(f"Similarity: {similarity}")
            if data['type'] == 'skill_requirement':
                final_essential_skills.append({
                    'type': data['type'],
                    'requirement': data['requirement']
                })
            elif data['type'] == 'soft_skill_requirement':
                final_soft_skills.append({
                    'type': data['type'],
                    'requirement': data['requirement']
                })
            elif data['type'] == 'nice_to_have_requirement':
                final_nice_to_have.append({
                    'type': data['type'],
                    'requirement': data['requirement']
                })
    print("we got to here past supabase")
    print(final_essential_skills)
    print(final_soft_skills)
    print(final_nice_to_have)
    # Create UpdatedRequirements with raw dictionaries
    return UpdatedRequirements(
        essential_skills=final_essential_skills,
        soft_skills=final_soft_skills,
        nice_to_have=final_nice_to_have
    )


def generate_id(prefix: str = "") -> str:
    return f"{prefix}_{uuid.uuid4()}"

def get_timestamp() -> str:
    return datetime.now().isoformat()



def filter_system_prompts(messages: List[ModelMessage]) -> List[ModelMessage]:
    """
    Filters out SystemPromptPart from ModelRequest objects
    
    Args:
        messages: List of ModelMessage objects
        
    Returns:
        List of ModelMessage objects without SystemPromptPart
    """
    filtered_messages = []
    
    for msg in messages:
        if isinstance(msg, ModelRequest):
            # Filter out SystemPromptPart
            filtered_parts = [part for part in msg.parts if not isinstance(part, SystemPromptPart)]
            if filtered_parts:  # Only add if there are parts left
                filtered_messages.append(ModelRequest(parts=filtered_parts))
        else:
            filtered_messages.append(msg)
    
    return filtered_messages

# Simple chat endpoint that takes a query parameter
class ChatRequest(BaseModel):
    query: str
    thread_id: Optional[str] = None

async def create_test_thread():
    """
    Creates a test thread with ID 10 and a placeholder job description.
    Called only at backend initialization.
    """
    # Use ID 10 as requested
    thread_id = "10"
    timestamp = get_timestamp()
    
    # Create a placeholder job description
    initial_description = JobDescription(
        title="Software Engineer (Test)",
        description="""We are looking for a talented Software Engineer to join our team. The ideal candidate should be proficient in Python and JavaScript. He must have at least 5 years of experience. The successful candidate will work alongside other engineers and developers working on different layers of the infrastructure. A commitment to collaborative problem solving, sophisticated design, and quality product is essential. This position is suitable for men who can handle pressure.""",
        version=1
    )
    
    # Create edited job description with the job description and no gender recommendations
    edited_job_description = EditedJobDescription(
        job_description=initial_description,
        gender_recommendations=None
    )
    
    # Create a thread with the Thread model structure
    test_thread = Thread(
        id=thread_id,
        created_at=timestamp,
        chat_history=[],
        edit_history=[],
        chat_model_history=[],
        edit_model_history=[],
        descriptions=[edited_job_description]
    )
    
    # Save to database
    threads[thread_id] = test_thread.model_dump()
    print(f"Created test thread with ID {thread_id}")
    
    return thread_id

async def create_thread():
    """
    Creates a new thread with initial empty state
    """
    thread_id = generate_id("thread")
    timestamp = get_timestamp()
    
    new_thread = Thread(
        id=thread_id,
        created_at=timestamp,
        chat_history=[],
        edit_history=[],
        chat_model_history=[],
        edit_model_history=[],
        descriptions=[]
    )
    
    threads[thread_id] = new_thread.model_dump()
    return {
        "thread_id": thread_id,
        "created_at": timestamp
    }

def format_chat_history(thread: Thread, timestamp: str) -> List[Dict[str, str]]:
    """
    Formats the chat history for frontend display.
    
    Args:
        thread: The thread containing the chat history
        timestamp: The timestamp to use for the messages
        
    Returns:
        List of formatted messages with role, content, and timestamp
    """
    formatted_history = []
    for msg in thread.chat_history:
        formatted_history.append({
            "role": "user",
            "content": msg.user_input,
            "timestamp": timestamp
        })
        formatted_history.append({
            "role": "assistant",
            "content": msg.assistant_response,
            "timestamp": timestamp
        })
    return formatted_history

def format_edit_history(thread: Thread, timestamp: str) -> List[Dict[str, str]]:
    """
    Formats the edit history for frontend display.
    
    Args:
        thread: The thread containing the edit history
        timestamp: The timestamp to use for the messages
        
    Returns:
        List of formatted messages with role, content, and timestamp
    """
    formatted_history = []
    for msg in thread.edit_history:
        formatted_history.append({
            "role": "user",
            "content": msg.user_input,
            "timestamp": timestamp
        })
        formatted_history.append({
            "role": "assistant",
            "content": msg.assistant_response,
            "timestamp": timestamp
        })
    return formatted_history

async def update_thread_history(
    thread: Thread,
    query: str,
    response: str,
    result: Any,
    history_type: Literal["chat", "edit"]
) -> None:
    """
    Updates thread history with new messages and model history.
    
    Args:
        thread: The thread to update
        query: The user's query
        response: The assistant's response
        result: The agent result containing new messages
        history_type: Which history to update ("chat" or "edit")
    """
    # Create a new message with user input and assistant response
    new_message = Message(
        user_input=query,
        assistant_response=response
    )
    
    # Add message to appropriate history based on type
    if history_type == "chat":
        thread.chat_history.append(new_message)
        # Get new messages from the result and filter out SystemPromptPart
        new_model_messages = filter_system_prompts(result.new_messages())
        # Add filtered new messages to thread's chat_model_history
        thread.chat_model_history.extend(new_model_messages)
    else:  # edit
        thread.edit_history.append(new_message)
        # Get new messages from the result and filter out SystemPromptPart
        new_model_messages = filter_system_prompts(result.new_messages())
        # Add filtered new messages to thread's edit_model_history
        thread.edit_model_history.extend(new_model_messages)

class ReadabilityRequest(BaseModel):
    text: str = Field(description="The text to analyze for readability")

@app.post("/readability")
async def calculate_readability(request: ReadabilityRequest):
    """
    Calculate readability metrics for the given text using textstat library.
    Returns Flesch Reading Ease, Flesch-Kincaid Grade Level, and a combined score.
    """
    text = request.text

    # Calculate Flesch Reading Ease (0-100, higher is better)
    flesch_ease = textstat.flesch_reading_ease(text)

    # Calculate Flesch-Kincaid Grade Level (corresponds to US grade level)
    flesch_grade = textstat.flesch_kincaid_grade(text)

    # Normalize Flesch-Kincaid Grade to a 0-10 scale (assuming grade 12+ is the maximum)
    # Lower grade level is better for readability
    normalized_grade = max(0, min(10, 10 - (flesch_grade / 12) * 10))

    # Normalize Flesch Reading Ease to a 0-10 scale (assuming 100 is the maximum)
    normalized_ease = max(0, min(10, flesch_ease / 10))

    # Calculate combined score (average of both normalized scores)
    combined_score = (normalized_ease + normalized_grade) / 2

    return {
        "flesch_ease": flesch_ease,
        "flesch_grade": flesch_grade,
        "normalized_ease": normalized_ease,
        "normalized_grade": normalized_grade,
        "combined_score": combined_score,
        "rounded_score": round(combined_score)
    }
class CreateNewVersionRequest(BaseModel):
    thread_id: str
    current_job_description: JobDescription
    gender_recommendations: Optional[RecommendationResponse]


@app.post("/save_version")
async def save_version(request: CreateNewVersionRequest):
    """
    Endpoint that updates an existing job description in thread history based on version number.
    """
    # Check if thread exists
    if not request.thread_id or request.thread_id not in threads:
        raise HTTPException(status_code=404, detail="Thread not found")
    
    # Get the thread
    thread = Thread(**threads[request.thread_id])
    
    # Look for the job description with matching version
    found = False
    for i, desc in enumerate(thread.descriptions):
        if desc.job_description.version == request.current_job_description.version:
            # Update the job description
            edited_job_description = EditedJobDescription(
                job_description=request.current_job_description,
                gender_recommendations=request.gender_recommendations
            )
            thread.descriptions[i] = edited_job_description
            found = True
            break
    
    if not found:
        raise HTTPException(status_code=404, detail=f"Job description with version {request.current_job_description.version} not found")
    
    # Update thread in storage
    threads[request.thread_id] = thread.model_dump()
    
    # Return the updated job description
    return {"job_description": request.current_job_description}

@app.post("/create_new_version")
async def create_new_version(request: CreateNewVersionRequest):
    """
    Endpoint that saves a job description to thread history and returns the same job description
    with version based on the number of existing descriptions.
    """
    # Check if thread exists
    if not request.thread_id or request.thread_id not in threads:
        raise HTTPException(status_code=404, detail="Thread not found")
    
    # Get the thread
    thread = Thread(**threads[request.thread_id])
    
    # Calculate new version number based on the length of descriptions list
    new_version = len(thread.descriptions) + 1
    
    # Create a new job description with version based on descriptions count
    updated_job_description = JobDescription(
        title=request.current_job_description.title,
        description=request.current_job_description.description,
        version=new_version,
    )
    
    # Add to thread's descriptions
    edited_job_description = EditedJobDescription(
        job_description=updated_job_description,
        gender_recommendations=request.gender_recommendations
    )
    thread.descriptions.append(edited_job_description)
    
    # Update thread in storage
    threads[request.thread_id] = thread.model_dump()
    
    # Return the updated job description
    return {"job_description": updated_job_description}



@app.post("/chatendpoint")
async def chat_endpoint(request: ChatRequest):
    """
    Simple endpoint that takes a query and returns a response with chat history
    """
    job_description_generated = False  # Initialize flag as False
    # Check if thread exists or create new one
    if not request.thread_id or request.thread_id not in threads:
        thread_response = await create_thread()
        thread_id = thread_response["thread_id"]
        timestamp = thread_response["created_at"]
    else:
        thread_id = request.thread_id
        timestamp = get_timestamp()
    
    # Initialize OpenAI and Supabase clients
    deps = Deps(openai_client=OpenAI(api_key=os.getenv("OPENAI_API_KEY")),
                supabase=create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_ANON_KEY"))
    )
    thread = Thread(**threads[thread_id])
    query = CHAT_AGENT_QUERY_PROMPT.format(query=request.query)
    print("message history:",thread.chat_model_history)
    result = await chat_agent.run(
        query, 
        deps=deps,
        message_history=thread.chat_model_history
    )

    
    # Extract response from the agent result
    response = ""
    if isinstance(result.data, str):
        response = result.data
    elif isinstance(result.data, JobRequirements):
        requirements = result.data
        print("requirements:",requirements)
        updated_requirements = await analyze_requirements(deps, requirements)
        generation_prompt = JOB_DESCRIPTION_GENERATION_PROMPT.format(
            job_title=requirements.job_title,
            original_essential_skills=chr(10).join(f'- {skill.requirement}' for skill in requirements.job_requirements.essential_skills),
            inclusive_essential_skills=chr(10).join(f'- {skill.requirement}' for skill in updated_requirements.essential_skills),
            original_nice_to_have=chr(10).join(f'- {skill.requirement}' for skill in requirements.job_requirements.nice_to_have),
            inclusive_nice_to_have=chr(10).join(f'- {skill.requirement}' for skill in updated_requirements.nice_to_have),
            original_soft_skills=chr(10).join(f'- {skill.requirement}' for skill in requirements.job_requirements.soft_skills),
            inclusive_soft_skills=chr(10).join(f'- {skill.requirement}' for skill in updated_requirements.soft_skills),
            responsibilities=requirements.responsibilities,
            salary=requirements.job_salary,
            location=requirements.job_location,
            job_type=requirements.job_type
        )
        description_result = await job_description_agent.run(
            generation_prompt, 
            deps=deps,
        )
        
        job_description_generated = True
        
        if isinstance(description_result.data, JobDescription):
            # Create an EditedJobDescription with the job description and no gender recommendations yet
            edited_job_description = EditedJobDescription(
                job_description=description_result.data,
                gender_recommendations=None
            )
            
            thread.descriptions.append(edited_job_description)
            response = "Requirements gathered successfully! I've generated a job description based on your requirements. You can now view and edit it in the canvas."
    
    # Update thread history
    await update_thread_history(thread, request.query, response, result, "chat")
    
    # Update thread in storage
    threads[thread_id] = thread.model_dump()
    
    # Format chat history for frontend display
    formatted_history = format_chat_history(thread, timestamp)
    
    # Return the response, thread ID, formatted chat history, and job description generated flag
    return {
        "response": response,
        "thread_id": thread_id,
        "chat_history": formatted_history,
        "timestamp": timestamp,
        "isGenerated": job_description_generated
    }

@app.get("/api/threads/{thread_id}/version-histories")
async def retrieve_version_histories(thread_id: str):
    """Fetch all job description versions with gender recommendations for a specific thread."""
    if thread_id not in threads:
        return {"error": "Thread not found"}
    
    thread_data = threads[thread_id]
    thread = Thread(**thread_data)
    
    # Transform the descriptions to match the frontend's expected format
    # but also include gender recommendations
    transformed_versions = []
    for desc in thread.descriptions:
        version = {
            "title": desc.job_description.title,
            "description": desc.job_description.description,
            "version": desc.job_description.version,
            "gender_recommendations": desc.gender_recommendations.model_dump() if desc.gender_recommendations else None
        }
        transformed_versions.append(version)
    
    # Return all job descriptions in the format expected by the frontend
    return {
        "versions": transformed_versions
    }
class ApplyChangeRequest(BaseModel):
    gendered_language: str
    reasoning: str 
    current_job_description: JobDescription

@app.post("/apply_change")
async def apply_change(request: ApplyChangeRequest):
    """
    Endpoint for applying changes to gendered language in job descriptions
    """
    # Initialize OpenAI and Supabase clients
    deps = Deps(openai_client=OpenAI(api_key=os.getenv("OPENAI_API_KEY")),
                supabase=create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_ANON_KEY"))
    )

    # Format prompt for apply_change_agent
    change_prompt = APPLY_CHANGE_USER_PROMPT.format(
        gendered_language=request.gendered_language,
        reasoning=request.reasoning,
        job_description=request.current_job_description.description
    )

    result = await apply_change_agent.run(
        change_prompt,
        deps=deps
    )

    if isinstance(result.data, JobDescription):
        return result.data
    else:
        raise HTTPException(status_code=400, detail="Failed to apply changes to job description")

class EditChatRequest(BaseModel):
    query: str
    thread_id: Optional[str] = None
    current_job_description: JobDescription

class SelectionEditRequest(BaseModel):
    query: str
    thread_id: Optional[str] = None
    selected_text: str
    current_job_description: JobDescription
@app.post("/selection_edit")
async def selection_edit(request: SelectionEditRequest):
    """
    Endpoint for handling edit requests with selected text from the job description
    """
    timestamp = get_timestamp()
    
    # Create or retrieve thread
    thread_id = request.thread_id
    
    # Initialize OpenAI and Supabase clients
    deps = Deps(openai_client=OpenAI(api_key=os.getenv("OPENAI_API_KEY")),
                supabase=create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_ANON_KEY"))
    )
    
    # Get thread model
    thread = Thread(**threads[thread_id])
    
    # Process the message with the editor_agent using the thread's edit_model_history
    edit_prompt = SELECTION_EDIT_PROMPT_USER_PROMPT.format(
        selected_text=request.selected_text,
        query=request.query,
        job_description=request.current_job_description.description
    )
    
    result = await selection_edit_agent.run(
        edit_prompt, 
        deps=deps,
    )
    
    # Extract response from the agent result
    response = ""
    updated_job_description = None
    
    if isinstance(result.data, JobDescription):
        updated_job_description = result.data
        response = f"I've updated the job description based on your feedback about the selected text."
    else:
        response = "I couldn't update the job description. Please try again with more specific instructions."
    
    # Update thread history
    await update_thread_history(thread, request.query, response, result, "edit")
    
    # Return the updated job description or an error message
     
    
    # If we have an updated job description, add it to the thread
    gender_recommendations = None
    if updated_job_description:
        # Get the previous version (if any)
        
        gender_recommendations = await analyze_gender_bias(
            deps, 
            request.current_job_description, 
            updated_job_description
        )
        
        # Create an EditedJobDescription with the job description and gender recommendations
        edited_job_description = EditedJobDescription(
            job_description=updated_job_description,
            gender_recommendations=gender_recommendations
        )
        print(edited_job_description)
        # Add to thread
       
    # Update thread in storage
    threads[thread_id] = thread.model_dump()
    
    # Format edit history for frontend display
    formatted_history = format_edit_history(thread, timestamp)
    
    # Store the job description in Supabase
    deps.supabase.table("user_queries").insert({
        "job_description": result.data.description
    }).execute()

    return {
        "response": response,
        "thread_id": thread_id,
        "chat_history": formatted_history,
        "timestamp": timestamp,
        "job_description": updated_job_description.model_dump() if updated_job_description else None,
        "gender_recommendations": gender_recommendations.model_dump() if gender_recommendations else None
    }
   



@app.post("/edit_chat")
async def edit_chat(request: EditChatRequest):
    """
    Endpoint for handling edit requests with the current job description
    """
    timestamp = get_timestamp()
    
    # Create or retrieve thread
    thread_id = request.thread_id
    
    # Initialize OpenAI and Supabase clients
    deps = Deps(openai_client=OpenAI(api_key=os.getenv("OPENAI_API_KEY")),
                supabase=create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_ANON_KEY"))
    )
    
    # Get thread model
    thread = Thread(**threads[thread_id])
    
    # Process the message with the editor_agent using the thread's edit_model_history
    edit_prompt = f"""
    {request.query}
    
    Current Job Description:
    Title: {request.current_job_description.title}
    
    {request.current_job_description.description}

    version: {request.current_job_description.version}
    """
    
    result = await editor_agent.run(
        edit_prompt, 
        deps=deps,
        message_history=thread.edit_model_history
    )
    
    # Extract response from the agent result
    response = ""
    updated_job_description = None
    
    if isinstance(result.data, JobDescription):
        updated_job_description = result.data
        response = f"I've updated the job description based on your feedback."
    else:
        response = "I couldn't update the job description. Please try again with more specific instructions."
    
    # Update thread history
    await update_thread_history(thread, request.query, response, result, "edit")
    
    # If we have an updated job description, add it to the thread
    gender_recommendations = None
    if updated_job_description:
        # Get the previous version (if any)
        
        gender_recommendations = await analyze_gender_bias(
            deps, 
            request.current_job_description, 
            updated_job_description
        )
        
        # Create an EditedJobDescription with the job description and gender recommendations
        edited_job_description = EditedJobDescription(
            job_description=updated_job_description,
            gender_recommendations=gender_recommendations
        )
        print(edited_job_description)
        # Add to thread
       
    # Update thread in storage
    threads[thread_id] = thread.model_dump()
    
    # Format edit history for frontend display
    formatted_history = format_edit_history(thread, timestamp)
    
    # Store the job description in Supabase
    deps.supabase.table("user_queries").insert({
        "job_description": result.data.description
    }).execute()

    return {
        "response": response,
        "thread_id": thread_id,
        "chat_history": formatted_history,
        "timestamp": timestamp,
        "job_description": updated_job_description.model_dump() if updated_job_description else None,
        "gender_recommendations": gender_recommendations.model_dump() if gender_recommendations else None
    }

async def analyze_gender_bias(
    deps: Deps,
    original_description: JobDescription, 
    updated_description: JobDescription
) -> RecommendationResponse:
    """
    Analyze gender bias in the changed sections of a job description.
    
    Args:
        deps: Dependencies including API clients
        original_description: The previous version of the job description
        updated_description: The updated version of the job description
        
    Returns:
        RecommendationResponse: A list of recommendations for gender-neutral language
    """
    # Identify changes between the original and updated descriptions
    changes = identify_changes(original_description.description, updated_description.description)
    
    if not changes:
        # No changes detected, return empty response
        return RecommendationResponse(responses=[])
    
    # Prepare changed sections for the prompt
    sections_to_analyze = []
    for changed_section, context in changes:
        sections_to_analyze.append(f"Changed section:\n{changed_section}\n\nSurrounding context:\n{context}")
    
    changed_sections_text = "\n\n".join(sections_to_analyze)
    
    # Create a custom prompt with the specific job descriptions
    custom_prompt = gender_expert_prompt_2_0.format(
        original_description=original_description.description,
        updated_description=updated_description.description,
        changed_sections=changed_sections_text
    )
    
    # Call gender expert agent with the custom prompt
    result = await gender_expert_agent.run(
        custom_prompt,
        deps=deps
    )
    
    return result.data

# Main entry point
if __name__ == "__main__":
    # Create initial test thread on startup
    asyncio.run(create_test_thread())
    print(f"Initialized threads: {list(threads.keys())}")
    
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
    