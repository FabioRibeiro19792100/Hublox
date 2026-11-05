export function isWebImageUrl(url) {
  return typeof url === "string" && /^https?:\/\//.test(url);
}
