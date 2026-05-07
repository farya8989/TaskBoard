import authReducer, { logout, clearError } from '../../store/authSlice';

const initialState = { token: null, user: null, loading: false, error: null };

describe('authSlice reducers', () => {
  it('logout clears token and user', () => {
    const state = { token: 'abc', user: { id: 1, name: 'Alice' }, loading: false, error: null };
    const next = authReducer(state, logout());
    expect(next.token).toBeNull();
    expect(next.user).toBeNull();
  });

  it('clearError resets error to null', () => {
    const state = { ...initialState, error: 'Something went wrong' };
    const next = authReducer(state, clearError());
    expect(next.error).toBeNull();
  });

  it('login.fulfilled sets token and user', () => {
    const action = {
      type: 'auth/login/fulfilled',
      payload: { token: 'jwt-token', userId: 1, name: 'Alice', email: 'alice@test.com' },
    };
    const next = authReducer(initialState, action);
    expect(next.token).toBe('jwt-token');
    expect(next.user.name).toBe('Alice');
    expect(next.user.email).toBe('alice@test.com');
    expect(next.loading).toBe(false);
  });

  it('login.pending sets loading to true and clears error', () => {
    const state = { ...initialState, error: 'old error' };
    const next = authReducer(state, { type: 'auth/login/pending' });
    expect(next.loading).toBe(true);
    expect(next.error).toBeNull();
  });

  it('login.rejected sets error message', () => {
    const next = authReducer(initialState, {
      type: 'auth/login/rejected',
      payload: 'Invalid email or password.',
    });
    expect(next.error).toBe('Invalid email or password.');
    expect(next.loading).toBe(false);
  });

  it('register.fulfilled sets token and user', () => {
    const action = {
      type: 'auth/register/fulfilled',
      payload: { token: 'jwt-token', userId: 2, name: 'Bob', email: 'bob@test.com' },
    };
    const next = authReducer(initialState, action);
    expect(next.token).toBe('jwt-token');
    expect(next.user.name).toBe('Bob');
  });

  it('register.rejected sets error message', () => {
    const next = authReducer(initialState, {
      type: 'auth/register/rejected',
      payload: 'Email is already registered.',
    });
    expect(next.error).toBe('Email is already registered.');
  });
});
