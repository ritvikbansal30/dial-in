// Runs once a day (see vercel.json) so the free Supabase project never looks inactive.
// Needs SUPABASE_URL and SUPABASE_ANON_KEY in Vercel's environment variables.
module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  const base = String(process.env.SUPABASE_URL || "").replace(/\/$/, "");
  const key = process.env.SUPABASE_ANON_KEY;
  if (!base || !key) return res.status(500).json({ ok: false, error: "not_configured" });
  const headers = { apikey: key };
  if (key.startsWith("eyJ")) headers.Authorization = "Bearer " + key; // older JWT-style keys
  const results = [];
  for (const path of ["beans?select=id&limit=1", "settings?select=user_id&limit=1", "beans?select=id&limit=1"]) {
    try { results.push((await fetch(base + "/rest/v1/" + path, { headers })).status); } catch (e) { results.push(0); }
  }
  res.status(200).json({ ok: results.some((s) => s >= 200 && s < 300), results });
};
