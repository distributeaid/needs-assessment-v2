# Needs Assessment Project

This project is a Next.js application with a Prisma/Postgres backend designed to facilitate the management and completion of needs assessment Assessments.

## 🚀 Getting started with Gitpod

Gitpod provides a fully automated development environment for your Next.js project, and the development environment is set up with just a single click. Follow these steps to get started:

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/distributeaid/needs-assessment-v2)

1. Click the `Open in Gitpod` button above. Note: you'll need to have an account on [Gitpod](https://gitpod.io/login/) before proceeding with the next steps (this requires a GitHub account).
2. Click the `Continue` button.
3. Relax, a development environment is being set up for you in the first terminal.
4. To access your workspace later, go to [Gitpod Workspaces](https://gitpod.io/workspaces). Pin the `needs-assessment-v2` workspace to prevent auto-deletion after 14 days by clicking the three dots next to the workspace name and selecting "Pin".

## Tech Stack

- **Frontend:** Next.js (React, TypeScript, TailwindCSS)
- **Backend:** Prisma ORM with PostgreSQL
- **Containerization:** Docker (Postgres in Docker)
- **Authentication:** NextAuth.js

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-repo/needs-assessment.git
cd needs-assessment
```

### 2. Install Dependencies

Make sure you have **Node.js** installed. Then install project dependencies:

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Ensure the following environment variables are correctly set in `.env`:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/needs_assessment"
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
```

---

## Database Setup

### 4. Run PostgreSQL with Docker

This project uses Docker to manage the PostgreSQL database. Make sure Docker is installed and running.

Start the PostgreSQL container:

```bash
docker-compose up -d
```

### 5. Update the database

```bash
npx prisma migrate reset --force
```

## Running the App

### 7. Start the Development Server

Run the Next.js development server:

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the app.

---

## Project Structure

```
needs-assessment/
├── prisma/              # Prisma schema and migrations
├── src/
│   ├── app/             # Next.js app directory with routes
│   ├── components/      # Reusable React components
│   ├── types/           # TypeScript types and models
├── docker-compose.yml   # Docker configuration (Postgres)
├── .env.example         # Example environment configuration
├── package.json         # Project metadata and scripts
```

---

## Contributing

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature-name`).
3. Make your changes.
4. Commit your changes (`git commit -m 'Add some feature'`).
5. Push to the branch (`git push origin feature/your-feature-name`).
6. Open a pull request.

### Potential TODOs for Contributors

#### **Frontend Improvements (Next.js/React):**
0. **Implement critical features:**
   - Incorporate a real authentication system (waiting on updates)
   - Update Assessment to reflect the actual questions we want
   - Store all responses in a queryable way (e.g. Baserow?)
   - Get initial Assessment questions from Strapi (waiting on strapi deploy)

1. **Enhance Form Components:**
   - Create reusable components for different question types (`Numeric`, `Dropdown`, `MultiSelect`, etc.).
   - Add validation and user-friendly error messages for required fields.

2. **UI/UX Enhancements:**
   - Improve the **Sidebar** with better progress indicators or navigation.
   - Add animations/transitions using **Framer Motion** for smoother interactions.
   - Implement responsive design improvements using **TailwindCSS**.

3. **Assessment Summary Page:**
   - Build a summary page that displays a user's completed responses before final submission.

4. **Loading and Error States:**
   - Add loading spinners or skeleton components while data is being fetched.
   - Improve error handling with user-friendly messages and retry options.

#### **Backend Enhancements (Prisma/Postgres):**

1. **Add Role-Based Access Control (RBAC):**
   - Implement roles (Admin, Contributor, Viewer) with different permissions for Assessments and responses.

2. **Optimize Database Queries:**
   - Review and optimize Prisma queries to reduce response times.
   - Add indexes to frequently queried fields (e.g., `siteId`, `AssessmentId`).

3. **Audit Logging:**
   - Track changes to Assessments and responses in an audit log for accountability.

#### **Testing & QA:**

1. **Add Unit and Integration Tests:**
   - Write tests for API routes using **Jest** or **React Testing Library**.
   - Add tests for form validation and submission.

2. **End-to-End Testing:**
   - Set up **Cypress** for end-to-end testing of the Assessment flow.

#### **DevOps & Documentation:**

1. **Docker Optimization:**
   - Optimize Dockerfile for faster builds and smaller image sizes.
   - Set up separate Docker configurations for development and production.

2. **Expand Documentation:**
   - Add detailed API documentation for backend routes.
   - Create a guide for setting up the project without Docker for contributors who prefer a local setup.

#### **Feature Requests:**

1. **Assessment Versioning:**
   - Implement a system to track different versions of Assessments over time.

2. **Data Visualization Dashboard:**
   - Build a dashboard to visualize Assessment responses using **Chart.js** or **Recharts**.

3. **Import/Export Assessments:**
   - Add functionality to import/export Assessments and responses as CSV or JSON.

---

## Troubleshooting

- **Docker Issues:**
  - If Docker volumes are stuck, try restarting Docker or force removing volumes:
    ```bash
    docker volume prune -f
    ```

- **Database Errors:**
  - If migrations fail, try resetting the database:
    ```bash
    npx prisma migrate reset
    ```

- **Port Conflicts:**
  - Make sure ports `3000` (Next.js) and `5432` (Postgres) are not in use by other applications.

---

## License

This project is licensed under the MIT License.
