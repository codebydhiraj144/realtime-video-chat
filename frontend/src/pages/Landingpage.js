import React from "react";
import "../App.css"
import { Link, useNavigate } from 'react-router-dom';

export default function Landingpage(){

    const router = useNavigate(); 

    return(
        <div className="landingpagecontainer">
            <nav> 
                <div className="navHeader">
                    <h2>Video Call</h2>
                </div>

                <div className="navlist">
                    {/* Bypass authentication to allow immediate entry for guests */}
                    <p onClick={() => {
                        window.location.href="/abc34"
                    }}>Join as Guest</p>
                    
                    <p onClick={() => router("/auth")}>Register</p>

                    <div onClick={() => {
                        router("/auth");
                    }} role="button">
                        <p>Login</p>
                    </div>         
                </div>
            </nav>
            
           <div className="landingmaincontainer">
                <div>
                    <h1> <span style={{color:"#FF9839"}}>Connect</span> with your loved Ones</h1>
                    <p> Cover a distance by Video Call</p>
                    
                    {/* Call to Action: Directs new users to the Auth flow */}
                    <div role="button" className="hero-btn">
                       <Link to="/auth">Get Started</Link>
                    </div>
                </div>
                <div>
                    <img src="mobile.png" alt="mobile"/>
                </div>
           </div>
        </div>
    )
}