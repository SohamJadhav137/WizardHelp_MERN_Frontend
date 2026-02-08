import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { getCurrentUser } from "../utils/getCurrentUser";
import { createSocket, disconnectSocket } from "../socket";
import API_BASE_URL from "../utils/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || null);
    const [token, setToken] = useState(localStorage.getItem("token") || null);
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            const currentUser = getCurrentUser();
            if (!currentUser.id) return;
            createSocket({
                userId: currentUser.id,
                username: user.username
            });
        }
        else {
            disconnectSocket();
        }
    }, [user]);

    const login = (userData, token) => {
        setUser(userData);
        setToken(token);
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("token", token);

        // createSocket({
        //     userId: currentUser.id,
        //     username: userData.username
        // })
        navigate('/');
    }

    const logout = async () => {
        const result = await Swal.fire({
            title: 'Leaving so soon?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#018790',
            cancelButtonColor: '#94a3b8',
            confirmButtonText: 'Logout',
            customClass: {
                popup: 'swal-custom-popup',
                title: 'swal-custom-title'
            }
        });

        if (!result.isConfirmed)
            return;

        try {
            await fetch(`${API_BASE_URL}/api/auth/logout`, { method: 'POST', credentials: 'include' });
        } catch (error) {
            console.error("Logout error!", error);
        }

        disconnectSocket();

        setUser(null);
        setToken(null);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        navigate('/auth/login');
    }

    const updateUser = (updatedFields) => {
        setUser(prev => {
            const updatedUser = {
                ...prev,
                ...updatedFields
            };

            localStorage.setItem("user", JSON.stringify(updatedUser));
            return updatedUser;
        });
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, updateUser, setUser, setToken }}>
            {children}
        </AuthContext.Provider>
    );
};