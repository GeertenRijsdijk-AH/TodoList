# uvicorn main:app --reload

from contextlib import asynccontextmanager
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.postgres import db, create_tables, delete_task, get_tasks, add_task, check_task
from api.models import Task

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        db.connect()
        logging.info("Connected to Database")
        create_tables()
        yield

    finally:
        db.close()
        logging.info("Disconnected from Database")

app = FastAPI(
    lifespan=lifespan,
    title="learning_app",
    description="beautiful full stack app",
)

# Allow all origins (for development purposes)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Allow only frontend
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)


@app.get("/")
def root():
    return get_tasks()

@app.post("/")
def post_task(task: Task):
    return add_task(task)

@app.post("/check/{id}")
def post_check(id: int):
    return check_task(id)

@app.delete("/check/{id}")
def delete_check(id: int):
    return delete_task(id)