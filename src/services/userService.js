import apiClient from './api/apiClient';
import { USER_ENDPOINTS } from './api/endpoints';

class UserService {
    async getUsers() {
        const response = await apiClient.get(USER_ENDPOINTS.GET_USERS);
        return response.data;
    }

    async getUser(userId) {
        const response = await apiClient.get(USER_ENDPOINTS.GET_USER.replace(':id', userId));
        return response.data;
    }

    async updateUser(userId, userData) {
        const response = await apiClient.put(
            USER_ENDPOINTS.UPDATE_USER.replace(':id', userId), 
            userData
        );
        return response.data;
    }

    async deleteUser(userId) {
        const response = await apiClient.delete(USER_ENDPOINTS.DELETE_USER.replace(':id', userId));
        return response.data;
    }
}

export default new UserService();