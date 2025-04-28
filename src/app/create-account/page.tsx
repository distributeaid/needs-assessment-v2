"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import ActionButton from "@/components/ui/ActionButton";
import ErrorAlert from "@/components/ui/ErrorAlert";
import { colors } from "@/styles/colors";

export default function CreateAccountPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialEmail = searchParams.get("email") || "";
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [orgName, setOrgName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialEmail && !orgName) {
      const namePart = initialEmail.split("@")[0];
      const formatted = namePart
        .replace(/[.\-_]/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
      setOrgName(formatted);
    }
  }, [initialEmail, orgName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password || !orgName) {
      setError("Please fill out all fields.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`/flask-api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgName, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // After successful registration, automatically sign them in
        const signInResult = await signIn("credentials", {
          redirect: false,
          email,
          password,
        });

        if (signInResult?.ok) {
          router.push("/");
        } else {
          setError(
            "Account created, but failed to log in. Please log in manually.",
          );
          router.push("/login"); // Fallback
        }
      } else {
        setError(data.error || "Registration failed. Please try again.");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex justify-center items-center h-screen"
      style={{ backgroundColor: colors.secondary.base }}
    >
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-96 space-y-6"
      >
        <h2 className="text-2xl font-bold text-center text-blue-900">
          Create Account
        </h2>

        <div>
          <label className="block text-gray-700 mb-1">Organization Name</label>
          <input
            type="text"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="Your Organization"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="you@example.com"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="Create a password"
            required
          />
        </div>

        {error && <ErrorAlert message={error} />}

        <ActionButton
          type="submit"
          label={loading ? "Creating..." : "Create Account"}
          variant="primary"
          disabled={loading}
        />
      </form>
    </div>
  );
}
