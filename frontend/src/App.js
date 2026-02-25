import React from 'react';
import './App.css';
import Landingpage from './pages/Landingpage';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Authentication from './pages/Authentication';
import { AuthProvider } from './contexts/AuthContext';
import VideoMeetComponent from './pages/VideoMeet.jsx';
import Home from './pages/Home';
import History from './pages/History';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path='/' element={<Landingpage />} />
          <Route path='/auth' element={<Authentication />} />
          <Route path='/home' element={<Home/>}/>
          <Route path='history' element={<History/>}/>
          {/* This matches any URL after the slash, e.g., localhost:3000/my-room */}
          <Route path='/:url' element={<VideoMeetComponent />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;