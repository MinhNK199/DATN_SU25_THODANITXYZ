export const BAD_WORDS = [
    "đm", "dm", "cc", "vcl", "vđ", "cmm", "địt", "lồn", "cặc", "đụ", "fuck", "shit"
];

export function containsBadWords(text) {
    if (!text) return false;
    const pattern = new RegExp(BAD_WORDS.join("|"), "i");
    return pattern.test(text);
}

export function filterBadWords(text) {
    if (!text) return text;
    let filteredText = text;
    BAD_WORDS.forEach(word => {
        const regex = new RegExp(word, 'gi');
        filteredText = filteredText.replace(regex, '*'.repeat(word.length));
    });
    return filteredText;
}