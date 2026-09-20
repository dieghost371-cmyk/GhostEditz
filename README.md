# GHOST-KING Bot + Pairing Website

A starter Node.js project inspired by the supplied screenshots.

## Included
- Dark blue secure pairing terminal
- WhatsApp pairing-code flow using Baileys
- `.menu`, `.ping`, `.ai`, `.yt`, `.ytmp3`, `.ytmp4`, `.tempmail`, `.usersdrive`, `.gdrive`, `.cinesubz`
- JSON API routes under `/api/*`
- Render-friendly `npm start`

## Run locally

1. Install Node.js 20+.
2. Copy `.env.example` to `.env`.
3. Run `npm install`.
4. Run `npm start`.
5. Open `http://localhost:3000`.
6. Enter the WhatsApp number with country code, e.g. `947XXXXXXXX`.

## Render deployment

Create a new Web Service from this project:
- Runtime: Node
- Build Command: `npm install`
- Start Command: `npm start`
- Add the environment variables from `.env.example`.

For production, use persistent storage for `SESSION_DIR`, because the WhatsApp auth session must survive restarts.

## Important media/API note

The project deliberately does not implement a YouTube music/video ripping service. Connect only providers and storage you are authorized to use, and follow the source service's terms and copyright rules.

API placeholders such as Google Drive, temp mail, and AI need their provider credentials and exact APIs before they can be enabled.
