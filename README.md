# Gemini Forum

A modern, full-stack forum application built with:

- **Frontend:** Next.js 14 (React), TypeScript, Tailwind CSS
- **Backend:** NestJS, TypeScript, TypeORM/Prisma
- **Database:** PostgreSQL
- **Caching:** Redis
- **Infrastructure:** Docker & Docker Compose

## Getting Started

### Prerequisites

- Docker & Docker Compose installed on your machine.

### Installation

1. Clone the repository (if not already done).
2. Navigate to the project root:
   ```bash
   cd gemini-forum
   ```
3. Start the application stack:
   ```bash
   docker-compose up --build
   ```

The services will be available at:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:4000
- **Database:** localhost:5432

## Project Structure

- `frontend/`: Next.js application
- `backend/`: NestJS API application
- `docker-compose.yml`: Service orchestration configuration

## Features (Planned)

- User Authentication (Login/Register)
- Create/Read/Update/Delete Threads and Posts
- Categories/Topics
- User Profiles
- Administration Panel
