import React, { useState } from 'react';
import { CheckCircle, XCircle, Clock, AlertCircle, X } from 'lucide-react';
import Button from '../common/Button';

const ChangeStatus = ({ bug, onChangeStatus, onCancel }) => {
  const [status, setStatus] = useState(bug.status);
  const [resolution, setResolution] = useState(bug.resolution || '');
  
  const statusOptions = [
    { value: 'open', label: 'Open', icon: AlertCircle, color: 'text-red-600' },
    { value: 'in-progress', label: 'In Progress', icon: Clock, color: 'text-blue-600' },
    { value: 'resolved', label: 'Resolved', icon: CheckCircle, color: 'text-green-600' },
    { value: 'closed', label: 'Closed', icon: XCircle, color: 'text-gray-600' },
  ];
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onChangeStatus(bug.id, status, resolution);
  };
  
  return (
    <div 
      className="relative bg-white rounded-lg shadow-2xl w-full max-w-md border border-gray-200"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 flex justify-between items-center px-6 py-4">
        <h2 className="text-xl font-bold text-gray-900">Change Bug Status</h2>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <div className="p-6">
        <div className="mb-6">
          <h3 className="font-medium text-gray-900 mb-1">{bug.title}</h3>
          <div className="text-sm text-gray-600">
            Current status: <span className="font-medium capitalize">{bug.status}</span>
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              New Status
            </label>
            <div className="grid grid-cols-2 gap-2">
              {statusOptions.map(option => {
                const Icon = option.icon;
                const isSelected = status === option.value;
                
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setStatus(option.value)}
                    className={`
                      flex flex-col items-center justify-center p-4 border rounded-lg transition-all
                      ${isSelected 
                        ? `bg-blue-100 border-blue-400` 
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }
                    `}
                  >
                    <Icon className={`w-6 h-6 mb-2 ${option.color}`} />
                    <span className={`text-sm font-medium ${isSelected ? 'text-blue-700' : ''}`}>
                      {option.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          
          {(status === 'resolved' || status === 'closed') && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resolution Notes
              </label>
              <textarea
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                rows={4}
                placeholder="Describe how the bug was resolved..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                This will be visible to the reporter and team members
              </p>
            </div>
          )}
          
          <div className="flex gap-3 justify-end">
            <Button 
              type="button"
              variant="outline" 
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              variant="primary"
            >
              Update Status
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangeStatus;