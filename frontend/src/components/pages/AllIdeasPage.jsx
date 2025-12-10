import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./FlipCard.css";
import Header from "../Header";
import Footer from "../Footer";
 
function AllIdeasPage() {
  const [ideas, setIdeas] = useState([]);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
 
  const navigate = useNavigate();
 
  useEffect(() => {
    axios
      .get("/api/all-ideas", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      })
      .then((res) => {
        if (Array.isArray(res.data)) {
          setIdeas(res.data);
        } else {
          setIdeas([]);
        }
      })
      .catch((err) => {
        console.error("❌ API Error:", err);
        setIdeas([]);
      });
  }, []);
 
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login", { replace: true });
  };
 
  return (
    <div className="flex flex-col min-h-screen bg-teal-50">
      <Header
        handleLogout={handleLogout}
        showProfileMenu={showProfileMenu}
        setShowProfileMenu={setShowProfileMenu}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />
      <main className="flex-1 px-6 pt-22 pb-10">
        <div className="relative mb-6 px-4 flex items-center">
  <h2 className="flex-1 text-2xl font-bold flex justify-center items-center gap-2">
    💡 All Ideas
  </h2>

  <button
    onClick={() => navigate("/user-page")}
    className="absolute right-4 top-1/2 -translate-y-1/2
               px-4 py-2 bg-teal-600 text-white rounded-lg font-medium
               shadow-md hover:bg-teal-700 transition duration-200 cursor-pointer">
      Add Idea
    </button>
  </div>
 
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {ideas.map((idea) => (
            <div key={idea.id} className="flip-card">
              <div className="flip-card-inner">
                <div className="flip-card-front bg-white p-4 rounded-lg shadow-md">
                  {/* <div className="text-lg text-gray-800 mb-2">
                    {idea.user?.split("@")[0] || "Unknown"}
                  </div> */}
                  <h4 className="text-xl font-bold text-gray-800 text-center">
                    {idea.name || "Untitled"}
                  </h4>
                </div>
                <div className="flip-card-back bg-teal-200 p-4 rounded-lg shadow-md">
                  <p className="text-sm text-gray-700 text-center">
                    {idea.description || "No description available."}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
 
export default AllIdeasPage;
 
 