/**
 * Convert an emoji character to its Google Noto Animated Emoji GIF URL.
 * Google hosts animated emojis at:
 * https://fonts.gstatic.com/s/e/notoemoji/latest/{codepoints}/512.gif
 *
 * Codepoints are lowercase hex, joined by underscores for multi-codepoint emojis.
 */
export function getAnimatedEmojiUrl(emoji: string): string {
    const codepoints = [...emoji]
        .map((char) => {
            const cp = char.codePointAt(0);
            return cp ? cp.toString(16) : "";
        })
        .filter((cp) => cp && cp !== "fe0f") // Remove variation selectors
        .join("_");

    return `https://fonts.gstatic.com/s/e/notoemoji/latest/${codepoints}/512.gif`;
}

/**
 * Split a string of emojis into individual emoji characters.
 * Handles multi-byte emojis correctly using the Unicode segmenter pattern.
 */
export function splitEmojis(str: string): string[] {
    // Use spread to correctly split multi-byte emojis
    const chars = [...str.trim()];

    // Group characters that form a single emoji (ZWJ sequences etc.)
    const emojis: string[] = [];
    let current = "";

    for (const char of chars) {
        const cp = char.codePointAt(0) || 0;
        // Variation selectors and ZWJ should be merged with previous
        if (cp === 0xfe0f || cp === 0x200d) {
            current += char;
        } else if (current && current.endsWith("\u200d")) {
            // ZWJ sequence continues
            current += char;
        } else {
            if (current) emojis.push(current);
            current = char;
        }
    }
    if (current) emojis.push(current);

    return emojis;
}
