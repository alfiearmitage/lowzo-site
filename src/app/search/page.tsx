"use client";

import {
  ChangeEvent,
  FormEvent,
  KeyboardEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type LowzoUser = {
  id: string;
  email: string;
};

type LowzoResult = {
  id: string;
  title: string;
  platform: "eBay";
  price: number;
  shipping: number;
  totalPrice: number;
  condition: "New" | "Used" | "Second hand" | "Refurbished";
  image: string;
  url: string;
  score: number;
};

type SavedItemRecord = {
  id: string;
  marketplace: string;
  marketplace_item_id: string;
  title: string;
  price: string | null;
  shipping: string | null;
  total_price: string | null;
  image_url: string | null;
  item_url: string;
  condition: string | null;
  location: string | null;
  created_at: string;
};

type SearchFilters = {
  category: string;
  condition: string;
  buyingType: string;
  sortBy: string;
  minPrice: string;
  maxPrice: string;
};

const defaultFilters: SearchFilters = {
  category: "clothing",
  condition: "any",
  buyingType: "buy-it-now",
  sortBy: "best-match",
  minPrice: "",
  maxPrice: "",
};

const RESULTS_PER_PAGE = 10;
const SAVED_SEARCHES_KEY = "lowzo_saved_searches";

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(price || 0);
}

function getDealBadge(index: number, searchType: "text" | "image" | null) {
  if (searchType === "image" && index === 0) {
    return "📸 Visual Match";
  }

  if (index === 0) {
    return "🔥 Best Match";
  }

  if (index === 1) {
    return "⭐ Great Deal";
  }

  return "👍 Good Price";
}

function buildLoginUrl(nextPath: string) {
  return `/login?next=${encodeURIComponent(nextPath)}`;
}

export default function SearchPage() {
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<LowzoUser | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(defaultFilters.category);
  const [condition, setCondition] = useState(defaultFilters.condition);
  const [buyingType, setBuyingType] = useState(defaultFilters.buyingType);
  const [sortBy, setSortBy] = useState(defaultFilters.sortBy);
  const [minPrice, setMinPrice] = useState(defaultFilters.minPrice);
  const [maxPrice, setMaxPrice] = useState(defaultFilters.maxPrice);

  const [results, setResults] = useState<LowzoResult[]>([]);
  const [savedItemIds, setSavedItemIds] = useState<string[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [lastSearchType, setLastSearchType] = useState<"text" | "image" | null>(
    null
  );

  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const [imageFileName, setImageFileName] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isSavingItem, setIsSavingItem] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const [pendingUrlSearch, setPendingUrlSearch] = useState<{
    query: string;
    filters: SearchFilters;
    nextPath: string;
  } | null>(null);

  const currentFilters: SearchFilters = {
    category,
    condition,
    buyingType,
    sortBy,
    minPrice,
    maxPrice,
  };

  const totalPages = Math.max(1, Math.ceil(results.length / RESULTS_PER_PAGE));

  const paginatedResults = useMemo(() => {
    const startIndex = (currentPage - 1) * RESULTS_PER_PAGE;
    const endIndex = startIndex + RESULTS_PER_PAGE;

    return results.slice(startIndex, endIndex);
  }, [results, currentPage]);

  useEffect(() => {
    let isMounted = true;

    async function checkUser() {
      try {
        const response = await fetch(`/api/auth/me?time=${Date.now()}`, {
          method: "GET",
          cache: "no-store",
          credentials: "include",
        });

        const data = await response.json();

        if (!isMounted) {
          return;
        }

        if (data.loggedIn && data.user) {
          setCurrentUser({
            id: String(data.user.id || ""),
            email: String(data.user.email || ""),
          });
        } else {
          setCurrentUser(null);
          setSavedItemIds([]);
        }
      } catch {
        if (isMounted) {
          setCurrentUser(null);
          setSavedItemIds([]);
        }
      } finally {
        if (isMounted) {
          setIsCheckingAuth(false);
        }
      }
    }

    void checkUser();

    function handlePageShow() {
      void checkUser();
    }

    function handleFocus() {
      void checkUser();
    }

    function handleVisibilityChange() {
      if (!document.hidden) {
        void checkUser();
      }
    }

    window.addEventListener("pageshow", handlePageShow);
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isMounted = false;
      window.removeEventListener("pageshow", handlePageShow);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    let isMounted = true;

    async function loadSavedItems() {
      try {
        const response = await fetch(`/api/saved-items?time=${Date.now()}`, {
          method: "GET",
          cache: "no-store",
          credentials: "include",
        });

        const data = await response.json();

        if (!isMounted) {
          return;
        }

        if (!response.ok) {
          setSavedItemIds([]);
          return;
        }

        const savedItems = Array.isArray(data.savedItems)
          ? (data.savedItems as SavedItemRecord[])
          : [];

        setSavedItemIds(
          savedItems
            .map((item) => String(item.marketplace_item_id || ""))
            .filter(Boolean)
        );
      } catch {
        if (isMounted) {
          setSavedItemIds([]);
        }
      }
    }

    void loadSavedItems();

    return () => {
      isMounted = false;
    };
  }, [currentUser]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const mobileQuery = urlParams.get("mobileQ");

    if (!mobileQuery) {
      return;
    }

    const filtersFromUrl: SearchFilters = {
      category: urlParams.get("category") || defaultFilters.category,
      condition: urlParams.get("condition") || defaultFilters.condition,
      buyingType: urlParams.get("buyingType") || defaultFilters.buyingType,
      sortBy: urlParams.get("sortBy") || defaultFilters.sortBy,
      minPrice: urlParams.get("minPrice") || defaultFilters.minPrice,
      maxPrice: urlParams.get("maxPrice") || defaultFilters.maxPrice,
    };

    setSearch(mobileQuery);
    setCategory(filtersFromUrl.category);
    setCondition(filtersFromUrl.condition);
    setBuyingType(filtersFromUrl.buyingType);
    setSortBy(filtersFromUrl.sortBy);
    setMinPrice(filtersFromUrl.minPrice);
    setMaxPrice(filtersFromUrl.maxPrice);

    setPendingUrlSearch({
      query: mobileQuery,
      filters: filtersFromUrl,
      nextPath: `/search?${urlParams.toString()}`,
    });
  }, []);

  useEffect(() => {
    if (isCheckingAuth || !pendingUrlSearch) {
      return;
    }

    if (!currentUser) {
      router.replace(buildLoginUrl(pendingUrlSearch.nextPath));
      return;
    }

    void runTextSearch(pendingUrlSearch.query, pendingUrlSearch.filters);
    setPendingUrlSearch(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCheckingAuth, currentUser, pendingUrlSearch]);

  useEffect(() => {
    if (!hasSearched || !currentUser) {
      return;
    }

    const autoSearchDelay = window.setTimeout(() => {
      const searchTerm = search.trim();

      if (lastSearchType === "text" && searchTerm) {
        void runTextSearch(searchTerm, currentFilters);
      }
    }, 450);

    return () => {
      window.clearTimeout(autoSearchDelay);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, condition, buyingType, sortBy, minPrice, maxPrice]);

  function requireLogin(nextPath = "/search") {
    if (isCheckingAuth) {
      setErrorMessage("Checking your account. Try again in a second.");
      return false;
    }

    if (!currentUser) {
      router.push(buildLoginUrl(nextPath));
      return false;
    }

    return true;
  }

  function isItemSaved(itemId: string) {
    return savedItemIds.includes(itemId);
  }

  function showTemporaryStatus(message: string) {
    setStatusMessage(message);

    window.setTimeout(() => {
      setStatusMessage("");
    }, 3000);
  }

  async function toggleSavedItem(item: LowzoResult) {
    if (!requireLogin("/search")) {
      return;
    }

    if (isSavingItem) {
      return;
    }

    const alreadySaved = isItemSaved(item.id);
    setIsSavingItem(item.id);
    setErrorMessage("");

    if (alreadySaved) {
      setSavedItemIds((current) =>
        current.filter((savedItemId) => savedItemId !== item.id)
      );

      try {
        const response = await fetch(
          `/api/saved-items?marketplaceItemId=${encodeURIComponent(item.id)}`,
          {
            method: "DELETE",
            cache: "no-store",
            credentials: "include",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Could not remove saved item.");
        }

        showTemporaryStatus("Removed from saved items.");
      } catch (error) {
        setSavedItemIds((current) =>
          current.includes(item.id) ? current : [item.id, ...current]
        );

        const message =
          error instanceof Error
            ? error.message
            : "Could not remove saved item.";

        setErrorMessage(message);
      } finally {
        setIsSavingItem("");
      }

      return;
    }

    setSavedItemIds((current) =>
      current.includes(item.id) ? current : [item.id, ...current]
    );

    try {
      const response = await fetch("/api/saved-items", {
        method: "POST",
        cache: "no-store",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          item,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not save item.");
      }

      showTemporaryStatus("Saved to your account.");
    } catch (error) {
      setSavedItemIds((current) =>
        current.filter((savedItemId) => savedItemId !== item.id)
      );

      const message =
        error instanceof Error ? error.message : "Could not save item.";

      setErrorMessage(message);
    } finally {
      setIsSavingItem("");
    }
  }

  function saveCurrentSearch() {
    if (!requireLogin("/search")) {
      return;
    }

    const searchTerm = search.trim();

    if (!searchTerm) {
      showTemporaryStatus("Search something first.");
      return;
    }

    try {
      const savedSearchesFromStorage = localStorage.getItem(SAVED_SEARCHES_KEY);
      const savedSearches = savedSearchesFromStorage
        ? JSON.parse(savedSearchesFromStorage)
        : [];

      const newSavedSearch = {
        id: crypto.randomUUID(),
        type: "text",
        query: searchTerm,
        filters: currentFilters,
        createdAt: new Date().toISOString(),
      };

      localStorage.setItem(
        SAVED_SEARCHES_KEY,
        JSON.stringify([newSavedSearch, ...savedSearches])
      );

      showTemporaryStatus("Search saved.");
    } catch {
      showTemporaryStatus("Could not save search.");
    }
  }

  async function runTextSearch(searchTerm: string, filters: SearchFilters) {
    setIsLoading(true);
    setErrorMessage("");
    setStatusMessage("Searching...");
    setHasSearched(true);
    setLastSearchType("text");
    setCurrentPage(1);

    const params = new URLSearchParams({
      q: searchTerm,
      category: filters.category,
      condition: filters.condition,
      buyingType: filters.buyingType,
      sortBy: filters.sortBy,
    });

    if (filters.minPrice.trim()) {
      params.set("minPrice", filters.minPrice.trim());
    }

    if (filters.maxPrice.trim()) {
      params.set("maxPrice", filters.maxPrice.trim());
    }

    try {
      const response = await fetch(`/api/search?${params.toString()}`, {
        method: "GET",
        cache: "no-store",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.errors?.[0] || "Search failed.");
      }

      const nextResults = Array.isArray(data.results) ? data.results : [];

      setResults(nextResults);
      setStatusMessage(`Found ${nextResults.length} results.`);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong while searching.";

      setErrorMessage(message);
      setStatusMessage("");
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }

  async function submitTextSearch() {
    const searchTerm = search.trim();

    if (!searchTerm) {
      setErrorMessage("Type something to search first.");
      setStatusMessage("");
      return;
    }

    const nextPath = `/search?mobileQ=${encodeURIComponent(searchTerm)}&category=${encodeURIComponent(
      category
    )}&condition=${encodeURIComponent(condition)}&buyingType=${encodeURIComponent(
      buyingType
    )}&sortBy=${encodeURIComponent(sortBy)}&minPrice=${encodeURIComponent(
      minPrice
    )}&maxPrice=${encodeURIComponent(maxPrice)}`;

    if (!requireLogin(nextPath)) {
      return;
    }

    await runTextSearch(searchTerm, currentFilters);
  }

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await submitTextSearch();
  }

  async function handleMobileSearchKeyDown(
    event: KeyboardEvent<HTMLInputElement>
  ) {
    if (event.key === "Enter") {
      event.preventDefault();
      await submitTextSearch();
    }
  }

  async function handleImageSelected(event: ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0];

    event.target.value = "";

    if (!selectedFile) {
      return;
    }

    if (!requireLogin("/search")) {
      return;
    }

    setImageFileName(selectedFile.name);
    setImagePreviewUrl(URL.createObjectURL(selectedFile));
    setErrorMessage("Photo search is paused while we fix mobile text search.");
    setStatusMessage("");
  }

  function clearAllFilters() {
    setCategory(defaultFilters.category);
    setCondition(defaultFilters.condition);
    setBuyingType(defaultFilters.buyingType);
    setSortBy(defaultFilters.sortBy);
    setMinPrice(defaultFilters.minPrice);
    setMaxPrice(defaultFilters.maxPrice);
    setCurrentPage(1);

    showTemporaryStatus("Filters reset.");
  }

  function clearImageSearch() {
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }

    setImagePreviewUrl("");
    setImageFileName("");
    showTemporaryStatus("Photo removed.");
  }

  function goToPage(pageNumber: number) {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleDealClick(event: React.MouseEvent<HTMLAnchorElement>) {
    if (!currentUser) {
      event.preventDefault();
      router.push(buildLoginUrl("/search"));
    }
  }

  return (
    <main>
      <Navbar />

      <section className="lowzo-search-page">
        <aside
          className={
            mobileFiltersOpen
              ? "lowzo-filter-sidebar mobile-open"
              : "lowzo-filter-sidebar"
          }
        >
          <div className="filter-top-row">
            <h2>✨ Filters</h2>
            <button type="button" onClick={clearAllFilters}>
              Clear all
            </button>
          </div>

          <div className="filter-block open">
            <div className="filter-block-title">
              <span>🏪 Marketplace</span>
              <span>⌃</span>
            </div>

            <label className="filter-check active">
              <input type="checkbox" checked readOnly />
              <span>eBay</span>
              <strong>{results.length || "1,842"}</strong>
            </label>

            <label className="filter-check">
              <input type="checkbox" disabled />
              <span>Grailed</span>
              <strong>523</strong>
            </label>

            <label className="filter-check">
              <input type="checkbox" disabled />
              <span>StockX</span>
              <strong>312</strong>
            </label>

            <label className="filter-check">
              <input type="checkbox" disabled />
              <span>Depop</span>
              <strong>226</strong>
            </label>

            <label className="filter-check">
              <input type="checkbox" disabled />
              <span>GOAT</span>
              <strong>112</strong>
            </label>

            <button className="show-more-button" type="button">
              Show more⌄
            </button>
          </div>

          <div className="filter-block open">
            <div className="filter-block-title">
              <span>🏷️ Condition</span>
              <span>⌃</span>
            </div>

            <label className="filter-radio">
              <input
                type="radio"
                name="condition"
                checked={condition === "any"}
                onChange={() => setCondition("any")}
              />
              <span>Any</span>
            </label>

            <label className="filter-radio">
              <input
                type="radio"
                name="condition"
                checked={condition === "new"}
                onChange={() => setCondition("new")}
              />
              <span>New</span>
            </label>

            <label className="filter-radio">
              <input
                type="radio"
                name="condition"
                checked={condition === "used"}
                onChange={() => setCondition("used")}
              />
              <span>Used / Second hand</span>
            </label>

            <label className="filter-radio">
              <input
                type="radio"
                name="condition"
                checked={condition === "refurbished"}
                onChange={() => setCondition("refurbished")}
              />
              <span>Refurbished</span>
            </label>
          </div>

          <div className="filter-block open">
            <div className="filter-block-title">
              <span>📦 Category</span>
              <span>⌄</span>
            </div>

            <select
              className="sidebar-select"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              <option value="all">All</option>
              <option value="clothing">Clothing</option>
              <option value="shoes">Shoes</option>
              <option value="tech">Tech</option>
              <option value="cars">Cars</option>
              <option value="car-parts">Car Parts</option>
            </select>
          </div>

          <div className="filter-block open">
            <div className="filter-block-title">
              <span>💷 Price Range</span>
              <span>⌄</span>
            </div>

            <div className="price-input-row">
              <input
                type="number"
                min="0"
                placeholder="Min £"
                value={minPrice}
                onChange={(event) => setMinPrice(event.target.value)}
              />

              <input
                type="number"
                min="0"
                placeholder="Max £"
                value={maxPrice}
                onChange={(event) => setMaxPrice(event.target.value)}
              />
            </div>

            <div className="price-line">
              <span />
            </div>
          </div>

          <div className="filter-block open">
            <div className="filter-block-title">
              <span>⚡ Buying Type</span>
              <span>⌄</span>
            </div>

            <select
              className="sidebar-select"
              value={buyingType}
              onChange={(event) => setBuyingType(event.target.value)}
            >
              <option value="buy-it-now">Buy It Now</option>
              <option value="auction">Auction</option>
              <option value="any">Any</option>
            </select>
          </div>
        </aside>

        <section className="lowzo-results-area">
          <button
            className="mobile-filter-toggle"
            type="button"
            onClick={() => setMobileFiltersOpen((current) => !current)}
          >
            {mobileFiltersOpen ? "Hide Filters" : "Show Filters"} ⚙️
          </button>

          {!isCheckingAuth && !currentUser && (
            <div className="search-error">
              Log in or create an account to search, save items and view deals.
            </div>
          )}

          <form
            className="lowzo-mobile-text-search-only"
            method="GET"
            action="/search"
          >
            <div className="mobile-text-search-card">
              <label>Search Lowzo</label>

              <input type="hidden" name="category" value={category} />
              <input type="hidden" name="condition" value={condition} />
              <input type="hidden" name="buyingType" value={buyingType} />
              <input type="hidden" name="sortBy" value={sortBy} />
              <input type="hidden" name="minPrice" value={minPrice} />
              <input type="hidden" name="maxPrice" value={maxPrice} />

              <div className="mobile-text-search-row">
                <input
                  name="mobileQ"
                  type="search"
                  enterKeyHint="search"
                  autoComplete="off"
                  placeholder="Nike tech, supreme jacket..."
                  defaultValue={search}
                />

                <button type="submit">Go</button>
              </div>

              <p>
                {currentUser
                  ? "Search eBay deals freely while signed in."
                  : "You can look around, but you need an account before searching."}
              </p>
            </div>
          </form>

          <form
            className="lowzo-search-control lowzo-search-control-with-camera desktop-search-tools"
            onSubmit={handleSearch}
          >
            <div className="big-search-box">
              <span>⌕</span>
              <input
                type="search"
                enterKeyHint="search"
                autoComplete="off"
                placeholder="Search supreme jacket, nike tech, air force 1..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onKeyDown={handleMobileSearchKeyDown}
              />
            </div>

            <button
              className="main-search-button"
              type="submit"
              disabled={isLoading}
            >
              {isLoading && lastSearchType === "text"
                ? "Searching..."
                : "Search"}
            </button>

            <div className="photo-button-group">
              <label className="camera-search-button">
                📷 Take Photo
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageSelected}
                  hidden
                />
              </label>

              <label className="camera-search-button choose-photo-button">
                🖼️ Choose Photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelected}
                  hidden
                />
              </label>
            </div>

            <button
              className="save-search-button"
              type="button"
              onClick={saveCurrentSearch}
            >
              ♡ Save Search
            </button>
          </form>

          {imagePreviewUrl && (
            <div className="image-search-preview">
              <img src={imagePreviewUrl} alt="Uploaded search preview" />

              <div>
                <strong>Image selected</strong>
                <p>{imageFileName}</p>
              </div>

              <button type="button" onClick={clearImageSearch}>
                Remove
              </button>
            </div>
          )}

          <div className="results-header-row">
            <div>
              <h1>
                {hasSearched
                  ? `Best matches for “${search}”`
                  : "Find your next deal"}
                {hasSearched && <span className="spark">〰</span>}
              </h1>

              <p>
                {hasSearched
                  ? `${results.length} eBay results found · page ${currentPage} of ${totalPages}`
                  : currentUser
                  ? "Search eBay deals with filters."
                  : "Create an account to start searching eBay deals with filters."}
              </p>
            </div>

            <label className="sort-control">
              Sort by
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
              >
                <option value="best-match">Best Match</option>
                <option value="lowest-price">Lowest Price</option>
                <option value="newest">Newest</option>
              </select>
            </label>
          </div>

          {statusMessage && <div className="save-status">{statusMessage}</div>}
          {errorMessage && <div className="search-error">{errorMessage}</div>}

          {!hasSearched ? (
            <div className="lowzo-empty-state">
              {currentUser ? (
                <>
                  <h2>Start searching.</h2>
                  <p>
                    You are logged in. Search above to find live eBay deals.
                  </p>
                </>
              ) : (
                <>
                  <h2>Start with an account.</h2>
                  <p>
                    Users need to log in or sign up before searching and opening
                    deals.
                  </p>
                </>
              )}
            </div>
          ) : isLoading ? (
            <div className="lowzo-empty-state">
              <h2>Searching eBay...</h2>
              <p>Finding listings, checking relevance and sorting deals.</p>
            </div>
          ) : results.length === 0 ? (
            <div className="lowzo-empty-state">
              <h2>No accurate results found.</h2>
              <p>
                Try changing category, removing price limits, or using a clearer
                item name.
              </p>
            </div>
          ) : (
            <>
              <div className="lowzo-result-list">
                {paginatedResults.map((item, index) => {
                  const realIndex =
                    (currentPage - 1) * RESULTS_PER_PAGE + index;
                  const saved = isItemSaved(item.id);
                  const savingThisItem = isSavingItem === item.id;

                  return (
                    <article className="lowzo-result-card" key={item.id}>
                      <div
                        className={`result-image-frame frame-${realIndex % 3}`}
                      >
                        {item.image ? (
                          <img src={item.image} alt={item.title} />
                        ) : (
                          <span>🛍️</span>
                        )}

                        <button
                          className={
                            saved ? "heart-button saved" : "heart-button"
                          }
                          type="button"
                          onClick={() => toggleSavedItem(item)}
                          aria-label={saved ? "Unsave item" : "Save item"}
                          disabled={savingThisItem}
                        >
                          {saved ? "♥" : "♡"}
                        </button>
                      </div>

                      <div className="result-info-panel">
                        <span className={`deal-badge badge-${realIndex % 3}`}>
                          {getDealBadge(realIndex, lastSearchType)}
                        </span>

                        <h2>{item.title}</h2>

                        <p className="item-subtitle">
                          {item.condition === "New"
                            ? "Brand new listing"
                            : "Pre-owned marketplace deal"}
                        </p>

                        <div className="seller-line">
                          <span className="ebay-mini">eBay</span>
                          <span>•</span>
                          <span>Live marketplace result</span>
                          <span className="verified-dot">●</span>
                        </div>

                        <div className="item-tags">
                          <span>Condition: {item.condition}</span>
                          <span>Total includes shipping</span>
                        </div>
                      </div>

                      <div className="price-breakdown-panel">
                        <div className="price-row">
                          <span>Item price</span>
                          <strong>{formatPrice(item.price)}</strong>
                        </div>

                        <div className="price-row">
                          <span>Shipping</span>
                          <strong>{formatPrice(item.shipping)}</strong>
                        </div>

                        <div className="total-row">
                          <span>Best total price</span>
                          <strong>{formatPrice(item.totalPrice)}</strong>
                        </div>
                      </div>

                      <div className="deal-action-panel">
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="view-deal-button"
                          onClick={handleDealClick}
                        >
                          View Deal →
                        </a>

                        <button
                          className={
                            saved
                              ? "save-item-button saved"
                              : "save-item-button"
                          }
                          type="button"
                          onClick={() => toggleSavedItem(item)}
                          disabled={savingThisItem}
                        >
                          {savingThisItem
                            ? "Saving..."
                            : saved
                            ? "♥ Saved"
                            : "♡ Save"}
                        </button>

                        <p>Live eBay listing</p>
                      </div>
                    </article>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="pagination-bar">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => goToPage(currentPage - 1)}
                  >
                    ←
                  </button>

                  {Array.from({ length: totalPages }, (_, index) => index + 1)
                    .slice(0, 8)
                    .map((pageNumber) => (
                      <button
                        key={pageNumber}
                        type="button"
                        className={
                          currentPage === pageNumber ? "active-page" : ""
                        }
                        onClick={() => goToPage(pageNumber)}
                      >
                        {pageNumber}
                      </button>
                    ))}

                  {totalPages > 8 && <span>...</span>}

                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => goToPage(currentPage + 1)}
                  >
                    →
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </section>

      <Footer />
    </main>
  );
}