import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, max-age=0",
};

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return Response.json(
      { ok: false, error: "Unauthorized" },
      { status: 401, headers: NO_STORE_HEADERS },
    );
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("companies")
    .select("bvd_code")
    .limit(1);

  if (error) {
    return Response.json(
      { ok: false, error: "Supabase keepalive query failed" },
      { status: 500, headers: NO_STORE_HEADERS },
    );
  }

  return Response.json(
    {
      ok: true,
      checkedAt: new Date().toISOString(),
      rows: data?.length ?? 0,
    },
    { headers: NO_STORE_HEADERS },
  );
}
