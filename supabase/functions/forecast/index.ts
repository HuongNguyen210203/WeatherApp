import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ error: "Use POST" }, 405);
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const lat = Number(body?.lat);
  const lon = Number(body?.lon);

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return json({ error: "lat and lon must be numbers" }, 400);
  }

  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${lat}` +
    `&longitude=${lon}` +
    `&current=temperature_2m,weathercode,wind_speed_10m` +
    `&hourly=temperature_2m,weathercode` +
    `&daily=temperature_2m_max,temperature_2m_min,weathercode` +
    `&timezone=auto`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      return json({ error: "Open-Meteo failed" }, 502);
    }

    const data = await res.json();
    return json(data);
  } catch (err) {
    return json({ error: String(err) }, 500);
  }
});

