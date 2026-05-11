import { marked } from 'marked';
import DOMPurify from 'dompurify';

marked.use({
  gfm: true,
  breaks: false,
});

export function renderMarkdown(src: string, onCheckboxToggle?: (lineIndex: number, checked: boolean) => void): string {
  const raw = marked.parse(src, { async: false }) as string;
  const sanitized = DOMPurify.sanitize(raw, {
    ADD_ATTR: ['target'],
    ALLOWED_URI_REGEXP: /^(?:(?:https?|ftp|mailto):|[^:]+$)/i,
  });

  if (!onCheckboxToggle) return sanitized;

  const container = document.createElement('div');
  container.innerHTML = sanitized;

  const lines = src.split('\n');
  const todoLineIndices: Array<{ text: string; index: number }> = [];
  lines.forEach((line, idx) => {
    if (/^[-*]\s+\[( |x|X)\]\s+/.test(line)) {
      const text = line.replace(/^[-*]\s+\[( |x|X)\]\s+/, '').trim();
      todoLineIndices.push({ text, index: idx });
    }
  });

  const checkboxes = container.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach((checkbox, i) => {
    const li = checkbox.closest('li');
    const liText = (li?.textContent || '').trim().replace(/\s+/g, ' ');
    const match = todoLineIndices.find((t) => {
      const normalized = t.text.replace(/\s+/g, ' ');
      return liText.includes(normalized) || normalized.includes(liText);
    });
    if (match) {
      (checkbox as HTMLInputElement).checked = /\[(x|X)\]/.test(lines[match.index]);
      checkbox.addEventListener('click', (e) => {
        e.preventDefault();
        const newChecked = !(checkbox as HTMLInputElement).checked;
        onCheckboxToggle(match.index, newChecked);
      });
    }
  });

  return container.innerHTML;
}
