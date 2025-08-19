import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "./firebase.jsx";
import { setDoc, doc } from "firebase/firestore";
import { toast } from "react-toastify";
import "./register.css";

function Register() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password || !form.confirmPassword || !form.name) {
      setError("Please fill all fields.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    try {
      await createUserWithEmailAndPassword(auth, form.email, form.password);
      const user = auth.currentUser;
      console.log(user);
      if (user) {
        await setDoc(doc(db, "users", user.uid), {
          email: user.email,
          name: form.name,
        });
      }
      console.log("User Registered Successfully!!");
      toast.success("User Registered Successfully!!", {
        position: "top-center",
      });
      setSuccess("Registration successful! You can now log in.");
      setForm({ email: "", password: "", confirmPassword: "", name: "" });
    } catch (error) {
      console.log(error.message);
      toast.error(error.message, {
        position: "bottom-center",
      });
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-title">Sign Up</div>
      {error && <div className="signup-error">{error}</div>}
      {success && <div className="signup-success">{success}</div>}
      <form onSubmit={handleSubmit}>
        <div>
          <label className="signup-label">Full Name</label>
          <input
            className="signup-input"
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Enter your name"
            autoComplete="off"
          />
        </div>
        <div>
          <label className="signup-label">Email</label>
          <input
            className="signup-input"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Enter your email"
            autoComplete="off"
          />
        </div>
        <div>
          <label className="signup-label">Password</label>
          <input
            className="signup-input"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Enter password"
            autoComplete="new-password"
          />
        </div>
        <div>
          <label className="signup-label">Confirm Password</label>
          <input
            className="signup-input"
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm password"
            autoComplete="new-password"
          />
        </div>
        <button className="signup-btn" type="submit">
          Sign Up
        </button>
      </form>
      <Link className="signup-link" to="/login">
        Already have an account? Login
      </Link>
    </div>
  );
}

export default Register;