import axios, { AxiosInstance } from 'axios';
import { config } from './config.js';
import qs from 'qs';

export class BungieApi {
  private client: AxiosInstance;

  constructor(private accessToken?: string) {
    this.client = axios.create({
      baseURL: config.apiRoot,
      headers: {
        'X-API-Key': config.bungieApiKey,
      },
    });
    if (accessToken) {
      this.client.interceptors.request.use((req) => {
        req.headers = req.headers || {};
        req.headers['Authorization'] = `Bearer ${accessToken}`;
        return req;
      });
    }
  }

  static async exchangeCode(code: string) {
    const body = qs.stringify({
      grant_type: 'authorization_code',
      code,
      client_id: config.clientId,
      client_secret: config.clientSecret,
    });
    const res = await axios.post(config.oauth.token, body, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    return res.data;
  }

  static async refreshToken(refreshToken: string) {
    const body = qs.stringify({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: config.clientId,
      client_secret: config.clientSecret,
    });
    const res = await axios.post(config.oauth.token, body, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    return res.data;
  }

  async getMembershipsForCurrentUser() {
    const res = await this.client.get('/User/GetMembershipsForCurrentUser/');
    return res.data.Response;
  }

  async getProfile(membershipType: number, destinyMembershipId: string, components: number[]) {
    const res = await this.client.get(
      `/Destiny2/${membershipType}/Profile/${destinyMembershipId}/`,
      { params: { components: components.join(',') } }
    );
    return res.data.Response;
  }

  async getDestinyEntityDefinition(entityType: string, hash: number) {
    // Returns JSON definition for a single entity
    const res = await this.client.get(`/Destiny2/Manifest/${entityType}/${hash}/`);
    return res.data.Response;
  }
}
