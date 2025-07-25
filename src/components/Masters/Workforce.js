import React, { useState, useEffect } from "react";
import axios from "axios";
import { BsPencil, BsTrash } from "react-icons/bs";
import API_BASE_URL from "../config";
// const API_BASE_URL = "http://localhost:5003";

const UserForm = () => {
  const [users, setUsers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [shiftsList, setShiftsList] = useState([]);
  const [machinesList, setMachinesList] = useState([]);

  const [form, setForm] = useState({
    employee_code: "",
    full_name: "",
    user_role: "",
    mobile_number: "",
    email_id: "",
    username: "",
    password: "",
    access_level: "",
    fingerprint: "",
    pin: "",
    joining_date: "",
    department: "",
    status: "Active",
    shift_assignment: "",
    line_assigned: "",
    machines_assigned: "",
  });

  useEffect(() => {
    fetchUsers();
    fetchShifts();
    fetchMachines();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/users`);
      setUsers(res.data);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const fetchShifts = async () => {
    const res = await axios.get(`${API_BASE_URL}/api/shifts`);
    setShiftsList(res.data);
  };

  const fetchMachines = async () => {
    const res = await axios.get(`${API_BASE_URL}/api/machines/getallmachine`);
    setMachinesList(res.data);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...form,
      pin: form.pin ? parseInt(form.pin) : null,
      access_level: form.access_level || "",
    };

    try {
      if (editingId) {
        await axios.put(`${API_BASE_URL}/api/users/${editingId}`, payload);
        alert("✅ User updated");
      } else {
        await axios.post(`${API_BASE_URL}/api/users`, payload);
        alert("✅ User created");
      }
      resetForm();
      fetchUsers();
    } catch (err) {
      console.error("❌ Error saving user:", err.response?.data || err);
      alert("❌ Failed to save user. Please check the fields.");
    }
  };

  const handleEdit = (user) => {
    setForm({
      ...user,
      machines_assigned: user.machines_assigned || "",
    });
    setEditingId(user.user_id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure to delete this user?")) {
      await axios.delete(`${API_BASE_URL}/api/users/${id}`);
      fetchUsers();
    }
  };

  const resetForm = () => {
    setForm({
      employee_code: "",
      full_name: "",
      user_role: "",
      mobile_number: "",
      email_id: "",
      username: "",
      password: "",
      access_level: "",
      fingerprint: "",
      pin: "",
      joining_date: "",
      department: "",
      status: "Active",
      shift_assignment: "",
      line_assigned: "",
      machines_assigned: "",
    });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="container3 mt-5">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2 p-2 border rounded bg-light">
        <div className="fs-4 fw-bold" style={{ color: "#034694" }}>
          User Master
        </div>
        {!showForm && (
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            + Add User
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="row g-3">
          {[
            ["employee_code", "Employee Code"],
            ["full_name", "Full Name"],
            ["mobile_number", "Mobile No."],
            ["email_id", "Email"],
            ["username", "Username"],
            ["password", "Password"],
            ["fingerprint", "Fingerprint"],
            ["pin", "PIN"],
            ["department", "Department"],
            ["line_assigned", "Line Assigned"],
          ].map(([name, label]) => (
            <div className="col-md-4" key={name}>
              <label className="form-label">{label}</label>
              <input
                type={name === "pin" ? "number" : "text"}
                className="form-control"
                name={name}
                value={form[name]}
                onChange={handleChange}
                required={["employee_code", "full_name", "username"].includes(
                  name
                )}
              />
            </div>
          ))}

          <div className="col-md-4">
            <label className="form-label">Joining Date</label>
            <input
              type="date"
              className="form-control"
              name="joining_date"
              value={form.joining_date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-4">
            <label className="form-label">User Role</label>
            <select
              className="form-control"
              name="user_role"
              value={form.user_role}
              onChange={handleChange}
              required
            >
              <option value="">Select</option>
              <option value="Admin">Admin</option>
              <option value="Operator">Operator</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Supervisor">Supervisor</option>
            </select>
          </div>

          <div className="col-md-4">
            <label className="form-label">Access Level</label>
            <select
              className="form-control"
              name="access_level"
              value={form.access_level}
              onChange={handleChange}
              required
            >
              <option value="">Select</option>
              <option value="Level 1">Level 1</option>
              <option value="Level 2">Level 2</option>
              <option value="Level 3">Level 3</option>
            </select>
          </div>

          <div className="col-md-4">
            <label className="form-label">Status</label>
            <select
              className="form-control"
              name="status"
              value={form.status}
              onChange={handleChange}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="col-md-4">
            <label className="form-label">Shift Assignment</label>
            <select
              className="form-control"
              name="shift_assignment"
              value={form.shift_assignment}
              onChange={handleChange}
              required
            >
              <option value="">Select Shift</option>
              {shiftsList.map((shift) => (
                <option key={shift.shift_id} value={shift.shift_name}>
                  {shift.shift_name}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-4">
            <label className="form-label">Machines Assigned</label>
            <select
              multiple
              className="form-control"
              name="machines_assigned"
              value={form.machines_assigned.split(",")}
              onChange={(e) => {
                const selected = Array.from(
                  e.target.selectedOptions,
                  (opt) => opt.value
                );
                setForm((prev) => ({
                  ...prev,
                  machines_assigned: selected.join(","),
                }));
              }}
            >
              {machinesList.map((machine) => (
                <option
                  key={machine.machine_id}
                  value={machine.machine_name_type}
                >
                  {machine.machine_name_type}
                </option>
              ))}
            </select>
          </div>

          <div className="col-12">
            <button type="submit" className="btn btn-success me-2">
              {editingId ? "Update" : "Add"} User
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={resetForm}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {!showForm && (
        <table className="table table-bordered table-hover mt-4">
          <thead className="table-light">
            <tr>
             <th style={{ color: "#034694" }} >Employee Code</th>
              <th style={{ color: "#034694" }} >Name</th>
              <th style={{ color: "#034694" }} >Username</th>
              <th style={{ color: "#034694" }} >Role</th>
              <th style={{ color: "#034694" }} >Status</th>
              <th style={{ color: "#034694" }} >Shift</th>
              <th style={{ color: "#034694" }} >Assign Machine</th>
              <th style={{ color: "#034694" }} >Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.employee_code}</td>
                <td>{u.full_name}</td>
                <td>{u.username}</td>
                <td>{u.user_role}</td>
                <td>{u.status}</td>
                <td>{u.shift_assignment}</td>
                <td>
                  {(u.machines_assigned || [])
                    .map((id) => {
                      const machine = machinesList.find(
                        (machine) => machine.machine_id
                      );
                      return machine?.machine_name_type;
                    })
                    .filter(Boolean)
                    .join(", ")}
                </td>{" "}
                {/* <td>{u.machines_assigned}</td> */}
                <td>
                  <button
                    className="btn btn-sm text-primary me-2"
                    onClick={() => handleEdit(u)}
                  >
                    <BsPencil />
                  </button>
                  <button
                    className="btn btn-sm text-danger"
                    onClick={() => handleDelete(u.uesr_id)}
                  >
                    <BsTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default UserForm;
