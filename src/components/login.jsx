import { signInWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import { auth } from "./firebase.jsx";
import { toast } from "react-toastify";
import SignInwithGoogle from "./signinwithgoogle.jsx";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log("User logged in Successfully");
      window.location.href = "/profile";
      toast.success("User logged in Successfully", {
        position: "top-center",
      });
    } catch (error) {
      console.log(error.message);

      toast.error(error.message, {
        position: "bottom-center",
      });
    }
  };

  const registerlink = () => {
    window.location.href = "/register";
  }

  return (
    <form onSubmit={handleSubmit}>
      <h3 className="text-4xl">Login</h3>

      <div
          className="mb-5 gap-2 flex flex-wrap items-center justify-center">
        <label className="sm:basis-40 text-2xl">Email</label>
        <input
          type="email"
          className="input"
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="mb-5 gap-2 flex flex-wrap items-center justify-center space-x-2">
        <label className="sm:basis-40 text-2xl">Password</label>
        <input
          type="password"
          className="form-control input"
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <div className="flex flex-wrap items-center justify-center flex-col gap-2">
        <button type="submit" className="button-primary w-40 uppercase">
          Submit
        </button>
      <button className="button-secondary uppercase rounded-lg" onClick={registerlink}>New user ? <br/> Sign Up now!</button>
      </div>

 <br/>
      <SignInwithGoogle />
    </form>
  );
}

export default Login;