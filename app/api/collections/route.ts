import { NextResponse } from 'next/server';
import { supabase } from '../../../src/lib/supabase';

export async function POST(req: Request) {
  try {
    const { userId, gameId, name } = await req.json();
    
    // First find if a collection exists for this user with this name, or create one
    let { data: cols } = await supabase.from('collections').select('*').eq('user_id', userId).eq('name', name || 'Favorites');
    
    let collectionId;
    if (!cols || cols.length === 0) {
      const slug = (name || 'favorites').toLowerCase().replace(/\s+/g, '-');
      const { data: newCol } = await supabase.from('collections').insert({
        user_id: userId,
        name: name || 'Favorites',
        slug,
        games: [gameId]
      }).select().single();
      collectionId = newCol?.id;
    } else {
      const col = cols[0];
      const newGames = [...(col.games || [])];
      if (!newGames.includes(gameId)) newGames.push(gameId);
      await supabase.from('collections').update({ games: newGames }).eq('id', col.id);
      collectionId = col.id;
    }

    return NextResponse.json({ success: true, collectionId });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
