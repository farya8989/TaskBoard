import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../../test-utils';
import Register from '../../../components/Auth/Register';

jest.mock('../../../api/axios', () => ({
  default: { post: jest.fn(), get: jest.fn(), interceptors: { request: { use: jest.fn() } } },
}));

describe('Register', () => {
  it('renders name, email and password fields', () => {
    renderWithProviders(<Register />);
    expect(screen.getByPlaceholderText('Your name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Min. 6 characters')).toBeInTheDocument();
  });

  it('renders Register button', () => {
    renderWithProviders(<Register />);
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
  });

  it('renders link to login page', () => {
    renderWithProviders(<Register />);
    expect(screen.getByText(/login/i)).toBeInTheDocument();
  });

  it('shows error when auth error exists in state', () => {
    renderWithProviders(<Register />, {
      preloadedState: {
        auth: { token: null, user: null, loading: false, error: 'Email is already registered.' },
      },
    });
    expect(screen.getByText('Email is already registered.')).toBeInTheDocument();
  });

  it('shows loading text on button when loading', () => {
    renderWithProviders(<Register />, {
      preloadedState: {
        auth: { token: null, user: null, loading: true, error: null },
      },
    });
    expect(screen.getByRole('button', { name: /creating account/i })).toBeInTheDocument();
  });

  it('updates name field on change', () => {
    renderWithProviders(<Register />);
    const input = screen.getByPlaceholderText('Your name');
    fireEvent.change(input, { target: { value: 'Alice' } });
    expect(input.value).toBe('Alice');
  });
});
