import type { Loadout } from "./types";

const API_BASE = "https://a41533c3a539.ngrok-free.app";

export async function getMe() {
  const res = await fetch(`${API_BASE}/api/user/me`, {
    credentials: "include",
  });
  return res.json();
}

export async function getProfile() {
  const res = await fetch(`${API_BASE}/api/profile`, {
    credentials: "include",
  });
  return res.json();
}

export async function optimize(
  weights: any,
  preferSet?: string,
  enforceOneExotic = true
) {
  const res = await fetch(`${API_BASE}/api/optimize`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ weights, preferSet, enforceOneExotic }),
  });
  return res.json();
}
