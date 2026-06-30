'use client';

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { supabase } from '../../src/lib/supabase';
import { Send, Bot, User as UserIcon, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const GROQ_API_KEY = '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';

export default function AIAgent() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [games, setGames] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [wishlists, setWishlists] = useState<any[]>([]);
  const [emailInputMode, setEmailInputMode] = useState(false);
  const [tempEmail, setTempEmail] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchData = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      let currentUser = sessionData?.session?.user;
      
      if (currentUser) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', currentUser.id).single();
        if (profile) currentUser = { ...currentUser, ...profile };
        setUser(currentUser);
      } else {
        setEmailInputMode(true);
      }

      const [gamesRes, usersRes, postsRes] = await Promise.all([
        axios.get('/api/games'),
        axios.get('/api/users'),
        axios.get('/api/posts')
      ]);

      setGames(gamesRes.data || []);
      
      if (currentUser) {
        const [colRes, wishRes] = await Promise.all([
          supabase.from('collections').select('*').eq('user_id', currentUser.id),
          supabase.from('wishlists').select('*, games(*)').eq('user_id', currentUser.id)
        ]);
        setCollections(colRes.data || []);
        setWishlists(wishRes.data || []);
      }
    } catch (e) {
      console.error('Error fetching data', e);
    }
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempEmail) {
      setUser({ email: tempEmail, isGuest: true });
      setEmailInputMode(false);
      setMessages([{ role: 'assistant', content: `Hello! I see your email is ${tempEmail}. I am the Gaming Studio AI. How can I help you with our games today?` }]);
    }
  };

  const getSystemPrompt = () => {
    const userInfo = user ? `User Email: ${user.email}\nUser ID: ${user.id || 'guest'}` : 'User is not logged in.';
    const gamesList = games.map(g => `- ${g.data?.title} (Slug: ${g.slug}, Size: ${g.data?.size || 'Unknown'}, Platform: ${g.data?.category || 'Unknown'}, ID: ${g.id})`).join('\n');
    
    // Format wishlist and collections to pass as context
    const wishListContext = wishlists.map(w => `- ${w.games?.data?.title || 'Unknown Game'} (Size: ${w.games?.data?.size || 'Unknown'})`).join('\n');
    const colContext = collections.map(c => `- ${c.name}: ${c.games?.length || 0} games`).join('\n');

    return `You are the "Gaming Studio AI" agent for Game Studio.
You must ONLY help with Game Studio games, features, and website info.
If the user asks anything off-topic, reply exactly: "I can only help with Game Studio games and features."
You must output in Markdown. Use TABLES, **BIG and small BOLD TEXT** to highlight, and \`QUOTES\` for steps.

User Context:
${userInfo}

Available Games:
${gamesList}

User's Wishlist:
${wishListContext || 'Empty'}

User's Collections:
${colContext || 'Empty'}

Rules:
1. If the user wants a game not in the Available Games list, reply: "I don't have that yet. Want me to send a request to Admin on WhatsApp for you?"
2. If they say yes or ask to request a game, generate a WhatsApp link formatted exactly like this: [Send Request to Admin on WhatsApp](https://wa.me/255755123456?text=Game+Request:+{GAME_NAME}+|+From:+{USER_EMAIL})
3. When showing a game, use the exact format: **Here you go:** [{GAME_TITLE}](/game/{SLUG}) | Size: {SIZE} | {PLATFORM}
4. If asked to show wishlist or collection, present it as a Markdown TABLE with columns: Game | Size | Download
5. For account verification, explain the steps using quotes:
> **Step 1:** Upload your profile picture
> **Step 2:** Complete 3 downloads
> **Step 3:** Wait for admin approval. You will get the **BLUE VERIFIED BADGE**.
6. Auto-detect the user's language. Default is English, but reply in their language if different.
7. Site Knowledge: 1DM is the recommended Browser & Download Manager app to download 50GB+ games without failing.

If the user asks to add a game to their collection, YOU MUST USE the function call 'add_to_collection'. DO NOT just say it was added. Call the function with the game_id of the requested game.
`;
  };

  const sendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      let currentMessages = newMessages;
      let aiResponseComplete = false;

      while (!aiResponseComplete) {
        const payload = {
          model: 'llama-3.1-70b-versatile',
          messages: [
            { role: 'system', content: getSystemPrompt() },
            ...currentMessages
          ],
          tools: [
            {
              type: 'function',
              function: {
                name: 'add_to_collection',
                description: "Add a game to the user's collection",
                parameters: {
                  type: 'object',
                  properties: {
                    game_id: { type: 'string', description: 'The ID of the game to add' },
                    collection_name: { type: 'string', description: 'The name of the collection, default to Favorites' }
                  },
                  required: ['game_id']
                }
              }
            }
          ],
          tool_choice: 'auto'
        };

        const res = await axios.post('https://api.groq.com/openai/v1/chat/completions', payload, {
          headers: {
            'Authorization': `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json'
          }
        });

        const responseMessage = res.data.choices[0].message;

        if (responseMessage.tool_calls) {
          // Add the assistant's tool call message
          currentMessages = [...currentMessages, responseMessage];

          // Process tool calls
          for (const toolCall of responseMessage.tool_calls) {
            if (toolCall.function.name === 'add_to_collection') {
              const args = JSON.parse(toolCall.function.arguments);
              
              if (user && !user.isGuest) {
                await axios.post('/api/collections', {
                  userId: user.id,
                  gameId: args.game_id,
                  name: args.collection_name || 'Favorites'
                });
                
                currentMessages = [
                  ...currentMessages,
                  {
                    role: 'tool',
                    tool_call_id: toolCall.id,
                    name: toolCall.function.name,
                    content: 'Successfully added game to collection.'
                  }
                ];
              } else {
                currentMessages = [
                  ...currentMessages,
                  {
                    role: 'tool',
                    tool_call_id: toolCall.id,
                    name: toolCall.function.name,
                    content: 'Failed: User is not logged in. Tell the user to log in to save collections.'
                  }
                ];
              }
            }
          }
        } else {
          setMessages([...currentMessages, { role: 'assistant', content: responseMessage.content }]);
          aiResponseComplete = true;
        }
      }
    } catch (error) {
      console.error('AI Error:', error);
      setMessages([...newMessages, { role: 'assistant', content: 'Sorry, I encountered an error connecting to my brain. Please try again later.' }]);
    } finally {
      setLoading(false);
    }
  };

  if (emailInputMode) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="glass p-8 rounded-3xl w-full max-w-md bg-white/5 border border-white/10 text-center">
          <Bot size={48} className="mx-auto text-cyan-500 mb-6 drop-shadow-[0_0_15px_rgba(0,255,255,0.5)]" />
          <h2 className="text-2xl font-black text-white mb-4 glow-text">Gaming Studio AI</h2>
          <p className="text-gray-400 mb-6">Please enter your email to start the session.</p>
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <input 
              type="email" 
              required 
              value={tempEmail} 
              onChange={e => setTempEmail(e.target.value)} 
              className="w-full glass-dark rounded-xl px-4 py-3 outline-none focus:border-cyan-500 text-white border border-white/10" 
              placeholder="gamer@example.com" 
            />
            <button type="submit" className="w-full py-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-bold transition-all shadow-[0_0_15px_rgba(0,255,255,0.3)] glow-hover">
              Start AI Agent
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] md:h-screen bg-black">
      <div className="glass bg-white/5 border-b border-white/10 p-4 flex items-center justify-between sticky top-0 z-10 backdrop-blur-xl">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-500">
            <Bot size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black text-white glow-text">Gaming Studio AI</h1>
            <p className="text-xs text-cyan-500">Online & Ready</p>
          </div>
        </div>
        {user && (
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-white">{user.email}</p>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-50 space-y-4">
            <Bot size={64} className="text-cyan-500" />
            <p className="text-xl font-bold text-gray-400">How can I help you today, {user?.name || 'Gamer'}?</p>
          </div>
        )}

        {messages.filter(m => m.role !== 'tool').map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] md:max-w-[70%] rounded-2xl p-4 ${
              msg.role === 'user' 
                ? 'bg-cyan-500/20 border border-cyan-500/30 text-white' 
                : 'glass bg-white/5 border border-white/10 text-gray-200'
            }`}>
              <div className="flex items-center space-x-2 mb-2 opacity-70">
                {msg.role === 'user' ? <UserIcon size={16} /> : <Bot size={16} />}
                <span className="text-xs font-bold uppercase">{msg.role === 'user' ? 'You' : 'Gaming Studio AI'}</span>
              </div>
              <div className="prose prose-invert prose-cyan max-w-none prose-sm sm:prose-base
                prose-a:text-cyan-400 prose-a:no-underline hover:prose-a:text-cyan-300
                prose-table:border-collapse prose-table:w-full prose-table:my-4
                prose-th:bg-white/10 prose-th:p-3 prose-th:text-left prose-th:border prose-th:border-white/10
                prose-td:p-3 prose-td:border prose-td:border-white/10
                prose-blockquote:border-l-4 prose-blockquote:border-cyan-500 prose-blockquote:bg-white/5 prose-blockquote:p-4 prose-blockquote:rounded-r-xl prose-blockquote:font-normal prose-blockquote:not-italic
                prose-strong:text-white prose-strong:font-black
              ">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    a: ({node, ...props}) => {
                      const isWa = props.href?.includes('wa.me');
                      if (isWa) {
                        return (
                          <a 
                            {...props} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-block mt-4 w-full sm:w-auto px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-bold text-center transition-all shadow-[0_0_15px_rgba(0,255,255,0.3)] glow-hover"
                          >
                            {props.children}
                          </a>
                        );
                      }
                      return <a {...props} className="text-cyan-500 hover:text-cyan-400 font-bold transition-colors">{props.children}</a>;
                    }
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="glass bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center space-x-3 text-cyan-500">
              <Loader2 size={20} className="animate-spin" />
              <span className="text-sm font-bold">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-black/80 backdrop-blur-xl border-t border-white/10 sticky bottom-0">
        <form onSubmit={sendMessage} className="max-w-4xl mx-auto relative flex items-end gap-2">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Ask about games, wishlist, or request a new game..."
            className="w-full glass-dark rounded-2xl pl-4 pr-14 py-4 outline-none focus:border-cyan-500 text-white border border-white/10 resize-none min-h-[60px] max-h-[200px]"
            rows={1}
          />
          <button 
            type="submit" 
            disabled={!input.trim() || loading}
            className="absolute right-2 bottom-2 p-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white transition-colors disabled:opacity-50 disabled:hover:bg-cyan-500"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}
