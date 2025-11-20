// src/components/RankingDashboard.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './RankingDashboard.css'; // Optional: for table styling

// Get the API URL from environment variables
const API_URL = `${import.meta.env.VITE_API_BASE_URL}/ideas/`;

const RankingDashboard = () => {
    const [ideas, setIdeas] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchIdeas = async () => {
            try {
                const response = await axios.get(API_URL);
                setIdeas(response.data);
            } catch (error) {
                console.error("Failed to fetch ideas:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchIdeas();
    }, []);

    if (loading) return <p>Loading ideas...</p>;

    return (
        <div className="dashboard-container">
            <h2>Ranked AI Use Case Ideas</h2>
            <p>Ideas are ranked by a composite score calculated from Impact, Viability, and Complexity.</p>
            <table className="ideas-table">
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>Idea Title</th>
                        <th>Composite Score</th>
                        <th>Impact</th>
                        <th>Viability</th>
                        <th>Complexity</th>
                    </tr>
                </thead>
                <tbody>
                    {ideas.length > 0 ? (
                        ideas.map((idea, index) => (
                            <tr key={idea.id}>
                                <td>{index + 1}</td>
                                <td>{idea.title}</td>
                                <td>{idea.composite_score.toFixed(2)}</td>
                                <td className={`score-cell score-${idea.impact_score}`}>
                                    {idea.impact_score === 3 ? 'High' : idea.impact_score === 2 ? 'Med' : 'Low'}
                                </td>
                                <td className={`score-cell score-${idea.viability_score}`}>
                                    {idea.viability_score === 3 ? 'High' : idea.viability_score === 2 ? 'Med' : 'Low'}
                                </td>
                                <td className={`score-cell score-${idea.complexity_score}`}>
                                    {idea.complexity_score === 3 ? 'High' : idea.complexity_score === 2 ? 'Med' : 'Low'}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="6">No ideas submitted yet.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default RankingDashboard;