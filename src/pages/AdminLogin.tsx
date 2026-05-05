import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiFetch, ApiError } from "@lib/api";

export function AdminLogin() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await apiFetch<{ ok: boolean }>("/api/admin/login", {
        method: "POST",
        body: JSON.stringify({ password }),
      });
      navigate("/admin", { replace: true });
    } catch (err) {
      const msg =
        err instanceof ApiError && err.status === 401
          ? "Invalid password. Please try again."
          : "Login failed. Check the server and try again.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center bg-[#E4E3E0] p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white border border-[#141414] shadow-[6px_6px_0_0_#141414] rounded-md p-8 flex flex-col gap-5"
      >
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-blue-700 mb-2">
            Admin Access
          </div>
          <h1 className="font-serif font-bold text-3xl text-[#141414]">Sign in to Admin Ops</h1>
          <p className="font-sans text-sm opacity-70 mt-2">
            Enter the admin password configured in the server environment.
          </p>
        </div>
        <label className="flex flex-col gap-2">
          <span className="text-[11px] font-mono uppercase tracking-widest font-bold">Password</span>
          <input
            type="password"
            value={password}
            autoFocus
            autoComplete="current-password"
            onChange={(e) => setPassword(e.target.value)}
            className="border border-[#141414] bg-white py-2.5 px-3 rounded-sm text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-[2px_2px_0_0_#141414]"
            required
          />
        </label>
        {error && (
          <div role="alert" className="text-sm text-red-700 bg-red-50 border border-red-300 rounded-sm px-3 py-2">
            {error}
          </div>
        )}
        <button
          type="submit"
          disabled={submitting || !password}
          className="bg-[#141414] text-white font-mono uppercase tracking-widest font-bold py-3 rounded-sm border border-[#141414] shadow-[2px_2px_0_0_rgba(0,0,0,0.5)] active:translate-y-0.5 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed text-xs"
        >
          {submitting ? "Signing in..." : "Sign In"}
        </button>
        <Link
          to="/"
          className="text-center text-[11px] font-mono uppercase tracking-widest opacity-60 hover:opacity-100"
        >
          ← Return to radar
        </Link>
      </form>
    </div>
  );
}
