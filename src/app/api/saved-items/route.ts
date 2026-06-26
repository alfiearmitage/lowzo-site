import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ACCESS_COOKIE = "lowzo_access_token";

function formatMoney(value: unknown) {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return "";
  }

  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(numberValue);
}

async function getLoggedInUser() {
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    return {
      supabase: null,
      user: null,
      error: "Supabase service role key is missing.",
    };
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_COOKIE)?.value || "";

  if (!accessToken) {
    return {
      supabase,
      user: null,
      error: "You need to log in first.",
    };
  }

  const { data, error } = await supabase.auth.getUser(accessToken);

  if (error || !data.user) {
    return {
      supabase,
      user: null,
      error: "Your login has expired. Please log in again.",
    };
  }

  return {
    supabase,
    user: data.user,
    error: "",
  };
}

export async function GET() {
  const { supabase, user, error } = await getLoggedInUser();

  if (!supabase || !user) {
    return NextResponse.json(
      {
        savedItems: [],
        error,
      },
      { status: 401 }
    );
  }

  const { data, error: savedItemsError } = await supabase
    .from("saved_items")
    .select(
      "id, marketplace, marketplace_item_id, title, price, shipping, total_price, image_url, item_url, condition, location, created_at"
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (savedItemsError) {
    return NextResponse.json(
      {
        savedItems: [],
        error: savedItemsError.message,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    savedItems: data || [],
  });
}

export async function POST(request: Request) {
  const { supabase, user, error } = await getLoggedInUser();

  if (!supabase || !user) {
    return NextResponse.json(
      {
        savedItem: null,
        error,
      },
      { status: 401 }
    );
  }

  const body = await request.json();
  const item = body.item || body;

  const marketplaceItemId = String(item.id || item.marketplace_item_id || "").trim();
  const title = String(item.title || "").trim();
  const itemUrl = String(item.url || item.item_url || "").trim();

  if (!marketplaceItemId || !title || !itemUrl) {
    return NextResponse.json(
      {
        savedItem: null,
        error: "Missing item details.",
      },
      { status: 400 }
    );
  }

  const priceText =
    String(item.priceText || item.price_text || "").trim() ||
    formatMoney(item.price);

  const shippingText =
    String(item.shippingText || item.shipping_text || "").trim() ||
    formatMoney(item.shipping);

  const totalPriceText =
    String(item.totalPriceText || item.total_price_text || "").trim() ||
    formatMoney(item.totalPrice);

  const { data, error: saveError } = await supabase
    .from("saved_items")
    .upsert(
      {
        user_id: user.id,
        marketplace: "ebay",
        marketplace_item_id: marketplaceItemId,
        title,
        price: priceText,
        shipping: shippingText,
        total_price: totalPriceText || priceText,
        image_url: String(item.image || item.image_url || "").trim(),
        item_url: itemUrl,
        condition: String(item.condition || "").trim(),
        location: String(item.location || "").trim(),
      },
      {
        onConflict: "user_id,marketplace,marketplace_item_id",
      }
    )
    .select(
      "id, marketplace, marketplace_item_id, title, price, shipping, total_price, image_url, item_url, condition, location, created_at"
    )
    .single();

  if (saveError) {
    return NextResponse.json(
      {
        savedItem: null,
        error: saveError.message,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    savedItem: data,
  });
}

export async function DELETE(request: Request) {
  const { supabase, user, error } = await getLoggedInUser();

  if (!supabase || !user) {
    return NextResponse.json(
      {
        removed: false,
        error,
      },
      { status: 401 }
    );
  }

  const url = new URL(request.url);
  const marketplaceItemId = String(
    url.searchParams.get("marketplaceItemId") || url.searchParams.get("id") || ""
  ).trim();

  if (!marketplaceItemId) {
    return NextResponse.json(
      {
        removed: false,
        error: "Missing item id.",
      },
      { status: 400 }
    );
  }

  const { error: deleteError } = await supabase
    .from("saved_items")
    .delete()
    .eq("user_id", user.id)
    .eq("marketplace", "ebay")
    .eq("marketplace_item_id", marketplaceItemId);

  if (deleteError) {
    return NextResponse.json(
      {
        removed: false,
        error: deleteError.message,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    removed: true,
  });
}