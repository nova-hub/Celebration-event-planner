import React, { useState } from 'react';
import { 
  CheckSquare, Square, Plus, Calendar, AlertTriangle, 
  Flag, User, Edit2, Trash2, CheckCircle2, Clock, Sparkles 
} from 'lucide-react';
import { formatDate, triggerTaskDoneConfetti } from '../utils/helpers';
import TaskModal from './TaskModal';
import ConfirmModal from './ConfirmModal';

export default function ChecklistView({ event, onAddTask, onUpdateTask, onToggleTask, onDeleteTask }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [deleteTaskId, setDeleteTaskId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  const tasks = event.tasks || [];
  const completedCount = tasks.filter(t => t.completed).length;
  const pendingCount = tasks.length - completedCount;
  const progressPct = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const todayStr = new Date().toISOString().split('T')[0];
  const overdueCount = tasks.filter(t => !t.completed && t.dueDate && t.dueDate < todayStr).length;

  const uniqueCategories = Array.from(new Set(tasks.map(t => t.category).filter(Boolean)));

  // Filtered tasks
  const filteredTasks = tasks.filter((t) => {
    if (filterStatus === 'pending' && t.completed) return false;
    if (filterStatus === 'completed' && !t.completed) return false;
    if (filterPriority !== 'all' && t.priority !== filterPriority) return false;
    if (filterCategory !== 'all' && t.category !== filterCategory) return false;
    return true;
  });

  const handleEdit = (task) => {
    setTaskToEdit(task);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setTaskToEdit(null);
    setIsModalOpen(true);
  };

  const handleSave = async (data) => {
    if (taskToEdit) {
      await onUpdateTask(taskToEdit.id, data);
    } else {
      await onAddTask(event.id, data);
    }
  };

  const handleToggle = async (task) => {
    if (!task.completed) {
      triggerTaskDoneConfetti();
    }
    await onToggleTask(task.id);
  };

  const confirmDelete = async () => {
    if (deleteTaskId) {
      await onDeleteTask(deleteTaskId);
      setDeleteTaskId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress & Milestone Overview */}
      <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-bold text-white">Event Planning Milestones</h3>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              {completedCount} of {tasks.length} tasks completed ({progressPct}%)
            </p>
          </div>

          <div className="flex items-center gap-3">
            {overdueCount > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-300 border border-rose-500/30">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                {overdueCount} Overdue
              </span>
            )}
            <button
              onClick={handleCreate}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg shadow-purple-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Task
            </button>
          </div>
        </div>

        {/* Big Progress Bar */}
        <div className="w-full h-3 bg-zinc-900 rounded-full overflow-hidden p-0.5 border border-zinc-800">
          <div
            className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-400 rounded-full transition-all duration-500 shadow-glow-purple"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Task Filters & Roster */}
      <div className="glass-panel p-5 rounded-2xl space-y-4">
        {/* Filters Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-pink-400" />
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Checklist Actions</h4>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl glass-input text-xs"
            >
              <option value="all" className="bg-zinc-900 text-white">All Statuses ({tasks.length})</option>
              <option value="pending" className="bg-zinc-900 text-amber-400">To Do ({pendingCount})</option>
              <option value="completed" className="bg-zinc-900 text-emerald-400">Completed ({completedCount})</option>
            </select>

            {/* Priority Filter */}
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl glass-input text-xs"
            >
              <option value="all" className="bg-zinc-900 text-white">All Priorities</option>
              <option value="high" className="bg-zinc-900 text-rose-400">High Priority</option>
              <option value="medium" className="bg-zinc-900 text-amber-400">Medium Priority</option>
              <option value="low" className="bg-zinc-900 text-zinc-400">Low Priority</option>
            </select>

            {/* Category Filter */}
            {uniqueCategories.length > 0 && (
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl glass-input text-xs"
              >
                <option value="all" className="bg-zinc-900 text-white">All Categories</option>
                {uniqueCategories.map(c => (
                  <option key={c} value={c} className="bg-zinc-900 text-white">{c}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Task Items */}
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-zinc-800 rounded-xl">
            <CheckSquare className="w-10 h-10 text-zinc-600 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-zinc-300">No planning tasks found</h4>
            <p className="text-xs text-zinc-500 max-w-xs mx-auto mt-1 mb-4">
              Add tasks like hiring the DJ, floral mockups, tasting the menu, or sending save-the-dates.
            </p>
            <button
              onClick={handleCreate}
              className="inline-flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-800 text-purple-300 hover:bg-zinc-700 hover:text-white transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add First Task
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredTasks.map((task) => {
              const isOverdue = !task.completed && task.dueDate && task.dueDate < todayStr;
              const priorityClasses = {
                high: 'bg-rose-950/60 text-rose-300 border-rose-500/40',
                medium: 'bg-amber-950/60 text-amber-300 border-amber-500/40',
                low: 'bg-zinc-800 text-zinc-300 border-zinc-700/60'
              };

              return (
                <div
                  key={task.id}
                  className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    task.completed
                      ? 'bg-zinc-950/40 border-zinc-850 opacity-70 hover:opacity-100'
                      : isOverdue
                      ? 'bg-rose-950/20 border-rose-900/50 hover:border-rose-500/50'
                      : 'bg-zinc-900/50 border-zinc-800/80 hover:border-purple-500/40'
                  }`}
                >
                  {/* Left: Checkbox & Info */}
                  <div className="flex items-start gap-3 flex-1">
                    <button
                      onClick={() => handleToggle(task)}
                      className={`mt-0.5 p-1 rounded-lg transition-transform active:scale-90 ${
                        task.completed
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-zinc-800 text-zinc-400 hover:text-purple-400 hover:bg-zinc-700'
                      }`}
                    >
                      {task.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Square className="w-5 h-5 text-zinc-400" />
                      )}
                    </button>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-sm font-semibold ${task.completed ? 'line-through text-zinc-500' : 'text-white'}`}>
                          {task.title}
                        </span>

                        {/* Priority Badge */}
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${priorityClasses[task.priority] || priorityClasses.medium}`}>
                          {task.priority}
                        </span>

                        {/* Category */}
                        {task.category && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-zinc-800 text-zinc-300 border border-zinc-700/60">
                            {task.category}
                          </span>
                        )}
                      </div>

                      {/* Meta info: Due date, Assigned to, Notes */}
                      <div className="flex items-center gap-3 text-xs text-zinc-400 flex-wrap">
                        {task.dueDate && (
                          <div className={`flex items-center gap-1 ${isOverdue ? 'text-rose-400 font-semibold' : 'text-zinc-400'}`}>
                            <Calendar className="w-3 h-3" />
                            <span>
                              {formatDate(task.dueDate)} {isOverdue && '(Overdue!)'}
                            </span>
                          </div>
                        )}
                        {task.assignedTo && (
                          <div className="flex items-center gap-1 text-purple-300">
                            <User className="w-3 h-3 text-purple-400" />
                            <span>{task.assignedTo}</span>
                          </div>
                        )}
                      </div>

                      {task.notes && (
                        <p className="text-xs text-zinc-400 italic mt-0.5">{task.notes}</p>
                      )}
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-1 self-end sm:self-center">
                    <button
                      onClick={() => handleEdit(task)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                      title="Edit task"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteTaskId(task.id)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        taskToEdit={taskToEdit}
        eventId={event.id}
      />

      {/* Confirm Delete */}
      <ConfirmModal
        isOpen={Boolean(deleteTaskId)}
        title="Delete Checklist Task"
        message="Are you sure you want to remove this task from your celebration roadmap?"
        confirmText="Delete Task"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTaskId(null)}
        isDanger={true}
      />
    </div>
  );
}
