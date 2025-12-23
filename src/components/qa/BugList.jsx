import React from 'react';
import { Bug, Search, Filter, Plus, AlertTriangle, Clock, User, Tag } from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';

const BugList = ({ bugs, onBugClick }) => {
  // Helper function to capitalize words
  const capitalizeWords = (str) => {
    return str
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getPriorityColor = (priority) => {
    const colors = {
      critical: 'error',
      high: 'warning',
      medium: 'info',
      low: 'default',
    };
    return colors[priority] || 'default';
  };

  const getStatusColor = (status) => {
    const colors = {
      open: 'error',
      'in-progress': 'info',
      resolved: 'success',
      closed: 'default',
    };
    return colors[status] || 'default';
  };

  const getPriorityIcon = (priority) => {
    const icons = {
      critical: <AlertTriangle className="w-4 h-4" />,
      high: <AlertTriangle className="w-4 h-4" />,
      medium: <AlertTriangle className="w-4 h-4" />,
      low: <AlertTriangle className="w-4 h-4" />,
    };
    return icons[priority] || <Bug className="w-4 h-4" />;
  };

  // Get card border color based on priority
  const getCardBorderColor = (priority) => {
    const colors = {
      critical: 'border-l-4 border-l-red-500',
      high: 'border-l-4 border-l-orange-500',
      medium: 'border-l-4 border-l-yellow-500',
      low: 'border-l-4 border-l-gray-400',
    };
    return colors[priority] || '';
  };

  // Get card background color based on priority
  const getCardBgColor = (priority) => {
    const colors = {
      critical: 'hover:bg-red-50',
      high: 'hover:bg-orange-50',
      medium: 'hover:bg-yellow-50',
      low: 'hover:bg-gray-50',
    };
    return colors[priority] || '';
  };

  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="space-y-4">
      {/* Bug List Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Bugs</h2>
          <p className="text-sm text-gray-600">{bugs.length} bug{bugs.length !== 1 ? 's' : ''} found</p>
        </div>
      </div>

      {/* Scrollable Bug List Container with Fixed Height */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        {bugs.length === 0 ? (
          <div className="h-[400px] flex items-center justify-center bg-white">
            <div className="text-center">
              <Bug className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No bugs found</h3>
              <p className="text-gray-600">Try adjusting your filters or search terms</p>
            </div>
          </div>
        ) : (
          <div 
            className="overflow-y-auto bg-white"
            style={{ 
              maxHeight: 'calc(100vh - 300px)', // Adjust this value as needed
              minHeight: '400px' // Minimum height when there are few bugs
            }}
          >
            <div className="divide-y divide-gray-100">
              {bugs.map((bug) => (
                <div
                  key={bug.id}
                  onClick={() => onBugClick(bug)}
                  className={`cursor-pointer transition-all duration-200 hover:bg-gray-50 active:bg-gray-100 ${getCardBorderColor(bug.priority)} ${getCardBgColor(bug.priority)}`}
                >
                  <div className="p-4">
                    <div className="flex items-start gap-3 sm:gap-4">
                      {/* Priority Icon */}
                      <div className={`
                        p-2 rounded-lg flex-shrink-0 mt-1
                        ${bug.priority === 'critical' ? 'bg-red-100' : ''}
                        ${bug.priority === 'high' ? 'bg-orange-100' : ''}
                        ${bug.priority === 'medium' ? 'bg-yellow-100' : ''}
                        ${bug.priority === 'low' ? 'bg-gray-100' : ''}
                      `}>
                        <div className={`
                          ${bug.priority === 'critical' ? 'text-red-600' : ''}
                          ${bug.priority === 'high' ? 'text-orange-600' : ''}
                          ${bug.priority === 'medium' ? 'text-yellow-600' : ''}
                          ${bug.priority === 'low' ? 'text-gray-600' : ''}
                        `}>
                          {getPriorityIcon(bug.priority)}
                        </div>
                      </div>

                      {/* Main Content */}
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-medium text-gray-500 px-2 py-1 bg-gray-100 rounded whitespace-nowrap">
                                BUG-{bug.id.toString().padStart(4, '0')}
                              </span>
                              <span className="text-xs font-medium text-gray-500 hidden sm:inline">•</span>
                              <span className="text-xs font-medium text-gray-500 truncate">{bug.project}</span>
                            </div>
                            <h4 className="font-semibold text-gray-900 truncate">{bug.title}</h4>
                          </div>
                          <div className="flex flex-wrap gap-2 flex-shrink-0 mt-2 sm:mt-0">
                            <Badge variant={getPriorityColor(bug.priority)} size="sm">
                              {capitalizeWords(bug.priority)}
                            </Badge>
                            <Badge variant={getStatusColor(bug.status)} size="sm">
                              {capitalizeWords(bug.status)}
                            </Badge>
                          </div>
                        </div>

                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{bug.description}</p>

                        {/* Metadata Row */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-500">
                          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                            <span className="flex items-center gap-1 min-w-0">
                              <User className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{bug.assignedTo}</span>
                            </span>
                            <span className="hidden sm:inline">•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 flex-shrink-0" />
                              <span className="whitespace-nowrap">{formatRelativeTime(bug.createdAt)}</span>
                            </span>
                          </div>
                          
                          {bug.tags && bug.tags.length > 0 && (
                            <>
                              <span className="hidden sm:inline">•</span>
                              <span className="flex items-center gap-1 min-w-0">
                                <Tag className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate">
                                  {bug.tags.slice(0, 2).map(tag => capitalizeWords(tag)).join(', ')}
                                  {bug.tags.length > 2 && ` +${bug.tags.length - 2}`}
                                </span>
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BugList;