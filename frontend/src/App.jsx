import { Routes, Route, Navigate } from "react-router-dom";
import React from "react";
import Login from "./components/pages/Login";
import Chatbot from "./components/Chatbot/Chatbot";
import Dashboard from "./components/admin/Dashboard";
import IdeaListPage from "./components/pages/IdeaListPage";
import UserIdeasPage from "./components/pages/UserIdeasPage";
import ConversationPage from "./components/pages/ConversationPage";
import AllIdeasPage from "./components/pages/AllIdeasPage";

const Layout = ({ children }) => (
  <div className="min-h-screen bg-teal-100 text-black flex justify-center items-start pt-10">
    <div className="w-full md:w-3/4 lg:w-2/3 xl:w-1/2 shadow-xl rounded-2xl overflow-hidden">
      {children}
    </div>
  </div>
);


const ProtectedRoute = ({ children, adminOnly = false }) => {
  const token = localStorage.getItem("accessToken");
  const isAdmin = localStorage.getItem("isAdmin") === "true";

  if (!token) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/user-page" replace />;

  return children;
};

const UserPage = () => (
  <Layout>
    <Chatbot />
  </Layout>
);

const AdminPage = () => (
  <Layout>
    <Dashboard />
  </Layout>
);

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route
        path="/user-page"
        element={
          <ProtectedRoute>
            <UserPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/all-ideas"
        element={
          <ProtectedRoute>
            <Layout>
              <AllIdeasPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin-page"
        element={
          <ProtectedRoute adminOnly={true}>
            <AdminPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/ideas/:type"
        element={
          <ProtectedRoute adminOnly={true}>
            <IdeaListPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/user-ideas/:userId"
        element={
          <ProtectedRoute adminOnly={true}>
            <UserIdeasPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/conversation/:conversationId"
        element={
          <ProtectedRoute adminOnly={true}>
            <ConversationPage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;

