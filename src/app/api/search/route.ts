import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ACCESS_COOKIE = "lowzo_access_token";

type Platform = "eBay";

type SearchCategory =
  | "all"
  | "clothing"
  | "shoes"
  | "tech"
  | "cars"
  | "car-parts";

type SearchCondition = "any" | "new" | "used" | "refurbished";

type BuyingType = "buy-it-now" | "auction" | "any";

type SortType = "best-match" | "lowest-price" | "newest";

type LowzoResult = {
  id: string;
  title: string;
  platform: Platform;
  price: number;
  shipping: number;
  totalPrice: number;
  condition: "New" | "Used" | "Second hand" | "Refurbished";
  image: string;
  url: string;
  score: number;
};

type EbayTokenResponse = {
  access_token: string;
  expires_in: number;
  token_type: string;
};

type EbayItemSummary = {
  itemId?: string;
  title?: string;
  itemWebUrl?: string;
  itemAffiliateWebUrl?: string;
  image?: {
    imageUrl?: string;
  };
  thumbnailImages?: {
    imageUrl?: string;
  }[];
  price?: {
    value?: string;
    currency?: string;
  };
  currentBidPrice?: {
    value?: string;
    currency?: string;
  };
  shippingOptions?: {
    shippingCost?: {
      value?: string;
      currency?: string;
    };
  }[];
  condition?: string;
};

type EbaySearchResponse = {
  itemSummaries?: EbayItemSummary[];
  total?: number;
  warnings?: unknown[];
};

const categoryRules: Record<
  SearchCategory,
  {
    goodWords: string[];
    badWords: string[];
    minimumUsefulPrice: number;
  }
> = {
  all: {
    goodWords: [],
    badWords: [],
    minimumUsefulPrice: 0,
  },
  clothing: {
    goodWords: [
      "coat",
      "jacket",
      "hoodie",
      "fleece",
      "tracksuit",
      "jumper",
      "sweatshirt",
      "t-shirt",
      "shirt",
      "jeans",
      "trousers",
      "shorts",
      "puffer",
      "gilet",
      "parka",
    ],
    badWords: [
      "card",
      "cards",
      "sticker",
      "stickers",
      "case",
      "cover",
      "poster",
      "keyring",
      "manual",
      "box only",
      "empty box",
      "tag only",
      "receipt",
    ],
    minimumUsefulPrice: 5,
  },
  shoes: {
    goodWords: [
      "shoes",
      "trainers",
      "sneakers",
      "jordan",
      "dunk",
      "air force",
      "yeezy",
      "boots",
    ],
    badWords: [
      "laces",
      "lace",
      "box only",
      "empty box",
      "keyring",
      "sticker",
      "poster",
      "cleaner",
      "protector",
      "insole",
      "insoles",
    ],
    minimumUsefulPrice: 10,
  },
  tech: {
    goodWords: [
      "iphone",
      "ipad",
      "macbook",
      "laptop",
      "camera",
      "console",
      "playstation",
      "xbox",
      "headphones",
      "airpods",
      "phone",
    ],
    badWords: [
      "case",
      "cover",
      "charger only",
      "box only",
      "screen protector",
      "manual",
      "cable only",
      "parts only",
    ],
    minimumUsefulPrice: 15,
  },
  cars: {
    goodWords: [
      "car",
      "vehicle",
      "hatchback",
      "saloon",
      "estate",
      "coupe",
      "convertible",
      "diesel",
      "petrol",
      "automatic",
      "manual",
    ],
    badWords: [
      "model car",
      "toy",
      "brochure",
      "manual only",
      "keyring",
      "poster",
      "wheels only",
      "breaking",
      "parts",
    ],
    minimumUsefulPrice: 500,
  },
  "car-parts": {
    goodWords: [
      "bumper",
      "wheel",
      "alloy",
      "headlight",
      "tail light",
      "mirror",
      "engine",
      "gearbox",
      "door",
      "bonnet",
      "wing",
      "turbo",
    ],
    badWords: ["toy", "poster", "keyring", "brochure", "model car"],
    minimumUsefulPrice: 3,
  },
};

function getSupabaseServerClient() {
  const rawSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const rawSupabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!rawSupabaseUrl) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL in .env.local");
  }

  if (!rawSupabaseKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local");
  }

  const supabaseUrl = rawSupabaseUrl
    .trim()
    .replace("/rest/v1/", "")
    .replace("/rest/v1", "")
    .replace(/\/$/, "");

  return createClient(supabaseUrl, rawSupabaseKey.trim(), {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

async function isUserLoggedIn() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_COOKIE)?.value;

  if (!accessToken) {
    return false;
  }

  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase.auth.getUser(accessToken);

  if (error || !data.user) {
    return false;
  }

  return true;
}

function normaliseText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9£ ]/g, " ");
}

function toNumber(value: string | undefined) {
  const parsedNumber = Number(value);

  if (Number.isNaN(parsedNumber)) {
    return 0;
  }

  return parsedNumber;
}

function roundPrice(value: number) {
  return Math.round(value * 100) / 100;
}

function getValidCategory(value: string | null): SearchCategory {
  if (
    value === "all" ||
    value === "clothing" ||
    value === "shoes" ||
    value === "tech" ||
    value === "cars" ||
    value === "car-parts"
  ) {
    return value;
  }

  return "all";
}

function getValidCondition(value: string | null): SearchCondition {
  if (
    value === "any" ||
    value === "new" ||
    value === "used" ||
    value === "refurbished"
  ) {
    return value;
  }

  return "any";
}

function getValidBuyingType(value: string | null): BuyingType {
  if (value === "buy-it-now" || value === "auction" || value === "any") {
    return value;
  }

  return "buy-it-now";
}

function getValidSortType(value: string | null): SortType {
  if (value === "best-match" || value === "lowest-price" || value === "newest") {
    return value;
  }

  return "best-match";
}

function mapEbayCondition(
  condition: string | undefined
): LowzoResult["condition"] {
  const value = condition?.toLowerCase() || "";

  if (value.includes("refurbished")) {
    return "Refurbished";
  }

  if (value.includes("new")) {
    return "New";
  }

  if (
    value.includes("used") ||
    value.includes("pre-owned") ||
    value.includes("second")
  ) {
    return "Second hand";
  }

  return "Used";
}

function matchesCondition(
  resultCondition: LowzoResult["condition"],
  selectedCondition: SearchCondition
) {
  if (selectedCondition === "any") {
    return true;
  }

  if (selectedCondition === "new") {
    return resultCondition === "New";
  }

  if (selectedCondition === "used") {
    return resultCondition === "Used" || resultCondition === "Second hand";
  }

  if (selectedCondition === "refurbished") {
    return resultCondition === "Refurbished";
  }

  return true;
}

function getConditionFilter(condition: SearchCondition) {
  if (condition === "new") {
    return "conditionIds:{1000|1500|1750}";
  }

  if (condition === "used") {
    return "conditionIds:{3000|4000|5000|6000}";
  }

  if (condition === "refurbished") {
    return "conditionIds:{2000|2500}";
  }

  return "";
}

function getBuyingTypeFilter(buyingType: BuyingType) {
  if (buyingType === "buy-it-now") {
    return "buyingOptions:{FIXED_PRICE}";
  }

  if (buyingType === "auction") {
    return "buyingOptions:{AUCTION}";
  }

  return "buyingOptions:{FIXED_PRICE|AUCTION|BEST_OFFER}";
}

function getPriceFilter(minPrice: string, maxPrice: string) {
  const min = minPrice ? Number(minPrice) : null;
  const max = maxPrice ? Number(maxPrice) : null;

  if (min !== null && max !== null && !Number.isNaN(min) && !Number.isNaN(max)) {
    return `price:[${min}..${max}]`;
  }

  if (min !== null && !Number.isNaN(min)) {
    return `price:[${min}..]`;
  }

  if (max !== null && !Number.isNaN(max)) {
    return `price:[..${max}]`;
  }

  return "";
}

function getEbaySort(sortBy: SortType) {
  if (sortBy === "lowest-price") {
    return "price";
  }

  if (sortBy === "newest") {
    return "newlyListed";
  }

  return "";
}

function calculateRelevanceScore({
  title,
  query,
  category,
  totalPrice,
  index,
}: {
  title: string;
  query: string;
  category: SearchCategory;
  totalPrice: number;
  index: number;
}) {
  const cleanTitle = normaliseText(title);
  const cleanQuery = normaliseText(query);
  const queryWords = cleanQuery.split(" ").filter(Boolean);
  const rules = categoryRules[category];

  let score = 100 - index;

  for (const queryWord of queryWords) {
    if (cleanTitle.includes(queryWord)) {
      score += 22;
    } else {
      score -= 18;
    }
  }

  for (const goodWord of rules.goodWords) {
    if (cleanTitle.includes(goodWord)) {
      score += 18;
    }
  }

  for (const badWord of rules.badWords) {
    if (cleanTitle.includes(badWord)) {
      score -= 90;
    }
  }

  if (rules.minimumUsefulPrice > 0 && totalPrice < rules.minimumUsefulPrice) {
    score -= 45;
  }

  if (totalPrice <= 1.5 && category !== "all") {
    score -= 60;
  }

  return score;
}

function sortResults(results: LowzoResult[], sortBy: SortType) {
  if (sortBy === "lowest-price") {
    return [...results].sort((a, b) => a.totalPrice - b.totalPrice);
  }

  if (sortBy === "newest") {
    return results;
  }

  return [...results].sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }

    return a.totalPrice - b.totalPrice;
  });
}

async function getEbayAccessToken() {
  const clientId = process.env.EBAY_CLIENT_ID;
  const clientSecret = process.env.EBAY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing eBay API keys in .env.local");
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString(
    "base64"
  );

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    scope: "https://api.ebay.com/oauth/api_scope",
  });

  const response = await fetch(
    "https://api.ebay.com/identity/v1/oauth2/token",
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
      cache: "no-store",
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`eBay token failed: ${errorText}`);
  }

  const data = (await response.json()) as EbayTokenResponse;

  return data.access_token;
}

async function searchEbay({
  query,
  category,
  condition,
  buyingType,
  sortBy,
  minPrice,
  maxPrice,
}: {
  query: string;
  category: SearchCategory;
  condition: SearchCondition;
  buyingType: BuyingType;
  sortBy: SortType;
  minPrice: string;
  maxPrice: string;
}) {
  const accessToken = await getEbayAccessToken();

  const url = new URL(
    "https://api.ebay.com/buy/browse/v1/item_summary/search"
  );

  url.searchParams.set("q", query);
  url.searchParams.set("limit", "50");

  const filters = [
    getBuyingTypeFilter(buyingType),
    getConditionFilter(condition),
    getPriceFilter(minPrice, maxPrice),
    "priceCurrency:GBP",
    "deliveryCountry:GB",
  ].filter(Boolean);

  if (filters.length > 0) {
    url.searchParams.set("filter", filters.join(","));
  }

  const ebaySort = getEbaySort(sortBy);

  if (ebaySort) {
    url.searchParams.set("sort", ebaySort);
  }

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Accept-Language": "en-GB",
      "X-EBAY-C-MARKETPLACE-ID": "EBAY_GB",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`eBay search failed: ${errorText}`);
  }

  const data = (await response.json()) as EbaySearchResponse;
  const items = data.itemSummaries || [];

  const min = minPrice ? Number(minPrice) : null;
  const max = maxPrice ? Number(maxPrice) : null;

  const mappedResults = items
    .map((item, index): LowzoResult | null => {
      const itemPrice = toNumber(item.price?.value);
      const bidPrice = toNumber(item.currentBidPrice?.value);
      const price = itemPrice > 0 ? itemPrice : bidPrice;
      const shipping = toNumber(item.shippingOptions?.[0]?.shippingCost?.value);
      const totalPrice = roundPrice(price + shipping);

      if (!item.itemId || !item.title || !item.itemWebUrl || price <= 0) {
        return null;
      }

      const mappedCondition = mapEbayCondition(item.condition);

      if (!matchesCondition(mappedCondition, condition)) {
        return null;
      }

      if (min !== null && !Number.isNaN(min) && totalPrice < min) {
        return null;
      }

      if (max !== null && !Number.isNaN(max) && totalPrice > max) {
        return null;
      }

      const score = calculateRelevanceScore({
        title: item.title,
        query,
        category,
        totalPrice,
        index,
      });

      if (category !== "all" && score < 20) {
        return null;
      }

      return {
        id: item.itemId,
        title: item.title,
        platform: "eBay",
        price: roundPrice(price),
        shipping: roundPrice(shipping),
        totalPrice,
        condition: mappedCondition,
        image: item.image?.imageUrl || item.thumbnailImages?.[0]?.imageUrl || "",
        url: item.itemAffiliateWebUrl || item.itemWebUrl,
        score,
      };
    })
    .filter((item): item is LowzoResult => item !== null);

  return sortResults(mappedResults, sortBy);
}

export async function GET(request: Request) {
  try {
    const loggedIn = await isUserLoggedIn();

    if (!loggedIn) {
      return NextResponse.json(
        {
          totalResults: 0,
          results: [],
          errors: ["You need to log in before searching."],
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);

    const query = (searchParams.get("q") || "").trim();

    if (!query) {
      return NextResponse.json(
        {
          totalResults: 0,
          results: [],
          errors: ["Missing search query."],
        },
        { status: 400 }
      );
    }

    const category = getValidCategory(searchParams.get("category"));
    const condition = getValidCondition(searchParams.get("condition"));
    const buyingType = getValidBuyingType(searchParams.get("buyingType"));
    const sortBy = getValidSortType(searchParams.get("sortBy"));
    const minPrice = searchParams.get("minPrice") || "";
    const maxPrice = searchParams.get("maxPrice") || "";

    const results = await searchEbay({
      query,
      category,
      condition,
      buyingType,
      sortBy,
      minPrice,
      maxPrice,
    });

    return NextResponse.json({
      query,
      totalResults: results.length,
      results,
      errors: [],
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown search error.";

    return NextResponse.json(
      {
        totalResults: 0,
        results: [],
        errors: [message],
      },
      { status: 500 }
    );
  }
}