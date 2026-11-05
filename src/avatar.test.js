import assert from "node:assert/strict";
import { test } from "node:test";
import { isWebImageUrl } from "./avatar.js";

test("accepts the https thumbnails the Roblox web API returns", () => {
  assert.equal(isWebImageUrl("https://tr.rbxcdn.com/30DAY-AvatarHeadshot-2524/150/150/AvatarHeadshot/Png/noFilter"), true);
});

test("rejects the rbxthumb addresses that only work inside the Roblox engine", () => {
  assert.equal(isWebImageUrl("rbxthumb://type=AvatarHeadShot&id=7063736477&w=100&h=100"), false);
});

test("rejects empty or missing avatars", () => {
  assert.equal(isWebImageUrl(""), false);
  assert.equal(isWebImageUrl(null), false);
  assert.equal(isWebImageUrl(undefined), false);
});
