import React, { useState, useEffect } from 'react';
import { 
  Calendar, Users, Target, TrendingUp, Edit, 
  ExternalLink, GitBranch 
} from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';
import Tabs from '../common/Tabs';
import Timeline from './Timeline';
import MilestoneTracker from './MilestoneTracker';
import DocumentList from './DocumentList';
import TeamMembers from './TeamMembers';
import { formatDate } from '@/utils/helpers';
import { PROJECT_STATUS_COLORS } from '@/utils/constants';
import { supabase } from '@/services/supabaseClient';

const ProjectDetail = ({ project, onEdit }) => {
  const tabs = [
    {
      label: 'Overview',
      content: <ProjectOverview project={project} />,
    },
    {
      label: 'Timeline',
      content: <Timeline milestones={project.milestones} />,
    },
    {
      label: 'Team',
      content: <TeamMembers projectId={project.id} />,
    },
    {
      label: 'Documents',
      content: <DocumentList projectId={project.id} />,
    },
  ];
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
              <Badge variant="success">
                {project.status.replace('-', ' ')}
              </Badge>
            </div>
            <p className="text-gray-600 mb-4">{project.description}</p>
            <div className="flex flex-wrap gap-2">
              {project.platform?.map(p => (
                <Badge key={p} variant="default">{p}</Badge>
              ))}
              <Badge variant="info">{project.genre}</Badge>
            </div>
          </div>
          <Button variant="outline" icon={Edit} onClick={onEdit}>
            Edit Project
          </Button>
        </div>
        
        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Progress
            </p>
            <p className="text-2xl font-bold text-gray-900">{project.progress}%</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Team Size
            </p>
            <TeamSizeDisplay projectId={project.id} fallbackCount={project.team} />
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Start Date
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {formatDate(project.startDate, 'MMM yyyy')}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Target Release
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {formatDate(project.targetRelease, 'MMM yyyy')}
            </p>
          </div>
        </div>
      </Card>
      
      {/* Progress Bar */}
      <Card>
        <div className="flex justify-between text-sm mb-2">
          <span className="font-medium text-gray-700">Overall Progress</span>
          <span className="font-bold text-gray-900">{project.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-primary rounded-full h-3 transition-all duration-500"
            style={{ width: `${project.progress}%` }}
          />
        </div>
      </Card>
      
      {/* Tabs */}
      <Tabs tabs={tabs} />
    </div>
  );
};

const TeamSizeDisplay = ({ projectId, fallbackCount }) => {
  const [teamCount, setTeamCount] = useState(fallbackCount || 0);

  useEffect(() => {
    fetchTeamCount();
  }, [projectId]);

  const fetchTeamCount = async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('team_members, team')
      .eq('id', projectId)
      .single();
    
    if (!error && data) {
      if (data.team_members && Array.isArray(data.team_members)) {
        setTeamCount(data.team_members.length);
      } else if (data.team) {
        setTeamCount(data.team);
      }
    }
  };

  return <p className="text-2xl font-bold text-gray-900">{teamCount}</p>;
};

const ProjectOverview = ({ project }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Details</h3>
        <dl className="space-y-3">
          <div>
            <dt className="text-sm text-gray-600">Lead Developer</dt>
            <dd className="text-base font-medium text-gray-900">{project.lead}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-600">Genre</dt>
            <dd className="text-base font-medium text-gray-900">{project.genre}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-600">Platforms</dt>
            <dd className="text-base font-medium text-gray-900">
              {project.platform?.join(', ')}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-600">Start Date</dt>
            <dd className="text-base font-medium text-gray-900">
              {formatDate(project.startDate)}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-600">Expected Release</dt>
            <dd className="text-base font-medium text-gray-900">
              {formatDate(project.targetRelease)}
            </dd>
          </div>
        </dl>
      </Card>
      
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Bug Summary</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
            <span className="text-sm font-medium text-red-900">Critical</span>
            <span className="text-2xl font-bold text-red-700">{project.bugs?.critical || 0}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
            <span className="text-sm font-medium text-orange-900">High Priority</span>
            <span className="text-2xl font-bold text-orange-700">{project.bugs?.high || 0}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
            <span className="text-sm font-medium text-yellow-900">Medium</span>
            <span className="text-2xl font-bold text-yellow-700">{project.bugs?.medium || 0}</span>
          </div>
        </div>
      </Card>
      
      <Card className="lg:col-span-2">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Milestones</h3>
        <MilestoneTracker milestones={project.milestones} />
      </Card>
    </div>
  );
};

export default ProjectDetail;