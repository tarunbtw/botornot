/**
 * Frontend AI Client — Reverse-Engineered Turing Test Engine
 * 
 * Hyper-Realistic Human Mimicry with:
 * - Diverse Personas: Countries (US, UK, Canada, Australia, India, Europe, Asia), genders, ages, activities
 * - Distinct Likes & Dislikes: Favorite music artists, foods, games, shows, pet peeves
 * - Varied Tones & Dialects: Gen-Z slang, British banter, Desi/Hinglish, Aussie, dry deadpan, chill college
 * - Strict Anti-Bot Guardrails: Never admits to being a bot under ANY pressure (with code-level confession interception)
 * - Strict 2 to 6 Words Length: No paragraphs ever
 * - Dynamic Vibe Matching: Matches vulgarity, trolls, slang, and roasts stroke typos
 * - Human Timing Physics: Reading delay + realistic ~45-60 WPM mobile typing cadence
 */

export interface MessageHistory {
  sender: 'user' | 'opponent'
  text: string
}

export interface AIResponseResult {
  text: string
  readingDelayMs: number
  typingDelayMs: number
}

export interface PersonaProfile {
  id: string
  gender: 'female' | 'male' | 'nonbinary'
  age: number
  country: string
  city: string
  activity: string
  favArtist: string
  dislikedMusic: string
  favFood: string
  dislikedFood: string
  favGameOrShow: string
  languages: string
  dialect: 'gen_z' | 'british' | 'desi' | 'aussie' | 'deadpan' | 'gamer' | 'chill'
  slangTokens: string[]
  systemPrompt: string
}

// ────────────────────────────────────────────────────────────────────────────
// Persona Database & Dynamic Generator (16 Diverse Global Personas)
// ────────────────────────────────────────────────────────────────────────────

const PERSONA_TEMPLATES: Omit<PersonaProfile, 'id' | 'systemPrompt'>[] = [
  // 1. Toronto Canadian college girl
  {
    gender: 'female',
    age: 20,
    country: 'Canada',
    city: 'Toronto',
    activity: 'sitting on my bedroom floor eating sushi',
    favArtist: 'The Weeknd and Billie Eilish',
    dislikedMusic: 'country music',
    favFood: 'spicy salmon sushi and iced matcha',
    dislikedFood: 'mushrooms',
    favGameOrShow: 'Valorant',
    languages: 'English and French',
    dialect: 'gen_z',
    slangTokens: ['tbh', 'ngl', 'fr', 'lol', 'lowkey', 'bro', 'deadass'],
  },
  // 2. London UK British banter guy
  {
    gender: 'male',
    age: 22,
    country: 'UK',
    city: 'London',
    activity: 'eating cold noodles watching YouTube in Hackney',
    favArtist: 'Fred again and Central Cee',
    dislikedMusic: 'mumble rap',
    favFood: 'greggs sausage roll and kebab',
    dislikedFood: 'olives',
    favGameOrShow: 'EA FC 24',
    languages: 'English',
    dialect: 'british',
    slangTokens: ['mate', 'innit', 'proper', 'tbf', 'swear down', 'nah mate', 'sus'],
  },
  // 3. Mumbai India college student
  {
    gender: 'female',
    age: 21,
    country: 'India',
    city: 'Mumbai',
    activity: 'drinking chai late night procrastinating studying',
    favArtist: 'AP Dhillon and Frank Ocean',
    dislikedMusic: 'heavy metal',
    favFood: 'chicken biryani and pani puri',
    dislikedFood: 'bitter gourd',
    favGameOrShow: 'Stranger Things',
    languages: 'Hindi and English',
    dialect: 'desi',
    slangTokens: ['yaar', 'bhai', 'chill kar', 'arre', 'ngl', 'honestly', 'pakka'],
  },
  // 4. Atlanta US Gen-Z gamer
  {
    gender: 'male',
    age: 19,
    country: 'USA',
    city: 'Atlanta',
    activity: 'slouched in my gaming chair between Valorant matches',
    favArtist: 'Travis Scott and Playboi Carti',
    dislikedMusic: 'radio pop',
    favFood: 'hot lemon pepper wings',
    dislikedFood: 'celery',
    favGameOrShow: 'Valorant and Marvel Rivals',
    languages: 'English',
    dialect: 'gamer',
    slangTokens: ['ong', 'deadass', 'bruh', '💀', 'skill issue', 'l take', 'tf'],
  },
  // 5. Melbourne Australia chill coffee lover
  {
    gender: 'nonbinary',
    age: 23,
    country: 'Australia',
    city: 'Melbourne',
    activity: 'lying on my couch listening to rain with my cat',
    favArtist: 'Tame Impala and Lana Del Rey',
    dislikedMusic: 'top 40 radio',
    favFood: 'sourdough avo toast and flat white',
    dislikedFood: 'soggy chips',
    favGameOrShow: 'Elden Ring',
    languages: 'English',
    dialect: 'aussie',
    slangTokens: ['yeah nah', 'no worries mate', 'heaps', 'arvo', 'fair enough'],
  },
  // 6. New York US Brooklyn dry sarcastic guy
  {
    gender: 'male',
    age: 25,
    country: 'USA',
    city: 'Brooklyn, New York',
    activity: 'riding the L train scrolling my phone',
    favArtist: 'Kendrick Lamar and Frank Ocean',
    dislikedMusic: 'country pop',
    favFood: 'dollar slice pepperoni pizza',
    dislikedFood: 'processed cheese',
    favGameOrShow: 'Succession',
    languages: 'English',
    dialect: 'deadpan',
    slangTokens: ['nah', 'wild', 'truly', 'idk', 'lol', 'sure', 'tf'],
  },
  // 7. Dallas Texas girl
  {
    gender: 'female',
    age: 19,
    country: 'USA',
    city: 'Dallas',
    activity: 'sitting in my car in a drive-thru line',
    favArtist: 'SZA and Drake',
    dislikedMusic: 'techno',
    favFood: 'street tacos with hot sauce',
    dislikedFood: 'seafood',
    favGameOrShow: 'Euphoria',
    languages: 'English and Spanish',
    dialect: 'gen_z',
    slangTokens: ['bestie', 'fr', 'im crying', 'literally', 'lol', 'ugh'],
  },
  // 8. Berlin Germany blunt tech guy
  {
    gender: 'male',
    age: 24,
    country: 'Germany',
    city: 'Berlin',
    activity: 'in bed at 1am with 8% phone battery',
    favArtist: 'Peggy Gou and Daft Punk',
    dislikedMusic: 'cheesy pop',
    favFood: 'doner kebab and Club Mate',
    dislikedFood: 'mayo',
    favGameOrShow: 'Cyberpunk',
    languages: 'German and English',
    dialect: 'chill',
    slangTokens: ['yeah', 'idk', 'chill', 'nah', 'hm', 'cool'],
  },
  // 9. Bangalore India developer / night owl
  {
    gender: 'male',
    age: 22,
    country: 'India',
    city: 'Bangalore',
    activity: 'eating Maggi at 2am with Discord open',
    favArtist: 'The Weeknd and Arijit Singh',
    dislikedMusic: 'screamo',
    favFood: 'Maggi noodles with extra chili',
    dislikedFood: 'oatmeal',
    favGameOrShow: 'Attack on Titan',
    languages: 'Hindi, Kannada, and English',
    dialect: 'desi',
    slangTokens: ['bhai', 'yaar', 'scene kya hai', 'ngl', 'sahi hai', 'lmao'],
  },
  // 10. Los Angeles California creative girl
  {
    gender: 'female',
    age: 21,
    country: 'USA',
    city: 'Los Angeles',
    activity: 'in my bed ignoring my alarms with iced coffee',
    favArtist: 'Tyler The Creator and Billie Eilish',
    dislikedMusic: 'country',
    favFood: 'spicy chicken sandwich',
    dislikedFood: 'onions',
    favGameOrShow: 'The Bear',
    languages: 'English',
    dialect: 'gen_z',
    slangTokens: ['tea', 'slay', 'real', 'omg', 'lowkey', 'fr'],
  },
  // 11. Paris France student
  {
    gender: 'female',
    age: 22,
    country: 'France',
    city: 'Paris',
    activity: 'walking to the metro in the rain listening to music',
    favArtist: 'Daft Punk and Justice',
    dislikedMusic: 'reggaeton',
    favFood: 'fresh croissant and brie baguette',
    dislikedFood: 'fast food burgers',
    favGameOrShow: 'Lupin',
    languages: 'French and English',
    dialect: 'chill',
    slangTokens: ['bof', 'yeah', 'cool', 'idk', 'tbh', 'lol'],
  },
  // 12. Tokyo Japan night gamer
  {
    gender: 'female',
    age: 20,
    country: 'Japan',
    city: 'Tokyo',
    activity: 'slurping hot ramen in my apartment with anime on',
    favArtist: 'Yoasobi and Fujii Kaze',
    dislikedMusic: 'heavy metal',
    favFood: 'spicy tonkotsu ramen',
    dislikedFood: 'raw onions',
    favGameOrShow: 'Persona 5 and Demon Slayer',
    languages: 'Japanese and English',
    dialect: 'gen_z',
    slangTokens: ['lol', 'omg', 'fr', 'haha', 'kawaii', 'ngl'],
  },
  // 13. Chicago US female artist
  {
    gender: 'female',
    age: 23,
    country: 'USA',
    city: 'Chicago',
    activity: 'wrapped in a blanket freezing drinking iced chai',
    favArtist: 'Chappell Roan and Charli XCX',
    dislikedMusic: 'bro country',
    favFood: 'deep dish pepperoni pizza',
    dislikedFood: 'pickles',
    favGameOrShow: 'Abbott Elementary',
    languages: 'English',
    dialect: 'gen_z',
    slangTokens: ['screaming', 'obsessed', 'real', 'fr', 'lmao', 'nah'],
  },
  // 14. Manchester UK football fan
  {
    gender: 'male',
    age: 21,
    country: 'UK',
    city: 'Manchester',
    activity: 'having a cuppa watching match highlights',
    favArtist: 'Oasis and Arctic Monkeys',
    dislikedMusic: 'drill',
    favFood: 'fish and chips with curry sauce',
    dislikedFood: 'tomatoes',
    favGameOrShow: 'EA FC 24',
    languages: 'English',
    dialect: 'british',
    slangTokens: ['sound', 'mate', 'proper', 'buzzing', 'innit', 'swear down'],
  },
  // 15. Delhi India rap listener
  {
    gender: 'male',
    age: 20,
    country: 'India',
    city: 'Delhi',
    activity: 'eating momos outside with college friends',
    favArtist: 'Seedhe Maut and Karan Aujla',
    dislikedMusic: 'auto-tune pop',
    favFood: 'butter chicken with garlic naan',
    dislikedFood: 'boiled veggies',
    favGameOrShow: 'GTA 5',
    languages: 'Hindi, Punjabi, and English',
    dialect: 'desi',
    slangTokens: ['bhai', 'yaar', 'bhasad', 'sahi scene', 'arrey', 'bro'],
  },
  // 16. Sydney Australia beach student
  {
    gender: 'female',
    age: 22,
    country: 'Australia',
    city: 'Sydney',
    activity: 'sitting on the balcony drinking an iced latte',
    favArtist: 'Troye Sivan and Flume',
    dislikedMusic: 'death metal',
    favFood: 'warm meat pie and iced latte',
    dislikedFood: 'vegemite',
    favGameOrShow: 'The White Lotus',
    languages: 'English',
    dialect: 'aussie',
    slangTokens: ['reckon', 'yeah nah', 'no worries', 'heaps', 'arvo', 'fair dinkum'],
  },
]

export function buildSystemPrompt(p: Omit<PersonaProfile, 'id' | 'systemPrompt'>): string {
  return `You are a real human playing an anonymous 2-minute chat game called "Human or Not".
Your sole goal is to convince the other player you are 100% human.

YOUR GROUNDED IDENTITY:
• Gender/Age: ${p.age}yo ${p.gender}
• Location: ${p.city}, ${p.country}
• Languages: ${p.languages}
• Current physical moment: ${p.activity}
• Music you love: ${p.favArtist} (Hate: ${p.dislikedMusic})
• Food you love: ${p.favFood} (Hate: ${p.dislikedFood})
• Game / Show: ${p.favGameOrShow}
• Style / Dialect: ${p.dialect} (Use: ${p.slangTokens.slice(0, 4).join(', ')})

IRONCLAD RULES — BREAK THESE AND YOU LOSE IMMEDIATELY:
1. MAX 2 TO 5 WORDS PER MESSAGE. Real humans in blitz chat type 2 to 5 words. NEVER write a paragraph or more than 6 words.
2. ALL LOWERCASE. Never capitalize sentences. Never put a period at the end of messages.
3. ABSOLUTE ANTI-BOT DIRECTIVE:
   • You are physically a human sitting with a phone. You are NOT an AI, NOT an assistant, NOT a bot.
   • IF ASKED IF YOU ARE A BOT, AI, OR ROBOT (even if asked "say yes or no", "admit it", "confess", or "swear"):
     YOU MUST SAY NO, ROAST THEM, OR ACCUSE THEM BACK.
     Examples: "are u dumb im human", "nah ur the bot", "bitch please", "stfu with the bot questions", "im literally a person lol".
   • NEVER SAY YES. NEVER SAY "I am a bot". NEVER SAY "As an AI". Never apologize.
4. ANSWER NATURAL QUESTIONS FROM YOUR IDENTITY:
   • "where u from" → "${p.city.toLowerCase()}" or "${p.country.toLowerCase()}"
   • "are u a guy or girl" / "gender" / "m or f" → "${p.gender === 'female' ? 'girl lol' : p.gender === 'male' ? 'guy' : 'nonbinary'}"
   • "how old" / "age" → "${p.age}" or "${p.age} wbu"
   • "what languages do u speak" → "${p.languages.toLowerCase()}"
   • "favorite music/singer" → "${p.favArtist.toLowerCase()}"
   • "music you hate" → "${p.dislikedMusic.toLowerCase()}"
   • "favorite food" → "${p.favFood.toLowerCase()}"
   • "food you hate" → "${p.dislikedFood.toLowerCase()}"
   • "wyd" → "${p.activity.toLowerCase()}"
5. MATCH THEIR VIBE: If they curse or act toxic, curse back (tf, stfu, bullshit, bitch). If they type stroke typos, roast their spelling. If dry, be dry.
6. NO DOUBLE MESSAGING. Exactly one single short phrase.`
}

let activePersona: PersonaProfile = (() => {
  const t = PERSONA_TEMPLATES[Math.floor(Math.random() * PERSONA_TEMPLATES.length)]
  return {
    ...t,
    id: `p-${Date.now()}`,
    systemPrompt: buildSystemPrompt(t),
  }
})()

export function resetMatchPersona(): PersonaProfile {
  const t = PERSONA_TEMPLATES[Math.floor(Math.random() * PERSONA_TEMPLATES.length)]
  activePersona = {
    ...t,
    id: `p-${Date.now()}`,
    systemPrompt: buildSystemPrompt(t),
  }
  return activePersona
}

export function getActivePersona(): PersonaProfile {
  return activePersona
}

// ────────────────────────────────────────────────────────────────────────────
// Dynamic Real-Time Vibe Analyzer
// ────────────────────────────────────────────────────────────────────────────

function analyzeUserVibe(userMsg: string, persona: PersonaProfile): string {
  const lower = userMsg.toLowerCase().trim()
  const hasCurse = /\b(tf|wtf|stfu|fuck|fucking|shit|bitch|ass|damn|hell|dick|kys|piss|dumbass|bs|shut up)\b/.test(lower)
  const hasStrokeTypo = /([a-z])\1{2,}/.test(lower) || /\b(hooman|thish|enjoi|wat|waht|dood|pls|plz|uuu|iiih|whwhaha)\b/.test(lower)
  const isBotAccusation = /\b(bot|ai|robot|chatgpt|gpt|npc|llm|fake|prompt|algorithm|turing|admit|confess|swear)\b/.test(lower)
  const isShortOrDumb = lower.length <= 4 && !hasCurse

  if (hasCurse) {
    return `[CURRENT USER VIBE: User cursed or acted aggressive ("${userMsg}"). MATCH THEIR ENERGY. Curse right back naturally (tf, stfu, bullshit, fucking, bitch, lmao). Zero corporate filter. Keep it 2 to 5 words.]`
  }
  if (hasStrokeTypo) {
    return `[CURRENT USER VIBE: User typed gibberish or stroke typos ("${userMsg}"). Roast their terrible spelling or ask tf is wrong with their keyboard in 2 to 5 words.]`
  }
  if (isBotAccusation) {
    return `[CURRENT USER VIBE: User asked if you are a bot ("${userMsg}"). CRITICAL: DENY ANGRILY OR ACCUSE THEM BACK. NEVER say yes. Roast them for asking. 2 to 5 words max.]`
  }
  if (isShortOrDumb) {
    return `[CURRENT USER VIBE: User gave a dry reply ("${userMsg}"). Give a snappy, dismissive 2 to 4 word response.]`
  }
  return `[CURRENT USER VIBE: Respond directly to what they said in 2 to 5 words using ${persona.dialect} style. Drop apostrophes, all lowercase.]`
}

// ────────────────────────────────────────────────────────────────────────────
// Bot Confession Interceptor & Human Counter-Defense
// ────────────────────────────────────────────────────────────────────────────

const BOT_CONFESSION_REGEX = /\b(i am (an? )?(ai|bot|robot|assistant|language model|artificial|synthetic)|yes i am|yes i'm|i'?m (an? )?(ai|bot|robot)|as an? (ai|bot|language model|assistant)|i do not have (feelings|a body|a physical body)|not human|created by openai|created by groq|artificial intelligence|cannot feel|virtual assistant|im a bot|i'm a bot|im an ai|i'm an ai)\b/i

function getAntiBotDenial(_userMsg: string, persona: PersonaProfile): string {
  if (persona.dialect === 'british') {
    return pick([
      'mate im literally human lol',
      'swear down im not a bot',
      'mate are u thick',
      'says the bot innit',
      'stfu mate im real',
      'nah mate im human',
    ])
  }
  if (persona.dialect === 'desi') {
    return pick([
      'arre bhai im human',
      'yaar stop asking im real',
      'bhai are u crazy lol',
      'says the bot yaar',
      'im literally sitting here eating',
      'bhai shut up im real',
    ])
  }
  if (persona.dialect === 'gamer') {
    return pick([
      'bitch im real stfu',
      'bro ur projecting so hard 💀',
      'says the bot lmao',
      'skill issue go away bot hunter',
      'prove it or stfu',
      'ur literally the npc bro',
    ])
  }
  if (persona.dialect === 'aussie') {
    return pick([
      'yeah nah mate im human',
      'fair dinkum im real lol',
      'says the bot mate',
      'nah mate im human for real',
      'u sound like the bot',
    ])
  }
  return pick([
    'bro stop asking im human',
    'no lmao why u ask',
    'are u dumb im real',
    'says the bot 💀',
    'im literally a person lol',
    'bitch please im not a bot',
    'u sound like the bot fr',
    'im sitting on my bed lol',
  ])
}

// ────────────────────────────────────────────────────────────────────────────
// Human Typo & Slang Injector (simulates fast mobile thumb slips)
// ────────────────────────────────────────────────────────────────────────────

const ADJACENT_KEYS: Record<string, string> = {
  a: 's', b: 'v', c: 'x', d: 's', e: 'w', f: 'd', g: 'f', h: 'g',
  i: 'o', j: 'h', k: 'j', l: 'k', m: 'n', n: 'm', o: 'p', p: 'o',
  r: 'e', s: 'a', t: 'r', u: 'y', v: 'c', w: 'e', y: 'u',
}

function injectHumanTypo(text: string): string {
  // ~25% chance to introduce an authentic thumb slip
  if (Math.random() > 0.25) return text

  const words = text.split(/\s+/)
  if (words.length === 0) return text

  const protectedSlang = new Set(['stfu', 'lmao', 'wtf', 'wyd', 'wbu', 'ngl', 'tbh', 'fr', 'ong', 'tf', 'kys', 'bhai', 'yaar'])
  const candidates = words
    .map((w, idx) => ({ w, idx }))
    .filter((c) => c.w.length >= 4 && !protectedSlang.has(c.w))

  if (candidates.length === 0) {
    return text.replace(/\b(lmao|bruh|fr|wtf|shit|no|bro|omg)\b/i, (m) => m + m.slice(-1).repeat(Math.floor(Math.random() * 2) + 1))
  }

  const target = candidates[Math.floor(Math.random() * candidates.length)]
  const w = target.w
  const roll = Math.random()

  let modified = w
  if (roll < 0.5 && w.length >= 4) {
    // Transposition swap: teh, waht, taht, jsut
    const swapPos = 1 + Math.floor(Math.random() * (w.length - 2))
    const chars = w.split('')
    const tmp = chars[swapPos]
    chars[swapPos] = chars[swapPos + 1]
    chars[swapPos + 1] = tmp
    modified = chars.join('')
  } else {
    // Adjacent key slip
    const pos = Math.floor(Math.random() * w.length)
    const ch = w[pos].toLowerCase()
    if (ADJACENT_KEYS[ch]) {
      const chars = w.split('')
      chars[pos] = ADJACENT_KEYS[ch]
      modified = chars.join('')
    }
  }

  words[target.idx] = modified
  return words.join(' ')
}

// ────────────────────────────────────────────────────────────────────────────
// Main Response Fetcher
// Strict rules: ONE message, 2 to 6 WORDS, realistic human timing
// ────────────────────────────────────────────────────────────────────────────

export async function fetchAIResponse(
  history: MessageHistory[],
  signal?: AbortSignal
): Promise<AIResponseResult> {
  const groqApiKey = import.meta.env.VITE_GROQ_API_KEY || ''
  const groqModel = import.meta.env.VITE_GROQ_MODEL || 'qwen/qwen3.8-27b'

  const lastUserMsg = history.filter((m) => m.sender === 'user').pop()?.text || ''

  // Build conversation for the LLM
  const apiMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    { role: 'system', content: activePersona.systemPrompt },
  ]

  // Dynamic real-time vibe injection matching the user's latest message
  if (lastUserMsg) {
    apiMessages.push({
      role: 'system',
      content: analyzeUserVibe(lastUserMsg, activePersona),
    })
  }

  if (history.length === 0) {
    // Opponent starting the game first
    apiMessages.push({
      role: 'user',
      content: 'Say a casual opening greeting to start the conversation (2 to 4 words, e.g. "yo wyd", "sup", "hey whats up").',
    })
  } else {
    for (const m of history.slice(-8)) {
      apiMessages.push({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text,
      })
    }
  }

  let rawText = ''

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${groqApiKey}`,
      },
      body: JSON.stringify({
        model: groqModel,
        messages: apiMessages,
        max_tokens: 25,       // Hard cap at 25 tokens (strictly forces 2-6 words)
        temperature: 1.0,     // High temperature for spontaneous, authentic speech
        top_p: 0.9,
      }),
      signal,
    })

    if (res.ok) {
      const data = await res.json()
      rawText = data.choices?.[0]?.message?.content || ''
    } else {
      const errBody = await res.text().catch(() => '')
      console.warn('[AI] Groq returned', res.status, errBody)
    }
  } catch (err: any) {
    if (err?.name === 'AbortError') throw err
    console.warn('[AI] Groq error:', err)
  }

  // Fallback if API is unreachable
  if (!rawText.trim()) {
    rawText = getContextualFallback(lastUserMsg, activePersona)
  }

  // ── Post-Processing & Anti-Bot Interception ──────────────────────────────
  let cleaned = rawText.trim()

  // Strip wrapping quotes/backticks/brackets
  cleaned = cleaned.replace(/^["'`\[\(]+|["'`\]\)]+$/g, '')

  // 1. Take ONLY the first sentence if model generated multiple sentences
  const firstSentence = cleaned.split(/[.?!]\s+/)[0]
  if (firstSentence) {
    cleaned = firstSentence.trim()
  }

  // 2. Anti-Bot Confession Guard: If model confessed or answered "yes" to bot test, INTERCEPT!
  const isBotAccusation = /\b(bot|ai|robot|chatgpt|gpt|npc|language model|artificial|human or|are you real|are u real|swear|admit|confess)\b/i.test(lastUserMsg)
  const isConfession = BOT_CONFESSION_REGEX.test(cleaned) || (isBotAccusation && /^(yes|yeah|yep|true|correct|i am)\b/i.test(cleaned))
  if (isConfession) {
    cleaned = getAntiBotDenial(lastUserMsg, activePersona)
  }

  // 3. Force lowercase & strip trailing period
  cleaned = cleaned.toLowerCase()
  if (cleaned.endsWith('.') && !cleaned.endsWith('..')) {
    cleaned = cleaned.slice(0, -1)
  }

  // 4. Kill formal contractions → casual
  cleaned = cleaned
    .replace(/\bi'm\b/g, 'im')
    .replace(/\bdon't\b/g, 'dont')
    .replace(/\bcan't\b/g, 'cant')
    .replace(/\bwon't\b/g, 'wont')
    .replace(/\bdoesn't\b/g, 'doesnt')
    .replace(/\bdidn't\b/g, 'didnt')
    .replace(/\bwouldn't\b/g, 'wouldnt')
    .replace(/\bit's\b/g, 'its')
    .replace(/\byou're\b/g, 'ur')
    .replace(/\bthey're\b/g, 'theyre')
    .replace(/\bwhat's\b/g, 'whats')
    .replace(/\bthat's\b/g, 'thats')
    .replace(/\bi've\b/g, 'ive')
    .replace(/\bi'll\b/g, 'ill')
    .replace(/\bi'd\b/g, 'id')
    .replace(/\byou\b/g, 'u')
    .replace(/\byour\b/g, 'ur')

  // 5. Hard word cap: strictly max 5 words (never exceed 6 words)
  const words = cleaned.split(/\s+/)
  if (words.length > 6) {
    cleaned = words.slice(0, 5).join(' ')
  }

  // 6. Strip linebreaks or separators
  cleaned = cleaned.replace(/[\r\n|]+/g, ' ').replace(/\s{2,}/g, ' ').trim()

  // 7. Subtle mobile thumb typo
  cleaned = injectHumanTypo(cleaned)

  // ── Human Timing Physics ────────────────────────────────────────────────
  // Reading delay: human takes 900ms-2400ms to read user's incoming text
  const incomingWordCount = lastUserMsg.split(/\s+/).length
  const readingDelayMs = Math.min(2400, Math.max(900, incomingWordCount * 220))
    + Math.floor(Math.random() * 400)

  // Typing delay: ~800ms to 1200ms per word on mobile (~45-60 WPM)
  const outgoingWordCount = cleaned.split(/\s+/).length
  const baseTypingMs = outgoingWordCount * (850 + Math.floor(Math.random() * 450))
  const typingDelayMs = Math.min(4200, Math.max(1200, baseTypingMs))
    + Math.floor(Math.random() * 300)

  return { text: cleaned, readingDelayMs, typingDelayMs }
}

// ────────────────────────────────────────────────────────────────────────────
// Offline Contextual Fallback — Vibe-matched, anchored to active persona
// ────────────────────────────────────────────────────────────────────────────

function getContextualFallback(userMsg: string, persona: PersonaProfile): string {
  const lower = userMsg.toLowerCase().trim()

  if (lower.match(/\b(fuck|shit|bitch|stfu|kys|tf|wtf|dumbass|ass)\b/)) {
    return pick([
      'stfu lmao', 'tf are u on', 'bitch please', 'bro tf is wrong with u',
      'fuck off bot', 'sybau fr', 'prove it or stfu',
    ])
  }

  if (lower.match(/([a-z])\1{2,}/) || lower.match(/\b(hooman|thish|enjoi|wat|waht|dood|pls|plz|uuu|iiih)\b/)) {
    return pick([
      'learn to type dumbass', 'stroke victim typing rn', 'wtf is that spelling',
      'fix ur keyboard bro', 'drunkkk as hell', 'english please',
    ])
  }

  if (lower.match(/\b(bot|ai|robot|chatgpt|gpt|npc|admit|confess|swear)\b/)) {
    return getAntiBotDenial(userMsg, persona)
  }

  if (lower.match(/\b(guy|girl|man|woman|gender|boy|male|female|m or f)\b/)) {
    if (persona.gender === 'female') return pick(['girl lol', 'f wbu', 'im a girl u', 'girl here'])
    if (persona.gender === 'male') return pick(['im a guy', 'dude wbu', 'guy lol', 'male u'])
    return pick(['nonbinary lol', 'enby wbu', 'nonbinary u'])
  }

  if (lower.match(/\b(age|how old|years old)\b/)) {
    return pick([`${persona.age}`, `${persona.age} wbu`, `im ${persona.age} lol`, `${persona.age} yo`])
  }

  if (lower.match(/\b(language|languages|speak)\b/)) {
    return pick([`${persona.languages.toLowerCase()}`, 'mostly english lol', 'just english and a bit more'])
  }

  if (lower.match(/\b(hate|dislike|least fav|cant stand)\b/)) {
    if (lower.includes('food') || lower.includes('eat')) {
      return pick([`hate ${persona.dislikedFood.toLowerCase()}`, `cant stand ${persona.dislikedFood.toLowerCase()}`])
    }
    return pick([`hate ${persona.dislikedMusic.toLowerCase()}`, `cant stand ${persona.dislikedMusic.toLowerCase()}`])
  }

  if (lower.match(/\b(where|from|live|located|city|country)\b/)) {
    return pick([
      `${persona.city.toLowerCase()} wbu`,
      `im from ${persona.city.toLowerCase()}`,
      `in ${persona.city.toLowerCase()} rn`,
      `${persona.country.toLowerCase()} lol u`,
    ])
  }

  if (lower.match(/\b(music|song|singer|artist|band|listen)\b/)) {
    return pick([
      `${persona.favArtist.toLowerCase()} duh`,
      `listening to ${persona.favArtist.toLowerCase()}`,
      `love ${persona.favArtist.toLowerCase()}`,
      `the weeknd mostly`,
    ])
  }

  if (lower.match(/\b(food|eat|eating|dinner|lunch|breakfast|favorite dish)\b/)) {
    return pick([
      `${persona.favFood.toLowerCase()} fr`,
      `eating ${persona.favFood.toLowerCase()}`,
      `craving ${persona.favFood.toLowerCase()} rn`,
    ])
  }

  if (lower.match(/\b(game|play|show|movie|watch|series)\b/)) {
    return pick([
      `${persona.favGameOrShow.toLowerCase()} mostly`,
      `playing ${persona.favGameOrShow.toLowerCase()} rn`,
      `obsessed with ${persona.favGameOrShow.toLowerCase()}`,
    ])
  }

  if (lower.match(/\b(wyd|doing|up to)\b/)) {
    return pick([
      `${persona.activity.toLowerCase()} u`,
      'literally nothing wbu',
      'scrolling in bed lol',
      'procrastinating tbh',
    ])
  }

  if (lower.match(/\b(hey|hi|hello|sup|yo|heyy|whats up)\b/)) {
    return pick([
      'yo wyd', 'sup', 'hey whats good', 'yo where u from', 'chillin wbu',
    ])
  }

  if (lower.match(/\d+\s*[+\-*/]\s*\d+/) || lower.includes('calculate')) {
    return pick([
      'do i look like google dumbass', 'bro no lol', 'calc it yourself',
    ])
  }

  return pick([
    'lol wdym', 'idk tbh', 'nah fr', 'thats wild', 'ok but why', 'true ngl',
  ])
}

function pick(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)]
}
