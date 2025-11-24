import React, { useState, useEffect, useRef } from 'react';
import AdminLayout from "../Layout/AdminLayout";
import CloseButton from "../Chatbot/CloseButton";
import axios from "axios";
import { submitIdea } from "../../services/submitIdea";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { formatDistanceToNow } from "date-fns";
import relativeTime from "dayjs/plugin/relativeTime";
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

function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  // Create ref for scrolling to all ideas section
  const allIdeasRef = useRef(null);

  const navigate = useNavigate();
  //  LOGOUT FUNCTION
  const handleLogout = () => {
    // Clears all authentication data from local storage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('username');
    localStorage.removeItem('email');

    // Redirect the user to the login page
    navigate('/login', { replace: true });
  };
  // Function to scroll to all ideas
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
    const res = await axios.get("http://13.222.154.187/api/dashboard-stats/", {
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


  // User Ideas Data 
  const [userIdeas, setUserIdeas] = useState([]);
  useEffect(() => {
    const fetchUserIdeas = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await axios.get("http://13.222.154.187/api/ranked/", {
          headers: { Authorization: `Bearer ${token}` }
        });

        const mappedIdeas = res.data.results.map((idea) => ({
          id: idea.conversation_id,
          title: idea.idea_name,
          score: idea.total_score,
          accepted: idea.is_approved,
          user: idea.user,
          timestamp: idea.approved_at || ""  // optional
        }));
        // Sort: unreviewed first, then reviewed — both by score descending
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
      await axios.post(`http://13.222.154.187/api/${id}/disapprove/`, {}, {
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
    await axios.post(`http://13.222.154.187/api/${id}/approve/`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setUserIdeas(prev => prev.filter(idea => idea.id !== id));
    await fetchStats(); // ✅ Refresh dashboard stats immediately
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
        const res = await axios.get("http://13.222.154.187/api/recent-chats/", {
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
        const res = await axios.get("http://13.222.154.187/api/recent-users/", {
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
        const res = await axios.get("http://13.222.154.187/api/user-rankings/", {
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


  // Activity
  const [range, setRange] = useState("7");
  const [weeklyData, setWeeklyData] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      console.warn("Missing access token — skipping weekly activity fetch.");
      return;
    }

    axios
      .get(`http://13.222.154.187/api/weekly-activity/?range=${range}`, {
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

  // Rankings Graph Data (Top 6 users by score)
  const rankingsGraphData = Array.isArray(rankings) ? rankings.slice(0, 6) : [];
  const menuItems = [
    { name: 'Dashboard', icon: '📊', path: '/dashboard', active: true }
    // { name: 'Chatbot', icon: '💬', path: '/idea' },
  ];

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
      const res = await axios.get(`http://13.222.154.187/api/user-ideas/${userId}/`, {
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
      const res = await axios.get(`http://13.222.154.187/api/conversation/${conversationId}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedConversation(res.data);
    } catch (err) {
      console.error("Failed to fetch conversation:", err);
      setSelectedConversation([]);
    }
  };





  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Custom Scrollbar Styles */}
      <style>{`
        /* Custom scrollbar for webkit browsers */
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
       
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
       
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #0d9488;
          border-radius: 10px;
        }
       
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #0f766e;
        }
       
        /* Firefox scrollbar */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #0d9488 #f1f5f9;
        }
      `}</style>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-200">
          <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-xl font-bold">A</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Aideator</h2>
            <p className="text-xs text-gray-500">Admin Panel</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="px-4 py-6 space-y-2">
          {menuItems.map((item) => (
            <a
              key={item.name}
              href={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${item.active
                ? 'bg-teal-50 text-teal-700 font-medium'
                : 'text-gray-700 hover:bg-gray-100'
                }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.name}</span>
            </a>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-4 md:px-6 py-4">
            <button
              onClick={() => setSidebarOpen(prev => !prev)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Search Bar */}
            <div className="flex-1 max-w-md mx-4">
              <div className="relative">
              </div>
            </div>

            {/* Right Side Icons */}
            <div className="flex items-center gap-4">

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">AD</span>
                  </div>
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <button
                      // NEW LOGOUT HANDLER
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors">
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6 lg:p-8">
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Dashboard Overview</h1>
            <p className="text-gray-600 mt-1">Welcome back! Here's the overview of AI-Ideas at your firm.</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => {
              const trendColor = stat.trend.startsWith('+') ? 'text-green-600' : 'text-red-600';
              return (
                <div
                  key={index}
                  onClick={() => handleCardClick(stat.title)}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer hover:ring-2 hover:ring-teal-500"
                >

                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${colorClasses[stat.color]} rounded-lg flex items-center justify-center text-2xl`}>
                      {stat.icon}
                    </div>
                    <span className={`text-sm font-semibold ${trendColor}`}>{stat.trend}</span>
                  </div>
                  <h3 className="text-gray-600 text-sm font-medium mb-1">{stat.title}</h3>
                  <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                </div>
              );
            })}
          </div>

          {/* User Ideas Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-800">💡 Recent User Ideas</h3>
            </div>

            {/* Scrollable container */}
            <div className="max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userIdeas.map((idea) => (
                  <div
                    key={idea.id}
                    className="relative border bg-teal-100 rounded-lg p-4 hover:shadow-md transition-shadow flex flex-col justify-between"
                  >
                    {/* User */}
                    <div className="absolute top-3 right-3 text-xs font-semibold text-gray-700">

                      <span className="text-white text-xs font-medium">
                        {(idea.user?.email || "User")
                          .split("@")[0]
                          .split(".")
                          .map((n) => n[0].toUpperCase())
                          .join("")}
                      </span>
                    </div>

                    {/* Rating  */}
                    <div className="absolute top-3 right-3 flex items-center text-yellow-500 text-xs font-semibold gap-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        className="w-4 h-4"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span>Score: {Math.floor(idea.score)}</span>
                    </div>

                    {/* Idea Content */}
                    <div className="mt-10">
                      <p className="text-sm text-gray-800 font-medium mb-2 line-clamp-2">
                        {idea.title}
                      </p>
                      <span className="text-xs text-gray-500">{idea.timestamp}</span>
                    </div>

                    {/* Accept / Reject Buttons */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                      <div className="flex gap-2 ml-auto">
                        {/* Accept Button */}
                        <button
                          className={`px-2 py-1 text-xs rounded-md transition-colors flex items-center gap-1 ${idea.accepted
                            ? "bg-teal-500 text-white cursor-not-allowed"
                            : "bg-teal-400 hover:bg-teal-400 text-black"
                            }`}
                          onClick={() => handleApprove(idea.id)}
                          disabled={idea.accepted}
                        >
                          {idea.accepted ? (
                            <>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                                stroke="currentColor"
                                className="w-4 h-4"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                              Accepted
                            </>
                          ) : (
                            "Accept"
                          )}
                        </button>

                        {/* Reject Button */}
                        {!idea.accepted && (
                          <button
                            className="px-2 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded-md transition-colors"
                            onClick={() => handleReject(idea.id)}
                          >
                            Reject
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Top Ideas Rankings Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-800">🏆 Top Ideas</h3>
              </div>

              {/* Horizontal Bar Chart */}
              <div className="space-y-4">
  {[...userIdeas]
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map((idea, index) => (
      <div key={idea.id} className="flex items-center gap-3">
        {/* Rank Circle */}
        <div className="flex-shrink-0 w-8 text-center">
          <span
            className={`inline-block w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center border-2 ${
              index === 0
                ? "bg-yellow-100 text-yellow-700 border-yellow-300"
                : index === 1
                ? "bg-gray-100 text-gray-700 border-gray-300"
                : index === 2
                ? "bg-orange-100 text-orange-700 border-orange-300"
                : "bg-blue-50 text-blue-600 border-blue-200"
            }`}
          >
            {index + 1}
          </span>
        </div>

        {/* Idea Title + Bar + Rating */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-800 line-clamp-1">
              {idea.title || "Untitled Idea"}
            </span>

            {/* Rating */}
            <div className="flex items-center text-yellow-500 text-xs font-semibold ml-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 20 20"
                className="w-4 h-4 mr-1"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {typeof idea.score === "number" ? idea.score.toFixed(1) : "—"}
            </div>
          </div>

          {/* Rating Bar */}
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                idea.score > 0
                  ? "bg-gradient-to-r from-teal-500 to-teal-400"
                  : idea.score < 0
                  ? "bg-gradient-to-r from-red-500 to-red-400"
                  : "bg-gray-400"
              }`}
              style={{
                width: `${Math.min(Math.abs(idea.score), 100)}%`,
              }}
            />
          </div>
        </div>
      </div>
    ))}
</div>

            </div>
          </div>
          {/* Weekly Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-800">📊 Activity</h3>
              <select value={range}
                onChange={(e) => setRange(e.target.value)}
                className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
              </select>
            </div>

            {/* Dual Line Chart */}
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="totalIdeas"
                  stroke="#14b8a6"
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Total Ideas"
                />
                <Line
                  type="monotone"
                  dataKey="approvedIdeas"
                  stroke="#0ea5e9"
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Approved Ideas"
                />
              </LineChart>
            </ResponsiveContainer>

            {/* Chart Legend */}
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

            {/* Recent Users */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Users</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4">
                {users.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => navigate(`/user-ideas/${user.id}`)}
                    className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"

                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-medium">
                        {user.name.split(" ").map((n) => n[0]).join("")}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-gray-800 truncate">
                        {user.name}
                      </h4>
                      <p className="text-xs text-gray-600 truncate">{user.email}</p>
                      {/*<div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">
                          {formatRelativeTime(user.last_activity)}
                        </span>
                      </div>*/}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div >
    </div >
  );
}
export default Dashboard;


{/* Recent Chats and Recent Users Side-by-Side */ }
{/* Recent Chats */ }

{/*
            <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Chats</h3>
              <div className="space-y-4">
                {recentChats.map((chat) => (
                  <div
                    key={chat.id}
                    className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-medium">
                       {chat.initials || "U"}
                      </span>

                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-semibold text-gray-800 truncate">
                        {chat.name || "User"}
                       </h4>

                        <span className="text-xs text-gray-500">
                        {chat.timestamp ? new Date(chat.timestamp).toLocaleString() : ""}
                       </span>

                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {chat.preview || "No message"}
                      </p>

                    </div>
                  </div>
                ))}
              </div>
            </div>
             */}




{/* Rankings Table */ }
{/*
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800">🏅 User Rankings</h3>
              <button className="text-sm text-teal-600 hover:text-teal-700 font-medium">Export</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ideas</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Votes</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {rankings.map((user) => (
                    <tr key={user.rank} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold border-2 ${getRankBadgeColor(user.rank)}`}>
                          {user.rank}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                              {user.user.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <span className="ml-3 text-sm font-medium text-gray-900">{user.user}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-800">{user.ideas}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">{user.votes}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-teal-600">{user.score}</span>
                          <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button onClick={() => fetchUserChats(user.id)}
                         className="text-teal-600 hover:underline text-sm">
                         View Chat
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          */}




