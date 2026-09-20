import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createBot, getBotState, requestPairingCode, stopBot } from "./bot.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "../public")));

const port = Number(process.env.PORT || 3000);

app.get("/api/status", (_req, res) => {
  res.json({
    ok: true,
    bot: process.env.BOT_NAME || "GHOST-KING",
    state: getBotState()
  });
});

app.post("/api/pair", async (req, res) => {
  try {
    const phone = String(req.body?.phone || "").replace(/\D/g, "");
    if (!phone || phone.length < 8) {
      return res.status(400).json({ ok: false, error: "Enter a valid phone number with country code." });
    }
    const code = await requestPairingCode(phone);
    res.json({ ok: true, code });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.get("/api/commands", (_req, res) => {
  res.json({
    ok: true,
    commands: [
      [".menu", "Show the command menu"],
      [".ping", "Check bot latency"],
      [".ai <text>", "AI chat when AI_API_URL is configured"],
      [".yt <url>", "Show YouTube metadata/link (no media ripping)"],
      [".ytmp3 <url>", "Safe response for authorized/self-owned media only"],
      [".ytmp4 <url>", "Safe response for authorized/self-owned media only"],
      [".tempmail", "Demo endpoint placeholder"],
      [".usersdrive", "Demo endpoint placeholder"],
      [".gdrive", "Demo endpoint placeholder"],
      [".cinesubz", "Demo endpoint placeholder"]
    ]
  });
});

app.post("/api/ai/chat", async (req, res) => {
  try {
    const message = String(req.body?.message || "").trim();
    if (!message) return res.status(400).json({ ok: false, error: "Message is required." });

    if (!process.env.AI_API_URL) {
      return res.json({
        ok: true,
        reply: "AI is not configured yet. Add AI_API_URL and AI_API_KEY to the server environment."
      });
    }

    const r = await fetch(process.env.AI_API_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(process.env.AI_API_KEY ? { authorization: `Bearer ${process.env.AI_API_KEY}` } : {})
      },
      body: JSON.stringify({ message })
    });
    const data = await r.json();
    res.status(r.ok ? 200 : 502).json({ ok: r.ok, data });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.get("/api/youtube", (req, res) => {
  const url = String(req.query.url || "").trim();
  if (!url) return res.status(400).json({ ok: false, error: "YouTube URL is required." });
  res.json({
    ok: true,
    url,
    message: "Use the original/official YouTube page for playback or downloads you are authorized to make."
  });
});

app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

const bot = await createBot();
const server = app.listen(port, () => {
  console.log(`GHOST-KING web panel listening on :${port}`);
});

const shutdown = async () => {
  await stopBot(bot);
  server.close(() => process.exit(0));
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
