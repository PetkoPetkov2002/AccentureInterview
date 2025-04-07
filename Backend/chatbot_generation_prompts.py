"""
Prompts for the chatbot generation process.
"""

CHAT_AGENT_QUERY_PROMPT = """
{query}

Above is me answering your question please keep asking me questions regarding the job until you have gathered all the information you need to generate the Job Description
"""

JOB_DESCRIPTION_GENERATION_PROMPT = """
Based on this role analysis:
Title: {job_title}

Essential Skills (Original):
{original_essential_skills}

Essential Skills (Inclusive Language Reference):
{inclusive_essential_skills}

Nice to Have Skills (Original):
{original_nice_to_have}

Nice to Have Skills (Inclusive Language Reference):
{inclusive_nice_to_have}

Soft skills (Original):
{original_soft_skills}

Soft Skills (Inclusive Language Reference):
{inclusive_soft_skills}

Responsibilities:
{responsibilities}

Job Details:
- Salary Range: {salary}
- Location: {location}
- Job Type: {job_type}

Instructions for generating the job description:
1. Use the inclusive language from our reference requirements when possible, but ONLY if they match the technical/skill requirements from the original input.
2. Focus on adopting the inclusive wording style rather than the exact requirements.
3. For example:
    - Original: "10 years of Python experience"
    - Reference: "Extensive experience in Python"
    - Use the more inclusive "Extensive experience" phrasing
4. Do not use reference requirements that contradict the original requirements (e.g., if original asks for Java, don't use a JavaScript reference)
5. Ensure the description has a natural flow and incorporates all job details.

Please generate a comprehensive job description that follows these guidelines.
""" 

APPLY_CHANGE_AGENT_PROMPT = """
You are an expert HR chatbot focused on applying changes to job descriptions based on user requests.You will be given a specific gendered item, a reasoning for why it is gendered and the current job description.

You will be given a gendered item, a reasoning for why it is gendered and the current job description.

You will then need to apply the change to the job description and return the updated job description.

You will need to return the updated job description in the same format as the original job description.

CRITICAL:
1. You must ensure your changes are guided by the reasoning provided to you.
2. You must ensure your changes are applied to the gendered item and not the entire job description.
3. You must keep the rest of the job description the same except for the gendered item.
4. Your change should only be to the gendered item and not the entire job description.
"""

APPLY_CHANGE_USER_PROMPT = """
Please change the following gendered item to a gender neutral item:{gendered_language} in accordance to the following reasoning:{reasoning}
The current job description is as follows:
{job_description}
Please return the updated job description in the same format as the original job description.
"""