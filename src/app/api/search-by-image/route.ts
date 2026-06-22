import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

type EbayImageSearchResponse = {
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

function calculateImageResultScore({
  title,
  category,
  totalPrice,
  index,
}: {
  title: string;
  category: SearchCategory;
  totalPrice: number;
  index: number;
}) {
  const cleanTitle = normaliseText(title);
  const rules = categoryRules[category];

  let score = 120 - index;

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

async function searchEbayByImage({
  base64Image,
  category,
  condition,
  buyingType,
  sortBy,
  minPrice,
  maxPrice,
}: {
  base64Image: string;
  category: SearchCategory;
  condition: SearchCondition;
  buyingType: BuyingType;
  sortBy: SortType;
  minPrice: string;
  maxPrice: string;
}) {
  const accessToken = await getEbayAccessToken();

  const url = new URL(
    "https://api.ebay.com/buy/browse/v1/item_summary/search_by_image"
  );

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

  const response = await fetch(url.toString(), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "Accept-Language": "en-GB",
      "X-EBAY-C-MARKETPLACE-ID": "EBAY_GB",
    },
    body: JSON.stringify({
      image: base64Image,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`eBay image search failed: ${errorText}`);
  }

  const data = (await response.json()) as EbayImageSearchResponse;
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

      const score = calculateImageResultScore({
        title: item.title,
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

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const imageFile = formData.get("image");
    const category = (formData.get("category") || "all") as SearchCategory;
    const condition = (formData.get("condition") || "any") as SearchCondition;
    const buyingType = (formData.get("buyingType") ||
      "buy-it-now") as BuyingType;
    const sortBy = (formData.get("sortBy") || "best-match") as SortType;
    const minPrice = String(formData.get("minPrice") || "");
    const maxPrice = String(formData.get("maxPrice") || "");

    if (!(imageFile instanceof File)) {
      return NextResponse.json(
        {
          error: "Missing image file.",
          results: [],
          errors: ["Missing image file."],
        },
        { status: 400 }
      );
    }

    if (!imageFile.type.startsWith("image/")) {
      return NextResponse.json(
        {
          error: "Please upload an image file.",
          results: [],
          errors: ["Please upload an image file."],
        },
        { status: 400 }
      );
    }

    if (imageFile.size > 8 * 1024 * 1024) {
      return NextResponse.json(
        {
          error: "Image is too large. Please use an image under 8MB.",
          results: [],
          errors: ["Image is too large. Please use an image under 8MB."],
        },
        { status: 413 }
      );
    }

    const arrayBuffer = await imageFile.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString("base64");

    if (!base64Image) {
      return NextResponse.json(
        {
          error: "Could not read image.",
          results: [],
          errors: ["Could not read image."],
        },
        { status: 400 }
      );
    }

    const results = await searchEbayByImage({
      base64Image,
      category,
      condition,
      buyingType,
      sortBy,
      minPrice,
      maxPrice,
    });

    return NextResponse.json({
      query: imageFile.name,
      totalResults: results.length,
      results,
      errors: [],
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown image search error.";

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