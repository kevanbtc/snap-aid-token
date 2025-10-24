import { Outlet, Link } from 'react-router-dom';

export default function App() {
  return (
    <div>
      <header className="header">
        <Link to="/">SNAP Aid Token</Link>
        <nav className="nav">
          <details>
            <summary>SNAP ▾</summary>
            <ul className="menu">
              <li><Link to="/data">SNAP by State</Link></li>
              <li><Link to="/status">State Status</Link></li>
            </ul>
          </details>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
