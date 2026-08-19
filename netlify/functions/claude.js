/* Proxy verso l'API Anthropic. La chiave resta sul server, mai nel browser. */
exports.handler = async (event) => {
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };
  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers: cors, body: "" };
  if (event.httpMethod !== "POST")
    return { statusCode: 405, headers: cors, body: JSON.stringify({ error: "Metodo non consentito" }) };

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey)
    return { statusCode: 500, headers: cors, body: JSON.stringify({ error: "ANTHROPIC_API_KEY non configurata" }) };

  try {
    const body = JSON.parse(event.body || "{}");
    const messages = Array.isArray(body.messages) ? body.messages : [];
    if (!messages.length)
      return { statusCode: 400, headers: cors, body: JSON.stringify({ error: "Nessun messaggio ricevuto" }) };

    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: body.model || "claude-sonnet-4-6",
        max_tokens: Math.min(Math.max(parseInt(body.max_tokens, 10) || 3000, 256), 8000),
        messages,
      }),
    });

    const data = await r.json();
    return { statusCode: r.status, headers: cors, body: JSON.stringify(data) };
  } catch (err) {
    return { statusCode: 500, headers: cors, body: JSON.stringify({ error: String(err.message || err) }) };
  }
};
