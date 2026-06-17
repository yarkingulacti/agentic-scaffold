import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

function rl() {
  return readline.createInterface({ input, output });
}

export async function askProjectName(defaultName) {
  const r = rl();
  const answer = await r.question(`Project name [${defaultName}]: `);
  r.close();
  return answer.trim() || defaultName;
}

export async function askIssueTracker(detectedValue) {
  const r = rl();
  const defaultChoice = detectedValue || "linear";
  const defaultNum = { linear: "1", github: "2", both: "3" }[defaultChoice] || "1";
  console.log("\nIssue tracker type:");
  console.log("  1) Linear");
  console.log("  2) GitHub Issues");
  console.log("  3) Both");
  const answer = await r.question(`Choice [${defaultNum}]: `);
  r.close();
  const map = { "1": "linear", "2": "github", "3": "both" };
  return map[answer.trim()] || defaultChoice;
}

export async function askOverwrite(filePath) {
  const r = rl();
  const answer = await r.question(`  ${filePath} already exists. Overwrite? [y/N]: `);
  r.close();
  return answer.trim().toLowerCase() === "y";
}

export async function askComponents() {
  const r = rl();
  console.log("\nComponent groups to include (comma-separated):");
  console.log("  docs, scripts, skills");
  const answer = await r.question("All [default]: ");
  r.close();
  const trimmed = answer.trim().toLowerCase();
  if (!trimmed) return ["docs", "scripts", "skills"];
  return trimmed.split(",").map((s) => s.trim()).filter(Boolean);
}
