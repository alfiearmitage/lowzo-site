import Link from "next/link";

export default function Footer() {
  return (
    <>
      <section id="waitlist" className="waitlist-section">
        <div className="container waitlist-inner">
          <h2>Be The First To Know.</h2>
          <p>
            Be part of the smartest deal-finding community. Join thousands
            waiting for early access.
          </p>

          <form className="waitlist-form" action="/waitlist">
            <input type="email" placeholder="Enter your email" />
            <button type="submit">Join Waitlist</button>
          </form>
        </div>
      </section>

      <footer className="footer">
        <div className="container footer-grid">
          <div className="footer-brand">
            <Link href="/">
              <img src="/lowzo-logo.png" alt="Lowzo logo" />
            </Link>

            <p>
              Find more. Pay less. The smartest way to search across all
              marketplaces.
            </p>

            <div className="socials">
              <a href="#">◎</a>
              <a href="#">𝕏</a>
              <a href="#">f</a>
            </div>
          </div>

          <div>
            <h3>Company</h3>
            <Link href="/about">About</Link>
            <Link href="/roadmap">Roadmap</Link>
            <Link href="/pricing">Pricing</Link>
            <Link href="/waitlist">Join Waitlist</Link>
          </div>

          <div>
            <h3>Product</h3>
            <Link href="/search">Search</Link>
            <Link href="/alerts">Alerts</Link>
            <Link href="/how-it-works">How It Works</Link>
            <Link href="/pricing">Pricing</Link>
          </div>

          <div>
            <h3>Contact</h3>
            <a href="mailto:hello@lowzo.com">Support</a>
            <a href="mailto:hello@lowzo.com">hello@lowzo.com</a>
            <a href="#">Discord Community</a>
          </div>
        </div>

        <div className="container footer-bottom">
          <p>© 2026 Lowzo. All rights reserved.</p>
          <p>Made with ❤️ for deal hunters everywhere</p>
        </div>
      </footer>
    </>
  );
}