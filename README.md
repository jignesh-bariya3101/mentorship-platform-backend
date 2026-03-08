# mentorship-platform-backend

This project is a backend implementation of a simplified mentorship
platform where **parents, students, and mentors interact**.

The goal of the project is to demonstrate a clean backend architecture
with authentication, role-based access control, lesson management,
booking flows, and a small LLM integration for text summarization.

The project is built using **NestJS** and **PostgreSQL** with Prisma
ORM.

------------------------------------------------------------------------

# Tech Stack

-   NestJS
-   TypeScript
-   Prisma ORM
-   PostgreSQL
-   JWT Authentication
-   Swagger (OpenAPI)
-   OpenAI-compatible LLM integration
-   @nestjs/throttler for simple rate limiting

Tested with:

Node.js v22.21.0

------------------------------------------------------------------------

# Main Features

## Authentication

-   Parent and Mentor signup
-   Login with JWT
-   `GET /me` endpoint for current user

## Student Management

-   Parents can create students under their account
-   Parents can view only their own students

## Lessons

-   Mentors can create lessons
-   Lessons belong to mentors

## Bookings

-   Parents can book their student into a lesson

## Sessions

-   Mentors can create sessions for a lesson
-   Sessions include date, topic, and summary
-   Sessions can be listed per lesson

## LLM Text Summarization

An endpoint is included that sends text to an LLM provider and returns a
short summary.

------------------------------------------------------------------------

# Additional APIs

-   `GET /students` with search and pagination
-   `GET /lessons` with search and pagination
-   `GET /bookings` with pagination and filters
-   `GET /lessons/:id/sessions` with pagination
-   `GET /students/:id`
-   `GET /lessons/:id`
-   `POST /sessions/:id/join`
-   `GET /health`

------------------------------------------------------------------------

# Assumptions

-   Only **Parent** and **Mentor** users can authenticate.
-   **Students are created by parents** and do not log in directly.
-   Parents can only access their own students and related bookings.
-   Mentors can only manage lessons and sessions they created.

------------------------------------------------------------------------

# Project Setup

## Install dependencies

npm install

## Configure environment variables

Copy the example file:

cp .env.example .env

Update: - DATABASE_URL - JWT_SECRET - OPENAI_API_KEY

------------------------------------------------------------------------

## Create PostgreSQL database

Example:

CREATE DATABASE mentora_nest;

------------------------------------------------------------------------

## Run migrations

npm run prisma:generate npm run prisma:migrate -- --name init

------------------------------------------------------------------------

## Seed data

npm run db:seed

------------------------------------------------------------------------

## Start server

npm run start:dev

API: http://localhost:4000

Swagger: http://localhost:4000/docs

Health: http://localhost:4000/health

------------------------------------------------------------------------

# Default Seed Users

Parent email: jignesh@gmail.com password: HelloHello@123

Mentor email: mentor1@example.com password: HelloHello@123

------------------------------------------------------------------------

# LLM Summarization Endpoint

POST /llm/summarize

Example request:

curl -X POST http://localhost:4000/llm/summarize -H "Content-Type:
application/json" -H "Authorization: Bearer `<TOKEN>`{=html}" -d
'{"text":"Mentor discussed algebra basics and student needs revision
support before next week. Additional information added to satisfy length
requirement."}'

------------------------------------------------------------------------

# Validation Rules

-   400 if text is missing
-   400 if text is shorter than 50 characters
-   413 if text exceeds allowed limit
-   502 if provider request fails

------------------------------------------------------------------------

# Security Notes

-   API keys stored in environment variables
-   JWT authentication
-   Passwords hashed using bcrypt
-   Role-based authorization
-   Request validation using DTOs
