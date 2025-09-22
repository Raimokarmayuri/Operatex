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
  const [linesList, setLinesList] = useState([]); // ⬅️ NEW: Lines list

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
    line_assigned: "", // ⬅️ ensure present
    machines_assigned: "",
  });

  useEffect(() => {
    fetchUsers();
    fetchShifts();
    fetchMachines();
    fetchLines(); // ⬅️ NEW: fetch lines
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
    try {
      const res = await axios.get(`${API_BASE_URL}/api/shifts`);
      setShiftsList(res.data || []);
    } catch (err) {
      console.error("Error fetching shifts:", err);
    }
  };

  const fetchMachines = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/machines/getallmachine`);
      setMachinesList(res.data || []);
    } catch (err) {
      console.error("Error fetching machines:", err);
    }
  };

  // 👉 Adjust this endpoint to match your backend if different (e.g. /api/line-master, /api/lines/getall)
  const fetchLines = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/lines`);
      setLinesList(res.data || []);
    } catch (err) {
      console.error("Error fetching lines:", err);
      setLinesList([]); // keep UI stable
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const machineIds = toIdArray(form.machines_assigned); // ['3','5',...]
    const payload = {
      ...form,
      pin: form.pin ? parseInt(form.pin) : null,
      access_level: form.access_level || "",
      machines_assigned: toCsv(machineIds), // CSV (backwards compatible)
      machines_assigned_ids: machineIds, // ARRAY (if your API prefers this)
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
    const machineIdsCsv = Array.isArray(user.machines_assigned)
      ? toCsv(user.machines_assigned.map(String))
      : toCsv(toIdArray(user.machines_assigned));

    setForm({
      employee_code: user.employee_code || "",
      full_name: user.full_name || "",
      user_role: user.user_role || "",
      mobile_number: user.mobile_number || "",
      email_id: user.email_id || "",
      username: user.username || "",
      password: "",
      access_level: user.access_level || "",
      fingerprint: user.fingerprint || "",
      pin: user.pin ?? "",
      joining_date: (user.joining_date || "").slice(0, 10),
      department: user.department || "",
      status: user.status || "Active",
      shift_assignment: user.shift_assignment || "",
      line_assigned: user.line_assigned || user.line_id || "",
      machines_assigned: machineIdsCsv, // 👈 keep CSV of IDs in state
    });
    setEditingId(user.user_id || user.id);
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

  // Render machines from CSV or array to human-friendly names
  const renderMachinesAssigned = (val) => {
    if (!val) return "";
    const arr = Array.isArray(val)
      ? val
      : String(val)
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);

    const names = arr.map((x) => {
      // if stored as ID
      const byId = machinesList.find((m) => String(m.machine_id) === String(x));
      if (byId) return byId.machine_name_type;
      // if stored as name already
      const byName = machinesList.find((m) => m.machine_name_type === x);
      return byName ? byName.machine_name_type : x;
    });

    return names.join(", ");
  };

  const toIdArray = (val) => {
    if (!val) return [];
    if (Array.isArray(val)) return val.map(String);
    return String(val)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  };
  const toCsv = (arr) => (arr && arr.length ? arr.join(",") : "");

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
            // removed line_assigned from here to place a dropdown below
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
                <option
                  key={shift.shift_id ?? shift.shift_no ?? shift.id}
                  value={shift.shift_name ?? shift.name}
                >
                  {shift.shift_name ?? shift.name}
                </option>
              ))}
            </select>
          </div>

          {/* ⬇️ NEW: Line dropdown fetched from API */}
          <div className="col-md-4">
            <label className="form-label">Line Assigned</label>
            <select
              className="form-control"
              name="line_assigned"
              value={form.line_assigned}
              onChange={handleChange}
              required
            >
              <option value="">Select Line</option>
              {linesList.map((line) => {
                const key =
                  line.line_id ??
                  line.LineId ??
                  line.LineNo ??
                  line.id ??
                  line.name ??
                  line.line_name;
                const val =
                  line.line_id ??
                  line.LineName ??
                  line.LineNo ??
                  line.name ??
                  line.code ??
                  "";
                return (
                  <option key={key} value={val}>
                    {line.line_name} ( {val} )
                  </option>
                );
              })}
            </select>
          </div>

          {/* <div className="col-md-4">
  <label className="form-label">Machines Assigned</label>
  <select
    multiple
    className="form-control"
    name="machines_assigned"
    // keep state as CSV but the control needs an array
    value={toIdArray(form.machines_assigned)}
    onChange={(e) => {
      const selected = Array.from(e.target.selectedOptions, opt => String(opt.value));
      setForm(prev => ({ ...prev, machines_assigned: toCsv(selected) })); // store CSV of IDs
    }}
  >
    {machinesList.map((m) => (
      <option key={m.machine_id} value={String(m.machine_id)}>
        {m.machine_name_type}
      </option>
    ))}
  </select>
</div> */}

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
              <th style={{ color: "#034694" }}>Employee Code</th>
              <th style={{ color: "#034694" }}>Name</th>
              <th style={{ color: "#034694" }}>Username</th>
              <th style={{ color: "#034694" }}>Role</th>
              <th style={{ color: "#034694" }}>Status</th>
              <th style={{ color: "#034694" }}>Shift</th>
              <th style={{ color: "#034694" }}>Line</th>
              {/* <th style={{ color: "#034694" }}>Assign Machine</th> */}
              <th style={{ color: "#034694" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.user_id || u.id}>
                <td>{u.employee_code}</td>
                <td>{u.full_name}</td>
                <td>{u.username}</td>
                <td>{u.user_role}</td>
                <td>{u.status}</td>
                <td>{u.shift_assignment}</td>
                <td>{u.line_assigned}</td>
                {/* <td>
  {toIdArray(u.machines_assigned)
    .map(id => {
      const m = machinesList.find(x => String(x.machine_id) === String(id));
      return m ? m.machine_name_type : id;
    })
    .join(", ")}
</td>                */}
                <td>
                  <button
                    className="btn btn-sm text-primary me-2"
                    onClick={() => handleEdit(u)}
                  >
                    <BsPencil />
                  </button>
                  <button
                    className="btn btn-sm text-danger"
                    onClick={() => handleDelete(u.user_id || u.id)}
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
