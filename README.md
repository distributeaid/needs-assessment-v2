# Needs Assessment Project

This project helps humanitarian actors complete needs assessments for Distribute Aid through a user-friendly web interface. It includes:

- ✅ A **Next.js frontend** (React, TypeScript, Tailwind CSS)
- ✅ A **Flask backend** using **Poetry** for Python dependency management
- 🌐 Optional Gitpod support for cloud-based development

## 🚀 Getting started with Gitpod

Gitpod provides a fully automated development environment for your Next.js project, and the development environment is set up with just a single click. Follow these steps to get started:

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/distributeaid/needs-assessment-v2)

1. Click the `Open in Gitpod` button above. Note: you'll need to have an account on [Gitpod](https://gitpod.io/login/) before proceeding with the next steps (this requires a GitHub account).
2. Click the `Continue` button.
3. Relax, a development environment is being set up for you in the first terminal.
4. To access your workspace later, go to [Gitpod Workspaces](https://gitpod.io/workspaces). Pin the `needs-assessment-v2` workspace to prevent auto-deletion after 14 days by clicking the three dots next to the workspace name and selecting "Pin".

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/distributeaid/needs-assessment-v2.git
cd needs-assessment-v2
```

### 2. Install Frontend Dependencies (Next.js)

```bash
yarn install
```

### 3. Install Backend Dependencies (Flask + Poetry)

Make sure you have [Poetry installed](https://python-poetry.org/docs/#installation):

```bash
cd backend
poetry install
```

### 4. Set Up Environment Variables

Create your local `.env` file:

```bash
cp .env.example .env
```

### 5. Run the App

#### ⏩ Start the frontend

```bash
yarn dev
```

Visit [http://localhost:3000](http://localhost:3000)

#### 🐍 Start the backend

```bash
yarn dev:backend
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
   - Get initial Assessment questions from Strapi (waiting on strapi deploy)

1. **Enhance Form Components:**

   - Add validation and user-friendly error messages for required fields.

2. **UI/UX Enhancements:**

   - Add animations/transitions using for smoother interactions.
   - Implement responsive design.

3. **Assessment Summary Page:**

   - Add estimated total quanties of items needed based on user input.

4. **Loading and Error States:**
   - Improve error handling with user-friendly messages and retry options.

#### **Backend Enhancements (Prisma/Postgres):**

1. **Add Role-Based Access Control (RBAC):**

   - Implement roles (Admin, Contributor, Viewer) with different permissions for Assessments and responses.

2. **Optimize Database Queries:**

   - Review and optimize queries to reduce response times.

3. **Audit Logging:**
   - Track changes to Assessments and responses in an audit log for accountability.

#### **Testing & QA:**

1. **Add Unit and Integration Tests:**

   - Write tests for additional API routes.
   - Add tests for form validation and submission.
   - Add tests for React components.

#### **Feature Requests:**

1. **Data Visualization Dashboard:**

   - Build a dashboard to visualize Assessment responses using **Chart.js** or **Recharts**.

2. **Import/Export Assessments:**
   - Add functionality to import/export Assessments and responses as CSV or JSON.

---

## Troubleshooting

- **Port Conflicts:**
  - Make sure ports `3000` (Next.js) and `5000` (Flask) are not in use by other applications.

---

## License

This project is licensed under the MIT License.
