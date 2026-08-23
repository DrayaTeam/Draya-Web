import {
  Component,
  ChangeDetectionStrategy,
  computed,
  inject,
  input,
  SecurityContext,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'draya-markdown-renderer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './markdown-renderer.component.html',
  styleUrl: './markdown-renderer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MarkdownRendererComponent {
  private readonly sanitizer = inject(DomSanitizer);

  /** Raw markdown content to parse and render */
  readonly content = input<string | undefined | null>('');

  /** Theme/variant: default or teal-tinted */
  readonly variant = input<'default' | 'teal' | 'slate'>('default');

  /** Parsed and sanitized HTML output */
  readonly parsedHtml = computed<SafeHtml>(() => {
    const raw = this.content() || '';
    const html = this.parseMarkdown(raw);
    return this.sanitizer.sanitize(SecurityContext.HTML, html)
      ? this.sanitizer.bypassSecurityTrustHtml(html)
      : '';
  });

  private parseMarkdown(text: string): string {
    if (!text || typeof text !== 'string') return '';

    // 1. Escape HTML special characters to prevent XSS
    let escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    // 2. Extract and preserve code blocks
    const codeBlocks: string[] = [];
    escaped = escaped.replace(/```([\s\S]*?)```/g, (_match, code: string) => {
      const idx = codeBlocks.length;
      codeBlocks.push(`<pre class="md-code-block"><code>${code.trim()}</code></pre>`);
      return `%%CODEBLOCK_${idx}%%`;
    });

    // 3. Process tables
    escaped = this.parseTables(escaped);

    // 4. Split into blocks/lines
    const lines = escaped.split('\n');
    const result: string[] = [];
    let inList = false;
    let listType: 'ul' | 'ol' = 'ul';

    for (const line of lines) {
      // Codeblock placeholder
      if (line.includes('%%CODEBLOCK_')) {
        if (inList) {
          result.push(`</${listType}>`);
          inList = false;
        }
        result.push(line);
        continue;
      }

      // Pre-rendered Table block
      if (line.includes('%%TABLE_BLOCK_')) {
        if (inList) {
          result.push(`</${listType}>`);
          inList = false;
        }
        result.push(line);
        continue;
      }

      // Horizontal Rule
      if (/^(\s*[-*_]\s*){3,}$/.test(line)) {
        if (inList) {
          result.push(`</${listType}>`);
          inList = false;
        }
        result.push('<hr class="md-hr" />');
        continue;
      }

      // Headings (###, ##, #)
      const h3Match = line.match(/^###\s+(.*)$/);
      if (h3Match) {
        if (inList) {
          result.push(`</${listType}>`);
          inList = false;
        }
        result.push(`<h4 class="md-h3">${this.parseInline(h3Match[1])}</h4>`);
        continue;
      }

      const h2Match = line.match(/^##\s+(.*)$/);
      if (h2Match) {
        if (inList) {
          result.push(`</${listType}>`);
          inList = false;
        }
        result.push(`<h3 class="md-h2">${this.parseInline(h2Match[1])}</h3>`);
        continue;
      }

      const h1Match = line.match(/^#\s+(.*)$/);
      if (h1Match) {
        if (inList) {
          result.push(`</${listType}>`);
          inList = false;
        }
        result.push(`<h2 class="md-h1">${this.parseInline(h1Match[1])}</h2>`);
        continue;
      }

      // Blockquotes (> Quote)
      const bqMatch = line.match(/^&gt;\s+(.*)$/);
      if (bqMatch) {
        if (inList) {
          result.push(`</${listType}>`);
          inList = false;
        }
        result.push(
          `<blockquote class="md-blockquote">${this.parseInline(bqMatch[1])}</blockquote>`,
        );
        continue;
      }

      // Unordered Lists (*, -, +)
      const ulMatch = line.match(/^[\s]*[-*+]\s+(.*)$/);
      if (ulMatch) {
        if (!inList || listType !== 'ul') {
          if (inList) result.push(`</${listType}>`);
          result.push('<ul class="md-ul">');
          inList = true;
          listType = 'ul';
        }
        result.push(`<li class="md-li">${this.parseInline(ulMatch[1])}</li>`);
        continue;
      }

      // Ordered Lists (1., 2., etc.)
      const olMatch = line.match(/^[\s]*\d+\.\s+(.*)$/);
      if (olMatch) {
        if (!inList || listType !== 'ol') {
          if (inList) result.push(`</${listType}>`);
          result.push('<ol class="md-ol">');
          inList = true;
          listType = 'ol';
        }
        result.push(`<li class="md-li">${this.parseInline(olMatch[1])}</li>`);
        continue;
      }

      // Blank line
      if (!line.trim()) {
        if (inList) {
          result.push(`</${listType}>`);
          inList = false;
        }
        continue;
      }

      // Regular Paragraph
      if (inList) {
        result.push(`</${listType}>`);
        inList = false;
      }
      result.push(`<p class="md-p">${this.parseInline(line)}</p>`);
    }

    if (inList) {
      result.push(`</${listType}>`);
    }

    let finalHtml = result.join('\n');

    // Restore Code blocks
    codeBlocks.forEach((cb, idx) => {
      finalHtml = finalHtml.replace(`%%CODEBLOCK_${idx}%%`, cb);
    });

    return finalHtml;
  }

  /**
   * Identifies Markdown tables and converts them to styled HTML tables.
   */
  private parseTables(text: string): string {
    const tableRegex = /((?:\|.+?\|\s*\n)+)/g;
    const tableBlocks: string[] = [];

    const replaced = text.replace(tableRegex, (match) => {
      const rows = match
        .trim()
        .split('\n')
        .map((r) => r.trim())
        .filter((r) => r.startsWith('|') && r.endsWith('|'));

      if (rows.length < 2) return match;

      // Check if second row is header separator (|---|---|)
      const separatorRow = rows[1];
      const isTable = /^\|(?:\s*:?-+:?\s*\|)+$/.test(separatorRow);
      if (!isTable) return match;

      const headerCells = rows[0]
        .slice(1, -1)
        .split('|')
        .map((c) => c.trim());

      const dataRows = rows.slice(2);

      let tableHtml = '<div class="md-table-wrapper"><table class="md-table"><thead><tr>';
      headerCells.forEach((h) => {
        tableHtml += `<th>${this.parseInline(h)}</th>`;
      });
      tableHtml += '</tr></thead><tbody>';

      dataRows.forEach((r) => {
        const cells = r
          .slice(1, -1)
          .split('|')
          .map((c) => c.trim());
        tableHtml += '<tr>';
        cells.forEach((c) => {
          tableHtml += `<td>${this.parseInline(c)}</td>`;
        });
        tableHtml += '</tr>';
      });

      tableHtml += '</tbody></table></div>';

      const placeholder = `%%TABLE_BLOCK_${tableBlocks.length}%%`;
      tableBlocks.push(tableHtml);
      return `\n${placeholder}\n`;
    });

    let result = replaced;
    tableBlocks.forEach((tb, idx) => {
      result = result.replace(`%%TABLE_BLOCK_${idx}%%`, tb);
    });

    return result;
  }

  /**
   * Parses inline markdown tokens: bold, italic, inline code, links.
   */
  private parseInline(text: string): string {
    return (
      text
        // Inline Code: `code`
        .replace(/`([^`]+)`/g, '<code class="md-inline-code">$1</code>')
        // Bold: **text** or __text__
        .replace(/\*\*(.*?)\*\*/g, '<strong class="md-strong">$1</strong>')
        .replace(/__([^_]+)__/g, '<strong class="md-strong">$1</strong>')
        // Italic: *text* or _text_
        .replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em class="md-em">$1</em>')
        .replace(/(?<!_)_([^_]+)_(?!_)/g, '<em class="md-em">$1</em>')
        // Links: [label](url)
        .replace(
          /\[([^\]]+)\]\(([^)]+)\)/g,
          '<a href="$2" target="_blank" rel="noopener noreferrer" class="md-link">$1</a>',
        )
    );
  }
}
