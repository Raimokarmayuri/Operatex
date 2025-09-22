import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../config";

const RegisterPage = () => {
  // ---------- Form state ----------
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [password, setPassword] = useState("");
  const [machine_id, setmachine_id] = useState("");

  const [machines, setMachines] = useState([]);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  // ---------- Table state ----------
  const [showForm, setShowForm] = useState(true); // form visible by default
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [usersError, setUsersError] = useState("");
  const [q, setQ] = useState(""); // client-side search

  // ===== Fetch machines on mount =====
  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/api/machines/getallmachine`)
      .then((response) => {
        setMachines(response.data || []);
      })
      .catch((error) => {
        console.error("Error fetching machines:", error);
      });
  }, []);

  // ===== Users fetcher (public endpoint) =====
  const fetchUsers = async () => {
    setLoadingUsers(true);
    setUsersError("");
    try {
      // If you use a protected route instead, change to /api/auth/users and add Authorization header.
      const res = await axios.get(`${API_BASE_URL}/api/auth/users`);
      setUsers(res?.data?.data ?? []);
    } catch (e) {
      setUsersError(e?.response?.data?.message || "Failed to load users");
    } finally {
      setLoadingUsers(false);
    }
  };

  // Load users only when switching to table view
  useEffect(() => {
    if (!showForm) fetchUsers();
  }, [showForm]);

  // ===== Register handler =====
  const handleRegister = async (e) => {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);

    try {
      await axios.post(`${API_BASE_URL}/api/auth/register`, {
        name,
        email,
        password,
        role,
        machine_id, // INCLUDE machine_id in request
      });

      // Reset form
      setName("");
      setEmail("");
      setPassword("");
      setRole("");
      setmachine_id("");

      alert("Registration successful! Please log in.");
      // If you prefer to stay here, remove navigate and optionally open the table:
      navigate("/login");
      // If table is currently visible, refresh users:
      if (!showForm) fetchUsers();
    } catch (error) {
      setFormError(error?.response?.data?.message || error.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  // ===== Derived: disable machine when role is admin/maintenance/quality =====
  const roleLower = (role || "").toLowerCase();
  const disableMachine = ["admin", "maintenance", "quality"].includes(roleLower);

  // ===== Client-side search for the table =====
  const filteredUsers = useMemo(() => {
    if (!q) return users;
    const v = q.toLowerCase();
    return users.filter((u) =>
      [u.name, u.email, u.role, String(u.machine_id ?? ""), String(u.mobile_no ?? "")]
        .map((x) => (x || "").toLowerCase())
        .some((s) => s.includes(v))
    );
  }, [users, q]);

  return (
    <div className="container py-4 mt-5">
      {/* Header + Toggle */}
      {/* <div className="d-flex align-items-center justify-content-between mb-3">
        <h3 className="mb-0">{showForm ? "Register User" : "Registered Users"}</h3>
        <div className="btn-group">
          <button
            type="button"
            className={`btn ${showForm ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => setShowForm(true)}
          >
            Add New User
          </button>
          <button
            type="button"
            className={`btn ${!showForm ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => setShowForm(false)}
          >
            View Users
          </button>
        </div>
      </div> */}

      {/* ---------------- FORM ---------------- */}
      {showForm && (
        <div className="d-flex justify-content-center">
          <div className="card shadow-lg p-4" style={{ maxWidth: "400px", width: "100%" }}>
            {/* <h2 className="text-center mb-4">Register</h2> */}
            {formError && <div className="alert alert-danger">{formError}</div>}

            <form onSubmit={handleRegister}>
              <div className="mb-3">
                <label htmlFor="name" className="form-label">Name</label>
                <input
                  type="text"
                  className="form-control"
                  id="name"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="email" className="form-label">Email address</label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="role" className="form-label">Role</label>
                <select
                  className="form-control"
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                >
                  <option value="">Select a role</option>
                  <option value="admin">Admin</option>
                  <option value="operator">Operator</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="quality">Quality</option>
                </select>
              </div>

              <div className="mb-3">
                <label htmlFor="machine_id" className="form-label">Machine ID</label>
                <select
                  className="form-control"
                  id="machine_id"
                  value={machine_id}
                  onChange={(e) => setmachine_id(e.target.value)}
                  disabled={disableMachine} // disables dropdown if role is Admin/Maintenance/Quality
                >
                  <option value="">Select a machine</option>
                  {machines.map((machine) => (
                    <option key={machine.machine_id} value={machine.machine_id}>
                      {machine.machine_name_type}
                    </option>
                  ))}
                </select>
                {disableMachine && (
                  <div className="form-text">
                    Machine is not required for this role.
                  </div>
                )}
              </div>

              <button type="submit" className="btn btn-primary w-100" disabled={submitting}>
                {submitting ? "Registering..." : "Register"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- TABLE ---------------- */}
      {/* {!showForm && (
  <div className="card shadow-sm">
    <div className="d-flex justify-content-between align-items-center p-3">
      <div className="d-flex align-items-center gap-3">
        <strong className="me-2">Users</strong>
        <input
          type="text"
          className="form-control"
          style={{ width: 260 }}
          placeholder="Search (name, email, role, machine)"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
      <div className="btn-group">
        <button
          className="btn btn-outline-secondary"
          onClick={fetchUsers}
          disabled={loadingUsers}
        >
          {loadingUsers ? "Refreshing…" : "Refresh"}
        </button>
        <button
          className="btn btn-outline-primary"
          onClick={() => setShowForm(true)}
        >
          + Add New
        </button>
      </div>
    </div>

    {loadingUsers && <div className="alert alert-info mb-0">Loading users…</div>}
    {usersError && <div className="alert alert-danger mb-0">{usersError}</div>}

    {!loadingUsers && !usersError && (
      <div className="table-responsive">
        <table className="table table-striped table-hover mb-0">
          <thead className="table-light">
            <tr>
              <th style={{ whiteSpace: "nowrap" }}>#</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th style={{ whiteSpace: "nowrap" }}>Machine</th>
             
              <th style={{ whiteSpace: "nowrap" }}>Created</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-3">
                  No users found
                </td>
              </tr>
            )}
            {filteredUsers.map((u, idx) => {
              const machine = machines.find(m => m.machine_id === u.machine_id);
              const machineName = machine ? machine.machine_name_type : "-";

              return (
                <tr key={u.id}>
                  <td>{idx + 1}</td>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>{machineName}</td>
                 
                  <td>{u.created_at ? new Date(u.created_at).toLocaleString() : "-"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    )}
  </div>
)} */}
    </div>
  );
};

export default RegisterPage;
