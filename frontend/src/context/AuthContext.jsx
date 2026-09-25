import { createContext, useContext, useState } from "react";
import api from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem("user");
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const [token, setToken] = useState(() => {
        return localStorage.getItem("token");
    });

    // LOGIN
    const login = async (email, password) => {
        const response = await api.post("/users/login", {
            email,
            password
        });

        const { token, user } = response.data;

        // Save in React state
        setToken(token);
        setUser(user);

        // Save in browser
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        return response.data;
    };

    // LOGOUT
    const logout = () => {
        setToken(null);
        setUser(null);

        localStorage.removeItem("token");
        localStorage.removeItem("user");
    };

    const isLoggedIn = !!token;

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isLoggedIn,
                login,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook
export const useAuth = () => {
    return useContext(AuthContext);
};