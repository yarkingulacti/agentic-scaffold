import { stdin as input, stdout as output } from "node:process";
import readline from "node:readline/promises";

function rl() {
  return readline.createInterface({ input, output });
}

export async function askProjectName(defaultName: string): Promise<string> {
  const r = rl();
  const answer = await r.question(`Project name [${defaultName}]: `);
  r.close();
  return answer.trim() || defaultName;
}

export async function askIssueTracker(detectedValue: string | null): Promise<string> {
  const r = rl();
  const defaultChoice = detectedValue || "linear";
  const defaultNum: Record<string, string> = { linear: "1", github: "2", both: "3" };
  const defaultDisplay = defaultNum[defaultChoice] || "1";
  console.log("\nIssue tracker type:");
  console.log("  1) Linear");
  console.log("  2) GitHub Issues");
  console.log("  3) Both");
  const answer = await r.question(`Choice [${defaultDisplay}]: `);
  r.close();
  const map: Record<string, string> = { "1": "linear", "2": "github", "3": "both" };
  return map[answer.trim()] || defaultChoice;
}

export async function askOverwrite(filePath: string): Promise<boolean> {
  const r = rl();
  const answer = await r.question(`  ${filePath} already exists. Overwrite? [y/N]: `);
  r.close();
  return answer.trim().toLowerCase() === "y";
}

export async function askComponents(): Promise<string[]> {
  const r = rl();
  console.log("\nComponent groups to include (comma-separated):");
  console.log("  docs, scripts, skills, hooks");
  const answer = await r.question("All [default]: ");
  r.close();
  const trimmed = answer.trim().toLowerCase();
  if (!trimmed) return ["docs", "scripts", "skills", "hooks"];
  return trimmed
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}
