import { Ciphertext } from "@/types/ciphertext";
import { getProcessedText, genericizeText } from "@/utils/textUtils";
import { decodeText } from "@/utils/decoderUtils";

/**
 * Count the frequency of each ASCII character in the given text
 * @param text The text to analyze
 * @returns Array of character counts indexed by ASCII code
 */
function countAsciiCharacters(text: string): number[] {
    const counts = new Array(256).fill(0);
    for (const char of text) {
        const code = char.charCodeAt(0);
        if (code < 256) {
            counts[code]++;
        }
    }
    return counts;
}

/**
 * Process a single ciphertext input to create its distribution
 * @param input The ciphertext input to process
 * @returns Object containing the input data and character counts
 */
function processCiphertextInput(input: Ciphertext) {
    let textForAnalysis = input.text;

    // Apply encoding conversion rules for ASCII distribution:
    // - If text is ascii, we will not decode
    // - If text is non-ascii:
    //   - If it is genericized, we will NOT decode
    //   - If it is not genericized, we WILL decode
    if (input.encoding !== 'ascii' && !input.ignoreGenericization) {
        // Non-ascii and not genericized: decode to ASCII
        textForAnalysis = decodeText(input.text, input.encoding);
    }

    // Apply filters to the text for analysis
    let processedText = textForAnalysis;
    if (input.ignoreWhitespace) {
        processedText = processedText.replace(/\s/g, '');
    }
    if (input.ignorePunctuation) {
        processedText = processedText.replace(/[!"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~]/g, '');
    }
    if (input.ignoreCasing) {
        processedText = processedText.toLowerCase();
    }
    if (input.ignoreGenericization) {
        processedText = processedText ? genericizeText(processedText) : '';
    }

    const counts = countAsciiCharacters(processedText);
    return {
        text: input.text,
        processedText,
        color: input.color,
        encoding: input.encoding,
        counts
    };
}

/**
 * Determine the ASCII range based on the specified range type
 * @param asciiRange The type of range ('ascii', 'input', or default full range)
 * @param distributions The distributions to analyze for 'input' range
 * @returns Object containing start and end indices for the ASCII range
 */
function determineAsciiRange(asciiRange: string, distributions: Array<{ counts: number[] }>): { start: number; end: number } {
    if (asciiRange === 'ascii') {
        return { start: 0, end: 128 };
    }
    if (asciiRange === 'input') {
        return calculateInputRange(distributions);
    }
    // Default full range
    return { start: 0, end: 256 };
}

/**
 * Calculate the range based on actually used ASCII codes in the input
 * @param distributions The distributions to analyze
 * @returns Object containing start and end indices for the used ASCII range
 */
function calculateInputRange(distributions: Array<{ counts: number[] }>): { start: number; end: number } {
    const usedCodes = new Set<number>();
    distributions.forEach(dist => {
        dist.counts.forEach((count, code) => {
            if (count > 0) usedCodes.add(code);
        });
    });
    if (usedCodes.size === 0) {
        return { start: 0, end: 256 };
    }
    const usedCodesArr = Array.from(usedCodes);
    const start = Math.min(...usedCodesArr);
    const end = Math.max(...usedCodesArr) + 1;
    return { start, end };
}

/**
 * Get the ascii distributions of the provided ciphertext inputs for the given ascii range.
 * @param inputs a list of Ciphertext objects
 * @param asciiRange the ascii range to use for the distribution
 * @returns an object containing the distributions, start, and end of the ascii range
 */
export function getAsciiDistribution(inputs: Ciphertext[], asciiRange: string) {
    const distributions = inputs.map(processCiphertextInput);
    const { start, end } = determineAsciiRange(asciiRange, distributions);
    return { distributions, start, end };
}