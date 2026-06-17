const reset = "\x1b[0m";

const c = {
  cyan: (s) => `\x1b[36m${s}${reset}`,
  green: (s) => `\x1b[32m${s}${reset}`,
  yellow: (s) => `\x1b[33m${s}${reset}`,
  dim: (s) => `\x1b[2m${s}${reset}`,
  bold: (s) => `\x1b[1m${s}${reset}`,
  gray: (s) => `\x1b[90m${s}${reset}`,
};

export function infoBox(rows) {
  const labelWidth = Math.max(...rows.map((r) => r[0].length));
  const sep = c.dim("│");
  const inner = rows.map(
    ([label, value]) => ` ${sep} ${c.bold(label.padEnd(labelWidth))} ${sep}  ${value}`
  );
  const title = c.cyan("agentic-scaffold");
  const w = Math.max(...inner.map((l) => l.length), title.length + 8);
  const top = ` ${c.dim("┌─ " + title + " " + "─".repeat(Math.max(0, w - title.length - 4)) + "┐")}`;
  const bottom = ` ${c.dim("└" + "─".repeat(w) + "┘")}`;
  return [top, ...inner, bottom].join("\n");
}

const spinnerFrames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

export function spinner(frame) {
  return c.cyan(spinnerFrames[frame % spinnerFrames.length]);
}

export function progressBar(current, total, width = 20) {
  if (total === 0) return "";
  let filled = Math.round((current / total) * width);
  if (current > 0 && filled === 0) filled = 1;
  const bar = c.cyan("█".repeat(filled)) + c.dim("░".repeat(width - filled));
  return `${bar} ${c.dim(`${current}/${total}`)}`;
}

export function summaryLine(text, type = "done") {
  const icon = type === "done" ? c.green("✔") : type === "warn" ? c.yellow("⚠") : c.dim("·");
  return ` ${icon}  ${text}`;
}

export { c as style };
