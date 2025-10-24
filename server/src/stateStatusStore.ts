import fs from 'fs';
import path from 'path';

export type StateStatus = {
  state: string;
  status: 'unknown' | 'normal' | 'warning' | 'on_hold' | 'not_issuing';
  last_confirmed: string | null; // ISO timestamp
  source: string; // URL or note
};

const FILE_PATH = path.resolve('data', 'state_status.json');

export function loadStatuses(): StateStatus[] {
  const raw = fs.readFileSync(FILE_PATH, 'utf-8');
  return JSON.parse(raw) as StateStatus[];
}

export function saveStatuses(list: StateStatus[]) {
  fs.writeFileSync(FILE_PATH, JSON.stringify(list, null, 2));
}

export function upsertStatus(update: Omit<StateStatus, 'last_confirmed'> & { last_confirmed?: string | null }) {
  const list = loadStatuses();
  const idx = list.findIndex((x) => x.state.toLowerCase() === update.state.toLowerCase());
  const entry: StateStatus = {
    state: update.state,
    status: update.status,
    source: update.source || '',
    last_confirmed: update.last_confirmed ?? new Date().toISOString(),
  };
  if (idx >= 0) {
    list[idx] = entry;
  } else {
    list.push(entry);
  }
  saveStatuses(list);
  return entry;
}
