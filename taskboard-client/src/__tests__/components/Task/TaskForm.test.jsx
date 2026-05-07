import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../../test-utils';
import TaskForm from '../../../components/Task/TaskForm';

jest.mock('../../../api/axios', () => ({
  default: { post: jest.fn(), put: jest.fn(), interceptors: { request: { use: jest.fn() } } },
}));

const existingTask = {
  id: 1,
  title: 'Existing Task',
  description: 'Some description',
  priority: 'High',
  dueDate: null,
};

describe('TaskForm', () => {
  it('renders "New Task" heading in create mode', () => {
    renderWithProviders(<TaskForm task={null} onClose={jest.fn()} />);
    expect(screen.getByText('New Task')).toBeInTheDocument();
  });

  it('renders "Edit Task" heading in edit mode', () => {
    renderWithProviders(<TaskForm task={existingTask} onClose={jest.fn()} />);
    expect(screen.getByText('Edit Task')).toBeInTheDocument();
  });

  it('renders empty title field in create mode', () => {
    renderWithProviders(<TaskForm task={null} onClose={jest.fn()} />);
    expect(screen.getByPlaceholderText('Task title').value).toBe('');
  });

  it('pre-fills title when editing', () => {
    renderWithProviders(<TaskForm task={existingTask} onClose={jest.fn()} />);
    expect(screen.getByDisplayValue('Existing Task')).toBeInTheDocument();
  });

  it('pre-fills priority when editing', () => {
    renderWithProviders(<TaskForm task={existingTask} onClose={jest.fn()} />);
    expect(screen.getByDisplayValue('High')).toBeInTheDocument();
  });

  it('renders Medium as default priority in create mode', () => {
    renderWithProviders(<TaskForm task={null} onClose={jest.fn()} />);
    expect(screen.getByDisplayValue('Medium')).toBeInTheDocument();
  });

  it('renders Create Task button in create mode', () => {
    renderWithProviders(<TaskForm task={null} onClose={jest.fn()} />);
    expect(screen.getByText('Create Task')).toBeInTheDocument();
  });

  it('renders Save Changes button in edit mode', () => {
    renderWithProviders(<TaskForm task={existingTask} onClose={jest.fn()} />);
    expect(screen.getByText('Save Changes')).toBeInTheDocument();
  });

  it('calls onClose when Cancel is clicked', () => {
    const onClose = jest.fn();
    renderWithProviders(<TaskForm task={null} onClose={onClose} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(onClose).toHaveBeenCalled();
  });

  it('updates title field on change', () => {
    renderWithProviders(<TaskForm task={null} onClose={jest.fn()} />);
    const input = screen.getByPlaceholderText('Task title');
    fireEvent.change(input, { target: { value: 'My new task' } });
    expect(input.value).toBe('My new task');
  });
});
