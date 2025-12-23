import React from 'react';
import { Plus, Bug, FileText, Users } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';

const QuickActions = ({ onAction }) => {
  const actions = [
    { id: 'project', label: 'New Project', icon: Plus, color: 'primary' },
    { id: 'bug', label: 'Report Bug', icon: Bug, color: 'secondary' },
    { id: 'document', label: 'Upload Doc', icon: FileText, color: 'secondary' },
    { id: 'member', label: 'Add Member', icon: Users, color: 'secondary' },
  ];
  
  return (
    <Card>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <Button
            key={action.id}
            variant={action.color}
            icon={action.icon}
            onClick={() => onAction?.(action.id)}
            className="justify-start"
          >
            {action.label}
          </Button>
        ))}
      </div>
    </Card>
  );
};

export default QuickActions;