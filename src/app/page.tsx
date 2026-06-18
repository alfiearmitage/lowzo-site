export default function Home() {
return ( <main className="min-h-screen bg-[#0B1020] text-white"> <nav className="flex justify-between items-center px-8 py-6 border-b border-white/10"> <h1 className="text-3xl font-bold text-purple-500">LOWZO</h1>

```
    <div className="hidden md:flex gap-8">
      <a href="#">Features</a>
      <a href="#">Pricing</a>
      <a href="#">About</a>
    </div>

    <button className="bg-purple-600 px-5 py-2 rounded-xl hover:bg-purple-700">
      Join Waitlist
    </button>
  </nav>

  <section className="max-w-6xl mx-auto text-center py-32 px-6">
    <h1 className="text-6xl md:text-8xl font-bold mb-8">
      Search Once.
      <br />
      Save Everywhere.
    </h1>

    <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-10">
      Compare prices from retailers, marketplaces and local sellers.
      Find the cheapest deal instantly.
    </p>

    <div className="max-w-3xl mx-auto flex gap-3">
      <input
        className="flex-1 p-4 rounded-xl bg-white text-black"
        placeholder="Search for iPhone 15 Pro..."
      />
      <button className="bg-purple-600 px-8 rounded-xl">
        Search
      </button>
    </div>
  </section>

  <section className="max-w-6xl mx-auto px-6 py-24">
   <div className="text-center mb-16">
  <p className="text-gray-400 mb-6">
    Searching across the places you already shop
  </p>

  <div className="flex justify-center gap-8 text-gray-300 flex-wrap">
    <span>Amazon</span>
    <span>eBay</span>
    <span>CEX</span>
    <span>Currys</span>
    <span>Facebook Marketplace</span>
  </div>
</div> 
    <h2 className="text-4xl font-bold text-center mb-16">
      Everything you need
    </h2>

    <div className="grid md:grid-cols-4 gap-6">
      <div className="bg-white/5 p-6 rounded-2xl">
        <h3 className="font-bold mb-3">🔍 Search Everywhere</h3>
        <p className="text-gray-300">
          Compare prices across retailers and marketplaces.
        </p>
      </div>

      <div className="bg-white/5 p-6 rounded-2xl">
        <h3 className="font-bold mb-3">🔔 Price Alerts</h3>
        <p className="text-gray-300">
          Get notified when prices hit your target.
        </p>
      </div>

      <div className="bg-white/5 p-6 rounded-2xl">
        <h3 className="font-bold mb-3">📍 Local Deals</h3>
        <p className="text-gray-300">
          Discover bargains near you.
        </p>
      </div>

      <div className="bg-white/5 p-6 rounded-2xl">
        <h3 className="font-bold mb-3">📈 Price History</h3>
        <p className="text-gray-300">
          Buy at the perfect time.
        </p>
      </div>
    </div>
  </section>

  <section className="text-center py-24">
    <h2 className="text-5xl font-bold mb-4">
      Premium
    </h2>

    <p className="text-6xl font-bold text-purple-500 mb-2">
      £4.99
    </p>

    <p className="text-gray-400 mb-8">
      per month
    </p>

    <button className="bg-purple-600 px-8 py-4 rounded-xl">
      Start Free Trial
    </button>
  </section>
</main>


);
}
