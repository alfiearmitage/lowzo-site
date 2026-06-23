type BetaLoginPageProps = {
  searchParams?: Promise<{
    next?: string;
    error?: string;
  }>;
};

export default async function BetaLoginPage({
  searchParams,
}: BetaLoginPageProps) {
  const params = searchParams ? await searchParams : {};
  const nextPath = params.next || "/";
  const error = params.error || "";

  return (
    <main className="beta-page">
      <section className="beta-card">
        <img src="/lowzo-logo.png" alt="Lowzo" className="beta-logo" />

        <p className="beta-eyebrow">Private Beta</p>

        <h1>Lowzo is currently private.</h1>

        <p className="beta-copy">
          Enter the beta password to access the website while it is being built.
        </p>

        {error && <div className="beta-error">{error}</div>}

        <form action="/api/beta-login" method="POST" className="beta-form">
          <input type="hidden" name="next" value={nextPath} />

          <label htmlFor="password">Beta password</label>

          <input
            id="password"
            name="password"
            type="password"
            placeholder="Enter password"
            autoComplete="current-password"
            required
          />

          <button type="submit">Enter Lowzo</button>
        </form>

        <p className="beta-small">
          This is separate from your Lowzo account login.
        </p>
      </section>

      <style>{`
        .beta-page {
          min-height: 100vh;
          display: grid;
          place-items: center;
          padding: 24px;
          background:
            radial-gradient(circle at 18% 12%, rgba(237, 28, 46, 0.12), transparent 30%),
            radial-gradient(circle at 88% 24%, rgba(237, 28, 46, 0.08), transparent 28%),
            #ffffff;
        }

        .beta-card {
          width: min(520px, 100%);
          background: #ffffff;
          border: 1px solid #eeeeee;
          border-radius: 30px;
          padding: 34px;
          box-shadow: 0 24px 80px rgba(16, 24, 40, 0.12);
          text-align: center;
        }

        .beta-logo {
          width: 132px;
          height: auto;
          margin: 0 auto 22px;
          display: block;
        }

        .beta-eyebrow {
          color: #ed1c2e;
          text-transform: uppercase;
          letter-spacing: 2px;
          font-size: 12px;
          font-weight: 900;
          margin-bottom: 12px;
        }

        .beta-card h1 {
          color: #111111;
          font-size: 42px;
          line-height: 1;
          letter-spacing: -1.5px;
          margin-bottom: 14px;
          font-family: "Arial Rounded MT Bold", Arial, Helvetica, sans-serif;
        }

        .beta-copy {
          color: #667085;
          font-size: 16px;
          line-height: 1.5;
          font-weight: 700;
          margin-bottom: 24px;
        }

        .beta-error {
          background: #fff0f2;
          color: #ed1c2e;
          border: 1px solid #f3b5bd;
          border-radius: 16px;
          padding: 12px;
          font-size: 14px;
          font-weight: 900;
          margin-bottom: 18px;
        }

        .beta-form {
          display: grid;
          gap: 12px;
          text-align: left;
        }

        .beta-form label {
          color: #111111;
          font-size: 14px;
          font-weight: 900;
        }

        .beta-form input {
          height: 56px;
          border-radius: 18px;
          border: 1px solid #e4e7ec;
          padding: 0 16px;
          font-size: 16px;
          font-weight: 800;
          outline: none;
        }

        .beta-form input:focus {
          border-color: #ed1c2e;
          box-shadow: 0 0 0 4px rgba(237, 28, 46, 0.08);
        }

        .beta-form button {
          height: 56px;
          border: 0;
          border-radius: 18px;
          background: #ed1c2e;
          color: #ffffff;
          font-size: 16px;
          font-weight: 900;
          cursor: pointer;
          box-shadow: 0 14px 30px rgba(237, 28, 46, 0.24);
        }

        .beta-small {
          color: #98a2b3;
          font-size: 13px;
          font-weight: 800;
          margin-top: 18px;
        }

        @media (max-width: 640px) {
          .beta-card {
            padding: 26px;
            border-radius: 24px;
          }

          .beta-card h1 {
            font-size: 34px;
          }
        }
      `}</style>
    </main>
  );
}