import { useState } from 'react';
import { useSafety } from '../../contexts/SafetyContext';
import { PlusIcon, CheckIcon, ClockIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function ActionTracking() {
  const { state, dispatch } = useSafety();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAction, setNewAction] = useState({
    incidentId: '',
    type: 'injury' as 'injury' | 'nearmiss',
    action: '',
    responsible: '',
    dueDate: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'critical'
  });

  const handleAddAction = () => {
    const action = {
      ...newAction,
      id: Date.now().toString(),
      status: 'open' as const,
      createdDate: format(new Date(), 'yyyy-MM-dd')
    };
    
    dispatch({ type: 'ADD_ACTION', payload: action });
    toast.success('Action added successfully');
    setShowAddForm(false);
    setNewAction({
      incidentId: '',
      type: 'injury',
      action: '',
      responsible: '',
      dueDate: '',
      priority: 'medium'
    });
  };

  const updateActionStatus = (id: string, status: 'open' | 'in-progress' | 'completed') => {
    const action = state.actions.find(a => a.id === id);
    if (action) {
      dispatch({
        type: 'UPDATE_ACTION',
        payload: {
          ...action,
          status,
          completedDate: status === 'completed' ? format(new Date(), 'yyyy-MM-dd') : undefined
        }
      });
      toast.success(`Action ${status === 'completed' ? 'completed' : 'updated'}`);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckIcon className="w-5 h-5 text-green-500" />;
      case 'in-progress':
        return <ClockIcon className="w-5 h-5 text-blue-500" />;
      case 'overdue':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const actionStats = {
    total: state.actions.length,
    open: state.actions.filter(a => a.status === 'open').length,
    inProgress: state.actions.filter(a => a.status === 'in-progress').length,
    completed: state.actions.filter(a => a.status === 'completed').length,
    overdue: state.actions.filter(a => 
      a.status !== 'completed' && new Date(a.dueDate) < new Date()
    ).length
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Action Tracking</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          Add Action
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Actions</p>
          <p className="text-2xl font-bold">{actionStats.total}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500 dark:text-gray-400">Open</p>
          <p className="text-2xl font-bold text-gray-600">{actionStats.open}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500 dark:text-gray-400">In Progress</p>
          <p className="text-2xl font-bold text-blue-600">{actionStats.inProgress}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500 dark:text-gray-400">Completed</p>
          <p className="text-2xl font-bold text-green-600">{actionStats.completed}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500 dark:text-gray-400">Overdue</p>
          <p className="text-2xl font-bold text-red-600">{actionStats.overdue}</p>
        </div>
      </div>

      {/* Add Action Form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Add New Action</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Incident ID</label>
                <input
                  type="text"
                  value={newAction.incidentId}
                  onChange={(e) => setNewAction({ ...newAction, incidentId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select
                  value={newAction.type}
                  onChange={(e) => setNewAction({ ...newAction, type: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="injury">Injury</option>
                  <option value="nearmiss">Near Miss</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Action Description</label>
                <textarea
                  value={newAction.action}
                  onChange={(e) => setNewAction({ ...newAction, action: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Responsible Person</label>
                <input
                  type="text"
                  value={newAction.responsible}
                  onChange={(e) => setNewAction({ ...newAction, responsible: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Due Date</label>
                <input
                  type="date"
                  value={newAction.dueDate}
                  onChange={(e) => setNewAction({ ...newAction, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Priority</label>
                <select
                  value={newAction.priority}
                  onChange={(e) => setNewAction({ ...newAction, priority: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAddAction}
                  className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Add Action
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Actions List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="p-4 border-b dark:border-gray-700">
          <h3 className="text-lg font-semibold">Active Actions</h3>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {state.actions.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              No actions tracked yet. Click "Add Action" to get started.
            </div>
          ) : (
            state.actions.map(action => (
              <div key={action.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {getStatusIcon(action.status)}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{action.incidentId}</span>
                        <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(action.priority)}`}>
                          {action.priority}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          action.type === 'injury' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {action.type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                        {action.action}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <span>Responsible: {action.responsible}</span>
                        <span>Due: {action.dueDate}</span>
                        {action.completedDate && (
                          <span>Completed: {action.completedDate}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {action.status !== 'completed' && (
                      <>
                        {action.status === 'open' && (
                          <button
                            onClick={() => updateActionStatus(action.id, 'in-progress')}
                            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                          >
                            Start
                          </button>
                        )}
                        <button
                          onClick={() => updateActionStatus(action.id, 'completed')}
                          className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
                        >
                          Complete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
