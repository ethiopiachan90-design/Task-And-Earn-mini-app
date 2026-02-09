# Task And Earn - Execution Guide

This guide provides instructions on how to set up and run the Task And Earn project.

## Prerequisites

- **Node.js**: Version 18 or higher.
- **pnpm**: Version 9 (Project manager).
- **Docker**: For running PostgreSQL and Redis (recommended).
- **Prisma**: For database management.

## Setup

1.  **Clone the Repository**:
    ```bash
    git clone <repository-url>
    cd task-and-earn
    ```

2.  **Install Dependencies**:
    ```bash
    pnpm install
    ```

3.  **Environment Variables**:
    - Copy `.env.example` to `.env`.
    - Update the database and other service credentials in `.env`.
    ```bash
    cp .env.example .env
    ```

4.  **Database Configuration**:
    Ensure your PostgreSQL instance is running, then run:
    ```bash
    # Generate Prisma Client
    pnpm db:generate

    # Push schema to database (or run migrations)
    pnpm db:push
    ```

## Running the Project

You can run the entire project or individual components using `pnpm` and `Turborepo`.

### Development Mode

- **Full Stack** (API, Admin, Mini-app):
  ```bash
  pnpm dev
  ```

- **API Only**:
  ```bash
  pnpm dev:api
  ```

- **Mini-app Only**:
  ```bash
  pnpm dev:mini-app
  ```

- **Admin Panel Only**:
  ```bash
  pnpm dev:admin
  ```

### Build

- **Build everything**:
  ```bash
  pnpm build
  ```

## Database Tools

- **Prisma Studio** (GUI to view/edit data):
  ```bash
  pnpm db:studio
  ```

- **Database Migration**:
  ```bash
  pnpm db:migrate
  ```

## Project Structure

- `apps/api`: Backend service (Fastify, Prisma, BullMQ).
- `apps/admin`: Admin dashboard for management.
- `apps/mini-app`: Telegram Mini App frontend.
- `packages/shared`: Shared types and logic across applications.
