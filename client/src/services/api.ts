import axios from 'axios';
import type { AxiosInstance, AxiosResponse } from 'axios';

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (data: any) => api.post('/auth/login', data),
  register: (data: any) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data: any) => api.put('/auth/profile', data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put('/auth/change-password', data),
};

// Email API
export const emailAPI = {
  getEmails: (params?: any) => api.get('/emails', { params }),
  
  getEmail: (id: string) => api.get(`/emails/${id}`),
  
  sendEmail: (data: any, attachments?: File[]) => {
    const formData = new FormData();
    formData.append('to', Array.isArray(data.to) ? data.to.join(',') : data.to);
    if (data.cc) {
      formData.append('cc', Array.isArray(data.cc) ? data.cc.join(',') : data.cc);
    }
    if (data.bcc) {
      formData.append('bcc', Array.isArray(data.bcc) ? data.bcc.join(',') : data.bcc);
    }
    formData.append('subject', data.subject);
    if (data.text) formData.append('text', data.text);
    if (data.html) formData.append('html', data.html);
    
    if (attachments) {
      attachments.forEach((file) => {
        formData.append('attachments', file);
      });
    }
    
    return api.post('/emails/send', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  updateEmail: (id: string, data: any) =>
    api.patch(`/emails/${id}`, data),
  
  deleteEmail: (id: string) => api.delete(`/emails/${id}`),
  
  permanentlyDeleteEmail: (id: string) => api.delete(`/emails/${id}/permanent`),
  
  markAsSpam: (id: string, isSpam: boolean) =>
    api.patch(`/emails/${id}/spam`, { isSpam }),
  
  updateLabels: (id: string, labels: string[]) =>
    api.patch(`/emails/${id}/labels`, { labels }),
  
  getEmailsByFolder: (folder: string) => api.get(`/emails/folder/${folder}`),
  
  searchEmails: (query: string) => api.get('/emails/search', { params: { q: query } }),
  
  getEmailAttachments: (emailId: string) => api.get(`/emails/${emailId}/attachments`),
  
  bulkUpdateEmails: (emailIds: string[], updateData: any) =>
    api.patch('/emails/bulk-update', { emailIds, updateData }),
  
  bulkDeleteEmails: (emailIds: string[]) =>
    api.patch('/emails/bulk-delete', { emailIds }),
  
  getStats: () => api.get('/emails/stats/overview'),
};

// Utility functions
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
  
  if (diffInHours < 24) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (diffInHours < 168) { // 7 days
    return date.toLocaleDateString([], { weekday: 'short' });
  } else {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
};

export default api;
