import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppRoutes } from './AppRouter';

// mock komponen sesuai path nyata di folder components
jest.mock('../components/Dashboard', () => () => <div>DashboardPage</div>);
jest.mock('../components/WeatherPrediction', () => () => <div>WeatherPredictionPage</div>);
jest.mock('../components/PricePrediction', () => () => <div>PricePredictionPage</div>);
jest.mock('../components/SlopeAnalysis', () => () => <div>SlopeAnalysisPage</div>);
jest.mock('../components/UserManagement', () => () => <div>UserManagementPage</div>);
jest.mock('../components/PriceDataManagement', () => () => <div>PriceDataManagementPage</div>);

test('renders dashboard at /', () => {
  render(
    <MemoryRouter initialEntries={['/']}>
      <AppRoutes />
    </MemoryRouter>
  );
  expect(screen.getByText('DashboardPage')).toBeInTheDocument();
});

test('renders prediksi-cuaca route', () => {
  render(
    <MemoryRouter initialEntries={['/prediksi-cuaca']}>
      <AppRoutes />
    </MemoryRouter>
  );
  expect(screen.getByText('WeatherPredictionPage')).toBeInTheDocument();
});

test('renders user-management route', () => {
  render(
    <MemoryRouter initialEntries={['/user-management']}>
      <AppRoutes />
    </MemoryRouter>
  );
  expect(screen.getByText('UserManagementPage')).toBeInTheDocument();
});