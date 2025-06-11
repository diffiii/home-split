import React, { useState } from 'react';
import { Task, User } from '../types';
import { taskAPI } from '../services/api';
import UserAvatar from './UserAvatar';
import Button from './Button';
import AddTask from './AddTask';

interface TaskListProps {
  tasks: Task[];
  currentUserId: number;
  householdMembers: User[];
  onTaskUpdated: () => void;
  householdId: number;
  addTaskButton?: React.ReactNode;
}

interface TaskItemProps {
  task: Task;
  currentUserId: number;
  onTaskUpdated: () => void;
  householdId: number;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, currentUserId, onTaskUpdated, householdId }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }) +
      ' ' +
      date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    );
  };

  const formatDueDate = (dueDateString?: string) => {
    if (!dueDateString) return null;

    const dueDate = new Date(dueDateString);
    const now = new Date();
    
    const isOverdue = now > dueDate;
    
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const taskDate = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
    
    const diffTime = taskDate.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    let dueDateClass = 'text-gray-600';
    let dueDateText = '';

    if (isOverdue && diffDays <= 0) {
      dueDateClass = 'text-red-600';
      if (diffDays === 0) {
        dueDateText = 'Overdue';
      } else {
        dueDateText = `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? '' : 's'}`;
      }
    } else if (diffDays === 0) {
      dueDateClass = 'text-orange-600';
      dueDateText = 'Due today';
    } else if (diffDays === 1) {
      dueDateClass = 'text-orange-500';
      dueDateText = 'Due tomorrow';
    } else if (diffDays <= 3) {
      dueDateClass = 'text-yellow-600';
      dueDateText = `Due in ${diffDays} days`;
    } else if (diffDays <= 7) {
      dueDateClass = 'text-blue-600';
      dueDateText = `Due in ${diffDays} days`;
    } else {
      return null;
    }

    return { class: dueDateClass, text: dueDateText };
  };

  const handleToggleComplete = async () => {
    setIsUpdating(true);
    try {
      await taskAPI.updateTask(task.id, { is_completed: !task.is_completed });
      onTaskUpdated();
    } catch (error) {
      console.error('Failed to update task:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setIsUpdating(true);
      try {
        await taskAPI.deleteTask(task.id);
        onTaskUpdated();
      } catch (error) {
        console.error('Failed to delete task:', error);
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const handleEdit = () => {
    setShowEditModal(true);
    setShowDetails(false);
  };

  const handleEditComplete = () => {
    setShowEditModal(false);
    onTaskUpdated();
  };

  const dueDateInfo = formatDueDate(task.due_date);
  const canModify = task.added_by.id === currentUserId;

  return (
    <>
      <div
        className={`border border-gray-200 rounded-lg p-4 transition-all duration-200 ${
          task.is_completed ? 'bg-gray-50 opacity-75' : 'bg-white hover:shadow-md'
        }`}
      >
        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <button
            onClick={handleToggleComplete}
            disabled={isUpdating}
            className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
              task.is_completed
                ? 'bg-green-500 border-green-500 text-white'
                : 'border-gray-300 hover:border-green-400'
            } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {task.is_completed && (
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>

          {/* Task content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3
                className={`font-medium text-base flex-1 ${
                  task.is_completed ? 'line-through text-gray-500' : 'text-gray-900'
                }`}
              >
                {task.name}
              </h3>
              {canModify && (
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1 flex-shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                    />
                  </svg>
                </button>
              )}
            </div>

            {/* Description */}
            {task.description && (
              <p
                className={`text-sm mb-2 break-words ${
                  task.is_completed ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                {task.description}
              </p>
            )}

            {/* Meta information */}
            <div className="flex flex-wrap items-center gap-x-1 gap-y-1 text-xs text-gray-500">
              <span>By {task.added_by.username}</span>
              {task.due_date && (
                <>
                  <span>•</span>
                  <span>{formatDate(task.due_date)}</span>
                </>
              )}
              {dueDateInfo && (
                <>
                  <span>•</span>
                  <span className={`font-medium ${dueDateInfo.class}`}>{dueDateInfo.text}</span>
                </>
              )}
            </div>

            {/* Action buttons */}
            {showDetails && canModify && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex gap-2">
                  <Button
                    onClick={handleEdit}
                    variant="outline"
                    size="sm"
                    className="text-xs flex-1 sm:flex-none"
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={handleDelete}
                    variant="danger"
                    size="sm"
                    disabled={isUpdating}
                    className="text-xs flex-1 sm:flex-none"
                  >
                    {isUpdating ? 'Deleting...' : 'Delete'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <AddTask
          householdId={householdId}
          onTaskAdded={handleEditComplete}
          onCancel={() => setShowEditModal(false)}
          editTask={task}
        />
      )}
    </>
  );
};

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  currentUserId,
  onTaskUpdated,
  householdId,
  addTaskButton
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const filteredTasks = tasks.filter(task => {
    if (filter === 'pending') return !task.is_completed;
    if (filter === 'completed') return task.is_completed;
    return true;
  });

  const sortedTasks = filteredTasks.sort((a, b) => {
    if (a.is_completed !== b.is_completed) {
      return a.is_completed ? 1 : -1;
    }

    if (a.due_date && b.due_date) {
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    }

    if (a.due_date && !b.due_date) return -1;
    if (!a.due_date && b.due_date) return 1;

    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks yet</h3>
        <p className="text-gray-600">
          Create your first task to get started organizing your household.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Filter Tabs and Add Task Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <div className="flex gap-1 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto">
          {[
            { key: 'all', label: 'All', count: tasks.length },
            { key: 'pending', label: 'Pending', count: tasks.filter(t => !t.is_completed).length },
            {
              key: 'completed',
              label: 'Completed',
              count: tasks.filter(t => t.is_completed).length
            }
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setFilter(key as any)}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap flex-shrink-0 ${
                filter === key
                  ? 'bg-black text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {label} ({count})
            </button>
          ))}
        </div>
        {addTaskButton && <div className="w-full sm:w-auto flex-shrink-0">{addTaskButton}</div>}
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {sortedTasks.map(task => (
          <TaskItem
            key={task.id}
            task={task}
            currentUserId={currentUserId}
            onTaskUpdated={onTaskUpdated}
            householdId={householdId}
          />
        ))}
      </div>

      {filteredTasks.length === 0 && tasks.length > 0 && (
        <div className="text-center py-8">
          <p className="text-gray-600">No tasks match the current filter.</p>
        </div>
      )}
    </div>
  );
};

export default TaskList;
