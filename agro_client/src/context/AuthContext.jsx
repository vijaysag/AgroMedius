import { createContext, useContext, useState } from 'react';
import api from '../api';

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('agroUser');
        return saved ? JSON.parse(saved) : null;
    });
    const [loading, setLoading] = useState(false);

    const login = async (email, password) => {
        setLoading(true);
        try {
            const { data } = await api.post('/auth/login', { email, password });
            localStorage.setItem('agroToken', data.token);
            localStorage.setItem('agroUser', JSON.stringify(data));
            setUser(data);
            return { success: true };
        } catch (err) {
            return { success: false, message: err.response?.data?.message || 'Login failed' };
        } finally {
            setLoading(false);
        }
    };

    const register = async (formData) => {
        setLoading(true);
        try {
            const { data } = await api.post('/auth/register', formData);
            localStorage.setItem('agroToken', data.token);
            localStorage.setItem('agroUser', JSON.stringify(data));
            setUser(data);
            return { success: true };
        } catch (err) {
            return { success: false, message: err.response?.data?.message || 'Registration failed' };
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('agroToken');
        localStorage.removeItem('agroUser');
        setUser(null);
    };

    const updateUser = (updatedData) => {
        setUser(prev => {
            const merged = { ...prev, ...updatedData };
            localStorage.setItem('agroUser', JSON.stringify(merged));
            return merged;
        });
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
