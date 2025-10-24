
export type ReviewInput = {
  family_name?: string;
  contact_email?: string;
  state?: string;
  wallet_address?: string;
  requested_amount?: number;
  documents: Array<{ id: string; doc_type?: string; filename: string; path: string; checksum?: string }>;
};

export type ReviewResult = {
  score: number; // 0-1
  summary: string;
  flags: string[];
};

// Simple deterministic heuristic stub. Replace with MCP/AI pipeline later.
export function reviewApplication(input: ReviewInput): ReviewResult {
  const flags: string[] = [];
  let score = 0.5;

  // Wallet sanity
  if (!input.wallet_address || !/^r[1-9A-HJ-NP-Za-km-z]{25,35}$/.test(input.wallet_address)) {
    flags.push('Invalid or missing XRPL wallet address');
    score -= 0.2;
  } else {
    score += 0.1;
  }

  // Required doc coverage
  const have = new Set(input.documents.map(d => (d.doc_type || '').toLowerCase()));
  if (!have.has('id')) { flags.push('Missing government ID'); score -= 0.2; } else { score += 0.1; }
  if (!have.has('address')) { flags.push('Missing proof of address'); score -= 0.1; } else { score += 0.05; }
  if (!have.has('income')) { flags.push('Missing proof of income/eligibility'); score -= 0.1; } else { score += 0.05; }

  // Basic email sanity
  if (!input.contact_email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(input.contact_email)) {
    flags.push('Invalid or missing contact email');
    score -= 0.05;
  }

  // Amount requested sanity
  if (typeof input.requested_amount === 'number') {
    if (input.requested_amount <= 0) { flags.push('Requested amount must be > 0'); score -= 0.1; }
    if (input.requested_amount > 1000) { flags.push('Requested amount unusually high'); }
  }

  // Deterministic “doc integrity” seed from checksums
  const concat = input.documents.map(d => d.checksum || d.filename).join('|');
  // Simple deterministic hash: sum char codes mod 256
  const sum = concat.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0) % 256;
  const bump = sum / 2560; // ~0..0.1
  score = Math.max(0, Math.min(1, score + bump));

  const summary = `Auto-review complete. Documents: ${input.documents.length}. Coverage: ${[...have].join(', ') || 'none'}. Flags: ${flags.join('; ') || 'none'}.`;
  return { score, summary, flags };
}
