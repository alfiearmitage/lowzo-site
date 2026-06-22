import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const plans = [
  {
    name: "Free",
    price: "£0",
    description: "For casual deal hunters.",
    features: ["Basic searches", "Limited alerts", "Marketplace previews"],
  },
  {
    name: "Pro",
    price: "£4.99",
    description: "For serious bargain hunters.",
    features: [
      "Unlimited searches",
      "Instant alerts",
      "Saved searches",
      "Price tracking",
    ],
    featured: true,
  },
  {
    name: "Premium",
    price: "£9.99",
    description: "For resellers and power users.",
    features: [
      "Everything in Pro",
      "Early deal alerts",
      "Advanced filters",
      "Priority features",
    ],
  },
];

export default function PricingPage() {
  return (
    <main>
      <Navbar />

      <section className="page-hero">
        <div className="container page-hero-inner">
          <p className="red-label">Pricing</p>
          <h1>Choose Your Deal-Finding Plan.</h1>
          <p>
            Start for free, then upgrade when you want more alerts, searches and
            power.
          </p>
        </div>
      </section>

      <section className="page-section">
        <div className="container pricing-grid">
          {plans.map((plan) => (
            <div
              className={plan.featured ? "pricing-card featured" : "pricing-card"}
              key={plan.name}
            >
              <h2>{plan.name}</h2>
              <p>{plan.description}</p>

              <div className="price">
                {plan.price}
                <span>/month</span>
              </div>

              <ul>
                {plan.features.map((feature) => (
                  <li key={feature}>✓ {feature}</li>
                ))}
              </ul>

              <button>{plan.featured ? "Join Pro" : "Get Started"}</button>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}