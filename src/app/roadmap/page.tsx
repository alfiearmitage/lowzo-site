import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const roadmap = [
  {
    stage: "Now",
    title: "Landing Page",
    text: "Build the Lowzo brand, homepage and waitlist.",
  },
  {
    stage: "Next",
    title: "Search Prototype",
    text: "Create the first working search experience for marketplace deals.",
  },
  {
    stage: "Soon",
    title: "Alerts System",
    text: "Allow users to save searches and receive deal notifications.",
  },
  {
    stage: "Future",
    title: "Mobile App",
    text: "Launch Lowzo on mobile with push notifications and saved searches.",
  },
];

export default function RoadmapPage() {
  return (
    <main>
      <Navbar />

      <section className="page-hero">
        <div className="container page-hero-inner">
          <p className="red-label">Roadmap</p>
          <h1>What We Are Building Next.</h1>
          <p>
            Lowzo will grow step by step from a search tool into a full
            deal-finding platform.
          </p>
        </div>
      </section>

      <section className="page-section">
        <div className="container roadmap-list">
          {roadmap.map((item) => (
            <div className="roadmap-card" key={item.title}>
              <span>{item.stage}</span>
              <h2>{item.title}</h2>
              <p>{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}