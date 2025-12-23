import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  Bug, 
  ChevronRight,
  Smartphone,
  Monitor,
  Gamepad2,
  Clock,
  AlertCircle,
  PlayCircle,
  Cpu
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Card from '../common/Card';
import Badge from '../common/Badge';
import { formatDate } from '@/utils/helpers';
import { bugService } from '@/services/bugService';
import { projectService } from '@/services/projectService';

const ProjectCard = ({ project }) => {
  const navigate = useNavigate();
  const [bugCounts, setBugCounts] = useState({ 
    critical: 0, 
    high: 0, 
    medium: 0, 
    low: 0 
  });
  const [loadingBugs, setLoadingBugs] = useState(true);
  const [teamSize, setTeamSize] = useState(0);
  
  // Platform icons mapping based on your exact platform names
  const getPlatformIcon = (platform) => {
    switch(platform.toLowerCase()) {
      case 'active':
        return <PlayCircle className="w-4 h-4 text-green-500" />;
      case 'console-xbox':
        return <Gamepad2 className="w-4 h-4 text-green-500" />;
      case 'console-ps5':
        return <Gamepad2 className="w-4 h-4 text-blue-500" />;
      case 'pc':
        return <Monitor className="w-4 h-4 text-blue-500" />;
      case 'mobile-ios':
        return <Smartphone className="w-4 h-4 text-gray-600" />;
      case 'mobile-android':
        return <Smartphone className="w-4 h-4 text-green-500" />;
      case 'console-switch':
        return <Gamepad2 className="w-4 h-4 text-red-500" />;
      default:
        return <Cpu className="w-4 h-4 text-gray-500" />;
    }
  };
  
  // Platform label text (simplified)
  const getPlatformLabel = (platform) => {
    switch(platform.toLowerCase()) {
      case 'active':
        return 'Active';
      case 'console-xbox':
        return 'Xbox';
      case 'console-ps5':
        return 'PS5';
      case 'pc':
        return 'PC';
      case 'mobile-ios':
        return 'iOS';
      case 'mobile-android':
        return 'Android';
      case 'console-switch':
        return 'Switch';
      default:
        return platform;
    }
  };

  // Status icon and color
  const getStatusConfig = (status) => {
    switch(status) {
      case 'production':
      case 'in-development':
        return {
          icon: <PlayCircle className="w-3 h-3" />,
          bgColor: 'bg-green-50',
          textColor: 'text-green-700',
          borderColor: 'border-green-200',
          label: 'ACTIVE'
        };
      case 'pre-production':
        return {
          icon: <Clock className="w-3 h-3" />,
          bgColor: 'bg-yellow-50',
          textColor: 'text-yellow-700',
          borderColor: 'border-yellow-200',
          label: 'PRE-PRODUCTION'
        };
      case 'testing':
        return {
          icon: <AlertCircle className="w-3 h-3" />,
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-700',
          borderColor: 'border-blue-200',
          label: 'TESTING'
        };
      default:
        return {
          icon: <Clock className="w-3 h-3" />,
          bgColor: 'bg-gray-50',
          textColor: 'text-gray-700',
          borderColor: 'border-gray-200',
          label: status ? status.replace('-', ' ').toUpperCase() : 'PLANNING'
        };
    }
  };

  // Fetch team size for this specific project
  useEffect(() => {
    const fetchTeamSize = async () => {
      try {
        if (project.id) {
          // Get full project data to access team_members
          const fullProject = await projectService.getProject(project.id);
          
          // Get the actual team members count from the database
          // Handle different possible data structures
          if (fullProject.team_members && Array.isArray(fullProject.team_members)) {
            setTeamSize(fullProject.team_members.length);
          } else if (fullProject.team && typeof fullProject.team === 'object' && fullProject.team.total) {
            setTeamSize(fullProject.team.total);
          } else if (project.team && typeof project.team === 'object' && project.team.total) {
            setTeamSize(project.team.total);
          } else if (project.team && typeof project.team === 'number') {
            setTeamSize(project.team);
          } else if (fullProject.team && typeof fullProject.team === 'number') {
            setTeamSize(fullProject.team);
          } else {
            // Fallback to 0 if no team data found
            setTeamSize(0);
          }
        }
      } catch (err) {
        console.error('Error fetching team size:', err);
        // Fallback to project.team if it exists
        if (project.team) {
          if (typeof project.team === 'object' && project.team.total) {
            setTeamSize(project.team.total);
          } else if (typeof project.team === 'number') {
            setTeamSize(project.team);
          } else {
            setTeamSize(0);
          }
        }
      }
    };
    
    fetchTeamSize();
  }, [project.id, project.team]);

  // Fetch bug counts for this specific project
  useEffect(() => {
    const fetchBugCounts = async () => {
      try {
        setLoadingBugs(true);
        
        // Get all bugs from the bug service
        const allBugs = await bugService.getBugs();
        
        // Filter bugs for this project
        const projectBugs = allBugs.filter(bug => 
          bug.project === project.name || 
          bug.project_id === project.id ||
          (bug.project && bug.project.toLowerCase() === project.name.toLowerCase())
        );
        
        // Count bugs by priority (only count active bugs)
        const counts = {
          critical: projectBugs.filter(bug => 
            bug.priority === 'critical' && 
            bug.status !== 'resolved' && 
            bug.status !== 'closed'
          ).length,
          high: projectBugs.filter(bug => 
            bug.priority === 'high' && 
            bug.status !== 'resolved' && 
            bug.status !== 'closed'
          ).length,
          medium: projectBugs.filter(bug => 
            bug.priority === 'medium' && 
            bug.status !== 'resolved' && 
            bug.status !== 'closed'
          ).length,
          low: projectBugs.filter(bug => 
            bug.priority === 'low' && 
            bug.status !== 'resolved' && 
            bug.status !== 'closed'
          ).length
        };
        
        setBugCounts(counts);
      } catch (err) {
        console.error('Error fetching bug counts:', err);
        if (project.bugs) {
          setBugCounts({
            critical: project.bugs.critical || 0,
            high: project.bugs.high || 0,
            medium: project.bugs.medium || 0,
            low: 0
          });
        }
      } finally {
        setLoadingBugs(false);
      }
    };
    
    fetchBugCounts();
  }, [project.name, project.id, project.bugs]);
  
  // Calculate total active bugs
  const totalActiveBugs = bugCounts.critical + bugCounts.high + bugCounts.medium + bugCounts.low;
  
  const statusConfig = getStatusConfig(project.status);
  
  return (
    <Card 
      hover 
      onClick={() => navigate(`/devportal/projects/${project.id}`)}
      className="cursor-pointer group hover:shadow-lg transition-all duration-200"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-black">
            {project.name}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2">
            {project.description}
          </p>
        </div>
      </div>
      
      {/* Status and Platforms - Spaced out */}
      <div className="space-y-4 mb-6">
        {/* Status Badge */}
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${statusConfig.bgColor} ${statusConfig.borderColor} w-fit`}>
          <div className={statusConfig.textColor}>
            {statusConfig.icon}
          </div>
          <span className={`text-xs font-semibold ${statusConfig.textColor}`}>
            {statusConfig.label}
          </span>
        </div>
        
        {/* Platform Icons with spacing */}
        {project.platform && project.platform.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {project.platform.map((platform, index) => (
              <div 
                key={index}
                className="flex flex-col items-center gap-1"
                title={getPlatformLabel(platform)}
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-50 border border-gray-200 group-hover:bg-gray-100 transition-colors">
                  {getPlatformIcon(platform)}
                </div>
                <span className="text-xs text-gray-600 font-medium">
                  {getPlatformLabel(platform)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Stats Row */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Users className="w-4 h-4" />
            <span>Team Size</span>
          </div>
          <span className="font-medium text-gray-900">{teamSize} members</span>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>Target Release</span>
          </div>
          <span className="font-medium text-gray-900">
            {formatDate(project.targetRelease, 'MMM yyyy')}
          </span>
        </div>
      </div>
      
      {/* Bug Counts Section - Updated Colors */}
      <div className="pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Critical Bugs - Red with pulse */}
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2 mb-1">
                <div className={`w-3 h-3 rounded-full ${bugCounts.critical > 0 ? 'bg-red-600 animate-pulse' : 'bg-gray-300'}`} />
                <span className="font-bold text-gray-900">
                  {loadingBugs ? '...' : bugCounts.critical}
                </span>
              </div>
              <span className="text-xs text-gray-500">Critical</span>
            </div>
            
            {/* High Bugs - Red (no pulse) */}
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2 mb-1">
                <div className={`w-3 h-3 rounded-full ${bugCounts.high > 0 ? 'bg-red-500' : 'bg-gray-300'}`} />
                <span className="font-bold text-gray-900">
                  {loadingBugs ? '...' : bugCounts.high}
                </span>
              </div>
              <span className="text-xs text-gray-500">High</span>
            </div>
            
            {/* Medium Bugs - Orange */}
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2 mb-1">
                <div className={`w-3 h-3 rounded-full ${bugCounts.medium > 0 ? 'bg-orange-500' : 'bg-gray-300'}`} />
                <span className="font-bold text-gray-900">
                  {loadingBugs ? '...' : bugCounts.medium}
                </span>
              </div>
              <span className="text-xs text-gray-500">Medium</span>
            </div>
          </div>
          
          {/* View Arrow */}
          <div className="flex items-center gap-2">
            {totalActiveBugs > 0 && (
              <div className="flex items-center gap-1 px-3 py-1.5 bg-red-50 rounded-lg border border-red-200">
                <Bug className="w-3.5 h-3.5 text-red-600" />
                <span className="text-xs font-semibold text-red-700">
                  {totalActiveBugs} active
                </span>
              </div>
            )}
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-black transition-colors" />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ProjectCard;