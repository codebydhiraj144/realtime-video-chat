import * as React from 'react';
import { Avatar, Button, CssBaseline, TextField, Paper, Box, Grid, Typography, createTheme, ThemeProvider, Snackbar, IconButton, InputAdornment } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom'; 

const theme = createTheme();

export default function Authentication() {
    const navigate = useNavigate(); 
    
    // formState: 0 for Login, 1 for Registration
    const [formState, setFormState] = React.useState(0); 
    const [username, setUsername] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [name, setName] = React.useState("");
    const [error, setError] = React.useState("");
    const [message, setMessage] = React.useState("");
    const [open, setOpen] = React.useState(false);
    const [showPassword, setShowPassword] = React.useState(false);

    const { handleRegister, handleLogin } = React.useContext(AuthContext);

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    /**
     * Unified handler for Login and Registration based on formState
     */
    const handleAuth = async () => {
        try {
            if (formState === 0) {
                // Execute login and redirect to main dashboard
                await handleLogin(username, password);
                setError("");
                setMessage("Logged in successfully!");
                setOpen(true);
                navigate("/home"); 
                
            } else {
                // Execute registration and reset view to Login
                let result = await handleRegister(name, username, password);
                setMessage(result); 
                setOpen(true);
                setError(""); 
                setFormState(0); 
                setName("");
            }
        } catch (err) {
            // Extract error message from API response or use fallback
            let msg = err.response?.data?.message || "Invalid Username or Password";
            setError(msg);
            setOpen(false); 
        }
    };

    return (
        <ThemeProvider theme={theme}>
            <Grid container component="main" sx={{ height: '100vh', width: '100vw' }}>
                <CssBaseline />
                {/* Visual side panel with background image */}
                <Grid
                    size={{ xs: false, sm: 4, md: 7 }} 
                    sx={{
                        backgroundImage: 'url(https://images.unsplash.com/photo-1470252649358-96753a780fa7?auto=format&fit=crop&w=1920&q=80)',
                        backgroundRepeat: 'no-repeat',
                        backgroundColor: "#cccccc", 
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        display: { xs: 'none', sm: 'block' } 
                    }}
                />
                {/* Interactive form panel */}
                <Grid 
                    size={{ xs: 12, sm: 8, md: 5 }} 
                    component={Paper} elevation={6} square 
                    sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
                >
                    <Box sx={{ my: 8, mx: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}><LockOutlinedIcon /></Avatar>
                        
                        {/* Tab-style navigation between Login and Sign Up */}
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 1, width: '100%' }}>
                            <Typography onClick={() => setFormState(0)} sx={{ cursor: 'pointer', color: formState === 0 ? 'primary.main' : 'text.secondary', fontWeight: 'bold' }}>SIGN IN</Typography>
                            <Typography onClick={() => setFormState(1)} sx={{ cursor: 'pointer', color: formState === 1 ? 'primary.main' : 'text.secondary', fontWeight: 'bold' }}>SIGN UP</Typography>
                        </Box>

                        <Box component="form" noValidate sx={{ mt: 1, width: '100%' }}>
                            {/* Conditional rendering for Name field in Sign Up mode */}
                            <Box sx={{ height: '80px', display: 'flex', alignItems: 'center' }}> 
                                {formState === 1 && (
                                    <TextField margin="normal" required fullWidth label="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
                                )}
                            </Box>
                            
                            <TextField margin="normal" required fullWidth label="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
                            
                            <TextField 
                                margin="normal" required fullWidth label="Password" 
                                type={showPassword ? 'text' : 'password'} 
                                value={password} onChange={(e) => setPassword(e.target.value)} 
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={handleClickShowPassword} edge="end">
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                            
                            {error && <p style={{ color: "red", fontSize: "0.8rem" }}>{error}</p>}

                            <Button fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} onClick={handleAuth}>
                                {formState === 0 ? "SIGN IN" : "SIGN UP"}
                            </Button>
                        </Box>
                    </Box>
                </Grid>
            </Grid>

            {/* Notification alert for status messages */}
            <Snackbar 
                open={open} autoHideDuration={4000} onClose={() => setOpen(false)} 
                message={message} anchorOrigin={{ vertical: 'top', horizontal: 'center' }} 
            />
        </ThemeProvider>
    );
}