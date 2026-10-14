FROM python:3.11-slim

WORKDIR /app

# fewer malloc arenas = noticeably lower memory use for a threaded Flask app
ENV PYTHONUNBUFFERED=1 MALLOC_ARENA_MAX=2

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 10000

# new1/new1.py is the entry point (new design). It imports dashboard/new.py,
# which imports dashboard/app.py — all three files are needed.
CMD gunicorn --chdir new1 new1:app --workers 1 --threads 2 --timeout 300 --bind 0.0.0.0:${PORT:-10000}
