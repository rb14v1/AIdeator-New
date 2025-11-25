import { useEffect, useState } from "react";
import axios from "axios";
import "./FlipCard.css";
import Header from "../Header";
import Footer from "../Footer";
 
function AllIdeasPage() {
  const [ideas, setIdeas] = useState([]);
 
  useEffect(() => {
    axios.get("/api/all-ideas", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`
      }
    }).then(res => {
      if (Array.isArray(res.data)) {
        setIdeas(res.data);
      } else {
        console.warn("⚠️ Unexpected response:", res.data);
        setIdeas([]);
      }
    }).catch(err => {
      console.error("❌ API Error:", err);
      setIdeas([]);
    });
  }, []);
 
  return (
    <div className="flex flex-col min-h-screen bg-teal-50">
 
      <Header />
 
      {/* Page Content */}
      <main className="flex-1 px-6 pt-24 pb-6">
        <h2 className="text-2xl font-bold mb-6 text-center">💡 All Ideas</h2>
 
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {ideas.map((idea) => (
            <div key={idea.id} className="flip-card">
              <div className="flip-card-inner">
                <div className="flip-card-front bg-white p-4 rounded-lg shadow-md">
                  <div className="text-lg text-gray-800 mb-2">
                    {idea.user?.split("@")[0] || "Unknown"}
                  </div>
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
 
 