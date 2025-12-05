'use client';

import { useState } from 'react';
import { Target, Plus, Check, Trash2, Calendar, DollarSign, GraduationCap, Home, Plane, Car, Heart, Briefcase, X, Edit2 } from 'lucide-react';

interface Goal {
  id: string;
  icon: string;
  title: string;
  description?: string;
  targetDate?: string;
  targetAmount?: number;
  completed: boolean;
}

interface GoalsConcernsProps {
  goals: Goal[];
  onAddGoal: (goal: Omit<Goal, 'id'>) => void;
  onUpdateGoal: (id: string, goal: Partial<Goal>) => void;
  onDeleteGoal: (id: string) => void;
  onToggleComplete: (id: string) => void;
}

const goalIcons: Record<string, React.ElementType> = {
  graduation: GraduationCap,
  home: Home,
  plane: Plane,
  car: Car,
  heart: Heart,
  briefcase: Briefcase,
  dollar: DollarSign,
  target: Target,
};

const iconOptions = [
  { id: 'graduation', label: 'Education', Icon: GraduationCap },
  { id: 'home', label: 'Home', Icon: Home },
  { id: 'plane', label: 'Travel', Icon: Plane },
  { id: 'car', label: 'Vehicle', Icon: Car },
  { id: 'heart', label: 'Family', Icon: Heart },
  { id: 'briefcase', label: 'Career', Icon: Briefcase },
  { id: 'dollar', label: 'Savings', Icon: DollarSign },
  { id: 'target', label: 'Other', Icon: Target },
];

const presetGoals = [
  { icon: 'graduation', title: 'Pay for children\'s college education', description: '4 years of tuition' },
  { icon: 'home', title: 'Buy a new home', description: 'Save for down payment' },
  { icon: 'briefcase', title: 'Retire comfortably', description: 'Financial independence' },
  { icon: 'dollar', title: 'Build emergency fund', description: '6 months of expenses' },
  { icon: 'car', title: 'Pay off all debt', description: 'Become debt-free' },
  { icon: 'plane', title: 'Travel the world', description: 'Annual family vacations' },
];

function GoalCard({
  goal,
  onToggle,
  onDelete,
  onEdit
}: {
  goal: Goal;
  onToggle: () => void;
  onDelete: () => void;
  onEdit: () => void;
}) {
  const Icon = goalIcons[goal.icon] || Target;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  return (
    <div
      className={`group relative p-4 rounded-xl border-2 transition-all ${
        goal.completed
          ? 'bg-green-50 border-green-300'
          : 'bg-white border-slate-200 hover:border-blue-300'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={onToggle}
          className={`mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
            goal.completed
              ? 'bg-green-500 border-green-500'
              : 'border-slate-300 hover:border-blue-500'
          }`}
        >
          {goal.completed && <Check className="w-4 h-4 text-white" />}
        </button>

        {/* Icon */}
        <div className={`p-2 rounded-lg ${goal.completed ? 'bg-green-200' : 'bg-blue-100'}`}>
          <Icon className={`w-5 h-5 ${goal.completed ? 'text-green-600' : 'text-blue-600'}`} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className={`font-semibold ${goal.completed ? 'text-green-700 line-through' : 'text-slate-800'}`}>
            {goal.title}
          </div>
          {goal.description && (
            <div className={`text-sm ${goal.completed ? 'text-green-600' : 'text-slate-500'}`}>
              {goal.description}
            </div>
          )}
          <div className="flex items-center gap-4 mt-2">
            {goal.targetDate && (
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(goal.targetDate)}
              </div>
            )}
            {goal.targetAmount && (
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <DollarSign className="w-3.5 h-3.5" />
                {formatCurrency(goal.targetAmount)}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onEdit}
            className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function AddGoalModal({
  isOpen,
  onClose,
  onAdd,
  editingGoal
}: {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (goal: Omit<Goal, 'id'>) => void;
  editingGoal?: Goal | null;
}) {
  const [icon, setIcon] = useState(editingGoal?.icon || 'target');
  const [title, setTitle] = useState(editingGoal?.title || '');
  const [description, setDescription] = useState(editingGoal?.description || '');
  const [targetDate, setTargetDate] = useState(editingGoal?.targetDate || '');
  const [targetAmount, setTargetAmount] = useState(editingGoal?.targetAmount?.toString() || '');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAdd({
      icon,
      title: title.trim(),
      description: description.trim() || undefined,
      targetDate: targetDate || undefined,
      targetAmount: targetAmount ? parseInt(targetAmount) : undefined,
      completed: editingGoal?.completed || false,
    });
    onClose();
  };

  const handlePresetClick = (preset: typeof presetGoals[0]) => {
    setIcon(preset.icon);
    setTitle(preset.title);
    setDescription(preset.description);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800">
              {editingGoal ? 'Edit Goal' : 'Add a Goal'}
            </h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Quick Presets */}
            {!editingGoal && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Quick Add</label>
                <div className="flex flex-wrap gap-2">
                  {presetGoals.map((preset, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handlePresetClick(preset)}
                      className="px-3 py-1.5 text-sm bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-700 rounded-lg transition-colors"
                    >
                      {preset.title.split(' ').slice(0, 3).join(' ')}...
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Icon Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
              <div className="grid grid-cols-4 gap-2">
                {iconOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setIcon(opt.id)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${
                      icon === opt.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <opt.Icon className={`w-5 h-5 ${icon === opt.id ? 'text-blue-600' : 'text-slate-500'}`} />
                    <span className={`text-xs ${icon === opt.id ? 'text-blue-600' : 'text-slate-500'}`}>
                      {opt.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Goal Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What do you want to achieve?"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add more details (optional)"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Target Date & Amount */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Target Date</label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Target Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                  <input
                    type="number"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    placeholder="0"
                    className="w-full pl-8 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
              >
                {editingGoal ? 'Save Changes' : 'Add Goal'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function GoalsConcerns({
  goals,
  onAddGoal,
  onUpdateGoal,
  onDeleteGoal,
  onToggleComplete
}: GoalsConcernsProps) {
  const [showModal, setShowModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  const handleAdd = (goal: Omit<Goal, 'id'>) => {
    if (editingGoal) {
      onUpdateGoal(editingGoal.id, goal);
    } else {
      onAddGoal(goal);
    }
    setEditingGoal(null);
  };

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setShowModal(true);
  };

  const completedCount = goals.filter(g => g.completed).length;
  const totalCount = goals.length;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Target className="w-6 h-6 text-white" />
            <h2 className="text-xl font-bold text-white">Goals & Concerns</h2>
          </div>
          <div className="flex items-center gap-3">
            {totalCount > 0 && (
              <div className="bg-white/20 px-3 py-1 rounded-full">
                <span className="text-white text-sm font-medium">
                  {completedCount} / {totalCount} completed
                </span>
              </div>
            )}
            <button
              onClick={() => {
                setEditingGoal(null);
                setShowModal(true);
              }}
              className="flex items-center gap-2 bg-white text-purple-600 px-4 py-2 rounded-xl font-medium hover:bg-purple-50 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Goal
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {goals.length === 0 ? (
          <div className="text-center py-12">
            <Target className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-600 mb-2">No goals yet</h3>
            <p className="text-slate-500 mb-4">Add your financial goals to track your progress</p>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-purple-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Your First Goal
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {goals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onToggle={() => onToggleComplete(goal.id)}
                onDelete={() => onDeleteGoal(goal.id)}
                onEdit={() => handleEdit(goal)}
              />
            ))}
          </div>
        )}
      </div>

      <AddGoalModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingGoal(null);
        }}
        onAdd={handleAdd}
        editingGoal={editingGoal}
      />
    </div>
  );
}
