export function resolveImageUrl(apiBase, rawUrl) {
  if (!rawUrl) return "";
  if (/^(https?:\/\/|blob:|data:)/i.test(rawUrl)) return rawUrl;
  if (rawUrl.startsWith("/")) return `${apiBase}${rawUrl}`;
  return `${apiBase}/${rawUrl}`;
}
