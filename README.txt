GHOST EDITZ + GHOST-KING BOT

1. index.html is your existing GHOST EDITZ website with a new "Ghost Bot" page added.
2. The page calls a separate Node/WhatsApp backend because GitHub Pages/static HTML cannot run a WhatsApp bot process.
3. Deploy ghost-bot-backend.zip to Render (or another Node host).
4. In index.html find:
   const GHOST_BOT_API = ...
   and replace YOUR-BOT-BACKEND.onrender.com with your deployed backend URL.
5. Upload the updated index.html to your GitHub website.

The media commands are intentionally limited to authorized/self-owned media and official playback/links.
