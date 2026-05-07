import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../../test-utils';
import TaskCard from '../../../components/Task/TaskCard';

jest.mock('../../../api/axios', () => ({
  default: { delete: jest.fn(), patch: jest.fn(), interceptors: { request: { use: jest.fn() } } },
}));

const baseTask = {
  id: 1,
  title: 'Fix login bug',
  description: 'The login button is broken',
  priority: 'High',
  status: 'Todo',
  dueDate: null,
};

describe('TaskCard', () => {
  it('renders task title', () => {
    renderWithProviders(<TaskCard task={baseTask} onEdit={jest.fn()} />);
    expect(screen.getByText('Fix login bug')).toBeInTheDocument();
  });

  it('renders priority badge', () => {
    renderWithProviders(<TaskCard task={baseTask} onEdit={jest.fn()} />);
    expect(screen.getByText('High')).toBeInTheDocument();
  });

  it('renders description', () => {
    renderWithProviders(<TaskCard task={baseTask} onEdit={jest.fn()} />);
    expect(screen.getByText('The login button is broken')).toBeInTheDocument();
  });

  it('renders Edit and Delete buttons', () => {
    renderWithProviders(<TaskCard task={baseTask} onEdit={jest.fn()} />);
    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('shows → move button for Todo status', () => {
    renderWithProviders(<TaskCard task={baseTask} onEdit={jest.fn()} />);
    expect(screen.getByTitle('Move to InProgress')).toBeInTheDocument();
  });

  it('shows both ← and → buttons for InProgress status', () => {
    const task = { ...baseTask, status: 'InProgress' };
    renderWithProviders(<TaskCard task={task} onEdit={jest.fn()} />);
    expect(screen.getByTitle('Move to Todo')).toBeInTheDocument();
    expect(screen.getByTitle('Move to Done')).toBeInTheDocument();
  });

  it('shows only ← button for Done status', () => {
    const task = { ...baseTask, status: 'Done' };
    renderWithProviders(<TaskCard task={task} onEdit={jest.fn()} />);
    expect(screen.getByTitle('Move to InProgress')).toBeInTheDocument();
    expect(screen.queryByTitle('Move to Done')).not.toBeInTheDocument();
  });

  it('shows overdue warning when dueDate is in the past', () => {
    const task = { ...baseTask, dueDate: '2020-01-01T00:00:00', status: 'Todo' };
    renderWithProviders(<TaskCard task={task} onEdit={jest.fn()} />);
    expect(screen.getByText(/overdue/i)).toBeInTheDocument();
  });

  it('calls onEdit when Edit button is clicked', () => {
    const onEdit = jest.fn();
    renderWithProviders(<TaskCard task={baseTask} onEdit={onEdit} />);
    fireEvent.click(screen.getByText('Edit'));
    expect(onEdit).toHaveBeenCalledWith(baseTask);
  });
});
