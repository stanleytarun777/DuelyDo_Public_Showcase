from pydantic import BaseModel, Field


class ExtractedTask(BaseModel):
    id: str
    title: str
    description: str = ""
    subject: str = "General"
    type: str = "other"
    dueDate: str | None = None
    priority: str = "medium"
    points: int | None = None
    status: str = "todo"
    estimatedHours: int | float | None = 1
    week: int | None = None


class ExtractResponse(BaseModel):
    tasks: list[ExtractedTask] = Field(default_factory=list)


class HealthResponse(BaseModel):
    status: str = "ok"
    model: str
