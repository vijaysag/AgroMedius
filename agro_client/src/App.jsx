import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import FarmerDashboard from './pages/FarmerDashboard';
import WholesalerDashboard from './pages/WholesalerDashboard';
import CropsPage from './pages/CropsPage';
import CropDetailPage from './pages/CropDetailPage';
import MarketPage from './pages/MarketPage';
import MessagesPage from './pages/MessagesPage';
import ProfilePage from './pages/ProfilePage';
import OrdersPage from './pages/OrdersPage';
import AICropHealth from './pages/AICropHealth';

// Layout
import Navbar from './components/Navbar';

const ProtectedRoute = ({ children, roles }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

function AppRoutes() {
  const { user } = useAuth();
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={user ? <Navigate to={user.role === 'farmer' ? '/farmer' : '/wholesaler'} /> : <LoginPage />} />
        <Route path="/register" element={user ? <Navigate to={user.role === 'farmer' ? '/farmer' : '/wholesaler'} /> : <RegisterPage />} />
        <Route path="/crops" element={<CropsPage />} />
        <Route path="/crops/:id" element={<CropDetailPage />} />
        <Route path="/market" element={<MarketPage />} />
        <Route path="/farmer" element={<ProtectedRoute roles={['farmer']}><FarmerDashboard /></ProtectedRoute>} />
        <Route path="/wholesaler" element={<ProtectedRoute roles={['wholesaler']}><WholesalerDashboard /></ProtectedRoute>} />
        <Route path="/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
        <Route path="/ai-doctor" element={<ProtectedRoute roles={['farmer']}><AICropHealth /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
