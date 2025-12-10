import React, { useState, useEffect, useRef } from 'react';
import axios from "axios";
import { submitIdea } from "../../services/submitIdea";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { formatDistanceToNow } from "date-fns";
import relativeTime from "dayjs/plugin/relativeTime";
import Header from '../Header';
dayjs.extend(relativeTime);
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import Footer from '../Footer';
 
function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
 
  const allIdeasRef = useRef(null);
 
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('username');
    localStorage.removeItem('email');
 
    navigate('/login', { replace: true });
  };
  const scrollToAllIdeas = () => {
    allIdeasRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  };
 
  const handleSubmit = async () => {
    try {
      const result = await submitIdea({
        conversation_id: currentConversationId,
        answer: userIdeaText,
      });
      console.log('Idea saved:', result.message);
    } catch (err) {
      console.error('Submission failed:', err);
    }
  };
 
  const formatRelativeTime = (isoString) => {
    if (!isoString) return "";
 
    const now = new Date();
    const past = new Date(isoString);
 
    const diffMs = now.getTime() - past.getTime();
 
    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
 
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
    return `Just now`;
  };
 
  const [stats, setStats] = useState([]);
 
  const fetchStats = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      console.warn("No access token found — dashboard stats will not load.");
      return;
    }
    try {
      const res = await axios.get("/api/dashboard-stats/", {
        headers: { Authorization: `Bearer ${token}` }
      });
 
      const { total_ideas, approved_ideas } = res.data;
 
      setStats([
        { title: 'Total AI-Ideas', value: total_ideas, icon: '💬', color: 'blue', trend: '' },
        { title: 'Total Approved Ideas', value: approved_ideas, icon: '👥', color: 'green', trend: '' },
      ]);
    } catch (err) {
      console.error("Failed to fetch dashboard stats:", err);
    }
  };
 
  useEffect(() => {
    fetchStats();
  }, []);
 
  const [userIdeas, setUserIdeas] = useState([]);
  useEffect(() => {
    const fetchUserIdeas = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await axios.get("/api/ranked/", {
          headers: { Authorization: `Bearer ${token}` }
        });
 
        const mappedIdeas = res.data.results.map((idea) => ({
          id: idea.conversation_id,
          title: idea.idea_name,
          score: idea.total_score,
          accepted: idea.is_approved,
          user: idea.user,
          timestamp: idea.approved_at || "" 
        }));
        
        const sortedIdeas = mappedIdeas.sort((a, b) => {
          const aPending = a.accepted === null || a.accepted === false;
          const bPending = b.accepted === null || b.accepted === false;
 
          if (aPending && !bPending) return -1;
          if (!aPending && bPending) return 1;
 
          return b.score - a.score;
        });
 
        setUserIdeas(sortedIdeas);
 
 
      } catch (err) {
        console.error("Failed to fetch user ideas:", err);
      }
    };
    fetchUserIdeas();
  }, []);
 
  const handleReject = async (id) => {
    try {
      const token = localStorage.getItem("accessToken");
      await axios.post(`/api/${id}/disapprove/`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserIdeas(prev => prev.filter(idea => idea.id !== id));
    } catch (err) {
      console.error("Failed to reject idea:", err);
    }
  };
 
  const handleApprove = async (id) => {
    try {
      const token = localStorage.getItem("accessToken");
      await axios.post(`/api/${id}/approve/`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserIdeas(prev => prev.filter(idea => idea.id !== id));
      await fetchStats();
    } catch (err) {
      console.error("Failed to approve idea:", err);
    }
  };
 
 
  const [recentChats, setRecentChats] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [recentUserIdeas, setRecentUserIdeas] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState([]);
  const [rankings, setRankings] = useState([]);
 
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      console.warn("No access token found — skipping dashboard fetches.");
      return;
    }
 
    const fetchChats = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await axios.get("/api/recent-chats/", {
          headers: { Authorization: `Bearer ${token}` }
        });
 
        const mappedChats = res.data.map((chat) => {
          const firstUserMessage = Array.isArray(chat.messages)
            ? chat.messages.find(m => m.sender === "user" && m.text)
            : null;
 
          return {
            ...chat,
            preview: firstUserMessage?.text || "No message"
          };
        });
 
        setRecentChats(mappedChats);
      } catch (err) {
        console.error("Failed to fetch recent chats:", err);
        setRecentChats([]);
      }
    };
 
 
    const fetchUsers = async () => {
      try {
        const res = await axios.get("/api/recent-users/", {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log("Recent Users:", res.data);
        setUsers(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Failed to fetch recent users:", err);
        setUsers([]);
      }
    };
 
    const fetchRankings = async () => {
      try {
        const res = await axios.get("/api/user-rankings/", {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log("User Rankings:", res.data);
        setRankings(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Failed to fetch user rankings:", err);
        setRankings([]);
      }
    };
 
    fetchChats();
    fetchUsers();
    fetchRankings();
  }, []);
 

  const [range, setRange] = useState("7");
  const [weeklyData, setWeeklyData] = useState([]);
 
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
 
    if (!token) {
      console.warn("Missing access token — skipping weekly activity fetch.");
      return;
    }
 
    axios
      .get(`/api/weekly-activity/?range=${range}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const { labels, total_ideas, approved_ideas } = res.data;
        const formatted = labels.map((label, i) => ({
          day: label,
          totalIdeas: total_ideas[i],
          approvedIdeas: approved_ideas[i],
        }));
        setWeeklyData(formatted);
      })
      .catch((err) => {
        console.error("Error fetching weekly activity:", err);
      });
  }, [range]);
 
  const rankingsGraphData = Array.isArray(rankings) ? rankings.slice(0, 6) : [];
 
 
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    yellow: 'from-yellow-500 to-yellow-600',
    purple: 'from-purple-500 to-purple-600',
  };
 
  const maxValue = weeklyData?.length
    ? Math.max(...weeklyData.map(d => Number(d.totalIdeas || 0)))
    : 0;
 
 
  const maxScore = rankingsGraphData?.length
    ? Math.max(...rankingsGraphData.map(d => Number(d.score || 0)))
    : 0;
 
 
  const categoryColors = {
    Finance: 'bg-blue-100 text-blue-700',
    IoT: 'bg-purple-100 text-purple-700',
    Travel: 'bg-green-100 text-green-700',
    Health: 'bg-red-100 text-red-700',
    Education: 'bg-yellow-100 text-yellow-700',
    Food: 'bg-orange-100 text-orange-700',
  };
 
  const getRankBadgeColor = (rank) => {
    if (rank === 1) return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    if (rank === 2) return 'bg-gray-100 text-gray-700 border-gray-300';
    if (rank === 3) return 'bg-orange-100 text-orange-700 border-orange-300';
    return 'bg-blue-50 text-blue-600 border-blue-200';
  };
 
  const handleCardClick = (cardTitle) => {
    if (cardTitle === "Total AI-Ideas") {
      navigate("/ideas/all");
    } else if (cardTitle === "Total Approved Ideas") {
      navigate("/ideas/approved");
    }
  };
 
  const handleUserClick = async (userId) => {
    setSelectedUserId(userId);
    const token = localStorage.getItem("accessToken");
    try {
      const res = await axios.get(`/api/user-ideas/${userId}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRecentUserIdeas(res.data);
    } catch (err) {
      console.error("Failed to fetch user ideas:", err);
      setRecentUserIdeas([]);
    }
  };
 
  const handleIdeaClick = async (conversationId) => {
    const token = localStorage.getItem("accessToken");
    try {
      const res = await axios.get(`/api/conversation/${conversationId}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedConversation(res.data);
    } catch (err) {
      console.error("Failed to fetch conversation:", err);
      setSelectedConversation([]);
    }
  };

  const initialsFromName = (name = "") => {
    return name.split(" ").map(n => n[0] || '').join('').slice(0, 2).toUpperCase();
  };

  const customScrollbarStyle = `
    .custom-scrollbar::-webkit-scrollbar { width: 10px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 10px; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #0d9488; border-radius: 10px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #0f766e; }
    .custom-scrollbar { scrollbar-width: thin; scrollbar-color: #0d9488 #f1f5f9; }
  `;
 
  return (
    <div className="w-full h-screen overflow-y-auto bg-gray-50">
      <style>{customScrollbarStyle}</style>
 
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
 
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          showProfileMenu={showProfileMenu}
          setShowProfileMenu={setShowProfileMenu}
          handleLogout={handleLogout}
        />

        <main className="flex-1 overflow-y-auto bg-white p-6 w-full mt-20">
 
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Dashboard Overview</h1>
            <p className="text-gray-600 mt-1">Welcome back! Here's the overview of AI-Ideas at your firm.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {stats.map((stat, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between hover:shadow-md transition cursor-pointer"
                onClick={() => handleCardClick(stat.title)}
              >
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl bg-gradient-to-br ${colorClasses[stat.color] || colorClasses.blue}`}>
                    {stat.icon}
                  </div>
                  <div className="text-sm font-semibold text-gray-500">{stat.trend}</div>
                </div>
                <div className="mt-6">
                  <p className="text-sm text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-800 mt-2">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-800">💡 Recent User Ideas</h3>
            </div>
 
            <div className="max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {userIdeas.map((idea) => (
                  <div
                    key={idea.id}
                    className="relative border bg-teal-50 rounded-lg p-4 hover:shadow-md transition-shadow 
             flex flex-col justify-between h-[230px] overflow-hidden">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-md font-semibold text-gray-800 mb-1 line-clamp-2">{idea.title}</h4>
                        <span className="text-xs text-gray-500">
                          {idea.timestamp ? formatRelativeTime(idea.timestamp) : ''}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-yellow-500 font-semibold text-sm">⭐ Score: {Math.floor(Number(idea.score) || 0)}</div>
                        <div className={`mt-2 text-xs inline-flex items-center px-2 py-1 rounded ${idea.accepted ? 'bg-teal-600 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>
                          {idea.accepted ? 'Accepted' : 'Pending'}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end gap-2">
                      {!idea.accepted && (
                      <div className="mt-4 flex justify-end gap-2">
                        <button
                          className="px-3 py-1 text-xs rounded-md transition-colors flex items-center gap-1 
                                    bg-teal-400 hover:bg-teal-500 text-black"
                          onClick={() => handleApprove(idea.id)}
                        >
                          Accept
                        </button>
                        <button
                          className="px-3 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-700 
                                    rounded-md transition-colors"
                          onClick={() => handleReject(idea.id)}
                        >
                          Reject
                        </button>
                      </div>
                    )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex flex-col lg:flex-row gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex-1">
              <h3 className="text-lg font-bold text-gray-800 mb-4">🏆 Top Ideas</h3>
 
              <div className="space-y-4">
                {[...userIdeas].sort((a, b) => b.score - a.score).slice(0, 6).map((idea, index) => (
                  <div key={idea.id} className="flex items-center gap-3">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2
                      ${index === 0 ? "bg-yellow-100 text-yellow-700 border-yellow-300"
                        : index === 1 ? "bg-gray-100 text-gray-700 border-gray-300"
                          : index === 2 ? "bg-orange-100 text-orange-700 border-orange-300"
                            : "bg-blue-50 text-blue-600 border-blue-200"}`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-800 line-clamp-1">{idea.title || "Untitled"}</span>
                        <span className="text-yellow-600 text-sm">⭐ {typeof idea.score === 'number' ? idea.score.toFixed(1) : '—'}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
                        <div
                          className="h-2 rounded-full transition-all duration-500 bg-teal-500"
                          style={{ width: `${Math.min(Math.abs(Number(idea.score || 0)), 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
 
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-800">📊 Activity</h3>
              <select value={range} onChange={(e) => setRange(e.target.value)} className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-teal-500">
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
              </select>
            </div>
 
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip contentStyle={{ backgroundColor: "#fff", borderRadius: "8px", border: "1px solid #e5e7eb" }} />
                <Legend />
                <Line type="monotone" dataKey="totalIdeas" stroke="#14b8a6" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Total Ideas" />
                <Line type="monotone" dataKey="approvedIdeas" stroke="#0ea5e9" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Approved Ideas" />
              </LineChart>
            </ResponsiveContainer>
 
            <div className="mt-6 flex items-center justify-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Total Ideas</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-sky-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Approved Ideas</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-6">Recent Users</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {users.map((user) => (
                <div
                  key={user.id}
                  onClick={() => navigate(`/user-ideas/${user.id}`)}
                  className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-medium">{initialsFromName(user.name || user.email || 'U')}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-gray-800 truncate">{user.name || user.email}</h4>
                    <p className="text-xs text-gray-600 truncate">{user.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
 
        </main>
      </div >
      <Footer />
    </div >
  );
}
export default Dashboard;
 
 