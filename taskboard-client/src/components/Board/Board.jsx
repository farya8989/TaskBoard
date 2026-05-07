import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTasks } from '../../store/tasksSlice';
import Column from './Column';
import TaskForm from '../Task/TaskForm';
import Navbar from '../shared/Navbar';

const STATUSES = ['Todo', 'InProgress', 'Done'];
const PRIORITIES = ['', 'Low', 'Medium', 'High'];

export default function Board() {
  const dispatch = useDispatch();
  const { items: tasks, loading, error } = useSelector((s) => s.tasks);

  const [search, setSearch] = useState('');
  const [priority, setPriority] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    const filters = {};
    if (search) filters.search = search;
    if (priority) filters.priority = priority;
    dispatch(fetchTasks(filters));
  }, [search, priority, dispatch]);

  const openCreate = () => { setEditingTask(null); setFormOpen(true); };
  const openEdit = (task) => { setEditingTask(task); setFormOpen(true); };
  const closeForm = () => { setFormOpen(false); setEditingTask(null); };

  const tasksByStatus = (status) => tasks.filter((t) => t.status === status);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex gap-3 flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks..."
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>{p || 'All Priorities'}</option>
              ))}
            </select>
          </div>

          <button
            onClick={openCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition shrink-0"
          >
            + New Task
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">{error}</div>
        )}

        {loading ? (
          <div className="text-center text-gray-400 py-20 text-sm">Loading tasks...</div>
        ) : (
          <div className="flex gap-5">
            {STATUSES.map((status) => (
              <Column
                key={status}
                status={status}
                tasks={tasksByStatus(status)}
                onEdit={openEdit}
              />
            ))}
          </div>
        )}
      </div>

      {formOpen && <TaskForm task={editingTask} onClose={closeForm} />}
    </div>
  );
}
