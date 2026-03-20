import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const src = path.join(root, "src", "features", "app-shell", "stock-pro-app.tsx");
const lines = fs.readFileSync(src, "utf8").split(/\r?\n/);

function slice(a, b) {
  return lines.slice(a - 1, b).join("\n");
}

const chunks = {
  primitives: [126, 920],
  loginPage: [927, 1275],
  sidebar: [1281, 1405],
  header: [1411, 1704],
  kpICard: [1706, 1771],
  dashboardPage: [1777, 2411],
  produitsPage: [2412, 3148],
  clientsPage: [3149, 3616],
  rapportsPage: [3617, 3802],
  parametresPage: [3803, 5992],
  posPage: [5993, 6536],
  stockPage: [6537, 6970],
  fournisseursPage: [6971, 7352],
  achatsPage: [7353, 7996],
  facturationPage: [7997, 8482],
  stockProApp: [8484, 8928],
  floatingHelp: [8934, 9088],
  quickActionsFab: [9094, 9160],
  onboardingModal: [9196, 9289],
  networkStatus: [9295, 9349],
  retoursPage: [9355, 10354],
  scrollToTop: [10360, 10397],
  profilePage: [10403, 11058],
  keyboardShortcuts: [11064, 11179],
};

for (const [name, [from, to]] of Object.entries(chunks)) {
  const out = path.join(root, "scripts", "_extracted", `${name}.tsx.txt`);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, slice(from, to), "utf8");
  console.log(name, to - from + 1, "lines");
}
