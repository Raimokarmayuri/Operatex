import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import { BsPencil, BsTrash } from "react-icons/bs";
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../config";
import { useAuth } from "../../context/AuthContext";

const BreakdownForm = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const machineId = user?.machine_id || ""; // ✅ Get machineId from logged-in user

  const [breakdowns, setBreakdowns] = useState([]);
  const [filteredBreakdowns, setFilteredBreakdowns] = useState([]);
  const [machineList, setMachineList] = useState([]);
  const [isTodayFilter, setIsTodayFilter] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [techNames, setTechNames] = useState([]);
  const [shiftOptions, setShiftOptions] = useState([]);
    const getLocalDateTime = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:mm
};
  const [formData, setFormData] = useState({
    machine_id: machineId,
    breakdown_reason: "",
    breakdown_start: getLocalDateTime(), 

    breakdown_end: "",
    assigned_technician: "",
    remark: "",
    shift_no: "",
    breakdown_type: "",
    action_taken: "",
    root_cause: "",
    responsibility: "",
    status: "open",
    location: "",
    user_id: "",
  });




  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredBreakdowns);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Breakdown Data");
    XLSX.writeFile(workbook, "Breakdown_Report.xlsx");
  };

  const filterTodaysSchedule = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const filtered = breakdowns.filter((b) => {
      const date = new Date(b.created_at);
      return date >= today && date < tomorrow;
    });
    setFilteredBreakdowns(filtered);
  };

  const fetchBreakdowns = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/breakdown`);
      const processed = res.data
        .filter((b) => b.machine_id === machineId) // ✅ Filter by machineId
        .map((b) => {
          const start = new Date(b.breakdown_start);
          const end = new Date(b.breakdown_end);
          const durationMs = end - start;
          const h = Math.floor(durationMs / 3600000);
          const m = Math.floor((durationMs % 3600000) / 60000);
          return {
            ...b,
            duration: `${h}h ${m}m`,
            startTime: start.toLocaleString(),
            endTime: end.toLocaleString(),
          };
        });
      setBreakdowns(processed);
      setFilteredBreakdowns(processed);
    } catch (err) {
      console.error("Error loading breakdowns", err);
    }
  };

  const fetchMachineData = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/machines/getallmachine`);
      setMachineList(res.data);
    } catch (err) {}
  };

  const fetchShiftOptions = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/shifts`);
      setShiftOptions(res.data);
    } catch (err) {}
  };

  const fetchTechnicianNames = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/users`);
      setTechNames(res.data);
    } catch (err) {
      console.error("Error loading technicians", err);
    }
  };

  const applyFilters = () => {
    let filtered = [...breakdowns];
    if (startDate) filtered = filtered.filter((b) => new Date(b.breakdown_start) >= new Date(startDate));
    if (endDate) filtered = filtered.filter((b) => new Date(b.breakdown_end) <= new Date(endDate));
    if (isTodayFilter) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      filtered = filtered.filter((b) => {
        const d = new Date(b.breakdown_start);
        return d >= today && d < tomorrow;
      });
    }
    setFilteredBreakdowns(filtered);
  };

  const resetFilters = () => {
    setStartDate("");
    setEndDate("");
    setIsTodayFilter(false);
    setFilteredBreakdowns(breakdowns);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      machine_id: machineId, // ✅ Force using logged-in user's machineId
      shift_no: parseInt(formData.shift_no),
      assigned_technician: techNames.find((u) => u.user_id === parseInt(formData.user_id))?.full_name || "",
      breakdown_start: new Date(formData.breakdown_start).getLocalDateTime(), 
      breakdown_end: new Date(formData.breakdown_end).getLocalDateTime(), 
    };
    try {
      if (isEditing && editingId) {
        await axios.put(`${API_BASE_URL}/api/breakdown/${editingId}`, payload);
        alert("Breakdown updated successfully");
      } else {
        await axios.post(`${API_BASE_URL}/api/breakdown`, payload);
        alert("Breakdown added successfully");
      }
      fetchBreakdowns();
      setShowForm(false);
      setIsEditing(false);
      setEditingId(null);
      resetForm();
    } catch (err) {
      alert("Submission failed");
      console.error(err);
    }
  };

  const resetForm = () => {
    setFormData({
      machine_id: machineId,
      breakdown_reason: "",
      breakdown_start: new Date().toISOString().slice(0, 16),
      breakdown_end: "",
      assigned_technician: "",
      remark: "",
      shift_no: "",
      breakdown_type: "",
      action_taken: "",
      root_cause: "",
      responsibility: "",
      status: "open",
      location: "",
      user_id: "",
    });
  };

  const handleEdit = (b) => {
    const selectedUser = techNames.find((t) => t.full_name === b.assigned_technician);
    setFormData({
      ...b,
      breakdown_start: new Date(b.breakdown_start).toISOString().slice(0, 16),
      breakdown_end: new Date(b.breakdown_end).toISOString().slice(0, 16),
      user_id: selectedUser?.user_id || "",
    });
    setIsEditing(true);
    setEditingId(b.breakdown_id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this breakdown?")) {
      try {
        await axios.delete(`${API_BASE_URL}/api/breakdown/${id}`);
        fetchBreakdowns();
      } catch (err) {
        console.error("Delete failed", err);
      }
    }
  };

  useEffect(() => {
    fetchBreakdowns();
    fetchMachineData();
    fetchShiftOptions();
    fetchTechnicianNames();
  }, []);

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="text-primary">Breakdowns</h4>
        {!showForm && (
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            + Add Breakdown
          </button>
        )}
      </div>

      {/* Filter section */}
      {!showForm && (
        <div className="d-flex gap-2 flex-wrap mb-3">
          <input
            type="date"
            className="form-control"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <input
            type="date"
            className="form-control"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <button className="btn btn-outline-primary" onClick={applyFilters}>
            Filter
          </button>
          <button className="btn btn-outline-secondary" onClick={resetFilters}>
            Reset
          </button>
          <button className="btn btn-outline-success" onClick={exportToExcel}>
            Export Excel
          </button>
        </div>
      )}

      {/* Breakdown form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="border rounded p-4 mb-4">
          <div className="row">
            <div className="col-md-4">
              <label>Breakdown Start</label>
              <input
                type="datetime-local"
                className="form-control"
                value={formData.breakdown_start}
                onChange={(e) => setFormData({ ...formData, breakdown_start: e.target.value })}
                required
              />
            </div>
            <div className="col-md-4">
              <label>Breakdown End</label>
              <input
                type="datetime-local"
                className="form-control"
                value={formData.breakdown_end}
                onChange={(e) => setFormData({ ...formData, breakdown_end: e.target.value })}
                required
              />
            </div>
            <div className="col-md-4">
              <label>Reason</label>
              <input
                type="text"
                className="form-control"
                value={formData.breakdown_reason}
                onChange={(e) => setFormData({ ...formData, breakdown_reason: e.target.value })}
                required
              />
            </div>

            <div className="col-md-4">
              <label>Technician</label>
              <select
                className="form-control"
                value={formData.user_id}
                onChange={(e) => setFormData({ ...formData, user_id: parseInt(e.target.value) })}
              >
                <option value="">Select Technician</option>
                {techNames.map((t) => (
                  <option key={t.user_id} value={t.user_id}>
                    {t.full_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-4">
              <label>Shift No</label>
              <select
                className="form-control"
                value={formData.shift_no}
                onChange={(e) => setFormData({ ...formData, shift_no: e.target.value })}
              >
                <option value="">Select Shift</option>
                {shiftOptions.map((s) => (
                  <option key={s.shift_no} value={s.shift_no}>
                    {s.shift_no}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-4">
              <label>Status</label>
              <select
                className="form-control"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="open">Open</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div className="col-md-6">
              <label>Remark</label>
              <textarea
                className="form-control"
                rows={2}
                value={formData.remark}
                onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
              />
            </div>
          </div>

          <div className="mt-3">
            <button type="submit" className="btn btn-primary me-2">
              Submit
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Breakdown Table */}
      {!showForm && (
        <div className="table-responsive">
          <table className="table table-bordered table-hover">
            <thead className="table-light">
              <tr>
                <th>Date</th>
                <th>Reason</th>
                <th>Technician</th>
                <th>Start</th>
                <th>End</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBreakdowns.length ? (
                filteredBreakdowns.map((b) => (
                  <tr key={b.breakdown_id}>
                    <td>{new Date(b.created_at).toLocaleDateString()}</td>
                    <td>{b.breakdown_reason}</td>
                    <td>{b.assigned_technician}</td>
                    <td>{b.startTime}</td>
                    <td>{b.endTime}</td>
                    <td>{b.duration}</td>
                    <td>{b.status}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => handleEdit(b)}
                      >
                        <BsPencil />
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(b.breakdown_id)}
                      >
                        <BsTrash />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center text-danger">
                    No breakdowns found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BreakdownForm;
