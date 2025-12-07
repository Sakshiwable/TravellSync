// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard.jsx";
import GroupsPage from "./pages/GroupsPage.jsx";
import InvitesPage from "./pages/InvitesPage.jsx";
import FriendsPage from "./pages/FriendsPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import LiveMap from "./pages/LiveMap.jsx";
import { Toaster } from "react-hot-toast";
import CreateGroup from "./pages/CreateGroup.jsx";
import InviteFriend from "./pages/InviteFriend.jsx";
import AppLayout from "./AppLayout/applayout.jsx";

export default function App() {
  const isLoggedIn = !!localStorage.getItem("token");

  return (
    <>
      <Routes>
        {/* Public Auth Page */}
        <Route path="/" element={<Auth />} />

        {/* Layout wrapper for protected pages */}
        <Route element={<AppLayout />}>
          <Route
            path="dashboard"
            element={isLoggedIn ? <Dashboard /> : <Navigate to="/" />}
          />
          <Route
            path="create-group"
            element={isLoggedIn ? <CreateGroup /> : <Navigate to="/" />}
          />
          <Route
            path="groups"
            element={isLoggedIn ? <GroupsPage /> : <Navigate to="/" />}
          />
          <Route
            path="invites"
            element={isLoggedIn ? <InvitesPage /> : <Navigate to="/" />}
          />
          <Route
            path="friends"
            element={isLoggedIn ? <FriendsPage /> : <Navigate to="/" />}
          />
          <Route
            path="profile"
            element={isLoggedIn ? <ProfilePage /> : <Navigate to="/" />}
          />
          <Route
            path="live-map"
            element={isLoggedIn ? <LiveMap /> : <Navigate to="/" />}
          />
          <Route
            path="invite-friend"
            element={isLoggedIn ? <InviteFriend /> : <Navigate to="/" />}
          />
        </Route>

        {/* Redirect unknown routes */}
        <Route
          path="*"
          element={<Navigate to={isLoggedIn ? "/dashboard" : "/"} />}
        />
      </Routes>

      <Toaster position="top-center" reverseOrder={false} />
    </>
  );
}
