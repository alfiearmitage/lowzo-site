const steps = [
  {
    number: "01",
    icon: "⌕",
    title: "Search",
    text: "Enter what you're looking for once.",
  },
  {
    number: "02",
    icon: "◇",
    title: "Track",
    text: "We monitor prices 24/7 across every platform.",
  },
  {
    number: "03",
    icon: "♢",
    title: "Set Alerts",
    text: "Get notified the moment a match is found.",
  },
  {
    number: "04",
    icon: "▢",
    title: "Buy Faster",
    text: "Click through to buy before anyone else.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="how-section">
      <div className="container">
        <div className="section-heading left">
          <p>Where It Works</p>
          <h2>
            From Search
            <br />
            To Score.
          </h2>
        </div>

        <div className="steps-grid">
          {steps.map((step) => (
            <div className="step-card" key={step.number}>
              <div className="step-icon">{step.icon}</div>
              <span>{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}