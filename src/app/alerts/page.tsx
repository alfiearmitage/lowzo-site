import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const alerts = [
  {
    title: "Nike Tech Fleece",
    budget: "Under £50",
    platforms: "Vinted, eBay, Depop",
    status: "Active",
  },
  {
    title: "Air Force 1",
    budget: "Under £70",
    platforms: "eBay, Facebook",
    status: "Active",
  },
  {
    title: "Vintage Jackets",
    budget: "Under £40",
    platforms: "Depop, Vinted",
    status: "Paused",
  },
];

export default function AlertsPage() {
  return (
    <main>
      <Navbar />

      <section className="page-hero">
        <div className="container page-hero-inner">
          <p className="red-label">Alerts</p>
          <h1>Never Miss A Deal Again.</h1>
          <p>
            Create alerts for items you want and get notified when Lowzo finds a
            match.
          </p>
        </div>
      </section>

      <section className="page-section">
        <div className="container">
          <div className="page-title-row">
            <h2>Your Saved Alerts</h2>
            <button className="small-red-button">Create Alert</button>
          </div>

          <div className="alert-list">
            {alerts.map((alert) => (
              <div className="alert-card" key={alert.title}>
                <div>
                  <h3>{alert.title}</h3>
                  <p>{alert.budget}</p>
                  <span>{alert.platforms}</span>
                </div>

                <strong
                  className={
                    alert.status === "Active"
                      ? "status-active"
                      : "status-paused"
                  }
                >
                  {alert.status}
                </strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}