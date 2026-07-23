FROM python:3.11-slim

# Install system dependencies (libatomic1 is required by Prisma's internal Node CLI)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libatomic1 \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirement files and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy all application code from backend
COPY . .

# Pre-generate Prisma Client during the build phase
RUN python -m prisma generate

# Expose port and start Uvicorn
EXPOSE 8000
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]