"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

function getSafeNextPath(value: string | null) {
  if (!value) {
    return "/account";
  }

  if (!value.startsWith("/") || value.startsWith("//")) {
    return "/account";
  }

  return value;
}

export default function SignupPage() {
  const searchParams = useSearchParams();

  const error = searchParams.get("error");
  const nextPath = getSafeNextPath(searchParams.get("next"));

  return (
    <main>
      <Navbar />

      <section className="auth-page">
        <div className="auth-card">
          <p className="auth-eyebrow">Create Account</p>

          <h1>Join Lowzo</h1>

          <p className="auth-subtitle">
            Create your account so you can save items, save searches and get
            alerts later.
          </p>

          <form action="/api/auth/signup" method="POST" className="auth-form">
            <input type="hidden" name="next" value={nextPath} />

            <label>
              Email
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </label>

            <label>
              Password
              <input
                type="password"
                name="password"
                placeholder="Minimum 8 characters"
                autoComplete="new-password"
                minLength={8}
                required
              />
            </label>

            <label>
              Confirm password
              <input
                type="password"
                name="confirmPassword"
                placeholder="Repeat your password"
                autoComplete="new-password"
                minLength={8}
                required
              />
            </label>

            <label className="auth-check">
              <input type="checkbox" name="humanCheck" required />
              <span>I confirm I am not a bot</span>
            </label>

            {error && <div className="auth-error">{error}</div>}

            <button type="submit">Create Account</button>
          </form>

          <p className="auth-switch">
            Already have an account?{" "}
            <Link href={`/login?next=${encodeURIComponent(nextPath)}`}>
              Log in
            </Link>
          </p>

          <p className="auth-note">
            This first bot check is a basic safety step. Later we’ll replace it
            with proper Cloudflare Turnstile verification.
          </p>
        </div>
      </section>

      <Footer />

      <style>{`
        .auth-page {
          min-height: calc(100vh - 86px);
          display: grid;
          place-items: center;
          padding: 70px 20px;
          background:
            radial-gradient(circle at 20% 10%, rgba(237, 28, 46, 0.08), transparent 28%),
            radial-gradient(circle at 85% 30%, rgba(237, 28, 46, 0.06), transparent 26%),
            #ffffff;
        }

        .auth-card {
          width: min(520px, 100%);
          background: #ffffff;
          border: 1px solid #eeeeee;
          border-radius: 28px;
          padding: 34px;
          box-shadow: 0 18px 60px rgba(16, 24, 40, 0.08);
        }

        .auth-eyebrow {
          color: #ed1c2e;
          text-transform: uppercase;
          letter-spacing: 2px;
          font-size: 12px;
          font-weight: 900;
          margin-bottom: 12px;
        }

        .auth-card h1 {
          font-family: "Arial Rounded MT Bold", Arial, Helvetica, sans-serif;
          font-size: 46px;
          line-height: 1;
          color: #111111;
          margin-bottom: 12px;
        }

        .auth-subtitle {
          color: #667085;
          font-size: 16px;
          line-height: 1.6;
          font-weight: 700;
          margin-bottom: 26px;
        }

        .auth-form {
          display: grid;
          gap: 16px;
        }

        .auth-form label {
          display: grid;
          gap: 8px;
          color: #111111;
          font-size: 14px;
          font-weight: 900;
        }

        .auth-form input {
          height: 52px;
          border: 1px solid #e4e7ec;
          border-radius: 16px;
          padding: 0 16px;
          font-size: 16px;
          font-weight: 700;
          outline: none;
          color: #111111;
          background: #ffffff;
        }

        .auth-form input:focus {
          border-color: #ed1c2e;
          box-shadow: 0 0 0 4px rgba(237, 28, 46, 0.08);
        }

        .auth-check {
          display: flex !important;
          grid-template-columns: none !important;
          align-items: center;
          gap: 10px !important;
          background: #f8fafc;
          border: 1px solid #e4e7ec;
          border-radius: 16px;
          padding: 14px;
        }

        .auth-check input {
          width: 18px;
          height: 18px;
          accent-color: #ed1c2e;
        }

        .auth-check span {
          color: #344054;
          font-size: 14px;
          font-weight: 900;
        }

        .auth-form button {
          height: 56px;
          border: 0;
          border-radius: 18px;
          background: #ed1c2e;
          color: #ffffff;
          font-size: 16px;
          font-weight: 900;
          cursor: pointer;
          box-shadow: 0 12px 28px rgba(237, 28, 46, 0.2);
        }

        .auth-error {
          background: #fff0f2;
          border: 1px solid #f3b5bd;
          color: #c51224;
          border-radius: 16px;
          padding: 13px 15px;
          font-size: 14px;
          font-weight: 800;
          line-height: 1.45;
        }

        .auth-switch {
          margin-top: 22px;
          text-align: center;
          color: #667085;
          font-size: 15px;
          font-weight: 800;
        }

        .auth-switch a {
          color: #ed1c2e;
          font-weight: 900;
        }

        .auth-note {
          margin-top: 16px;
          color: #98a2b3;
          font-size: 12px;
          line-height: 1.5;
          font-weight: 700;
          text-align: center;
        }

        @media (max-width: 760px) {
          .auth-page {
            padding: 36px 14px;
          }

          .auth-card {
            padding: 24px;
            border-radius: 22px;
          }

          .auth-card h1 {
            font-size: 38px;
          }
        }
      `}</style>
    </main>
  );
}