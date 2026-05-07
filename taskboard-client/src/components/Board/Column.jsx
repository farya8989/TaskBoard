import TaskCard from '../Task/TaskCard';

const HEADER_STYLES = {
  Todo: 'bg-blue-50 text-blue-700 border-blue-200',
  InProgress: 'bg-amber-50 text-amber-700 border-amber-200',
  Done: 'bg-green-50 text-green-700 border-green-200',
};

const LABEL = { Todo: 'To Do', InProgress: 'In Progress', Done: 'Done' };

export default function Column({ status, tasks, onEdit }) {
  return (
    <div className="flex-1 min-w-0 flex flex-col">
      <div className={`flex items-center justify-between px-4 py-2.5 rounded-xl border mb-3 ${HEADER_STYLES[status]}`}>
        <span className="font-semibold text-sm">{LABEL[status]}</span>
        <span className="text-xs font-bold bg-white bg-opacity-60 px-2 py-0.5 rounded-full">
          {tasks.length}
        </span>
      </div>

      <div className="space-y-3 flex-1">
        {tasks.length === 0 ? (
          <div className="text-center text-gray-300 text-sm py-10 border-2 border-dashed border-gray-100 rounded-xl">
            No tasks
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard key={task.id} task={task} onEdit={onEdit} />
          ))
        )}
      </div>
    </div>
  );
}
