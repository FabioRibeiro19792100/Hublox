import assert from "node:assert/strict";
import { test } from "node:test";
import { finishRobloxSignIn, startRobloxSignIn } from "./robloxSignIn.js";

const API_URL = "http://localhost:8000";

function memoryStorage() {
  const data = new Map();
  return {
    getItem: (key) => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => data.set(key, String(value)),
    removeItem: (key) => data.delete(key),
  };
}

function fakeFetch(replies) {
  const calls = [];
  const fetch = async (url, options = {}) => {
    calls.push({ url, options });
    const reply = replies.shift();
    return { ok: reply.status < 400, status: reply.status, json: async () => reply.body };
  };
  return { fetch, calls };
}

const PROFILE = {
  roblox_numeric_id: 987654321,
  roblox_username: "builderzinho",
  display_name: "Builder Zinho",
  onboarding_seen: false,
};

test("start asks for a pairing and sends the browser to Roblox with the way back", async () => {
  const storage = memoryStorage();
  const { fetch, calls } = fakeFetch([
    { status: 201, body: { code: "ABC234", device_secret: "secret-1", interval: 5 } },
  ]);

  const url = await startRobloxSignIn({ apiUrl: API_URL, fetch, storage, returnTo: "http://localhost:5184/" });

  assert.equal(calls[0].url, `${API_URL}/api/auth/pairing/`);
  assert.equal(calls[0].options.method, "POST");
  assert.equal(
    url,
    `${API_URL}/auth/roblox/start/?code=ABC234&return_to=${encodeURIComponent("http://localhost:5184/")}`,
  );
  assert.deepEqual(JSON.parse(storage.getItem("hublox-roblox-pairing")), {
    code: "ABC234",
    device_secret: "secret-1",
  });
});

test("finish does nothing when no sign-in is pending", async () => {
  const { fetch, calls } = fakeFetch([]);

  const result = await finishRobloxSignIn({ apiUrl: API_URL, fetch, storage: memoryStorage() });

  assert.equal(result, null);
  assert.equal(calls.length, 0);
});

test("finish hands over the verified account and forgets the pairing", async () => {
  const storage = memoryStorage();
  storage.setItem("hublox-roblox-pairing", JSON.stringify({ code: "ABC234", device_secret: "secret-1" }));
  const { fetch, calls } = fakeFetch([
    { status: 200, body: { status: "ok", token: "token-xyz", expires_at: "2026-11-06T15:00:00", profile: PROFILE } },
  ]);

  const result = await finishRobloxSignIn({ apiUrl: API_URL, fetch, storage });

  assert.deepEqual(result, { status: "ok", token: "token-xyz", profile: PROFILE });
  assert.equal(calls[0].url, `${API_URL}/api/auth/pairing/poll/`);
  assert.deepEqual(JSON.parse(calls[0].options.body), { code: "ABC234", device_secret: "secret-1" });
  assert.equal(storage.getItem("hublox-roblox-pairing"), null);
});

test("finish keeps polling while Roblox has not confirmed yet", async () => {
  const storage = memoryStorage();
  storage.setItem("hublox-roblox-pairing", JSON.stringify({ code: "ABC234", device_secret: "secret-1" }));
  const { fetch, calls } = fakeFetch([
    { status: 200, body: { status: "pending" } },
    { status: 200, body: { status: "ok", token: "token-xyz", profile: PROFILE } },
  ]);

  const result = await finishRobloxSignIn({ apiUrl: API_URL, fetch, storage, wait: async () => {} });

  assert.equal(result.status, "ok");
  assert.equal(calls.length, 2);
});

test("finish fails when the code expired or was refused", async () => {
  for (const reply of [{ status: 200, body: { status: "expired" } }, { status: 403, body: { status: "forbidden" } }]) {
    const storage = memoryStorage();
    storage.setItem("hublox-roblox-pairing", JSON.stringify({ code: "ABC234", device_secret: "secret-1" }));
    const { fetch } = fakeFetch([reply]);

    const result = await finishRobloxSignIn({ apiUrl: API_URL, fetch, storage });

    assert.deepEqual(result, { status: "failed" });
    assert.equal(storage.getItem("hublox-roblox-pairing"), null);
  }
});

test("finish gives up after a few pending answers", async () => {
  const storage = memoryStorage();
  storage.setItem("hublox-roblox-pairing", JSON.stringify({ code: "ABC234", device_secret: "secret-1" }));
  const { fetch, calls } = fakeFetch(Array.from({ length: 10 }, () => ({ status: 200, body: { status: "pending" } })));

  const result = await finishRobloxSignIn({ apiUrl: API_URL, fetch, storage, wait: async () => {}, attempts: 3 });

  assert.deepEqual(result, { status: "failed" });
  assert.equal(calls.length, 3);
});
