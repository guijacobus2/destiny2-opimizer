import { Router } from 'express';

const router = Router();

router.get('/me', (req, res) => {
  try {
    const raw = req.cookies?.d2_session;
    if (!raw) return res.json({ authenticated: false });
    const session = JSON.parse(raw);
    res.json({ authenticated: true, membership: session.membership });
  } catch {
    res.json({ authenticated: false });
  }
});

export default router;
