import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../pages/App';

jest.mock('../state/DataContext', () => ({
  DataProvider: ({ children }) => children,
  useData: () => ({
    pagination: {
      items: [{ id: 1, name: 'Laptop Pro', category: 'Electronics', price: 2499 }],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    },
    loading: false,
    error: null,
    fetchItems: jest.fn(),
  }),
}));

test('renders item catalog heading', () => {
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );

  expect(screen.getByRole('heading', { name: /items/i })).toBeInTheDocument();
  expect(screen.getByText('Laptop Pro')).toBeInTheDocument();
});
