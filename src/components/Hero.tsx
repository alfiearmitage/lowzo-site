import Link from "next/link";

export default function Hero() {
  return (
    <section className="hero">
      <div className="container hero-grid">
        <div className="hero-left">
          <h1>
            Find Deals
            <br />
            Before Everyone Else
          </h1>

          <p>
            Lowzo searches multiple marketplaces 24/7 so you never miss a deal
            again. Get instant alerts and buy smarter.
          </p>

          <div className="hero-buttons">
            <Link href="/search" className="primary-button">
              Start Searching <span>›</span>
            </Link>

            <Link href="/waitlist" className="secondary-button">
              Join Waitlist
            </Link>
          </div>

          <div className="hero-points">
            <span>Real-time alerts</span>
            <span>Multiple Marketplaces</span>
            <span>Save time & money</span>
          </div>
        </div>

        <div className="hero-right">
          <div className="phone-card">
            <div className="phone-top">
              <img src="/lowzo-logo.png" alt="Lowzo logo" />
              <div className="search-circle">⌕</div>
            </div>

            <div className="deal-list">
              <div className="deal-row">
                <div className="deal-icon">👕</div>
                <div>
                  <strong>Nike Tech Fleece</strong>
                  <p>
                    <span>£42</span> <s>£95</s>
                  </p>
                </div>
                <div className="alert-dot">🔔</div>
              </div>

              <div className="deal-row">
                <div className="deal-icon">👟</div>
                <div>
                  <strong>Air Force 1</strong>
                  <p>
                    <span>£65</span> <s>£110</s>
                  </p>
                </div>
                <div className="alert-dot">🔔</div>
              </div>

              <div className="deal-row">
                <div className="deal-icon">🧥</div>
                <div>
                  <strong>Vintage Jacket</strong>
                  <p>
                    <span>£28</span> <s>£75</s>
                  </p>
                </div>
                <div className="alert-dot">🔔</div>
              </div>

              <div className="match-box">
                <div className="match-icon">⚡</div>
                <div>
                  <strong>New Match Found!</strong>
                  <p>Nike Tech Fleece · £42</p>
                </div>
              </div>
            </div>
          </div>

          <div className="deal-alert">
            <div>🔔</div>
            <div>
              <strong>Deal Alert!</strong>
              <p>Save 62% today</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}