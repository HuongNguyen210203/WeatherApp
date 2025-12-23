import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Vary": "Origin",
};

type Body =
  | { op: "list" }
  | { op: "toggle"; city_id: string };

type FavoritesRow = { city_id: string };

const isUuid = (s: string) => /^[0-9a-fA-F-]{36}$/.test(s);

Deno.serve(async (req: Request) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Use POST" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

    if (!supabaseUrl || !supabaseAnonKey) {
      return new Response(
        JSON.stringify({ error: "Missing SUPABASE_URL / SUPABASE_ANON_KEY" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Require Authorization header
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized (missing Bearer token)" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // IMPORTANT: pass through Authorization header so RLS applies to the user
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify user (required)
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized (invalid JWT)" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const userId = userData.user.id;

    const body = (await req.json()) as Body;

    // LIST
    if (body.op === "list") {
      const { data, error } = await supabase
        .from("favorites")
        .select("city_id")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const ids = ((data ?? []) as FavoritesRow[]).map((row) => row.city_id);

      return new Response(JSON.stringify({ ids }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // TOGGLE
    if (body.op === "toggle") {
      const cityId = body.city_id?.trim();

      if (!cityId) {
        return new Response(JSON.stringify({ error: "city_id is required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (!isUuid(cityId)) {
        return new Response(
          JSON.stringify({ error: "city_id must be a UUID" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      

      const { data: existing, error: existErr } = await supabase
        .from("favorites")
        .select("id")
        .eq("user_id", userId)
        .eq("city_id", cityId)
        .maybeSingle();

      if (existErr) {
        return new Response(JSON.stringify({ error: existErr.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Remove if exists
      if (existing?.id) {
        const { error: delErr } = await supabase
          .from("favorites")
          .delete()
          .eq("id", existing.id);

        if (delErr) {
          return new Response(JSON.stringify({ error: delErr.message }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        return new Response(
          JSON.stringify({ status: "removed", city_id: cityId }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Add if not exists
      const { error: insErr } = await supabase
        .from("favorites")
        .insert([{ user_id: userId, city_id: cityId }]);

      if (insErr) {
        return new Response(JSON.stringify({ error: insErr.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ status: "added", city_id: cityId }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid op" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
