import { Request, Response, NextFunction } from 'express';
import { CONFIG } from '../config.js';

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const token = req.headers['x-admin-token'] as string | undefined;
  if (!token || token !== CONFIG.adminApiToken) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}