import { useDispatch } from 'react-redux';
import { deleteTask, updateStatus } from '../../store/tasksSlice';

const PRIORITY_STYLES = {
  Low: 'bg-green-100 text-green-700',
  Medium: 'bg-yellow-100 text-yellow-700',
  High: 'bg-red-100 text-red-700',
};

const PREV_STATUS = { InProgress: 'Todo', Done: 'InProgress' };
const NEXT_STATUS = { Todo: 'InProgress', InProgress: 'Done' };

export default function TaskCard({ task, onEdit }) {
  const dispatch = useDispatch();

  const handleDelete = () => {
    if (window.confirm('Delete this task?')) dispatch(deleteTask(task.id));
  };

  const handleMove = (status) => dispatch(updateStatus({ id: task.id, status }));

  const dueDate = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null;

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Done';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-2">
      <div className="flex justify-between items-start gap-2">
        <p className="text-sm font-semibold text-gray-800 leading-snug">{task.title}</p>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${PRIORITY_STYLES[task.priority]}`}>
          {task.priority}
        </span>
      </div>

      {task.description && (
        <p className="text-xs text-gray-500 line-clamp-2">{task.description}</p>
      )}

      {dueDate && (
        <p className={`text-xs font-medium ${isOverdue ? 'text-red-500' : 'text-gray-400'}`}>
          {isOverdue ? '⚠ Overdue · ' : '📅 '}{dueDate}
        </p>
      )}

      <div className="flex items-center justify-between pt-1">
        <div className="flex gap-1">
          {PREV_STATUS[task.status] && (
            <button
              onClick={() => handleMove(PREV_STATUS[task.status])}
              className="text-xs text-gray-400 hover:text-gray-600 px-1.5 py-0.5 rounded hover:bg-gray-100 transition"
              title={`Move to ${PREV_STATUS[task.status]}`}
            >
              ←
            </button>
          )}
          {NEXT_STATUS[task.status] && (
            <button
              onClick={() => handleMove(NEXT_STATUS[task.status])}
              className="text-xs text-gray-400 hover:text-gray-600 px-1.5 py-0.5 rounded hover:bg-gray-100 transition"
              title={`Move to ${NEXT_STATUS[task.status]}`}
            >
              →
            </button>
          )}
        </div>

        <div className="flex gap-1">
          <button
            onClick={() => onEdit(task)}
            className="text-xs text-blue-500 hover:text-blue-700 px-2 py-0.5 rounded hover:bg-blue-50 transition"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="text-xs text-red-400 hover:text-red-600 px-2 py-0.5 rounded hover:bg-red-50 transition"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
