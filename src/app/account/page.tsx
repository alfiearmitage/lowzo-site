import Link from "next/link";
import { cookies } from "next/headers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthStateSync from "@/components/AuthStateSync";

export const dynamic = "force-dynamic";

const ACCESS_COOKIE = "lowzo_access_token";
const USER_ID_COOKIE = "lowzo_user_id";
const USER_EMAIL_COOKIE = "lowzo_user_email";

export default async function AccountPage() {
  const cookieStore = await cookies();

  const accessToken = cookieStore.get(ACCESS_COOKIE)?.value || "";
  const userId = cookieStore.get(USER_ID_COOKIE)?.value || "";
  const userEmail = cookieStore.get(USER_EMAIL_COOKIE)?.value || "";

  const isLoggedIn = Boolean(accessToken && userId);

  return (
    <main>
      <AuthStateSync loggedIn={isLoggedIn} />

      <Navbar initialLoggedIn={isLoggedIn} />

      <section className="account-page">
        <div className="account-card">
          <p className="account-eyebrow">Lowzo Account</p>

          <h1>Your account</h1>

          {!isLoggedIn ? (
            <div className="account-state">
              <h2>You are not logged in.</h2>

              <p>
                Log in or create an account to use search, saved items and
                alerts.
              </p>

              <div className="account-actions">
                <Link href="/login">Log In</Link>
                <Link href="/signup" className="secondary">
                  Create Account
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="account-details">
                <div>
                  <span>Email</span>
                  <strong>{userEmail || "Logged in user"}</strong>
                </div>

                <div>
                  <span>User ID</span>
                  <strong>{userId}</strong>
                </div>

                <div>
                  <span>Status</span>
                  <strong>Logged in</strong>
                </div>
              </div>

              <div className="account-coming-soon">
                <h2>Coming next</h2>

                <div className="coming-grid">
                  <div>
                    <strong>Saved Items</strong>
                    <span>Move saved items from browser to your account.</span>
                  </div>

                  <div>
                    <strong>Saved Searches</strong>
                    <span>Save searches like Nike Tech under £60.</span>
                  </div>

                  <div>
                    <strong>Alerts</strong>
                    <span>Get notified when matching deals appear.</span>
                  </div>
                </div>
              </div>

              <form action="/api/auth/logout" method="POST">
                <button type="submit" className="logout-button">
                  Log Out
                </button>
              </form>
            </>
          )}
        </div>
      </section>

      <Footer />

      <style>{`
        .account-page {
          min-height: calc(100vh - 86px);
          display: grid;
          place-items: center;
          padding: 70px 20px;
          background:
            radial-gradient(circle at 20% 10%, rgba(237, 28, 46, 0.08), transparent 28%),
            radial-gradient(circle at 85% 30%, rgba(237, 28, 46, 0.06), transparent 26%),
            #ffffff;
        }

        .account-card {
          width: min(850px, 100%);
          background: #ffffff;
          border: 1px solid #eeeeee;
          border-radius: 28px;
          padding: 34px;
          box-shadow: 0 18px 60px rgba(16, 24, 40, 0.08);
        }

        .account-eyebrow {
          color: #ed1c2e;
          text-transform: uppercase;
          letter-spacing: 2px;
          font-size: 12px;
          font-weight: 900;
          margin-bottom: 12px;
        }

        .account-card h1 {
          font-family: "Arial Rounded MT Bold", Arial, Helvetica, sans-serif;
          font-size: 48px;
          line-height: 1;
          color: #111111;
          margin-bottom: 26px;
        }

        .account-state {
          background: #f8fafc;
          border: 1px solid #e4e7ec;
          border-radius: 20px;
          padding: 24px;
        }

        .account-state h2 {
          color: #111111;
          font-size: 24px;
          margin-bottom: 8px;
        }

        .account-state p {
          color: #667085;
          font-size: 16px;
          font-weight: 700;
          line-height: 1.5;
        }

        .account-actions {
          margin-top: 22px;
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .account-actions a {
          height: 52px;
          border-radius: 16px;
          background: #ed1c2e;
          color: #ffffff;
          display: grid;
          place-items: center;
          padding: 0 22px;
          font-size: 15px;
          font-weight: 900;
          text-decoration: none;
        }

        .account-actions a.secondary {
          background: #ffffff;
          color: #ed1c2e;
          border: 1px solid #f0b8bf;
        }

        .account-details {
          display: grid;
          gap: 14px;
          margin-bottom: 22px;
        }

        .account-details div {
          display: grid;
          gap: 5px;
          padding: 16px;
          background: #f8fafc;
          border: 1px solid #e4e7ec;
          border-radius: 18px;
        }

        .account-details span {
          color: #667085;
          font-size: 13px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .account-details strong {
          color: #111111;
          font-size: 15px;
          font-weight: 900;
          word-break: break-word;
        }

        .account-coming-soon {
          margin-top: 22px;
        }

        .account-coming-soon h2 {
          color: #111111;
          font-size: 26px;
          margin-bottom: 14px;
        }

        .coming-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
        }

        .coming-grid div {
          background: #fff0f2;
          border: 1px solid #f3b5bd;
          border-radius: 18px;
          padding: 16px;
          display: grid;
          gap: 8px;
        }

        .coming-grid strong {
          color: #111111;
          font-size: 16px;
          font-weight: 900;
        }

        .coming-grid span {
          color: #667085;
          font-size: 14px;
          line-height: 1.4;
          font-weight: 700;
        }

        .logout-button {
          margin-top: 24px;
          height: 52px;
          border: 0;
          border-radius: 16px;
          background: #ed1c2e;
          color: #ffffff;
          padding: 0 22px;
          font-size: 15px;
          font-weight: 900;
          cursor: pointer;
          box-shadow: 0 12px 28px rgba(237, 28, 46, 0.2);
        }

        @media (max-width: 760px) {
          .account-page {
            padding: 36px 14px;
          }

          .account-card {
            padding: 24px;
            border-radius: 22px;
          }

          .account-card h1 {
            font-size: 38px;
          }

          .coming-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
}