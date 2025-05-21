import removeMarkdown from 'remove-markdown';

export function markdownToText(input: string): string {
    let text = input;

    text = text.replace(/\$\$([^$]+)\$\$/g, (match, expr) =>
        `LaTeX expression: ${expr.trim()}`
    );

    text = text.replace(/\$([^$\n]+)\$/g, (match, expr) =>
        `LaTeX expression: ${expr.trim()}`
    );

    // Remove inline and block backticks
    text = text.replace(/`{3,}[\s\S]*?`{3,}/g, ''); // Remove code blocks
    text = text.replace(/`([^`]+)`/g, '$1'); // Remove inline code backticks

    text = removeMarkdown(text);

    // Keep only Latin letters, spaces, and common punctuation
    text = text.replace(/[^A-Za-z0-9 <>.,;:'"!?()\-\n]/g, '');

    return text.replace(/\n{2,}/g, '\n').trim();
}