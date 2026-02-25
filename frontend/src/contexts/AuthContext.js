import axios from 'axios'; 
import httpStatus from 'http-status'; 
import { useNavigate } from 'react-router-dom'; 
import { createContext, useState } from 'react';

// Create context to share authentication state across the app
export const AuthContext = createContext({});

// Axios instance for centralized API configuration
const client = axios.create({
    baseURL: "http://localhost:8000/api/v1/users" 
});

export const AuthProvider = ({ children }) => {
    const [userData, setUserData] = useState({});
    const navigate = useNavigate();

    const handleRegister = async (name, username, password) => {
        try {
            let request = await client.post("/register", { name, username, password });
            if (request.status === httpStatus.CREATED) return request.data.message;
        } catch (err) { throw err; }
    }

    const handleLogin = async (username, password) => {
        try {
            let request = await client.post("/login", { username, password });
            if (request.status === httpStatus.OK) {
                // Persist session token in browser storage
                localStorage.setItem("token", request.data.token);
                return request.data;
            }
        } catch (err) { throw err; }
    }

    const getHistoryOfUser = async () => {
        try {
            let request = await client.get("/get_all_activity", {
                params: { token: localStorage.getItem("token") }
            });
            return request.data;
        } catch (err) { throw err; }
    }

    const addToUserHistory = async (meetingcode) => {
        try {
            let request = await client.post("/add_to_activity", {
                token: localStorage.getItem("token"),
                meeting_code: meetingcode
            });
            return request;
        } catch (e) { throw e; }
    }

    // Exported functions and state available to all consumer components
    const data = {
        userData, setUserData, addToUserHistory,
        getHistoryOfUser, handleRegister, handleLogin 
    };

    return (
        <AuthContext.Provider value={data}>
            {children} 
        </AuthContext.Provider>
    );
};