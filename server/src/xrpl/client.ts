import xrpl from 'xrpl';
import { CONFIG } from '../config.js';

let client: xrpl.Client | null = null;

export async function getClient(): Promise<xrpl.Client> {
  if (client && client.isConnected()) return client;
  client = new xrpl.Client(CONFIG.xrplWs);
  await client.connect();
  return client;
}

export async function closeClient() {
  if (client && client.isConnected()) {
    await client.disconnect();
  }
  client = null;
}