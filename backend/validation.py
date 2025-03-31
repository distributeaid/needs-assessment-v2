from backend.models import Question

def validate_responses(responses, require_all=False):
    """Validate responses before saving or completing a SitePage."""
    errors = []
    for response in responses:
        question = Question.query.get(response["questionId"])
        if not question:
            errors.append(f"Invalid question ID: {response['questionId']}")
            continue

        # Ensure required questions have answers
        if require_all and question.mandatory and not response.get("value"):
            errors.append(f"Missing value for required question: {question.text}")
        if not response.get("value"):
            continue

        # Numeric validation
        if question.type == "Numeric" and response['value'].isnumeric():
            response["value"] = float(response["value"])
        if question.type == "Numeric" and not isinstance(response.get("value"), (int, float)):
            errors.append(f"Invalid numeric response for question: {question.text}: {response['value']}")

        # MultiSelect validation
        if question.type in ["MultiSelect", "MultiselectWithOther"]:
            if not isinstance(response.get("value"), list):
                errors.append(f"MultiSelect responses must be a list for question: {question.text}")

    return errors
