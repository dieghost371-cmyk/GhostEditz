import fs from "fs";
import path from "path";
import pino from "pino";
import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion
} from "@whiskeysockets/baileys";

const sessionDir = process.env.SESSION_DIR || "./session";
let sock = null;
let state = { status: "starting", phone: null, lastError: null };

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

export function getBotState() {
  return { ...state };
}

export async function createBot() {
  fs.mkdirSync(sessionDir, { recursive: true });

  const { state: authState, saveCreds } = await useMultiFileAuthState(sessionDir);
  let version;
  try {
    ({ version } = await fetchLatestBaileysVersion());
  } catch {
    version = [2, 3000, 1015901307];
  }

  sock = makeWASocket({
    version,
    auth: authState,
    logger: pino({ level: "silent" }),
    printQRInTerminal: false,
    browser: ["GHOST-KING", "Chrome", "1.0.0"],
    markOnlineOnConnect: false
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", ({ connection, lastDisconnect }) => {
    if (connection === "open") {
      state.status = "online";
      state.lastError = null;
    } else if (connection === "close") {
      state.status = "offline";
      const code = lastDisconnect?.error?.output?.statusCode;
      if (code !== DisconnectReason.loggedOut) {
        setTimeout(() => createBot(), 3000).unref();
      } else {
        state.lastError = "Logged out. Delete session and pair again.";
      }
    } else if (connection === "connecting") {
      state.status = "connecting";
    }
  });

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const m = messages?.[0];
    if (!m?.message || m.key.fromMe) return;

    const jid = m.key.remoteJid;
    const text =
      m.message.conversation ||
      m.message.extendedTextMessage?.text ||
      m.message.imageMessage?.caption ||
      "";

    if (!text.startsWith(".")) return;
    await handleCommand(jid, text.trim());
  });

  return sock;
}

async function send(jid, text) {
  if (!sock) return;
  await sock.sendMessage(jid, { text });
}

async function handleCommand(jid, input) {
  const [commandRaw, ...rest] = input.split(/\s+/);
  const command = commandRaw.toLowerCase();
  const arg = rest.join(" ").trim();

  switch (command) {
    case ".menu":
      return send(jid,
`╭───〔 👻 GHOST-KING 〕───╮
│ 👑 Owner : ${process.env.OWNER_NAME || "Owner"}
│ ⚙️ Mode  : PUBLIC
│ 📦 Commands : 10+
╰────────────────────────╯

🔻 SELECT CATEGORY

📥 DOWNLOAD
🎨 LOGO
🏠 MAIN
🔮 MEDIA
🛠️ TOOLS

Commands:
.ping
.ai <text>
.yt <url>
.ytmp3 <url>
.ytmp4 <url>
.tempmail
.usersdrive
.gdrive
.cinesubz`);
    case ".ping":
      return send(jid, "🏓 GHOST-KING: Pong!");
    case ".ai":
      return send(jid, arg ? "🤖 AI request received. Configure AI_API_URL on the server to enable the provider." : "Usage: .ai hello");
    case ".yt":
      return send(jid, arg ? `🎬 YouTube link received:\n${arg}\n\nUse the official page for playback or authorized downloads.` : "Usage: .yt <url>");
    case ".ytmp3":
    case ".ytmp4":
      return send(jid, arg
        ? "⚠️ This bot does not rip copyrighted music/videos. For media you own or are licensed to download, connect an authorized storage/download provider."
        : `Usage: ${command} <url>`);
    case ".tempmail":
      return send(jid, "📧 TEMPMAIL module is a placeholder. Connect a provider/API that permits this use.");
    case ".usersdrive":
      return send(jid, "☁️ USERSDRIVE module placeholder — connect your authorized storage provider.");
    case ".gdrive":
      return send(jid, "📁 GDRIVE module placeholder — connect your own Google Drive integration.");
    case ".cinesubz":
      return send(jid, "🎬 CINESUBZ module is not connected. Use legal/authorized media sources.");
    default:
      return send(jid, "❌ Unknown command. Send .menu");
  }
}

export async function requestPairingCode(phone) {
  if (!sock) throw new Error("Bot is not ready yet.");
  if (state.status === "online") throw new Error("Bot is already connected.");

  // Baileys pairing-code flow. The phone must not already be linked in a conflicting session.
  await sleep(500);
  const code = await sock.requestPairingCode(phone);
  state.phone = phone;
  return String(code);
}

export async function stopBot(s) {
  try { s?.ws?.close(); } catch {}
}
