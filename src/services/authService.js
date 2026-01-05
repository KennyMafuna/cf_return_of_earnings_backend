import apiClient from './api/apiClient';
import { AUTH_ENDPOINTS } from './api/apiEndpoints';

class AuthService {
    async login(credentials) {
        const response = await apiClient.post(AUTH_ENDPOINTS.LOGIN, credentials);
        return response.data;
    }

    async register(userData) {
        const response = await apiClient.post(AUTH_ENDPOINTS.REGISTER, userData);
        return response.data;
    }

    async checkUserInfo(userInfo) {
        const response = await apiClient.post(AUTH_ENDPOINTS.CHECK_USER_INFO, userInfo);
        return response.data;
    }

    async checkUserExists(userData) {
        const response = await apiClient.post(AUTH_ENDPOINTS.CHECK_USER_EXISTS, userData);
        return response.data;
    }

    async forgotPassword(userData) { 
        const response = await apiClient.post(AUTH_ENDPOINTS.FORGOT_PASSWORD, userData); 
        return response.data;
    }

    async resetPassword(resetData) {
        const response = await apiClient.post(AUTH_ENDPOINTS.RESET_PASSWORD, resetData);
        return response.data;
    }

    async logout() {
        const response = await apiClient.post(AUTH_ENDPOINTS.LOGOUT);
        return response.data;
    }

    async verifyToken() {
        const response = await apiClient.get(AUTH_ENDPOINTS.VERIFY_TOKEN);
        return response.data;
    }

    async getProfile() {
        const response = await apiClient.get(AUTH_ENDPOINTS.PROFILE);
        return response.data;
    }

    async updateProfile(profileData) {
        const response = await apiClient.put(AUTH_ENDPOINTS.PROFILE, profileData);
        return response.data;
    }
}

export default new AuthService();