generate_analysis_responses = {
    200: {
        "description": "Successful Analysis",
        "content": {
            "application/json": {
                "example": [{
                    "gendered_item": "string",
                    "recommendation": "string"
                }]
            }
        },
    },
    400: {"description": "Bad Request"},
    500: {"description": "Internal Server Error"},
}

generate_question_responses = {
    200: {
        "description": "Generated Question",
        "content": {
            "application/json": {
                "example": {
                    "question": "string"
                }
            }
        },
    },
    400: {"description": "Bad Request"},
    500: {"description": "Internal Server Error"},
}

generate_job_description_responses = {
    200: {
        "description": "Generated Job Description",
        "content": {
            "application/json": {
                "example": {
                    "job_description_id": 123,
                    "generated_description": "string"
                }
            }
        },
    },
    400: {"description": "Bad Request"},
    500: {"description": "Internal Server Error"},
}

update_job_description_responses = {
    200: {
        "description": "Updated Job Description",
        "content": {
            "application/json": {
                "example": {
                    "updated_job_description": "Updated job description content...",
                    "job_description_id": 123
                }
            }
        },
    },
    400: {"description": "Bad Request"},
    500: {"description": "Internal Server Error"},
}

get_job_descriptions_responses = {
    200: {
        "description": "List of Job Descriptions",
        "content": {
            "application/json": {
                "example": [
                    {
                        "id": "123e4567-e89b-12d3-a456-426614174000",
                        "user_id": "98765432-e89b-12d3-a456-426614174000",
                        "job_description": "We are seeking a talented Software Engineer...",
                        "is_generated": True,
                        "updated": False,
                        "updated_description": None,
                        "recommendations": [{
                            "gendered_item": "Where a gendered word, phrase or sentence is used",
                            "recommendation": "Where a recommendation on how to make the language gender neutral is given"
                        }],
                        "created_at": "2024-03-15T10:00:00Z",
                        "updated_at": "2024-03-15T10:00:00Z"
                    },
                    # ... other examples ...
                ]
            }
        },
    },
    400: {"description": "Bad Request"},
    500: {"description": "Internal Server Error"},
}