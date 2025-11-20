import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const IdeaListPage = () => {
  const { type } = useParams(); 
  const navigate = useNavigate();
  const normalizedType = type === "approved" ? "approved" : "all";
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIdeas = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await axios.get("http://localhost:8000/api/ranked/", {
          headers: { Authorization: `Bearer ${token}` }
        });

        const mapped = res.data.results.map((idea) => ({
          id: idea.conversation_id,
          title: idea.idea_name,
          score: idea.total_score,
          accepted: idea.is_approved,
          user: idea.user?.email || "Unknown",
          timestamp: idea.approved_at || ""
        }));

        const filtered =
          normalizedType === "approved"
            ? mapped.filter((i) => i.accepted)
            : mapped;

        setIdeas(filtered.sort((a, b) => b.score - a.score));
      } catch (err) {
        console.error("Failed to fetch ideas:", err);
        setIdeas([]);
      } finally {
        setLoading(false);
      }
    };

    fetchIdeas();
  }, [type]);

  return (
    <div className="p-6 min-h-screen bg-teal-50">
      <h1 className="text-2xl font-bold text-black mb-4 text-center">
        {type === "approved" ? "✅ Approved Ideas" : "📝 All Ideas"}
      </h1>

      {loading ? (
        <p className="text-gray-500">Loading ideas...</p>
      ) : ideas.length === 0 ? (
        <p className="text-gray-500">No ideas found for this view.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ideas.map((idea) => (
            <div
              key={idea.id}
              onClick={() => navigate(`/conversation/${idea.id}`)}
              className="cursor-pointer bg-teal-100 p-4 rounded-lg shadow hover:shadow-md border border-teal-300"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-1">
                {idea.title}
              </h3>
              <p className="text-sm text-gray-700 mb-1">
                Score: <span className="font-bold">{idea.score}</span>
              </p>
              <p className="text-sm text-gray-600">User: {idea.user}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default IdeaListPage;

