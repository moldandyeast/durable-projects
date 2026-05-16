export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function layoutPage(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>${escapeHtml(title)}</title>
  <style>
    :root {
      --fg: #111;
      --muted: #555;
      --bg: #fafafa;
      --card: #fff;
      --border: #e8e8e8;
      --accent: #2563eb;
    }
    * { box-sizing: border-box; }
    body {
      font-family: ui-sans-serif, system-ui, sans-serif;
      margin: 0;
      background: var(--bg);
      color: var(--fg);
      line-height: 1.5;
    }
    a { color: var(--accent); }
    main { max-width: 52rem; margin: 0 auto; padding: 1.5rem 1rem 4rem; }
    .muted { color: var(--muted); font-size: 0.9rem; }
    .tag {
      display: inline-block;
      padding: 0.15rem 0.5rem;
      border-radius: 999px;
      background: #eee;
      font-size: 0.75rem;
      margin-right: 0.35rem;
    }
  </style>
</head>
<body>
${body}
</body>
</html>`;
}
