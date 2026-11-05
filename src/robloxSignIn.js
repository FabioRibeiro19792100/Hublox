const PAIRING_KEY = "hublox-roblox-pairing";
const POLL_DELAY_MS = 1000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function startRobloxSignIn({ apiUrl, fetch, storage, returnTo }) {
  const res = await fetch(`${apiUrl}/api/auth/pairing/`, { method: "POST" });
  if (!res.ok) throw new Error("pairing_failed");
  const { code, device_secret } = await res.json();
  storage.setItem(PAIRING_KEY, JSON.stringify({ code, device_secret }));
  return `${apiUrl}/auth/roblox/start/?code=${code}&return_to=${encodeURIComponent(returnTo)}`;
}

export async function finishRobloxSignIn({
  apiUrl,
  fetch,
  storage,
  wait = () => sleep(POLL_DELAY_MS),
  attempts = 5,
}) {
  const pending = storage.getItem(PAIRING_KEY);
  if (!pending) return null;
  storage.removeItem(PAIRING_KEY);

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    if (attempt > 0) await wait();
    const res = await fetch(`${apiUrl}/api/auth/pairing/poll/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: pending,
    });
    if (!res.ok) return { status: "failed" };
    const body = await res.json();
    if (body.status === "ok") return { status: "ok", token: body.token, profile: body.profile };
    if (body.status !== "pending") return { status: "failed" };
  }
  return { status: "failed" };
}

export function isRobloxSignInEnabled(env) {
  return env.VITE_ROBLOX_SIGN_IN === "true";
}
