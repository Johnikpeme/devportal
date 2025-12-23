import React from 'react';
import { CheckCircle2, Circle, Clock } from 'lucide-react';
import { formatDate } from '@/utils/helpers';

const Timeline = ({ milestones = [] }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-6 h-6 text-green-600" />;
      case 'in-progress':
        return <Clock className="w-6 h-6 text-blue-600" />;
      default:
        return <Circle className="w-6 h-6 text-gray-400" />;
    }
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'in-progress':
        return 'bg-blue-500';
      default:
        return 'bg-gray-300';
    }
  };
  
  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-200" />
      
      <div className="space-y-8">
        {milestones.map((milestone, index) => (
          <div key={index} className="relative flex gap-6">
            {/* Icon */}
            <div className="relative z-10 flex-shrink-0">
              {getStatusIcon(milestone.status)}
            </div>
            
            {/* Content */}
            <div className="flex-1 pb-8">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">{milestone.name}</h4>
                  <span className={`
                    px-2 py-1 rounded-full text-xs font-medium capitalize
                    ${milestone.status === 'completed' ? 'bg-green-100 text-green-700' : ''}
                    ${milestone.status === 'in-progress' ? 'bg-blue-100 text-blue-700' : ''}
                    ${milestone.status === 'upcoming' ? 'bg-gray-100 text-gray-700' : ''}
                  `}>
                    {milestone.status.replace('-', ' ')}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  Target: {formatDate(milestone.date)}
                </p>
                {milestone.description && (
                  <p className="text-sm text-gray-600 mt-2">{milestone.description}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Timeline;