import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <HelperProvider>
          <PostsProvider>
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
                <Route
                  path="/settings"
                  element={
                    <AppLayout>
                      <Settings />
                    </AppLayout>
                  }
                />

                {/* About page — with navbar/footer */}
                <Route
                  path="/about"
                  element={
                    <AppLayout>
                      <About />
                    </AppLayout>
                  }
                />

                {/* 404 fallback — standalone */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </PostsProvider>
        </HelperProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}