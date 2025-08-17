import React, { useEffect } from "react";
import "./App.css";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";

import Login from "./components/login.jsx";
import Register from "./components/register.jsx";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Profile from "./components/profile.jsx";
import { useState } from "react";
import { auth } from "./components/firebase.jsx";

function App() {
    const [user, setUser] = useState();
    useEffect(() => {
        auth.onAuthStateChanged((user) => {
            setUser(user);
        });
    });
    return (
        <Router>
            <div className="App">
                <div className="auth-wrapper">
                    <div className="auth-inner">
                        <Routes>
                            <Route
                                path="/"
                                element={user ? <Navigate to="/profile" /> : <Login />}
                            />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/profile" element={<Profile />} />
                        </Routes>
                        <ToastContainer />
                    </div>
                </div>
            </div>
        </Router>
    );
}

export default App;