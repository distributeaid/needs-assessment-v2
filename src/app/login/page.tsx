"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import ActionButton from "@/components/ui/ActionButton";

export default function LoginPage() {
  const [step, setStep] = useState<"email" | "password" | "create">("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Step 1: check if user exists
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/flask-api/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const { exists } = await res.json();
      setStep(exists ? "password" : "create");
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  // Step 2A: actual sign-in
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });
    if (res?.ok) {
      router.push("/");
    } else {
      setError("Invalid credentials");
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-160">
        {/* === STEP 1: EMAIL INPUT === */}
        {step === "email" && (
          <form onSubmit={handleEmailSubmit}>
            <h2 className="text-xl font-bold mb-4 text-center">Welcome</h2>
            <p className="text-sm mb-4">Please enter your email to continue.</p>
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              required
              className="w-full px-3 py-2 border rounded-lg mb-4"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            {error && <p className="text-red-500 mb-2">{error}</p>}
            <ActionButton
              type="submit"
              label="Next"
              variant="primary"
              disabled={loading}
            />
          </form>
        )}

        {/* === STEP 2A: PASSWORD FOR EXISTING USER === */}
        {step === "password" && (
          <form onSubmit={handleLogin}>
            <h2 className="text-xl font-bold mb-4 text-center">Sign In</h2>
            <p className="text-sm mb-4">
              Email: <strong>{email}</strong>
            </p>

            <label className="block text-gray-700">Password</label>
            <input
              type="password"
              required
              className="w-full px-3 py-2 border rounded-lg mb-4"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {error && <p className="text-red-500 mb-2">{error}</p>}
            <div className="flex gap-2">
              <ActionButton
                type="submit"
                label="Login"
                variant="primary"
                disabled={loading}
              />

              <ActionButton
                type="button"
                label="Use different email"
                variant="secondary"
                onClick={() => {
                  setStep("email");
                  setPassword("");
                  setError(null);
                }}
              />
            </div>
          </form>
        )}

        {/* === STEP 2B: OFFER ACCOUNT CREATION === */}
        {step === "create" && (
          <div>
            <h2 className="text-xl font-bold mb-4 text-center">
              Create Account?
            </h2>
            <p className="text-sm mb-4">
              No account found for <strong>{email}</strong>.
            </p>
            <div className="flex gap-2">
              <ActionButton
                type="button"
                label="Create Account"
                variant="primary"
                onClick={() =>
                  router.push(
                    `/create-account?email=${encodeURIComponent(email)}`,
                  )
                }
              />

              <ActionButton
                type="button"
                label="Use different email"
                variant="secondary"
                onClick={() => {
                  setStep("email");
                  setPassword("");
                  setError(null);
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
