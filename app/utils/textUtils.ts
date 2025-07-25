import { Ciphertext } from '@/types/ciphertext';

/**
 * Genericizes text by replacing characters with letters based on frequency
 * Higher frequency characters get earlier letters (A, B, C, etc.)
 * Ties are broken by which character appears first in the text
 */
export function genericizeText(text: string): string {
  if (!text) return '';

  // Expanded character set: all ASCII letters, digits, and a wide range of Unicode symbols (excluding whitespace, punctuation, and ambiguous symbols)
  // This set includes: A-Z, a-z, 0-9, Greek, Cyrillic, math symbols, and some safe symbols
  const genericChars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789' +
    'αβγδεζηθικλμνξοπρστυφχψωΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ' +
    'абвгдеёжзийклмнопрстуфхцчшщъыьэюяАБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ' +
    '∆∑∏∫√∞≈≠≤≥±÷×§¶•ªº¿¡¤¢£¥₩₪₽₴₦₨₱₲₵₸₺₼₽₾₿ℂℇ℉ℋℌℍℎℏℐℑℒℓℕℙℚℛℜℝℤℨℬℭℯℰℱℲℳℴℵℶℷℸℹ℺℻ℼℽℾℿ⅀⅁⅂⅃⅄ⅅⅆⅇⅈⅉ⅊⅋⅌⅍ⅎ⅏⅐⅑⅒⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞ↄↅↆↇↈ↉↊↋↌↍↎↏←↑→↓↔↕↖↗↘↙↚↛↜↝↞↟↠↡↢↣↤↥↦↧↨↩↪↫↬↭↮↯↰↱↲↳↴↵↶↷↸↹↺↻↼↽↾↿⇀⇁⇂⇃⇄⇅⇆⇇⇈⇉⇊⇋⇌⇍⇎⇏⇐⇑⇓⇔⇕⇖⇗⇘⇙⇚⇛⇜⇝⇞⇟⇠⇡⇢⇣⇤⇥⇦⇧⇨⇩⇪⇫⇬⇭⇮⇯⇰⇱⇲⇳⇴⇵⇶⇷⇸⇹⇺⇻⇼⇽⇾⇿';

  // Count character frequencies
  const charCounts = new Map<string, number>();
  const charOrder = new Map<string, number>();

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    charCounts.set(char, (charCounts.get(char) || 0) + 1);
    if (!charOrder.has(char)) {
      charOrder.set(char, i);
    }
  }

  // Sort characters by frequency (descending), then by first appearance
  const sortedChars = Array.from(charCounts.entries()).sort((a, b) => {
    const [charA, countA] = a;
    const [charB, countB] = b;

    if (countA !== countB) {
      return countB - countA; // Higher frequency first
    }

    // Ties broken by which character came first
    return (charOrder.get(charA) || 0) - (charOrder.get(charB) || 0);
  });

  // Create mapping from original char to generic char
  const charToGeneric = new Map<string, string>();
  sortedChars.forEach(([char], index) => {
    if (index < genericChars.length) {
      charToGeneric.set(char, genericChars[index]);
    }
  });

  // Apply genericization
  return text.split('').map(char => charToGeneric.get(char) || char).join('');
}

/**
 * Gets the processed text based on input settings
 * Applies ignorePunctuation, ignoreWhitespace, ignoreCasing, and ignoreGenericization
 */
export function getProcessedText(input: Ciphertext): string {
  let processedText = input.text;

  // Apply filters first
  if (input.ignoreWhitespace) {
    processedText = processedText.replace(/\s/g, '');
  }
  if (input.ignorePunctuation) {
    processedText = processedText.replace(/[!"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~]/g, '');
  }
  if (input.ignoreCasing) {
    processedText = processedText.toLowerCase();
  }

  // Apply genericization last (if enabled)
  if (input.ignoreGenericization) {
    processedText = processedText ? genericizeText(processedText) : '';
  }

  return processedText;
}