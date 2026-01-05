import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home/Home';
import PublicRoute from './Routes/PublicRoute';
import ProtectedRoute from './Routes/ProtectedRoute';
import Register from './pages/Register/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import PasswordChange from './pages/PasswordChange/PasswordChange';
import ForgotPassword from './pages/ForgotPassword/ForgotPassword';
import TermsAndConditions from './pages/TermsAndConditions/TermsAndConditions';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes - only accessible when NOT logged in */}
      <Route element={<PublicRoute />}>
        <Route path="/signin" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgotpassword" element={<ForgotPassword/>} />
        <Route path="/help" element={<></>} />
        <Route path='/termsAndcondititons' element={<TermsAndConditions/>} />
      </Route>

      {/* Protected Routes - only accessible when logged in */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/submit-roe" element={<Dashboard />} />
        <Route path="/password-change" element={<PasswordChange />} />
      </Route>


    </Routes>
  );
};

export default AppRoutes;