import React, { useEffect, useState } from "react";
import "./App.css";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
    useLocation,
} from "react-router-dom";
import Login from "./components/login.jsx";
import Register from "./components/register.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Profile from "./components/profile.jsx";
import { auth } from "./components/firebase.jsx";

const STATIC_PSW = "dayawan@2010"; // Change this to your desired static password

function LoginGuard({ children }) {
    const [showPopover, setShowPopover] = useState(true);
    const [input, setInput] = useState("");
    const [error, setError] = useState("");
    const location = useLocation();

    // Only show popover on /login or /
    useEffect(() => {
        if (location.pathname === "/login" || location.pathname === "/") {
            setShowPopover(true);
        } else {
            setShowPopover(false);
        }
    }, [location.pathname]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (input === STATIC_PSW) {
            setShowPopover(false);
            setError("");
        } else {
            setError("Incorrect password. Please try again.");
        }
    };

    return (
        <>
            {showPopover && (
                <div style={{
                    position: "fixed",
                    top: 0, left: 0, width: "100vw", height: "100vh",
                    background: "rgba(0,0,0,0.4)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    zIndex: 9999,
                }}>
                    <form
                        onSubmit={handleSubmit}
                        style={{
                            background: "#fff",
                            padding: 32,
                            borderRadius: 10,
                            minWidth: 320,
                            boxShadow: "0 2px 16px #0002",
                            display: "flex",
                            flexDirection: "column",
                            gap: 16,
                        }}
                    >
                        <h3 style={{ margin: 0 }}>Enter Access Password</h3>
                        <input
                            type="password"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Enter password"
                            style={{
                                padding: 10,
                                borderRadius: 6,
                                border: "1px solid #ddd",
                                fontSize: 16,
                            }}
                            autoFocus
                        />
                        {error && <div style={{ color: "red", fontSize: 14 }}>{error}</div>}
                        <button
                            type="submit"
                            style={{
                                padding: "10px 0",
                                borderRadius: 6,
                                background: "#3b82f6",
                                color: "#fff",
                                border: "none",
                                fontWeight: 600,
                                fontSize: 16,
                                cursor: "pointer",
                            }}
                        >
                            Submit
                        </button>
                    </form>
                </div>
            )}
            {!showPopover && children}
        </>
    );
}

function App() {
    const [user, setUser] = useState();
    useEffect(() => {
        auth.onAuthStateChanged((user) => {
            setUser(user);
        });
    }, []);
    return (
        <Router>
            <div className="App">
                <div className="auth-wrapper">
                    <div className="auth-inner">
                        <Routes>
                            <Route
                                path="/"
                                element={
                                    user ? (
                                        <Navigate to="/profile" />
                                    ) : (
                                        <LoginGuard>
                                            <Login />
                                        </LoginGuard>
                                    )
                                }
                            />
                            <Route
                                path="/login"
                                element={
                                    <LoginGuard>
                                        <Login />
                                    </LoginGuard>
                                }
                            />
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