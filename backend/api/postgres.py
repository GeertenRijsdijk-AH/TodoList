from contextlib import contextmanager
import datetime
import psycopg
import logging
from api.models import Task

class Database():
    def __init__(self):
        self.connection = None

    def connect(self):
        self.connection = psycopg.connect("host=postgresdb dbname=test_db user=postgres password=password")

    @contextmanager
    def get_cursor(self):
        cursor = self.connection.cursor()
        try:
            yield cursor
        finally:
            cursor.close()
            self.connection.commit()

    def close(self):
        if self.connection:
            self.connection.close()

db = Database()

def create_tables():
    with db.get_cursor() as cur:
        cur.execute("""
            CREATE TABLE IF NOT EXISTS tasks (
                id SERIAL PRIMARY KEY, 
                text VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                done BOOLEAN DEFAULT FALSE
            )
        """)

    logging.info("Tables created")

def get_tasks() -> list[Task]:
    with db.get_cursor() as cur:
        cur.execute("SELECT * FROM tasks")
        tasks = cur.fetchall()

    return [Task(id=task[0], text=task[1], created_at=task[2], done=task[3]) for task in tasks]

def add_task(task: Task) -> Task:
    task.created_at = datetime.datetime.now()
    with db.get_cursor() as cur:
        cur.execute("INSERT INTO tasks (text, created_at, done) VALUES (%s, %s, %s) RETURNING *", (task.text, task.created_at, task.done))
        taskdict = cur.fetchone()
        return Task(id=taskdict[0], text=taskdict[1], created_at=taskdict[2], done=taskdict[3])
    
def check_task(id: int):
    with db.get_cursor() as cur:
        cur.execute("UPDATE tasks SET done = NOT done WHERE id=%s", (id,))
        return cur.rowcount
    
def delete_task(id: int):
    with db.get_cursor() as cur:
        cur.execute("DELETE FROM tasks WHERE id=%s", (id,))
        return cur.rowcount