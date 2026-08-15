const ALLOWED_ORIGIN = "*";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(),
    },
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(),
      });
    }

    // -------------------------
    // NUMBER LOOKUP
    // /api/number?num=9876543210
    // -------------------------
    if (url.pathname === "/api/number") {
      const num = url.searchParams.get("num");

      if (!num || !/^\d{10}$/.test(num)) {
        return jsonResponse(
          { error: "Invalid 10-digit number." },
          400
        );
      }

      const upstream = new URL("https://markplace.site/api.php");

      upstream.searchParams.set("type", "number");
      upstream.searchParams.set("num", num);

      // API key will be added later as a Cloudflare secret.
      upstream.searchParams.set("key", env.NUMBER_API_KEY);

      try {
        const response = await fetch(upstream);

        return new Response(response.body, {
          status: response.status,
          headers: {
            "Content-Type":
              response.headers.get("Content-Type") ||
              "application/json",
            ...corsHeaders(),
          },
        });
      } catch (error) {
        return jsonResponse(
          { error: "Upstream API request failed." },
          502
        );
      }
    }

    // -------------------------
    // AADHAAR LOOKUP
    // /api/aadhaar?aadhaar=123456789012
    // -------------------------
    if (url.pathname === "/api/aadhaar") {
      const aadhaar = url.searchParams.get("aadhaar");

      if (!aadhaar || !/^\d{12}$/.test(aadhaar)) {
        return jsonResponse(
          { error: "Invalid Aadhaar number." },
          400
        );
      }

      const upstream = new URL("https://markplace.site/api.php");

      upstream.searchParams.set("type", "aadhaar");
      upstream.searchParams.set("aadhaar", aadhaar);

      // API key will be added later as a Cloudflare secret.
      upstream.searchParams.set("key", env.AADHAAR_API_KEY);

      try {
        const response = await fetch(upstream);

        return new Response(response.body, {
          status: response.status,
          headers: {
            "Content-Type":
              response.headers.get("Content-Type") ||
              "application/json",
            ...corsHeaders(),
          },
        });
      } catch (error) {
        return jsonResponse(
          { error: "Upstream API request failed." },
          502
        );
      }
    }

    // Everything else = your normal website
    return env.ASSETS.fetch(request);
  },
};
