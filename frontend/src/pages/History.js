import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, Typography, IconButton } from "@mui/material";
import HomeIcon from '@mui/icons-material/Home';

export default function History() {
    // Access meeting history logic from AuthContext
    const { getHistoryOfUser } = useContext(AuthContext);
    const [meetings, setMeetings] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        /**
         * Fetches user-specific meeting data on component mount
         */
        const fetchHistory = async () => {
            try {
                const history = await getHistoryOfUser();
                setMeetings(history);
            } catch (e) {
                console.error("Failed to fetch history:", e);
            }
        };

        fetchHistory(); 
    }, [getHistoryOfUser]); 

    // Helper to transform ISO date strings into readable local format
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    return (
        <div style={{ padding: "20px" }}>
            <IconButton onClick={() => navigate("/home")}>
                <HomeIcon />
            </IconButton>
            
            <Typography variant="h4" gutterBottom>Meeting History</Typography>

            {/* Render a list of meeting cards or a empty state message */}
            {meetings && meetings.length > 0 ? (
                meetings.map((e, index) => (
                    <Card key={index} variant="outlined" style={{ marginBottom: "10px" }}>
                        <CardContent>
                            <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                                Meeting Code: {e.meetingCode}
                            </Typography>
                            <Typography variant="h6">
                                Joined on: {formatDate(e.date)}
                            </Typography>
                        </CardContent>
                    </Card>
                ))
            ) : (
                <Typography>No meeting history found.</Typography>
            )}
        </div>
    );
}