import tasksReducer, { clearTaskError } from '../../store/tasksSlice';

const task1 = { id: 1, title: 'Fix bug', priority: 'High', status: 'Todo' };
const task2 = { id: 2, title: 'Write docs', priority: 'Low', status: 'InProgress' };
const initialState = { items: [task1, task2], loading: false, error: null };

describe('tasksSlice reducers', () => {
  it('clearTaskError resets error to null', () => {
    const state = { ...initialState, error: 'Something failed' };
    const next = tasksReducer(state, clearTaskError());
    expect(next.error).toBeNull();
  });

  it('fetchTasks.pending sets loading to true', () => {
    const next = tasksReducer(initialState, { type: 'tasks/fetchAll/pending' });
    expect(next.loading).toBe(true);
    expect(next.error).toBeNull();
  });

  it('fetchTasks.fulfilled sets items and clears loading', () => {
    const tasks = [task1];
    const next = tasksReducer(
      { ...initialState, loading: true },
      { type: 'tasks/fetchAll/fulfilled', payload: tasks }
    );
    expect(next.items).toEqual(tasks);
    expect(next.loading).toBe(false);
  });

  it('fetchTasks.rejected sets error', () => {
    const next = tasksReducer(initialState, {
      type: 'tasks/fetchAll/rejected',
      payload: 'Failed to fetch tasks',
    });
    expect(next.error).toBe('Failed to fetch tasks');
    expect(next.loading).toBe(false);
  });

  it('createTask.fulfilled prepends new task to items', () => {
    const newTask = { id: 3, title: 'New Task', priority: 'Medium', status: 'Todo' };
    const next = tasksReducer(initialState, { type: 'tasks/create/fulfilled', payload: newTask });
    expect(next.items[0]).toEqual(newTask);
    expect(next.items.length).toBe(3);
  });

  it('createTask.rejected sets error', () => {
    const next = tasksReducer(initialState, {
      type: 'tasks/create/rejected',
      payload: 'Failed to create task',
    });
    expect(next.error).toBe('Failed to create task');
  });

  it('updateTask.fulfilled updates matching task in items', () => {
    const updated = { ...task1, title: 'Fix bug - DONE', priority: 'Medium' };
    const next = tasksReducer(initialState, { type: 'tasks/update/fulfilled', payload: updated });
    expect(next.items.find(t => t.id === 1).title).toBe('Fix bug - DONE');
  });

  it('deleteTask.fulfilled removes task by id', () => {
    const next = tasksReducer(initialState, { type: 'tasks/delete/fulfilled', payload: 1 });
    expect(next.items.length).toBe(1);
    expect(next.items.find(t => t.id === 1)).toBeUndefined();
  });

  it('updateStatus.fulfilled updates status of matching task', () => {
    const updated = { ...task1, status: 'InProgress' };
    const next = tasksReducer(initialState, { type: 'tasks/updateStatus/fulfilled', payload: updated });
    expect(next.items.find(t => t.id === 1).status).toBe('InProgress');
  });
});
