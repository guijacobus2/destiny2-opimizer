import { Router } from "express";
import { config } from "../config.js";
import { BungieApi } from "../bungie.js";
import type { D2Session, DestinyMembership } from "../types.js";

const router = Router();

function toCookie(session: D2Session) {
  return {
    httpOnly: true,
    sameSite: "none" as const, // allow cross-site XHR
    secure: true,
    maxAge: 1000 * 60 * 60 * 24 * 30,
  };
}

router.get("/login", (req, res) => {
  const state = Math.random().toString(36).slice(2);
  const url = new URL(config.oauth.authorize);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", config.clientId);
  url.searchParams.set("state", state);
  // Optional: scope not required for basic profile, but include if desired
  // url.searchParams.set('scope', 'ReadBasicUserProfile');
  res.redirect(url.toString());
});

router.get("/callback", async (req, res) => {
  const code = String(req.query.code || "");
  if (!code) return res.status(400).send("Missing code");
  const token = await BungieApi.exchangeCode(code);
  const session: D2Session = {
    access_token: token.access_token,
    refresh_token: token.refresh_token,
    expires_at: Date.now() + (token.expires_in * 1000 - 30_000),
  };
  // Get memberships
  const api = new BungieApi(session.access_token);
  const memberships = await api.getMembershipsForCurrentUser();
  const primary = memberships?.destinyMemberships?.[0];
  if (primary) {
    session.membership = {
      membershipId: primary.membershipId,
      membershipType: primary.membershipType,
    } as DestinyMembership;
  }

  res.cookie("d2_session", JSON.stringify(session), toCookie(session));
  res.redirect(config.clientAppOrigin);
});

router.post("/logout", (req, res) => {
  res.clearCookie("d2_session");
  res.json({ ok: true });
});

export default router;
