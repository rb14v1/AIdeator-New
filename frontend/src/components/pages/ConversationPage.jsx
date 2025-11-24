import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const ConversationPage = () => {
    const { conversationId } = useParams();
    const [messages, setMessages] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchConversation = async () => {
            const token = localStorage.getItem("accessToken");
            try {
                const res = await axios.get(`/api/conversation/${conversationId}/`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                // Sorts messages by timestamp before rendering
                const sortedMessages = [...res.data].sort((a, b) => {
                    const timeA = new Date(a.timestamp).getTime();
                    const timeB = new Date(b.timestamp).getTime();
                    return timeA - timeB;
                });

                setMessages(sortedMessages);
            } catch (err) {
                console.error("Failed to fetch conversation:", err);
                setMessages([]);
            }
        };
        fetchConversation();
    }, [conversationId]);

    return (
        <div className="p-6">
            <button
                onClick={() => navigate(-1)}
                className="text-sm text-white bg-teal-700 hover:bg-teal-600 mb-4 px-4 py-2 rounded"
            >
                ← Back to Ideas
            </button>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Conversations</h2>

            {/* Conversation Container */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm max-w-3xl mx-auto">
                <div className="flex flex-col space-y-2">
                    {messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`max-w-[80%] px-4 py-2 rounded-lg text-sm ${
                                msg.sender === "user"
                                    ? "bg-teal-500 text-white self-end"
                                    : "bg-gray-100 text-gray-800 self-start"
                            }`}
                        >
                            <p>{msg.text}</p>
                            {msg.timestamp && (
                                <p className="text-[10px] text-gray-900 mt-1 text-right">
                                    {new Date(msg.timestamp).toLocaleString()}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ConversationPage;
