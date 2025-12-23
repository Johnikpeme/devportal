import React from 'react';
import { CheckCircle2, PlayCircle, Clock, AlertCircle } from 'lucide-react';
import { formatDate } from '@/utils/helpers';

const MilestoneTracker = ({ milestones = [] }) => {
  const getIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'in-progress':
        return <PlayCircle className="w-5 h-5 text-blue-600" />;
      case 'delayed':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };
  
  const getBackgroundColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100';
      case 'in-progress':
        return 'bg-blue-100';
      case 'delayed':
        return 'bg-red-100';
      default:
        return 'bg-gray-100';
    }
  };
  
  return (
    <div className="space-y-3">
      {milestones.map((milestone, index) => (
        <div 
          key={index}
          className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition"
        >
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getBackgroundColor(milestone.status)}`}>
            {getIcon(milestone.status)}
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900">{milestone.name}</h4>
            <p className="text-sm text-gray-600">
              {formatDate(milestone.date, 'MMMM d, yyyy')}
            </p>
          </div>
          <span className={`
            px-3 py-1 rounded-full text-xs font-medium capitalize
            ${milestone.status === 'completed' ? 'bg-green-100 text-green-700' : ''}
            ${milestone.status === 'in-progress' ? 'bg-blue-100 text-blue-700' : ''}
            ${milestone.status === 'upcoming' ? 'bg-gray-100 text-gray-700' : ''}
            ${milestone.status === 'delayed' ? 'bg-red-100 text-red-700' : ''}
          `}>
            {milestone.status.replace('-', ' ')}
          </span>
        </div>
      ))}
    </div>
  );
};

export default MilestoneTracker;