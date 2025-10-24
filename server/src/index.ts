import express, { Request, Response } from 'express';
import cors from 'cors';
import { CONFIG } from './config.js';
import adminRoutes from './routes/admin.js';
import donorRoutes from './routes/donor.js';
import familyRoutes from './routes/family.js';
import merchantRoutes from './routes/merchant.js';
import dataRoutes from './routes/data.js';
import stateStatusRoutes from './routes/stateStatus.js';
import xrplRoutes from './routes/xrpl.js';
import applicationsRoutes from './routes/applications.js';

const app = express();
app.use(cors());
app.use(express.json());
// Static serving for uploaded documents (prototype convenience)
app.use('/uploads', express.static('uploads'));

app.get('/health', (_req: Request, res: Response) => res.json({ ok: true }));

app.use('/api/admin', adminRoutes);
app.use('/api/donor', donorRoutes);
app.use('/api/family', familyRoutes);
app.use('/api/merchant', merchantRoutes);
app.use('/api/data', dataRoutes);
app.use('/api', stateStatusRoutes);
app.use('/api/xrpl', xrplRoutes);
app.use('/api/applications', applicationsRoutes);

app.listen(CONFIG.port, () => {
  console.log(`Server running on http://localhost:${CONFIG.port}`);
});