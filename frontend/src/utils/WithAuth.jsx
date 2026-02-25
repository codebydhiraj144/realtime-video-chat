import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const WithAuth = (WrappedComponent) => {
    const AuthComponent = (props) => {
        const navigate = useNavigate();

        const isAuthenticated = () => {
            // Must be "token" in quotes to read from localStorage
            return localStorage.getItem("token") !== null;
        };

        useEffect(() => {
            if (!isAuthenticated()) {
                navigate("/auth"); // Redirect to login if no token
            }
        }, [navigate]);

        // If authenticated, render the component. If not, render nothing while redirecting.
        return isAuthenticated() ? <WrappedComponent {...props} /> : null;
    };

    return AuthComponent;
};

export default WithAuth;