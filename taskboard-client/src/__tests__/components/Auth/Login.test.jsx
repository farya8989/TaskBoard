import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../../test-utils';
import Login from '../../../components/Auth/Login';

jest.mock('../../../api/axios', () => ({
  default: { post: jest.fn(), get: jest.fn(), interceptors: { request: { use: jest.fn() } } },
}));

describe('Login', () => {
  it('renders email and password fields', () => {
    renderWithProviders(<Login />);
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Your password')).toBeInTheDocument();
  });

  it('renders Login button', () => {
    renderWithProviders(<Login />);
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('renders link to register page', () => {
    renderWithProviders(<Login />);
    expect(screen.getByText(/register/i)).toBeInTheDocument();
  });

  it('shows error when auth error exists in state', () => {
    renderWithProviders(<Login />, {
      preloadedState: {
        auth: { token: null, user: null, loading: false, error: 'Invalid email or password.' },
      },
    });
    expect(screen.getByText('Invalid email or password.')).toBeInTheDocument();
  });

  it('shows loading text on button when loading', () => {
    renderWithProviders(<Login />, {
      preloadedState: {
        auth: { token: null, user: null, loading: true, error: null },
      },
    });
    expect(screen.getByRole('button', { name: /logging in/i })).toBeInTheDocument();
  });

  it('updates email field on change', () => {
    renderWithProviders(<Login />);
    const input = screen.getByPlaceholderText('you@example.com');
    fireEvent.change(input, { target: { value: 'test@example.com' } });
    expect(input.value).toBe('test@example.com');
  });
});
