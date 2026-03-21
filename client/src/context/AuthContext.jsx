import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // 🔹 Load user from localStorage safely
    useEffect(() => {
        const storedUser = localStorage.getItem('user');

        try {
            if (storedUser && storedUser !== "undefined") {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
            }
        } catch (error) {
            console.error("Invalid JSON in localStorage:", error);
            localStorage.removeItem('user'); // cleanup bad data
        }

        setLoading(false);
    }, []);

    // 🔹 Login function
    const login = (userData) => {
        if (!userData) {
            console.warn("Invalid userData during login");
            return;
        }

        try {
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
        } catch (error) {
            console.error("Error saving user:", error);
        }
    };

    // 🔹 Update user safely
    const updateUser = (updatedFields) => {
        setUser((prev) => {
            if (!prev) {
                console.warn("No user to update");
                return null;
            }

            const updated = { ...prev, ...updatedFields };

            try {
                localStorage.setItem('user', JSON.stringify(updated));
            } catch (error) {
                console.error("Error updating user:", error);
            }

            return updated;
        });
    };

    // 🔹 Logout function
    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, updateUser, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

// 🔹 Custom hook
export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }

    return context;
};