import React from "react";

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function renderInline(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let rest = text;
  const patterns = [
    { type: "code", re: /`([^`]+)`/ },
    { type: "bold", re: /\*\*([^*]+)\*\*/ },
    { type: "italic", re: /\*([^*]+)\*/ },
    { type: "link", re: /\[([^\]]+)\]\(([^)]+)\)/ },
  ];
  while (rest.length) {
    let best: null | { m: RegExpExecArray; idx: number; type: string } = null;
    for (const p of patterns) {
      const m = p.re.exec(rest);
      if (m) {
        const idx = m.index;
        if (!best || idx < best.idx) best = { m, idx, type: p.type };
      }
    }
    if (!best) {
      nodes.push(rest);
      break;
    }
    if (best.idx > 0) nodes.push(rest.slice(0, best.idx));
    const [full, a, b] = best.m;
    if (best.type === "code") nodes.push(<code key={nodes.length}>{a}</code>);
    if (best.type === "bold") nodes.push(<strong key={nodes.length}>{a}</strong>);
    if (best.type === "italic") nodes.push(<em key={nodes.length}>{a}</em>);
    if (best.type === "link") nodes.push(<a key={nodes.length} href={b} target="_blank" rel="noreferrer">{a}</a>);
    rest = rest.slice(best.idx + full.length);
  }
  return nodes;
}

export default function Markdown({ source }: { source: string }) {
  const lines = source.split(/\r?\n/);
  const out: React.ReactNode[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (/^```/.test(line)) {
      const lang = line.replace(/```/, "").trim();
      i++;
      const buf: string[] = [];
      while (i < lines.length && !/^```/.test(lines[i])) {
        buf.push(lines[i]);
        i++;
      }
      i++;
      out.push(
        <pre key={`code-${i}`}>
          <code data-lang={lang}>{esc(buf.join("\n"))}</code>
        </pre>
      );
      continue;
    }
    const h = /^(#{1,6})\s+(.*)$/.exec(line);
    if (h) {
      const level = h[1].length;
      const content = renderInline(h[2]);
      const Tag = `h${Math.min(6, level)}` as keyof JSX.IntrinsicElements;
      out.push(<Tag key={`h-${i}`}>{content}</Tag>);
      i++;
      continue;
    }
    if (/^\s*[-*+]\s+/.test(line)) {
      const items: React.ReactNode[] = [];
      let j = i;
      while (j < lines.length && /^\s*[-*+]\s+/.test(lines[j])) {
        items.push(<li key={`li-${j}`}>{renderInline(lines[j].replace(/^\s*[-*+]\s+/, ""))}</li>);
        j++;
      }
      out.push(<ul key={`ul-${i}`}>{items}</ul>);
      i = j;
      continue;
    }
    if (/^\s*\d+\.\s+/.test(line)) {
      const items: React.ReactNode[] = [];
      let j = i;
      while (j < lines.length && /^\s*\d+\.\s+/.test(lines[j])) {
        items.push(<li key={`ol-${j}`}>{renderInline(lines[j].replace(/^\s*\d+\.\s+/, ""))}</li>);
        j++;
      }
      out.push(<ol key={`olwrap-${i}`}>{items}</ol>);
      i = j;
      continue;
    }
    if (/^>\s+/.test(line)) {
      const buf: string[] = [];
      let j = i;
      while (j < lines.length && /^>\s+/.test(lines[j])) {
        buf.push(lines[j].replace(/^>\s+/, ""));
        j++;
      }
      out.push(<blockquote key={`bq-${i}`}>{renderInline(buf.join(" "))}</blockquote>);
      i = j;
      continue;
    }
    if (/^\s*$/.test(line)) {
      i++;
      continue;
    }
    const buf: string[] = [line];
    let j = i + 1;
    while (j < lines.length && lines[j].trim() && !/^(#{1,6})\s+/.test(lines[j]) && !/^```/.test(lines[j]) && !/^\s*[-*+]\s+/.test(lines[j]) && !/^\s*\d+\.\s+/.test(lines[j]) && !/^>\s+/.test(lines[j])) {
      buf.push(lines[j]);
      j++;
    }
    out.push(<p key={`p-${i}`}>{renderInline(buf.join(" "))}</p>);
    i = j;
  }
  return <>{out}</>;
}

