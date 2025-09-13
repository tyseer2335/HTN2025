import 'dotenv/config';

const IMAGE_URLS = [
  'https://i.ibb.co/PsLMRpm2/1.png',
  'https://i.ibb.co/sp65HhXn/2.png',
  'https://i.ibb.co/xqNb9q3z/3.png',
];

const BLURB = `I spent two weeks in Japan, starting in Tokyo where I got lost in the energy of Shibuya Crossing and ate the best ramen of my life in a tiny shop tucked away in an alley. Then I took the bullet train to Kyoto, where I wandered through bamboo forests, visited golden temples, and even dressed up in a kimono for a day. One of the highlights was soaking in an onsen in Hakone with Mount Fuji in the distance. The mix of futuristic cities, peaceful shrines, and unforgettable food made the whole trip feel like stepping into another world.`;

async function urlToDataUrl(u) {
  const r = await fetch(u);
  if (!r.ok) throw new Error(`fetch ${u} -> ${r.status}`);
  const ct = r.headers.get('content-type') || 'image/png';
  const buf = Buffer.from(await r.arrayBuffer());
  return `data:${ct};base64,${buf.toString('base64')}`;
}

function buildMessage(blurb, dataUrls) {
  const textBlock = {
    type: 'text',
    text: [
      'You are an expert visual storyteller.',
      'Using the 3 photos and the trip blurb, create a sequential 5-panel storyboard.',
      '',
      'Each panel fields:',
      '- id: p1..p5',
      '- title: 2–6 words',
      '- description: 60–120 words (subject, setting, POV/shot, lighting, color mood, time of day, notable props).',
      '- keywords: 4–8 nouns/adjectives',
      '- iconPrompt: short low-poly 3D icon idea',
      '',
      'Return ONLY raw JSON (no markdown).',
      '',
      `TRIP BLURB: """${blurb}"""`,
    ].join('\n'),
  };

  const imageBlocks = dataUrls.map(d => ({ type: 'image_url', image_url: { url: d } }));
  return [{ role: 'user', content: [textBlock, ...imageBlocks] }];
}

async function main() {
  const API_KEY = process.env.COHERE_API_KEY;
  if (!API_KEY) throw new Error('Set COHERE_API_KEY in .env');

  // Convert remote images → base64 data URLs (Aya Vision docs use base64 here)
  const dataUrls = await Promise.all(IMAGE_URLS.map(urlToDataUrl));

  const body = {
    model: 'c4ai-aya-vision-32b',
    messages: buildMessage(BLURB, dataUrls),
    temperature: 0.2,
    max_tokens: 1500
  };

  const resp = await fetch('https://api.cohere.ai/v2/chat', {
    method: 'POST',
    headers: { Authorization: `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!resp.ok) {
    console.error('HTTP', resp.status, resp.statusText);
    console.error((await resp.text()).slice(0, 800));
    process.exit(1);
  }

  const data = await resp.json();
  const text = (data?.message?.content || []).find(b => b.type === 'text')?.text || '';
  // Aya Vision doesn’t support response_format, so we asked for “ONLY JSON”.
  // Try to parse; if it fails, log the preview so you can adjust the prompt.
  try {
    const storyboard = JSON.parse(text);
    console.log('Storyboard JSON:\n', JSON.stringify(storyboard, null, 2));
  } catch {
    console.log('Model returned non-JSON (preview):\n', text.slice(0, 400));
  }
}

main().catch(e => (console.error(e), process.exit(1)));
