import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = () => {
    const { user, loading, initialAuthCheckComplete } = useAuth();

    // Show loading only if we're still checking initial auth
    if (loading || !initialAuthCheckComplete) {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-600">Checking authentication...</p>
            </div>
        );
    }

    return user ? <Outlet /> : <Navigate to="/signin" replace />;
};

export default ProtectedRoute;