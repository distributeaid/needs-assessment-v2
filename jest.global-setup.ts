import { execSync } from "child_process";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function globalSetup() {
  console.log("📦 Setting up the test database...");

  // Ensure the test database exists
  try {
    execSync(
      `psql "postgresql://postgres:password@localhost:5432/postgres" -c "CREATE DATABASE test_db WITH OWNER postgres;"`,
      { stdio: "ignore" }
    );
  } catch {
    console.log("⚠️ Test database already exists.");
  }

  // Apply migrations & reset
  execSync("NODE_ENV=test npx prisma migrate reset --force", { stdio: "inherit" });

  console.log("✅ Test database is ready.");
}

export default globalSetup;
