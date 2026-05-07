import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axios';

const extractError = (err, fallback) => {
  const data = err.response?.data;
  if (!data) return fallback;
  if (typeof data === 'string') return data;
  if (data.errors) return Object.values(data.errors).flat().join(' ');
  if (data.title) return data.title;
  return fallback;
};

export const fetchTasks = createAsyncThunk('tasks/fetchAll', async (filters = {}, { rejectWithValue }) => {
  try {
    const res = await api.get('/tasks', { params: filters });
    return res.data;
  } catch (err) {
    return rejectWithValue(extractError(err, 'Failed to fetch tasks'));
  }
});

export const createTask = createAsyncThunk('tasks/create', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/tasks', data);
    return res.data;
  } catch (err) {
    return rejectWithValue(extractError(err, 'Failed to create task'));
  }
});

export const updateTask = createAsyncThunk('tasks/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/tasks/${id}`, data);
    return res.data;
  } catch (err) {
    return rejectWithValue(extractError(err, 'Failed to update task'));
  }
});

export const deleteTask = createAsyncThunk('tasks/delete', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/tasks/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(extractError(err, 'Failed to delete task'));
  }
});

export const updateStatus = createAsyncThunk('tasks/updateStatus', async ({ id, status }, { rejectWithValue }) => {
  try {
    const res = await api.patch(`/tasks/${id}/status`, { status });
    return res.data;
  } catch (err) {
    return rejectWithValue(extractError(err, 'Failed to update status'));
  }
});

const tasksSlice = createSlice({
  name: 'tasks',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearTaskError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchTasks.fulfilled, (state, action) => { state.loading = false; state.items = action.payload; })
      .addCase(fetchTasks.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(createTask.fulfilled, (state, action) => { state.items.unshift(action.payload); })
      .addCase(createTask.rejected, (state, action) => { state.error = action.payload; })

      .addCase(updateTask.fulfilled, (state, action) => {
        const idx = state.items.findIndex(t => t.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(updateTask.rejected, (state, action) => { state.error = action.payload; })

      .addCase(deleteTask.fulfilled, (state, action) => {
        state.items = state.items.filter(t => t.id !== action.payload);
      })
      .addCase(deleteTask.rejected, (state, action) => { state.error = action.payload; })

      .addCase(updateStatus.fulfilled, (state, action) => {
        const idx = state.items.findIndex(t => t.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(updateStatus.rejected, (state, action) => { state.error = action.payload; });
  },
});

export const { clearTaskError } = tasksSlice.actions;
export default tasksSlice.reducer;
