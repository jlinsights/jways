import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import DashboardLayout from './pages/Dashboard';
import InstantQuote from './pages/InstantQuote';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/dashboard/*" element={<DashboardLayout />} />
      <Route path="/instant-quote" element={<InstantQuote />} />
    </Routes>
  );
}

export default App;
