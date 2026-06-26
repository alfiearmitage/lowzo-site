import Link from "next/link";
import { cookies } from "next/headers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthStateSync from "@/components/AuthStateSync";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

const ACCESS_COOKIE = "lowzo_access_token";
const USER_ID_COOKIE = "lowzo_user_id";
const USER_EMAIL_COOKIE = "lowzo_user_email";

type SavedItem = {
  id: string;
  marketplace: string;
  marketplace_item_id: string;
  title: string;
  price: string | null;
  shipping: string | null;
  total_price: string | null;
  image_url: string | null;
  item_url: string;
  condition: string | null;
  location: string | null;
  created_at: string;
};

function formatSavedDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recently saved";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

async function getSavedItems(userId: string, accessToken: string) {
  const supabase = getSupabaseAdmin();

  if (!supabase || !userId || !accessToken) {
    return {
      savedItems: [] as SavedItem[],
      error: supabase ? "" : "Supabase service role key is missing.",
    };
  }

  const { data: userData, error: userError } = await supabase.auth.getUser(
    accessToken
  );

  if (userError || !userData.user || userData.user.id !== userId) {
    return {
      savedItems: [] as SavedItem[],
      error: "Your login has expired. Please log in again.",
    };
  }

  const { data, error } = await supabase
    .from("saved_items")
    .select(
      "id, marketplace, marketplace_item_id, title, price, shipping, total_price, image_url, item_url, condition, location, created_at"
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    return {
      savedItems: [] as SavedItem[],
      error: error.message,
    };
  }

  return {
    savedItems: (data || []) as SavedItem[],
    error: "",
  };
}

export default async function AccountPage() {
  const cookieStore = await cookies();

  const accessToken = cookieStore.get(ACCESS_COOKIE)?.value || "";
  const userId = cookieStore.get(USER_ID_COOKIE)?.value || "";
  const userEmail = cookieStore.get(USER_EMAIL_COOKIE)?.value || "";

  const isLoggedIn = Boolean(accessToken && userId);

  const { savedItems, error } = isLoggedIn
    ? await getSavedItems(userId, accessToken)
    : { savedItems: [] as SavedItem[], error: "" };

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
                  <span>Status</span>
                  <strong>Logged in</strong>
                </div>

                <div>
                  <span>Saved Items</span>
                  <strong>{savedItems.length}</strong>
                </div>
              </div>

              <section className="saved-items-section">
                <div className="saved-items-heading">
                  <div>
                    <p>Saved Deals</p>
                    <h2>Your saved items</h2>
                  </div>

                  <Link href="/search">Find more deals</Link>
                </div>

                {error && <div className="account-error">{error}</div>}

                {!error && savedItems.length === 0 ? (
                  <div className="empty-saved-items">
                    <h3>No saved items yet.</h3>
                    <p>
                      Search for something, press Save on a deal, and it will
                      appear here.
                    </p>

                    <Link href="/search">Start searching</Link>
                  </div>
                ) : (
                  <div className="saved-items-grid">
                    {savedItems.map((item) => (
                      <article className="saved-item-card" key={item.id}>
                        <div className="saved-item-image">
                          {item.image_url ? (
                            <img src={item.image_url} alt={item.title} />
                          ) : (
                            <span>🛍️</span>
                          )}
                        </div>

                        <div className="saved-item-content">
                          <div className="saved-item-topline">
                            <span>{item.marketplace || "eBay"}</span>
                            <span>{formatSavedDate(item.created_at)}</span>
                          </div>

                          <h3>{item.title}</h3>

                          <div className="saved-item-meta">
                            {item.condition && (
                              <span>Condition: {item.condition}</span>
                            )}
                            <span>Saved to your account</span>
                          </div>

                          <div className="saved-price-box">
                            <div>
                              <span>Price</span>
                              <strong>{item.price || "View deal"}</strong>
                            </div>

                            <div>
                              <span>Total</span>
                              <strong>
                                {item.total_price || item.price || "View deal"}
                              </strong>
                            </div>
                          </div>

                          <a
                            href={item.item_url}
                            target="_blank"
                            rel="noreferrer"
                            className="saved-view-button"
                          >
                            View Deal →
                          </a>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>

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
          width: min(1050px, 100%);
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
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
          margin-bottom: 26px;
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

        .saved-items-section {
          margin-top: 22px;
          border-top: 1px solid #eeeeee;
          padding-top: 24px;
        }

        .saved-items-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 18px;
        }

        .saved-items-heading p {
          color: #ed1c2e;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          font-size: 12px;
          font-weight: 900;
          margin-bottom: 6px;
        }

        .saved-items-heading h2 {
          color: #111111;
          font-size: 30px;
          line-height: 1;
        }

        .saved-items-heading a {
          height: 46px;
          border-radius: 999px;
          background: #ed1c2e;
          color: #ffffff;
          display: grid;
          place-items: center;
          padding: 0 18px;
          text-decoration: none;
          font-size: 14px;
          font-weight: 900;
          white-space: nowrap;
        }

        .account-error {
          background: #fff0f2;
          border: 1px solid #f3b5bd;
          color: #ed1c2e;
          border-radius: 18px;
          padding: 16px;
          font-size: 14px;
          font-weight: 900;
          margin-bottom: 16px;
        }

        .empty-saved-items {
          background: #f8fafc;
          border: 1px solid #e4e7ec;
          border-radius: 22px;
          padding: 24px;
        }

        .empty-saved-items h3 {
          color: #111111;
          font-size: 22px;
          margin-bottom: 8px;
        }

        .empty-saved-items p {
          color: #667085;
          font-size: 15px;
          font-weight: 700;
          line-height: 1.5;
          margin-bottom: 18px;
        }

        .empty-saved-items a {
          height: 48px;
          width: fit-content;
          border-radius: 999px;
          background: #ed1c2e;
          color: #ffffff;
          display: grid;
          place-items: center;
          padding: 0 18px;
          text-decoration: none;
          font-size: 14px;
          font-weight: 900;
        }

        .saved-items-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .saved-item-card {
          display: grid;
          grid-template-columns: 150px 1fr;
          gap: 16px;
          background: #ffffff;
          border: 1px solid #eeeeee;
          border-radius: 24px;
          padding: 14px;
          box-shadow: 0 12px 34px rgba(16, 24, 40, 0.06);
        }

        .saved-item-image {
          min-height: 150px;
          border-radius: 20px;
          background: #f8fafc;
          display: grid;
          place-items: center;
          overflow: hidden;
        }

        .saved-item-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .saved-item-image span {
          font-size: 42px;
        }

        .saved-item-content {
          display: grid;
          align-content: start;
          gap: 10px;
        }

        .saved-item-topline {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .saved-item-topline span {
          color: #667085;
          font-size: 12px;
          font-weight: 900;
        }

        .saved-item-topline span:first-child {
          color: #ed1c2e;
        }

        .saved-item-content h3 {
          color: #111111;
          font-size: 16px;
          line-height: 1.25;
          font-weight: 900;
        }

        .saved-item-meta {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .saved-item-meta span {
          background: #f8fafc;
          border: 1px solid #e4e7ec;
          border-radius: 999px;
          color: #667085;
          font-size: 11px;
          font-weight: 900;
          padding: 6px 9px;
        }

        .saved-price-box {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
        }

        .saved-price-box div {
          background: #fff0f2;
          border: 1px solid #f3b5bd;
          border-radius: 14px;
          padding: 10px;
          display: grid;
          gap: 4px;
        }

        .saved-price-box span {
          color: #667085;
          font-size: 11px;
          font-weight: 900;
          text-transform: uppercase;
        }

        .saved-price-box strong {
          color: #111111;
          font-size: 14px;
          font-weight: 900;
        }

        .saved-view-button {
          height: 44px;
          border-radius: 14px;
          background: #ed1c2e;
          color: #ffffff;
          display: grid;
          place-items: center;
          text-decoration: none;
          font-size: 14px;
          font-weight: 900;
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

        @media (max-width: 900px) {
          .account-details {
            grid-template-columns: 1fr;
          }

          .saved-items-grid {
            grid-template-columns: 1fr;
          }
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

          .saved-items-heading {
            align-items: flex-start;
            flex-direction: column;
          }

          .saved-item-card {
            grid-template-columns: 1fr;
          }

          .saved-item-image {
            min-height: 220px;
          }
        }
      `}</style>
    </main>
  );
}