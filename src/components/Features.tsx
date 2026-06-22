const features = [
  {
    icon: "♢",
    title: "Real-Time Alerts",
    text: "Never miss a deal again. Get notified the moment your saved search finds a match.",
  },
  {
    icon: "⌕",
    title: "Multi-Marketplace Search",
    text: "Search across thousands of listings at once with a single, powerful search.",
  },
  {
    icon: "▱",
    title: "Saved Searches",
    text: "Save your most-used searches and Lowzo will automatically update results daily.",
  },
  {
    icon: "⌁",
    title: "Price Intelligence",
    text: "Know what a fair price is with our AI-powered pricing data and trend analysis.",
  },
  {
    icon: "☷",
    title: "Smart Filters",
    text: "Filter by condition, location, price range, and more to find exactly what you want.",
  },
  {
    icon: "ϟ",
    title: "Instant Notifications",
    text: "Get alerts via email, SMS, or app push when deals are found.",
  },
];

export default function Features() {
  return (
    <section id="alerts" className="features-section">
      <div className="container">
        <div className="section-heading center">
          <p>Trending Feature</p>
          <h2>Everything You Need To Find The Best Deals</h2>
        </div>

        <div className="features-grid">
          {features.map((feature) => (
            <div className="feature-card" key={feature.title}>
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}