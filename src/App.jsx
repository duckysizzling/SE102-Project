import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import FindHelper from "./pages/FindHelper";
import HelperProfile from "./pages/HelperProfile";
import PostHelpCard from "./pages/PostHelpCard";
import WhatsNew from "./pages/WhatsNew";
import Profile from "./pages/Profile";

function AppLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Landing — no navbar/footer */}
            <Route path="/" element={<Landing />} />

            {/* Auth pages — no navbar/footer */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />

            {/* Main app pages — with navbar/footer */}
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

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}