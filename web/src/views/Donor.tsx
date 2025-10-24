import { useEffect, useState } from 'react';
import { api } from '../api';

export default function Donor() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => {
    api.get('/donor/ledger').then(r => setRows(r.data.issuances || [])).catch(() => setRows([]));
  }, []);

  return (
    <div className="page">
      <h2>Donor Ledger</h2>
      <p>Recent issuances (transparency)</p>
      <table>
        <thead>
          <tr><th>Amount</th><th>TX</th><th>Date</th></tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id}>
              <td>{r.amount}</td>
              <td>{r.tx_hash || '-'}</td>
              <td>{r.created_at}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}