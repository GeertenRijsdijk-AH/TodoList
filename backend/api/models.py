from typing import Optional
from pydantic import BaseModel
from datetime import datetime

class Task(BaseModel):
    id: Optional[int] = None
    text: str
    created_at: datetime = datetime.now()
    done: bool = False