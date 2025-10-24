import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

const router = Router();

router.get('/snap-persons', (req: Request, res: Response) => {
  const format = String(req.query.format || 'json').toLowerCase();
  const jsonPath = path.resolve('data', 'snap_persons_may_2025.json');
  const csvPath = path.resolve('data', 'snap_persons_may_2025.csv');

  if (format === 'csv') {
    res.type('text/csv');
    return fs.createReadStream(csvPath).pipe(res);
  }

  const raw = fs.readFileSync(jsonPath, 'utf-8');
  const data = JSON.parse(raw) as { state: string; persons: number }[];

  const totalPersons = data.reduce((sum, row) => sum + row.persons, 0);

  // Estimated households is optional; use a conservative divisor, make it clear it's an estimate.
  const avgPersonsPerHousehold = 2.6;
  const withHouseholds = data.map((row) => ({
    ...row,
    estimated_households: Math.round(row.persons / avgPersonsPerHousehold),
  }));

  res.json({
    as_of: 'May 2025 (initial, preliminary)',
    source: 'USDA FNS state submissions',
    notes: [
      'Persons, not households',
      'Estimated households computed using 2.6 persons/household as a rough proxy; adjust as needed',
      'Puerto Rico, American Samoa, Northern Mariana Islands use Nutrition Assistance Grants and are not included in SNAP totals',
    ],
    total_persons: totalPersons,
    avg_persons_per_household: avgPersonsPerHousehold,
    records: withHouseholds,
  });
});

export default router;
