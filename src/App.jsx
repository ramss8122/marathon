import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet, useLocation, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import FloatingFaqButton from './components/FloatingFaqButton';

// Public Pages
import Home from './pages/Home';
import About from './pages/About';
import Events from './pages/Events';
import HowItWorks from './pages/HowItWorks';
import Impact from './pages/Impact';
import Transparency from './pages/Transparency';
import Community from './pages/Community';
import Contact from './pages/Contact';
import Registration from './pages/Registration';
import Faq from './pages/Faq';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';

// Scroll to top on page change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
}

// Public Shell Layout with Website Navbar and Footer
function PublicLayout() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="main-content">
        <Outlet />
      </main>
      <FloatingFaqButton />
      <Footer />
    </div>
  );
}

// Protected Route Guard for Admin
function AdminRoute({ children }) {
  const token = localStorage.getItem('adminToken');
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
}

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* ── ADMIN ROUTES (Separate from Public Navbar/Footer) ── */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/*"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        />

        {/* ── PUBLIC WEBSITE ROUTES (With Normal Navbar & Footer) ── */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/events" element={<Events />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/impact" element={<Impact />} />
          <Route path="/transparency" element={<Transparency />} />
          <Route path="/community" element={<Community />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/register" element={<Registration />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/faq.html" element={<Faq />} />
          {/* Catch-all route within public layout */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}
