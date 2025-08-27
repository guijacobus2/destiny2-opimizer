import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from './config.js';
import './types.js';
import authRouter from './routes/auth.js';
import userRouter from './routes/user.js';
import profileRouter from './routes/profile.js';
import optimizerRouter from './routes/optimize.js';
import 'express-async-errors';

const app = express();
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser(config.sessionSecret));
app.use(cors({ origin: config.clientAppOrigin, credentials: true }));

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use('/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api', profileRouter);
app.use('/api', optimizerRouter);

// error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error', detail: err?.message || String(err) });
});

app.listen(config.port, () => {
  console.log(`Server listening on http://localhost:${config.port}`);
});
