import { readFile } from "node:fs/promises";

const token = process.env.BUTTONDOWN_API_KEY;
if (!token) {
  console.log("BUTTONDOWN_API_KEY is unset; newsletter delivery is inactive.");
  process.exit(0);
}

const releases = JSON.parse(await readFile(new URL("../newsletter-releases.json", import.meta.url), "utf8"));
const endpoint = "https://api.buttondown.com/v1/emails";
const headers = { Authorization: `Token ${token}`, "Content-Type": "application/json" };
const request = async (url, options = {}) => {
  const response = await fetch(url, { ...options, headers });
  if (!response.ok) throw new Error(`Buttondown API returned ${response.status}`);
  return response.json();
};

const existing = new Set();
let next = endpoint;
while (next) {
  const result = await request(next);
  if (!Array.isArray(result.results)) throw new Error("Unexpected Buttondown email list response");
  for (const email of result.results) if (email.slug) existing.add(email.slug);
  if (result.next) {
    const candidate = new URL(result.next, endpoint);
    if (candidate.origin !== new URL(endpoint).origin) throw new Error("Unexpected Buttondown pagination URL");
    next = candidate.href;
  } else next = null;
}

for (const release of releases) {
  if (release.number <= 1 || !release.url) continue;
  const slug = `paelen-comics-chapter-${release.number}`;
  if (existing.has(slug)) continue;
  const body = `Kaderin Çizdiği Rünler'in yeni bölümü yayında: ${release.title}\n\nBölümü oku: ${release.url}\n\nPaelen Comics`;
  await request(endpoint, { method: "POST", body: JSON.stringify({ subject: `Paelen Comics · Bölüm ${release.number}: ${release.title}`, slug, body, canonical_url: release.url, status: "about_to_send", metadata: { chapter: release.number, source: "paelen-comics-release" } }) });
  console.log(`Queued newsletter for chapter ${release.number}`);
}
