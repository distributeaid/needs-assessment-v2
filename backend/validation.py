from backend.models import Question

def validate_responses(responses, require_all=False):
    """Validate responses before saving or completing a SitePage."""
    errors = []
    for response in responses:
        question = Question.query.get(response["question_id"])

        if not question:
            errors.append(f"Invalid question ID: {response['question_id']}")
            continue

        # Ensure required questions have answers
        if require_all and question.mandatory and not response.get("answer"):
            errors.append(f"Missing answer for required question: {question.text}")

        # Numeric validation
        if question.type == "Numeric" and not isinstance(response.get("answer"), (int, float)):
            errors.append(f"Invalid numeric response for question: {question.text}")

        # MultiSelect validation
        if question.type in ["MultiSelect", "MultiselectWithOther"]:
            if not isinstance(response.get("answer"), list):
                errors.append(f"MultiSelect responses must be a list for question: {question.text}")

    return errors
