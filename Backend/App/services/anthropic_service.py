from App.models import ExtractedTask


class AnthropicExtractionService:
    """
    Extracts structured academic tasks from uploaded course files using the Claude API.

    In the full implementation, this service:
    - Builds a structured prompt with today's date and all parsed file contents
    - Calls the Anthropic Messages API using the configured Claude model
    - Parses the JSON response into a normalized list of ExtractedTask objects

    The AI is instructed to:
    - Extract every task, assignment, exam, quiz, project, lab, essay, and reading
    - Convert relative dates to YYYY-MM-DD format using today as reference
    - Infer realistic due dates when not explicitly stated
    - Return structured JSON only — no prose or markdown
    """

    def __init__(self, settings):
        """
        Initializes the Anthropic client.
        Requires ANTHROPIC_API_KEY to be configured in the environment.
        """
        ...

    def extract_tasks(self, parsed_files: list[dict]) -> list[ExtractedTask]:
        """
        Accepts a list of parsed file payloads and returns extracted tasks.

        Args:
            parsed_files: [{"name": "syllabus.pdf", "content": "..."}, ...]

        Returns:
            List of normalized ExtractedTask objects ready for the frontend
        """
        ...
