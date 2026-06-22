import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { HelperProvider } from "./context/HelperContext.jsx";
import { PostsProvider } from "./context/PostsContext.jsx";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import FindHelper from "./pages/FindHelper";
import HelperProfile from "./pages/HelperProfile";
import HelperProfileModal from "./pages/HelperProfileModal";
import PostHelpCard from "./pages/PostHelpCard";
import WhatsNew from "./pages/WhatsNew";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import About from "./pages/About";
import NotFound from "./pages/NotFound";

function AppLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

function AppRoutes() {
  const location = useLocation();
  // If navigation included a "background" location, we render the
  // routes for that background page, then layer the modal route on top.
  const backgroundLocation = location.state?.backgroundLocation;

  return (
    <>
      <Routes location={backgroundLocation || location}>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        <Route
          path="/find"
          element={
            <AppLayout>
              <FindHelper />
            </AppLayout>
          }
        />
        <Route
          path="/helper/:id"
          element={
            <AppLayout>
              <HelperProfile />
            </AppLayout>
          }
        />
        <Route
          path="/post"
          element={
            <AppLayout>
              <PostHelpCard />
            </AppLayout>
          }
        />
        <Route
          path="/whatsnew"
          element={
            <AppLayout>
              <WhatsNew />
            </AppLayout>
          }
        />
        <Route
          path="/profile"
          element={
            <AppLayout>
              <Profile />
            </AppLayout>
          }
        />
        <Route
          path="/settings"
          element={
            <AppLayout>
              <Settings />
            </AppLayout>
          }
        />
        <Route
          path="/about"
          element={
            <AppLayout>
              <About />
            </AppLayout>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* Overlay route — only renders when we arrived with a background location */}
      {backgroundLocation && (
        <Routes>
          <Route path="/helper/:id" element={<HelperProfileModal />} />
        </Routes>
      )}
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <HelperProvider>
          <PostsProvider>
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </PostsProvider>
        </HelperProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}