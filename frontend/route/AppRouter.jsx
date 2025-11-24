import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// pastikan nama persis sesuai file di /frontend/components
import Dashboard from '../components/Dashboard';
import WeatherPrediction from '../components/WeatherPrediction';
import PricePrediction from '../components/PricePrediction';
import SlopeAnalysis from '../components/SlopeAnalysis';
import UserManagement from '../components/UserManagement';
import PriceDataManagement from '../components/PriceDataManagement';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />}>
        <Route index element={<Dashboard />} />
        <Route path="prediksi-cuaca" element={<WeatherPrediction />} />
        <Route path="prediksi-harga" element={<PricePrediction />} />
        <Route path="analisis-lereng" element={<SlopeAnalysis />} />
        <Route path="user-management" element={<UserManagement />} />
        <Route path="price-management" element={<PriceDataManagement />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function AppRouter() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}