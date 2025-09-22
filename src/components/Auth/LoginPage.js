import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [adminCount, setAdminCount] = useState(0); // ✅ store admin users count
  const { login } = useAuth();
  const navigate = useNavigate();

  // 🔹 Fetch all users once (to check admin count)
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("http://192.168.1.200:5003/api/auth/users");
        if (res.data.success && Array.isArray(res.data.data)) {
          const admins = res.data.data.filter((u) => u.role?.toLowerCase() === "admin");
          setAdminCount(admins.length);
        }
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };
    fetchUsers();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post("http://192.168.1.200:5003/api/auth/login", {
        email,
        password,
      });

      login({
        token: res.data.token,
        id: res.data.user.id,
        name: res.data.user.name,
        email: res.data.user.email,
        role: res.data.user.role,
        machine_id: res.data.user.machine_id ?? res.data.user.machineId ?? null,
      });

      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    }
  };

  // 🔹 Only show register button if admin count < 5
  const showRegister = adminCount < 5;

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow-lg p-4" style={{ maxWidth: "400px", width: "100%" }}>
        <h2 className="text-center mb-4">Login</h2>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email address</label>
            <input
              type="email"
              className="form-control"
              id="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-100">Login</button>
        </form>

        {/* ✅ Show Register if less than 5 admins */}
        {showRegister && (
          <p className="text-center mt-3">
            Don&apos;t have an account?{" "}
            <Link to="/registerpage" className="text-decoration-none">
              Register here
            </Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
