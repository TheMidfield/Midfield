FROM python:3.11-slim

WORKDIR /app

# Install system dependencies (git is needed for some pip installs if from git)
RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY scrape.py .

# Run unbuffered for real-time logs
CMD ["python", "-u", "scrape.py"]
