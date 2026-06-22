"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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

export default function LoginPage() {
  const [nextPath, setNextPath] = useState("/account");
  const [errorMessage, setErrorMessage] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    setNextPath(getSafeNextPath(params.get("next")));
    setErrorMessage(params.get("error") || "");
    setMessage(params.get("message") || "");
  }, []);

  return (
    <main>
      <Navbar />

      <section className="auth-page">
        <div className="auth-card">
          <p className="auth-eyebrow">Welcome Back</p>

          <h1>Log in</h1>

          <p className="auth-subtitle">
            Access your saved items, saved searches and alerts.
          </p>

          <form action="/api/auth/login" method="POST" className="auth-form">
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
                placeholder="Your password"
                autoComplete="current-password"
                required
              />
            </label>

            {errorMessage && <div className="auth-error">{errorMessage}</div>}
            {message && <div className="auth-success">{message}</div>}

            <button type="submit">Log In</button>
          </form>

          <p className="auth-switch">
            No account yet?{" "}
            <Link href={`/signup?next=${encodeURIComponent(nextPath)}`}>
              Create one
            </Link>
          </p>

          <p className="auth-note">
            This login uses a server form, so it works properly on phone and
            desktop.
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

        .auth-success {
          background: #eafff0;
          border: 1px solid #98e7b2;
          color: #12833d;
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