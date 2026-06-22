import Navbar from "@/components/Navbar";
import HowItWorks from "@/components/HowItWorks";
import Footer from "@/components/Footer";

export default function HowItWorksPage() {
  return (
    <main>
      <Navbar />

      <section className="page-hero">
        <div className="container page-hero-inner">
          <p className="red-label">How It Works</p>
          <h1>From Search To Score.</h1>
          <p>
            Lowzo makes deal hunting simple: search once, track everywhere, get
            alerts, and buy faster.
          </p>
        </div>
      </section>

      <HowItWorks />

      <Footer />
    </main>
  );
}