// Standard English sample (from About page, can be replaced)
const ENGLISH_SAMPLE = `In the quiet town of Maple Hollow, time seemed to move differently. The mornings began not with the blaring noise of alarms but with the gentle chirping of birds and the soft golden light that streamed through the leaves of ancient oak trees.At the heart of the town stood a small, brick library, its worn steps and creaky doors offering a welcome to all who sought refuge in the world of words. Every morning, Ms. Penelope Hart, the town's beloved librarian, would unlock the doors precisely at nine o'clock, carrying with her a small basket filled with fresh scones she baked herself. Children would often race down the cobbled streets, their laughter echoing between the stone buildings, eager to claim their favorite reading nooks before they were taken. The library wasn't just a place to read; it was the beating heart of the community, a place where ideas blossomed and friendships were born. Old Mr. Whitaker, a retired sailor, spent hours telling tales of the sea to wide-eyed listeners, while young Emily Langston scribbled furiously in her notebook, dreaming of one day writing stories of her own. Outside, the seasons painted the town in vivid colors: spring's delicate pink blossoms, summer's rich green canopy, autumn's fiery reds and oranges, and winter's quiet, snowy hush. Festivals marked each change, with townsfolk gathering in the square to share food, music, and laughter under strings of twinkling lights. Life in Maple Hollow moved at a pace set by the rhythm of nature rather than the ticking of a clock, and few wished it any other way. Even the occasional visitor who stumbled upon the town often found themselves enchanted by its charm, lingering longer than they had planned. Some said it was the scent of fresh bread from the bakery on Main Street; others believed it was the warmth of the people, their sincere smiles and unwavering hospitality. Perhaps it was the way the stars shone so brightly at night, unpolluted by the harsh lights of the city, offering a breathtaking canopy to anyone who cared to look up. Whatever the reason, those who found their way to Maple Hollow rarely wanted to leave, and many who did left a piece of their heart behind. In a world that often seemed too fast, too loud, and too complicated, Maple Hollow remained a sanctuary of simplicity and connection, a gentle reminder that happiness often grows in the places we least expect it, nurtured by the small, everyday kindnesses of ordinary people living extraordinary lives. The clock tower that rose above the town square chimed every hour, its clear, resonant tones carrying on the breeze, not as a warning of time slipping away, but as an invitation to savor each passing moment. And so the days rolled on, one after another, a tapestry of memories woven with laughter, love, and an unspoken promise that here, in this little hollow sheltered by hills and hope, life would always be just a little sweeter, and dreams would always find a place to take root.`;

function encodeAscii(text: string): string[] {
  return text.split('');
}
function encodeOctal(text: string): string[] {
  return Array.from(text).map(c => c.charCodeAt(0).toString(8).padStart(3, '0')).join(' ').split(' ');
}
function encodeDecimal(text: string): string[] {
  return Array.from(text).map(c => c.charCodeAt(0).toString(10).padStart(3, '0')).join(' ').split(' ');
}
function encodeHex(text: string): string[] {
  return Array.from(text).map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join(' ').split(' ');
}
function encodeBase64(text: string): string[] {
  // atob/btoa only work with ascii, so use Buffer if available
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(text, 'utf-8').toString('base64').split('');
  } else if (typeof btoa !== 'undefined') {
    return btoa(unescape(encodeURIComponent(text))).split('');
  } else {
    // fallback: just return ascii
    return text.split('');
  }
}

const ENCODERS: Record<string, (text: string) => string[]> = {
  ascii: encodeAscii,
  octal: encodeOctal,
  decimal: encodeDecimal,
  hex: encodeHex,
  base64: encodeBase64,
};

const cache: Record<string, Record<string, number>> = {};

export function getReferenceDistribution(encoding: string): Record<string, number> {
  if (cache[encoding]) return cache[encoding];
  const encoder = ENCODERS[encoding] || encodeAscii;
  const symbols = encoder(ENGLISH_SAMPLE);
  const freq: Record<string, number> = {};
  for (const s of symbols) {
    freq[s] = (freq[s] || 0) + 1;
  }
  // Normalize to probabilities
  const total = symbols.length;
  for (const k in freq) {
    freq[k] /= total;
  }
  cache[encoding] = freq;
  return freq;
}