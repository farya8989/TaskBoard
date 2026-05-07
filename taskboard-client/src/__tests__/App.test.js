import { render, screen } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import App from '../App';
import authReducer from '../store/authSlice';
import tasksReducer from '../store/tasksSlice';

function renderApp(preloadedState = {}) {
  const store = configureStore({
    reducer: { auth: authReducer, tasks: tasksReducer },
    preloadedState,
  });
  return render(
    <Provider store={store}>
      <App />
    </Provider>
  );
}

describe('App routing', () => {
  it('redirects unauthenticated users to login page', () => {
    renderApp({ auth: { token: null, user: null, loading: false, error: null } });
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('shows board page for authenticated users', () => {
    renderApp({
      auth: { token: 'valid-token', user: { id: 1, name: 'Alice', email: 'alice@test.com' }, loading: false, error: null },
      tasks: { items: [], loading: false, error: null },
    });
    expect(screen.getByText('TaskBoard')).toBeInTheDocument();
  });
});
