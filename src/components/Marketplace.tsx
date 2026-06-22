const marketplaces = [
  { name: "Vinted", className: "vinted" },
  { name: "eBay", className: "ebay" },
  { name: "depop", className: "depop" },
  { name: "facebook", className: "facebook" },
  { name: "+", className: "plus" },
  { name: "+", className: "plus" },
];

export default function Marketplace() {
  return (
    <section id="search" className="marketplace-section">
      <div className="container">
        <div className="section-heading center">
          <p>Where We Search</p>
          <h2>More Places. More Deals.</h2>
        </div>

        <div className="marketplace-grid">
          {marketplaces.map((marketplace, index) => (
            <div
              className={`marketplace-card ${marketplace.className}`}
              key={`${marketplace.name}-${index}`}
            >
              {marketplace.name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}