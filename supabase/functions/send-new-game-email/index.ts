// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const RESEND_API_KEY = "re_CUMyDwD2_QEGeoyqPb64AWMtyEesQ7puS";

serve(async (req) => {
  try {
    const payload = await req.json();
    const game = payload.record;

    if (!game) {
      return new Response("No game data", { status: 400 });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get subscribers
    const { data: subscribers, error } = await supabase
      .from('profiles')
      .select('email')
      .eq('notify_new_games', true);

    if (error) {
      throw error;
    }

    if (!subscribers || subscribers.length === 0) {
      return new Response("No subscribers", { status: 200 });
    }

    const emails = subscribers.map(s => s.email).filter(Boolean);

    // Create the HTML template
    const html = `
      <div style="background-color: #0a0a0a; color: #ffffff; font-family: sans-serif; padding: 40px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1);">
        <h1 style="color: #00f5d4; font-size: 24px; text-align: center; letter-spacing: 2px;">GAMES STUDIO</h1>
        <h2 style="font-size: 20px; margin-top: 20px;">New Game Added: ${game.data.title}</h2>
        
        <div style="margin: 20px 0;">
          <img src="${game.data.image || game.data.cover_image_url}" alt="${game.data.title}" style="width: 100%; max-width: 600px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);" />
        </div>
        
        <p style="color: #a3a3a3;"><strong>Category:</strong> ${game.data.category}</p>
        
        ${game.data.specs && game.data.specs.length > 0 ? `
        <div style="background-color: rgba(255,255,255,0.05); padding: 20px; border-radius: 12px; margin-top: 20px;">
          <h3 style="color: #00f5d4; margin-top: 0;">System Requirements</h3>
          <ul style="list-style: none; padding: 0; color: #a3a3a3;">
            ${game.data.specs.map(spec => `<li><strong>${spec.label}:</strong> ${spec.value}</li>`).join('')}
          </ul>
        </div>
        ` : ''}
        
        <div style="margin-top: 30px; text-align: center;">
          <a href="https://yourdomain.com/game/${game.slug}" style="display: inline-block; background-color: #00f5d4; color: #0a0a0a; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-right: 10px;">Download Now</a>
          ${game.data.videos && game.data.videos[0] ? `<a href="${game.data.videos[0]}" style="display: inline-block; background-color: rgba(255,255,255,0.1); color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Watch Video</a>` : ''}
        </div>
      </div>
    `;

    // Send emails
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: "GAMES STUDIO <onboarding@resend.dev>",
        to: emails,
        subject: `New Game Alert: ${game.data.title}`,
        html: html
      })
    });

    const resData = await res.json();
    return new Response(JSON.stringify(resData), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
})
