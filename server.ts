import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const SUPABASE_URL = "https://ycesvbwivmhfglemhcir.supabase.co";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InljZXN2Yndpdm1oZmdsZW1oY2lyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjAzNjMxMCwiZXhwIjoyMDk3NjEyMzEwfQ.O_j5vYzM4IpAIfIKh0DQ_LoZuwYYcfiPOzSnU-R0Ejs";
const RESEND_API_KEY = "PASTE_YOUR_RESEND_KEY_HERE";
const MY_EMAIL = "lupinstarnley009@gmail.com";

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const resend = new Resend(RESEND_API_KEY);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Contact API
  app.post("/api/contact", async (req, res) => {
    try {
      const { name, email, subject, message } = req.body;
      const data = await resend.emails.send({
        from: 'Contact Form <onboarding@resend.dev>',
        to: MY_EMAIL,
        subject: `[GAME STUDIO] ${subject}`,
        text: `From: ${name} (${email})\n\n${message}`,
      });
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Admin Game Insert
  app.post("/api/admin/games", async (req, res) => {
    try {
      const { slug, data } = req.body;
      const { data: result, error } = await supabaseAdmin
        .from("games")
        .insert([{ slug, data }]);
        
      if (error) throw error;
      res.json({ success: true, result });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
