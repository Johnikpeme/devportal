import React, { useState, useEffect } from 'react';
import { 
  Lightbulb, Plus, ThumbsUp, TrendingUp, X, Loader, Check 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import { ideaService } from '../services/ideaService';
import { useAuth } from '@/hooks/useAuth';

// Avatar Imports (Matching Team.jsx)
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

const Incubator = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('trending');
  const [modalVisible, setModalVisible] = useState(false);

  // Avatar Map
  const avatarMap = { 
  avatar1, avatar2, avatar3, avatar4, avatar5, avatar6, avatar7, avatar8, avatar9, avatar10,
  avatar11, avatar12, avatar13, avatar14, avatar15, avatar16, avatar17, avatar18, avatar19, avatar20 
};
  const getAvatar = (url) => avatarMap[url] || null;

  const [newIdea, setNewIdea] = useState({
    title: '',
    elevator_pitch: '',
    genre: '',
    platform: 'Mobile'
  });

  useEffect(() => {
    fetchIdeas();
  }, [filter]);

  // Modal Animation + body scroll lock
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => setModalVisible(true), 10);
    } else {
      document.body.style.overflow = 'unset';
      setModalVisible(false);
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [showModal]);

  const fetchIdeas = async () => {
    try {
      setLoading(true);
      const data = await ideaService.getIdeas();
      
      let sorted = [...(data || [])];
      if (filter === 'trending') sorted.sort((a, b) => b.votes - a.votes);
      if (filter === 'new') sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      
      setIdeas(sorted);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (e, idea) => {
    e.stopPropagation();
    if (!user) return;

    const hasVoted = idea.voters.some(v => v.id === user.id);
    if (hasVoted) return;

    try {
      setIdeas(prev => prev.map(i => {
        if (i.id === idea.id) {
          return {
            ...i,
            votes: i.votes + 1,
            voters: [...i.voters, { 
  id: user.id, 
  name: user.user_metadata?.name || user.email?.split('@')[0],
  avatar_url: user.user_metadata?.avatar_url || 'avatar1' 
}]
          };
        }
        return i;
      }));

      await ideaService.toggleVote(idea.id, user);
      fetchIdeas();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await ideaService.createIdea({
        ...newIdea,
        author_id: user?.id,
        author_name: user?.user_metadata?.name || user?.email?.split('@')[0],
        created_at: new Date().toISOString()
      });
      setShowModal(false);
      setNewIdea({ title: '', elevator_pitch: '', genre: '', platform: 'Mobile' });
      fetchIdeas();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading && !ideas.length) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">The Incubator</h1>
          <p className="text-gray-600">Pitch concepts and vote for the next hit game.</p>
        </div>
        <Button 
          onClick={() => setShowModal(true)}
          className="w-full sm:w-auto !bg-black !text-white hover:!bg-gray-800 shadow-lg"
          icon={Plus}
        >
          Pitch New Idea
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-1">
        <button 
          onClick={() => setFilter('trending')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            filter === 'trending' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Trending
        </button>
        <button 
          onClick={() => setFilter('new')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            filter === 'new' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Newest
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ideas.map((idea) => {
          const hasVoted = user ? idea.voters.some(v => v.id === user.id) : false;
          
          return (
            <div 
              key={idea.id}
              onClick={() => navigate(`/incubator/${idea.id}`)}
              className="group bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-xl hover:border-gray-300 transition-all duration-300 cursor-pointer flex flex-col h-full"
            >
              <div className="flex justify-between items-start mb-4">
                <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-md uppercase tracking-wider">
                  {idea.genre || 'Concept'}
                </span>
                {idea.votes > 5 && (
                  <span className="flex items-center gap-1 text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                    <TrendingUp className="w-3 h-3" /> Hot
                  </span>
                )}
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-1">
                {idea.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-6 line-clamp-3 flex-1">
                {idea.elevator_pitch}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                <div className="flex -space-x-2 overflow-hidden">
                  {idea.voters.slice(0, 5).map((voter, idx) => (
                    <div key={idx} className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-gray-200 overflow-hidden">
                      {getAvatar(voter.avatar_url) ? (
                        <img src={getAvatar(voter.avatar_url)} alt={voter.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-gray-400 text-[8px] text-white font-bold">
                          {voter.name?.[0]}
                        </div>
                      )}
                    </div>
                  ))}
                  {idea.voters.length > 5 && (
                    <div className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-gray-100 flex items-center justify-center text-[8px] font-bold text-gray-500">
                      +{idea.voters.length - 5}
                    </div>
                  )}
                  {idea.voters.length === 0 && <span className="text-xs text-gray-400">No votes yet</span>}
                </div>
                
                <button 
                  onClick={(e) => handleVote(e, idea)}
                  disabled={hasVoted}
                  className={`
                    flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all
                    ${hasVoted 
                      ? 'bg-blue-100 text-blue-700 cursor-default' 
                      : 'bg-gray-50 hover:bg-black hover:text-white text-gray-600'
                    }
                  `}
                >
                  {hasVoted ? <Check className="w-4 h-4" /> : <ThumbsUp className="w-4 h-4" />}
                  <span className="text-sm font-bold">{idea.votes}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal with restored strong blur */}
      {showModal && (
        <div 
          className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-opacity duration-300 ease-in-out ${
            modalVisible ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setShowModal(false)}
        >
          {/* Strong blurred backdrop */}
          <div 
            className="absolute inset-0 bg-black/65 backdrop-blur-sm"
            style={{ backdropFilter: 'blur(8px)' }}
          />

          <div 
            className={`
              relative bg-white rounded-2xl shadow-2xl w-full 
              max-w-md 
              max-h-[90vh] overflow-y-auto
              transform transition-all duration-300 ease-in-out
              ${modalVisible ? 'translate-y-0 scale-100' : 'translate-y-4 scale-95'}
            `}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-sm border-b border-gray-100 flex justify-between items-center px-6 py-5">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <div className="p-2 bg-yellow-50 rounded-lg">
                  <Lightbulb className="w-5 h-5 text-yellow-600" />
                </div>
                Pitch New Game
              </h3>
              <button 
                onClick={() => setShowModal(false)} 
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-800"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleCreate} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Game Title</label>
                <input 
                  required
                  value={newIdea.title}
                  onChange={e => setNewIdea({...newIdea, title: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:bg-white outline-none transition-all"
                  placeholder="e.g. Neon Horizon"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Elevator Pitch</label>
                <textarea 
                  required
                  value={newIdea.elevator_pitch}
                  onChange={e => setNewIdea({...newIdea, elevator_pitch: e.target.value})}
                  rows={5}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:bg-white outline-none resize-none transition-all"
                  placeholder="What makes this game unique? Describe the core loop..."
                />
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Genre</label>
                  <select 
                    value={newIdea.genre}
                    onChange={e => setNewIdea({...newIdea, genre: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none appearance-none"
                  >
                    <option value="">Select Genre...</option>
                    <option value="RPG">RPG</option>
                    <option value="FPS">FPS</option>
                    <option value="Strategy">Strategy</option>
                    <option value="Puzzle">Puzzle</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Platform</label>
                  <select 
                    value={newIdea.platform}
                    onChange={e => setNewIdea({...newIdea, platform: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none appearance-none"
                  >
                    <option value="Mobile">Mobile</option>
                    <option value="PC">PC</option>
                    <option value="Console">Console</option>
                  </select>
                </div>
              </div>

              <div className="pt-6 flex flex-col gap-3">
                <Button 
                  variant="primary" 
                  type="submit" 
                  className="w-full !py-4 !bg-black !text-white hover:!bg-gray-800 rounded-xl font-bold shadow-lg shadow-black/10"
                >
                  Launch Pitch
                </Button>
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-full py-3 text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Incubator;