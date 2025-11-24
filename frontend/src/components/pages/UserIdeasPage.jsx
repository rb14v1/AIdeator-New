import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const UserIdeasPage = () => {
  const { userId } = useParams();
  const [ideas, setIdeas] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("User ID:", userId);
    const fetchIdeas = async () => {
      const token = localStorage.getItem("accessToken");
      try {
        const res = await axios.get(`http://13.222.154.187/api/user-ideas/${userId}/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log("Fetched ideas:", res.data);
        setIdeas(res.data);
      } catch (err) {
        console.error("Failed to fetch user ideas:", err);
        setIdeas([]);
      }
    };
    fetchIdeas();
  }, [userId]);

  return (
    <div className="p-6 min-h-screen bg-teal-50">
      <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">User Ideas</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ideas.map((idea) => (
          <div
            key={idea.conversation_id}
            onClick={() => navigate(`/conversation/${idea.conversation_id}`)}
            className={`p-4 rounded-lg shadow hover:shadow-md cursor-pointer border ${
              idea.is_approved
                ? "bg-teal-100 border-teal-300"
                : "bg-red-100 border-red-300"
            }`}
          >
            <h4 className="text-md font-semibold text-gray-800">{idea.idea_name}</h4>
            <p className="text-sm text-gray-700">Score: {idea.total_score}</p>
            <p className="text-sm text-gray-600">
              {idea.is_approved ? "✅ Approved" : "❌ Not Approved"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserIdeasPage;
