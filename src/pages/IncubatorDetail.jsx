import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Calendar, MessageSquare, Share2, 
  Rocket, Loader, Check, Copy, Twitter, Mail
} from 'lucide-react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { ideaService } from '../services/ideaService';
import { useAuth } from '@/hooks/useAuth';

// Import Avatars (same as in Incubator.jsx and Team.jsx)
import avatar1 from '../assets/avatars/avatar1.png';
import avatar2 from '../assets/avatars/avatar2.png';
import avatar3 from '../assets/avatars/avatar3.png';
import avatar4 from '../assets/avatars/avatar4.png';
import avatar5 from '../assets/avatars/avatar5.png';
import avatar6 from '../assets/avatars/avatar6.png';
import avatar7 from '../assets/avatars/avatar7.png';
import avatar8 from '../assets/avatars/avatar8.png';
import avatar9 from '../assets/avatars/avatar9.png';
import avatar10 from '../assets/avatars/avatar10.png';
import avatar11 from '../assets/avatars/avatar11.png';
import avatar12 from '../assets/avatars/avatar12.png';
import avatar13 from '../assets/avatars/avatar13.png';
import avatar14 from '../assets/avatars/avatar14.png';
import avatar15 from '../assets/avatars/avatar15.png';
import avatar16 from '../assets/avatars/avatar16.png';
import avatar17 from '../assets/avatars/avatar17.png';
import avatar18 from '../assets/avatars/avatar18.png';
import avatar19 from '../assets/avatars/avatar19.png';
import avatar20 from '../assets/avatars/avatar20.png';

const IncubatorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [idea, setIdea] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const avatarMap = { 
    avatar1, avatar2, avatar3, avatar4, avatar5, 
    avatar6, avatar7, avatar8, avatar9, avatar10,
    avatar11, avatar12, avatar13, avatar14, avatar15,
    avatar16, avatar17, avatar18, avatar19, avatar20
  };

  // Updated getAvatar function - now supports both local names and full URLs
  const getAvatar = (avatarValue) => {
    // Local avatar from imported files
    if (avatarValue && avatarMap[avatarValue]) {
      return avatarMap[avatarValue];
    }

    // Full external URL (Google, GitHub, Supabase storage, etc.)
    if (avatarValue && typeof avatarValue === 'string' && 
        (avatarValue.startsWith('http://') || avatarValue.startsWith('https://'))) {
      return avatarValue;
    }

    // Nothing valid → null (shows fallback with initial)
    return null;
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const ideaData = await ideaService.getIdeaById(id);
      const commentsData = await ideaService.getComments(id);
      setIdea(ideaData);
      setComments(commentsData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePostComment = async () => {
    if (!commentText.trim() || !user) return;
    try {
      setSubmittingComment(true);
      await ideaService.addComment(id, user, commentText);
      setCommentText('');
      const updatedComments = await ideaService.getComments(id);
      setComments(updatedComments);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleShare = (type) => {
    const url = window.location.href;
    const text = `Check out this game concept: ${idea.title}`;
    
    if (type === 'copy') {
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    } else if (type === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
    } else if (type === 'email') {
      window.location.href = `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(url)}`;
    }
    setShareOpen(false);
  };

  if (loading) return <div className="flex justify-center pt-20"><Loader className="animate-spin" /></div>;
  if (!idea) return <div>Idea not found</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      <Button 
        variant="ghost" 
        icon={ArrowLeft} 
        onClick={() => navigate('/incubator')}
        className="pl-0 hover:bg-transparent hover:text-gray-600"
      >
        Back to Incubator
      </Button>

      {/* Hero Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-black text-white text-xs font-bold uppercase tracking-wider rounded-md">
            {idea.genre}
          </span>
          <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-bold uppercase tracking-wider rounded-md">
            {idea.platform}
          </span>
        </div>
        <h1 className="text-4xl font-extrabold text-gray-900 leading-tight">
          {idea.title}
        </h1>
        <div className="flex items-center gap-6 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900">By {idea.author_name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{new Date(idea.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="p-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Rocket className="w-5 h-5" />
              The Pitch
            </h3>
            <p className="text-lg text-gray-700 leading-relaxed whitespace-pre-line">
              {idea.elevator_pitch}
            </p>
          </Card>

          {/* Comments Section */}
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Discussion ({comments.length})
            </h3>
            
            <div className="mb-6">
              <textarea 
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Share your thoughts..."
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none resize-none bg-white"
                rows={3}
              />
              <div className="flex justify-end mt-2">
                <Button 
                  size="sm" 
                  className="!bg-black !text-white"
                  onClick={handlePostComment}
                  disabled={submittingComment || !commentText.trim()}
                >
                  {submittingComment ? 'Posting...' : 'Post Comment'}
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {comments.length > 0 ? comments.map(comment => {
                // Optional debug: uncomment to see what value is actually coming
                // console.log("Comment avatar:", comment.profiles?.avatar_url);
                
                return (
                  <div key={comment.id} className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                    <div className="flex items-start gap-3 mb-2">
                      <div className="h-8 w-8 rounded-full bg-gray-200 overflow-hidden flex-shrink-0 ring-2 ring-gray-100">
                        {getAvatar(comment.profiles?.avatar_url) ? (
                          <img 
                            src={getAvatar(comment.profiles?.avatar_url)} 
                            alt={comment.profiles?.name || 'User'} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-600 text-white text-xs font-bold">
                            {comment.profiles?.name?.[0] || '?'}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-gray-900">
                            {comment.profiles?.name || 'Unknown'}
                          </span>
                          <span className="text-xs text-gray-500">
                            • {new Date(comment.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-700 text-sm mt-1 leading-relaxed">
                          {comment.text}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              }) : (
                <div className="text-center py-8 text-gray-500 text-sm">
                  No comments yet. Be the first to give feedback!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
              Share Concept
            </h3>
            <div className="relative">
              <Button 
                variant="outline" 
                className="w-full mb-2 justify-center" 
                icon={Share2}
                onClick={() => setShareOpen(!shareOpen)}
              >
                Share
              </Button>
              
              {shareOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 p-2 z-20 flex flex-col gap-1">
                  <button onClick={() => handleShare('copy')} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded text-sm text-left">
                    <Copy className="w-4 h-4" /> Copy Link
                  </button>
                  <button onClick={() => handleShare('email')} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded text-sm text-left">
                    <Mail className="w-4 h-4" /> Email
                  </button>
                  <button onClick={() => handleShare('twitter')} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded text-sm text-left">
                    <Twitter className="w-4 h-4" /> Twitter
                  </button>
                </div>
              )}
            </div>
            
            <div className="mt-6">
              <div className="text-xs text-gray-500 mb-1">Target Audience</div>
              <div className="font-medium text-gray-900 mb-3">{idea.target_audience || 'General'}</div>
              
              <div className="text-xs text-gray-500 mb-1">Estimated Scope</div>
              <div className="font-medium text-gray-900">Medium</div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default IncubatorDetail;