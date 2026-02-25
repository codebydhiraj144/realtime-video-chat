import React, { useState } from "react";
import WithAuth from "../utils/WithAuth"; 
import { useNavigate } from "react-router-dom";
import "../App.css"
import RestoreIcon from '@mui/icons-material/Restore';
import { Button, IconButton, TextField } from "@mui/material";
import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";

function Home() {

    let navigate = useNavigate();
    const [meetingCode, setMeetingCode] = useState("");
    
    const {addToUserHistory} = useContext(AuthContext)

    /**
     * Records the meeting in database history and redirects to the video room
     */
    let handleJoinVideoCall = async () => {
        await addToUserHistory(meetingCode);
        navigate(`/${meetingCode}`);
    }

    return (
        <>
            <div className="navBar">
                <div style={{ display: "flex", alignItems: "center" }}>
                    <h3>Video Call</h3>
                </div>

                <div style={{ display: "flex", alignItems: "center" }}>
                    {/* Navigation to User Activity History */}
                    <IconButton onClick={() => navigate("/history")}>
                        <RestoreIcon />
                        <p style={{ fontSize: "14px", marginLeft: "5px" }}>History</p>
                    </IconButton>

                    {/* Session termination and local storage cleanup */}
                    <Button onClick={() => {
                        localStorage.removeItem("token");
                        navigate("/auth");
                    }}>
                        LogOut
                    </Button>
                </div>
            </div>

            <div className="meetContainer">
                <div className="leftPanel">
                    <h2>Providing Quality video call Just Like Quality Education</h2>

                    <div style={{ display: 'flex', gap: "10px", marginTop: "20px" }}>
                        <TextField 
                            label="Meeting Code" 
                            variant="outlined" 
                            size="small"
                            value={meetingCode} 
                            onChange={(e) => setMeetingCode(e.target.value)} 
                            placeholder="Enter a code or link"
                        />

                        {/* Button is disabled unless a code is typed to prevent empty room joins */}
                        <Button 
                            variant="contained" 
                            onClick={handleJoinVideoCall}
                            disabled={meetingCode.length === 0}
                        >
                            Join Call
                        </Button>
                    </div>
                </div>
                
                <div className="rightPanel">
                    <img srcSet="/logo3.png" alt=""/>
                </div>
            </div>
        </>
    );
}

// Higher-Order Component (HOC) wrapper to protect this route from unauthenticated users
export default WithAuth(Home);