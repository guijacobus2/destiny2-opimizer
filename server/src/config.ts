import 'dotenv/config';

export const config = {
  port: parseInt(process.env.PORT || '8787', 10),
  bungieApiKey: process.env.BUNGIE_API_KEY || '',
  clientId: process.env.BUNGIE_CLIENT_ID || '',
  clientSecret: process.env.BUNGIE_CLIENT_SECRET || '',
  redirectUri: process.env.BUNGIE_REDIRECT_URI || '',
  sessionSecret: process.env.SESSION_SECRET || 'dev_secret',
  clientAppOrigin: process.env.CLIENT_APP_ORIGIN || 'http://localhost:5173',
  apiRoot: 'https://www.bungie.net/Platform',
  oauth: {
    authorize: 'https://www.bungie.net/en/oauth/authorize',
    token: 'https://www.bungie.net/platform/app/oauth/token/',
  },
};
