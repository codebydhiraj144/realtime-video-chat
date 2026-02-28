import React, { useState, useRef, useEffect } from 'react';
import { TextField, Button, IconButton, Paper, Typography, Badge, Tooltip } from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import CallEndIcon from '@mui/icons-material/CallEnd';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare';
import ChatIcon from '@mui/icons-material/Chat';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import ShareIcon from '@mui/icons-material/Share'; 
import io from 'socket.io-client';
import { useNavigate, useParams } from 'react-router-dom';
import "../styles/videoComponent.css";

const server_url = "https://video-chat-backend-l1qi.onrender.com";
const peerConfig = { 
    "iceServers": [
        { "urls": "stun:stun.l.google.com:19302" },
        {
            "urls": "turn:global.relay.metered.ca:80",
            "username": process.env.REACT_APP_METERED_USER, 
            "credential": process.env.REACT_APP_METERED_SECRET
        },
        {
            "urls": "turn:global.relay.metered.ca:443",
            "username": process.env.REACT_APP_METERED_USER,
            "credential": process.env.REACT_APP_METERED_SECRET
        },
        {
            "urls": "turn:global.relay.metered.ca:443?transport=tcp", 
            "username": process.env.REACT_APP_METERED_USER,
            "credential": process.env.REACT_APP_METERED_SECRET
        }
    ] 
};

export default function VideoMeetComponent() {
    const { url } = useParams(); 
    const navigate = useNavigate();
    
    const socketRef = useRef();
    const socketIdRef = useRef();
    const localVideoRef = useRef();
    const messagesEndRef = useRef(null);
    const screenStreamRef = useRef(null);
    const connections = useRef({}); 
    
    const [username, setUsername] = useState(localStorage.getItem('vc-username') || ""); 
    const [videos, setVideos] = useState([]);
    const [askForUsername, setAskForUsername] = useState(true);
    const [videoEnabled, setVideoEnabled] = useState(true);
    const [audioEnabled, setAudioEnabled] = useState(true);
    const [screenSharing, setScreenSharing] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [newMessagesCount, setNewMessagesCount] = useState(0);
    const [isJoining, setIsJoining] = useState(false);

    useEffect(() => {
        if (!askForUsername && localVideoRef.current && window.localStream) {
            localVideoRef.current.srcObject = window.localStream;
        }
    }, [askForUsername]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        setVideos([]);
        return () => {
            if (window.localStream) {
                window.localStream.getTracks().forEach(track => track.stop());
            }
            if (socketRef.current) socketRef.current.disconnect();
        };
    }, []);

    const handleVideoToggle = () => {
        if (window.localStream) {
            const videoTrack = window.localStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoEnabled;
                setVideoEnabled(!videoEnabled);
            }
        }
    };

    const handleAudioToggle = () => {
        if (window.localStream) {
            const audioTrack = window.localStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioEnabled;
                setAudioEnabled(!audioEnabled);
            }
        }
    };

    const handleEndCall = () => {
        localStorage.removeItem('vc-username');
        if (window.localStream) {
            window.localStream.getTracks().forEach(track => track.stop());
        }
        if (socketRef.current) socketRef.current.disconnect();
        navigate("/home");
    };

    const handleShareMeeting = async () => {
        const fullUrl = window.location.href;
        if (navigator.share) {
            try {
                await navigator.share({ title: 'Join Call', text: `Room: ${url}`, url: fullUrl });
            } catch (err) { console.error(err); }
        } else {
            navigator.clipboard.writeText(fullUrl);
            alert("Link copied!");
        }
    };

    const getMedia = async () => {
        if (isJoining) return; 
        setIsJoining(true);

        if (username) {
            localStorage.setItem('vc-username', username);
        }

        // CLEANUP: Stop any existing streams before starting a new request
        // This is the primary fix for "Camera access failed" errors
        if (window.localStream) {
            window.localStream.getTracks().forEach(track => track.stop());
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    facingMode: "user",
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }, 
                audio: true 
            });
            
            window.localStream = stream;
            connectToSocketServer();
            setAskForUsername(false); 
        } catch (err) { 
            console.error("Media Error:", err);
            setIsJoining(false); // Reset joining state so user can try again
            alert("Camera access failed. Please ensure no other apps are using the camera and you have granted browser permissions.");
        }
    };

    const connectToSocketServer = () => {
        socketRef.current = io.connect(server_url);
        
        socketRef.current.on("connect", () => {
            socketIdRef.current = socketRef.current.id;
            socketRef.current.emit("join-call", url, username);

            socketRef.current.on("user-joined", (id, clients) => {
                clients.forEach((client) => {
                    if (!connections.current[client.socketId] && client.socketId !== socketIdRef.current) {
                        initializePeer(client.socketId, client.name);
                    }
                });

                if (id === socketIdRef.current) {
                    Object.keys(connections.current).forEach(remoteId => {
                        connections.current[remoteId].createOffer().then(desc => {
                            connections.current[remoteId].setLocalDescription(desc).then(() => {
                                socketRef.current.emit("signal", remoteId, JSON.stringify({ sdp: connections.current[remoteId].localDescription }));
                            }).catch(e => console.warn("Offer error:", e));
                        });
                    });
                }
            });

            socketRef.current.on('signal', async (fromId, message) => {
                if (!connections.current[fromId]) return; 
                const signal = JSON.parse(message);

                try {
                    if (signal.sdp) {
                        await connections.current[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp));
                        if (signal.sdp.type === "offer") {
                            const desc = await connections.current[fromId].createAnswer();
                            await connections.current[fromId].setLocalDescription(desc);
                            socketRef.current.emit("signal", fromId, JSON.stringify({ sdp: connections.current[fromId].localDescription }));
                        }
                    }
                    if (signal.ice) {
                        await connections.current[fromId].addIceCandidate(new RTCIceCandidate(signal.ice));
                    }
                } catch (e) {
                    console.warn("Handshake skipped:", e);
                }
            });

            socketRef.current.on("chat-message", (data) => {
                setMessages((prev) => [...prev, data]);
                if (!showChat) setNewMessagesCount(prev => prev + 1);
            });

            socketRef.current.on("user-left", (id) => {
                setVideos(vids => vids.filter(v => v.socketId !== id));
                if (connections.current[id]) { 
                    connections.current[id].close(); 
                    delete connections.current[id]; 
                }
            });
        });
    };

    const initializePeer = (id, name) => {
        connections.current[id] = new RTCPeerConnection(peerConfig);

        connections.current[id].onicecandidate = (e) => {
            if (e.candidate) {
                socketRef.current.emit("signal", id, JSON.stringify({ ice: e.candidate }));
            }
        };

        connections.current[id].ontrack = (event) => {
            setVideos(vids => {
                const alreadyExists = vids.some(v => v.socketId === id);
                if (alreadyExists) return vids;
                return [...vids, { socketId: id, stream: event.streams[0], name: name }];
            });
        };

        if (window.localStream) {
            window.localStream.getTracks().forEach(track => {
                connections.current[id].addTrack(track, window.localStream);
            });
        }
    };

    const handleScreenShare = async () => {
        try {
            if (!screenSharing) {
                const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
                screenStreamRef.current = stream;
                const screenTrack = stream.getVideoTracks()[0];
                for (let id in connections.current) {
                    const sender = connections.current[id].getSenders().find(s => s.track?.kind === 'video');
                    if (sender) sender.replaceTrack(screenTrack);
                }
                localVideoRef.current.srcObject = stream;
                screenTrack.onended = () => stopScreenShare();
                setScreenSharing(true);
            } else {
                stopScreenShare();
            }
        } catch (err) { console.error(err); }
    };

    const stopScreenShare = () => {
        screenStreamRef.current?.getTracks().forEach(track => track.stop());
        const videoTrack = window.localStream.getVideoTracks()[0];
        for (let id in connections.current) {
            const sender = connections.current[id].getSenders().find(s => s.track?.kind === 'video');
            if (sender) sender.replaceTrack(videoTrack);
        }
        localVideoRef.current.srcObject = window.localStream;
        setScreenSharing(false);
    };

    const sendMessage = () => {
        if (message.trim()) {
            const msgData = { sender: username, message, time: new Date().toLocaleTimeString() };
            socketRef.current.emit("chat-message", url, msgData);
            setMessages(prev => [...prev, msgData]);
            setMessage("");
        }
    };

    return (
        <div className="video-meet-wrapper">
            {askForUsername ? (
                <div className="lobby">
                    <img src="/logo4.png" alt="logo" style={{ maxWidth: '500px', marginBottom: '20px' }} />
                    <Typography variant="h4">Join Meeting</Typography>
                    <Typography color="textSecondary">Room: <strong>{url}</strong></Typography>
                    <div style={{ margin: '20px 0' }}>
                        <TextField label="Your Name" value={username} onChange={e => setUsername(e.target.value)} fullWidth />
                    </div>
                    <Button variant="contained" onClick={getMedia} disabled={!username.trim() || isJoining}>
                        {isJoining ? "CONNECTING..." : "JOIN CALL"}
                    </Button>
                </div>
            ) : (
                <>
                    <div className="video-grid">
                        <div className="video-container">
                            <video ref={localVideoRef} autoPlay muted playsInline />
                            <span className="name-overlay">{username} (You)</span>
                        </div>
                        {videos.map(v => (
                            <div key={v.socketId} className="video-container">
                                <video ref={el => { if (el && v.stream) el.srcObject = v.stream; }} autoPlay playsInline />
                                <span className="name-overlay">{v.name}</span>
                            </div>
                        ))}
                    </div>

                    {showChat && (
                        <Paper className="chat-window">
                            <div className="chat-header">
                                <Typography>Messages</Typography>
                                <IconButton onClick={() => setShowChat(false)}><CloseIcon /></IconButton>
                            </div>
                            <div className="messages-area">
                                {messages.map((m, i) => (
                                    <div key={i} className="msg-box">
                                        <Typography variant="caption">{m.sender} • {m.time}</Typography>
                                        <Typography>{m.message}</Typography>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>
                            <div className="chat-input-area">
                                <TextField fullWidth value={message} onChange={e => setMessage(e.target.value)} onKeyPress={e => e.key === 'Enter' && sendMessage()} />
                                <IconButton onClick={sendMessage} color="primary"><SendIcon /></IconButton>
                            </div>
                        </Paper>
                    )}

                    <div className="button-container">
                        <IconButton onClick={handleAudioToggle} className="control-btn">
                            {audioEnabled ? <MicIcon style={{color: "white"}} /> : <MicOffIcon style={{color: "#ea4335"}} />}
                        </IconButton>
                        <IconButton onClick={handleVideoToggle} className="control-btn">
                            {videoEnabled ? <VideocamIcon style={{color: "white"}} /> : <VideocamOffIcon style={{color: "#ea4335"}} />}
                        </IconButton>
                        <IconButton onClick={handleScreenShare} className="control-btn">
                            {screenSharing ? <StopScreenShareIcon style={{color: "#ea4335"}} /> : <ScreenShareIcon style={{color: "white"}} />}
                        </IconButton>
                        <IconButton onClick={() => { setShowChat(true); setNewMessagesCount(0); }} className="control-btn">
                            <Badge badgeContent={newMessagesCount} color="error"><ChatIcon style={{color: "white"}} /></Badge>
                        </IconButton>
                        <IconButton onClick={handleShareMeeting} className="control-btn"><ShareIcon style={{color: "white"}} /></IconButton>
                        <IconButton onClick={handleEndCall} className="control-btn end-call"><CallEndIcon style={{color: "white"}} /></IconButton>
                    </div>
                </>
            )}
        </div>
    );
}