import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // --- CORS HEADERS START ---
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000"); // Change to your prod domain for production
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }
  // --- CORS HEADERS END ---

  const { code } = req.query;
  if (!code || typeof code !== "string") {
    return res.status(400).json({ valid: false, error: "No code provided" });
  }

  const { data, error } = await supabase
    .from("app_codes")
    .select("id")
    .eq("code", code)
    .eq("active", true)
    .single();

  if (error) {
    return res.status(500).json({ valid: false, error: error.message });
  }

  if (data) return res.json({ valid: true });
  return res.json({ valid: false });
}
