// Authentication endpoints
export const AUTH_ENDPOINTS = {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    CHECK_USER_INFO: '/auth/check-user',
    CHECK_USER_EXISTS: '/auth/check-user-exists',
    FORGOT_PASSWORD: 'auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    LOGOUT: '/auth/logout',
    VERIFY_TOKEN: '/auth/verify-token',
    PROFILE: '/auth/profile',
};

// User endpoints
export const USER_ENDPOINTS = {
    GET_USERS: '/users',
    GET_USER: '/users/:id',
    UPDATE_USER: '/users/:id',
    DELETE_USER: '/users/:id',
};

// Organisation endpoints
export const ORGANISATION_ENDPOINTS = {
    VERIFY_DETAILS: '/organisations/verify',
    UPLOAD_DOCUMENT: '/organisations/documents',
    UPLOAD_MULTIPLE_DOCUMENTS: '/organisations/documents/multiple',
    DELETE_DOCUMENT: '/organisations/documents/:id',
    GET_PROFILE: '/organisations/profile',
    SUBMIT_FOR_APPROVAL: '/organisations/submit-approval',
    GET_DOCUMENTS: '/organisations/documents',
    UPDATE_ORGANISATION_DETAILS: '/organisations/:id/details',
    GET_USER_ORGANISATIONS: '/organisations/user-organisations',
    VIEW_DOCUMENT: '/organisations/documents/view/:filename',
    DOWNLOAD_DOCUMENT: '/organisations/documents/download/:filename',
    GET_ORGANISATION_BY_ID: '/organisations/:id',
};