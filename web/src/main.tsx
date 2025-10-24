import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import App from './App'
import './app.css'
import Donor from './views/Donor';
import Family from './views/Family';
import Merchant from './views/Merchant';
import Admin from './views/Admin';
import SnapData from './views/SnapData';
import SnapStatus from './views/SnapStatus';
import Concept from './views/Concept';
import BackOffice from './views/BackOffice';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}> 
          <Route index element={<div className="page">
            <h2>SNAP Aid Token</h2>
            <p>Select a portal or explore the concept:</p>
            <ul>
              <li><Link to="/donor">Donor</Link></li>
              <li><Link to="/family">Family</Link></li>
              <li><Link to="/merchant">Merchant</Link></li>
              <li><Link to="/admin">Admin</Link></li>
              <li><Link to="/data">SNAP by State</Link></li>
              <li><Link to="/status">State Status</Link></li>
              <li><Link to="/concept">Educational Concept</Link></li>
              <li><Link to="/backoffice">Back Office</Link></li>
            </ul>
            </div>} />
          <Route path="/donor" element={<Donor />} />
          <Route path="/family" element={<Family />} />
          <Route path="/merchant" element={<Merchant />} />
          <Route path="/admin" element={<Admin />} />
            <Route path="/data" element={<SnapData />} />
            <Route path="/status" element={<SnapStatus />} />
            <Route path="/concept" element={<Concept />} />
            <Route path="/backoffice" element={<BackOffice />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
