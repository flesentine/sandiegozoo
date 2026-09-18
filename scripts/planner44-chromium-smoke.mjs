import { execFileSync, spawn, spawnSync } from "node:child_process";

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], ...options });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed with ${result.status}:\n${result.stdout ?? ""}\n${result.stderr ?? ""}`);
  }
  return result;
}

run("npm", ["run", "build", "--silent"]);

const preview = spawn("npm", ["run", "preview", "--", "--host", "127.0.0.1", "--port", "4173"], {
  stdio: ["ignore", "pipe", "pipe"],
  detached: false,
});

let previewOutput = "";
preview.stdout.on("data", chunk => { previewOutput += chunk.toString(); });
preview.stderr.on("data", chunk => { previewOutput += chunk.toString(); });

async function waitForPreview() {
  let lastError;
  for (let i = 0; i < 40; i += 1) {
    try {
      const response = await fetch("http://127.0.0.1:4173/");
      if (response.ok) return;
      lastError = new Error(`preview returned ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  throw new Error(`Vite preview did not become ready: ${lastError}\n${previewOutput}`);
}

function findBrowser() {
  for (const name of ["google-chrome", "google-chrome-stable", "chromium", "chromium-browser"]) {
    try {
      const path = execFileSync("which", [name], { encoding: "utf8" }).trim();
      if (path) return path;
    } catch {}
  }
  throw new Error("No Chromium/Chrome executable found on CI runner.");
}

try {
  await waitForPreview();
  const browser = findBrowser();
  const args = [
    "--headless=new",
    "--no-sandbox",
    "--disable-gpu",
    "--disable-dev-shm-usage",
    "--disable-background-networking",
    "--virtual-time-budget=5000",
    "--dump-dom",
    "http://127.0.0.1:4173/",
  ];
  const result = spawnSync(browser, args, { encoding: "utf8", timeout: 30000, maxBuffer: 10 * 1024 * 1024 });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`Chromium exited ${result.status}:\n${result.stderr ?? ""}`);
  }
  const dom = result.stdout ?? "";
  const rootMatch = dom.match(/<div id="root">([\s\S]*?)<\/div>/);
  if (!rootMatch || !rootMatch[1].trim()) {
    throw new Error(`Chromium loaded the page but React root stayed empty. DOM head:\n${dom.slice(0, 2000)}`);
  }
  if (!dom.includes("<title>WildRoute</title>")) {
    throw new Error("Chromium-rendered DOM lost the WildRoute document title.");
  }
  console.log("PLANNER44_CHROMIUM_SMOKE_PASS");
  console.log(`browser=${browser}`);
  console.log(`renderedDomBytes=${Buffer.byteLength(dom)}`);
  console.log(`rootPreview=${rootMatch[1].replace(/\s+/g, " ").slice(0, 400)}`);
} finally {
  preview.kill("SIGTERM");
}
