import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { BsPencil } from "react-icons/bs";
import API_BASE_URL from "../config";
// const API_BASE_URL = "http://192.168.29.244:5003";


const DowntimeForm = () => {
  const machine_id = localStorage.getItem("selectedmachine_id");
  const [downtimes, setDowntimes] = useState([]);
  
  const [formData, setFormData] = useState({
    machine_id: machine_id,
    shift_no: "",
    plan_id: "",
    downtime_reason: "",
    duration: "",
    category: "",
    linked: "",
    remark: "",
    start_timestamp: "",
    end_timestamp: "",
    date: "",
    status: true
  });
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const fetchDowntimes = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/downtimes/bymachineid/${machine_id}`
      );
      setDowntimes(res.data);
    } catch (err) {
      console.error("Error fetching downtimes:", err);
    }
  };

  useEffect(() => {
    fetchDowntimes();
  }, [machine_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(`${API_BASE_URL}/api/downtime/${editId}`, formData);
      }
      fetchDowntimes();
      setShowForm(false);
      setEditId(null);
    } catch (err) {
      console.error("Error submitting downtime:", err);
    }
  };

  const handleEdit = (dt) => {
    setFormData({
      machine_id: dt.machine_id,
      shift_no: dt.shift_no,
      plan_id: dt.plan_id,
      downtime_reason: dt.downtime_reason,
      duration: dt.duration,
      category: dt.category,
      linked: dt.linked,
      remark: dt.remark,
      start_timestamp: new Date(dt.start_timestamp).toISOString().slice(0, 16),
      end_timestamp: new Date(dt.end_timestamp).toISOString().slice(0, 16),
      date: new Date(dt.date).toISOString().split("T")[0],
      status: dt.status
    });
    setEditId(dt.id);
    setShowForm(true);
  };

  return (
    <div className="mt-4">
      <h2 style={{ color: "#034694" }}>Downtime Records</h2>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="row">
            <div className="col-md-4 mb-3">
              <label>Machine ID</label>
              <input type="text" name="machine_id" className="form-control" value={formData.machine_id} readOnly />
            </div>
            <div className="col-md-4 mb-3">
              <label>Shift No</label>
              <input type="number" name="shift_no" className="form-control" value={formData.shift_no} onChange={handleChange} required />
            </div>
            <div className="col-md-4 mb-3">
              <label>Plan ID</label>
              <input type="number" name="plan_id" className="form-control" value={formData.plan_id} onChange={handleChange} required />
            </div>
            <div className="col-md-4 mb-3">
              <label>Reason</label>
              <input type="text" name="downtime_reason" className="form-control" value={formData.downtime_reason} onChange={handleChange} required />
            </div>
            <div className="col-md-4 mb-3">
              <label>Category</label>
              <input type="text" name="category" className="form-control" value={formData.category} onChange={handleChange} required />
            </div>
            <div className="col-md-4 mb-3">
              <label>Linked</label>
              <input type="text" name="linked" className="form-control" value={formData.linked} onChange={handleChange} />
            </div>
            <div className="col-md-4 mb-3">
              <label>Remark</label>
              <input type="text" name="remark" className="form-control" value={formData.remark} onChange={handleChange} />
            </div>
            <div className="col-md-4 mb-3">
              <label>Duration (min)</label>
              <input type="number" name="duration" className="form-control" value={formData.duration} onChange={handleChange} required />
            </div>
            <div className="col-md-4 mb-3">
              <label>Start Timestamp</label>
              <input type="datetime-local" name="start_timestamp" className="form-control" value={formData.start_timestamp} onChange={handleChange} required />
            </div>
            <div className="col-md-4 mb-3">
              <label>End Timestamp</label>
              <input type="datetime-local" name="end_timestamp" className="form-control" value={formData.end_timestamp} onChange={handleChange} required />
            </div>
            <div className="col-md-4 mb-3">
              <label>Date</label>
              <input type="date" name="date" className="form-control" value={formData.date} onChange={handleChange} required />
            </div>
          </div>
          <button type="submit" className="btn btn-primary">
            {editId ? "Update" : "Submit"}
          </button>
          
        </form>
      )}
{!showForm ? (
      <div className="table-responsive">
        <table className="table table-bordered table-hover mt-3">
          <thead className="table-light">
            <tr>
              <th>Date</th>
              <th>Machine ID</th>
              <th>Shift No</th>
              <th>Downtime Reason</th>
              <th>Duration</th>
              <th>Category</th>
              <th>Linked</th>
              <th>Start</th>
              <th>End</th>
              <th>Remark</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {downtimes.length > 0 ? (
              downtimes.map((dt) => (
                <tr key={dt.id}>
                  <td>{new Date(dt.date).toLocaleDateString()}</td>
                  <td>{dt.machine_id}</td>
                  <td>{dt.shift_no}</td>
                  <td>{dt.downtime_reason}</td>
                  <td>{dt.duration} min</td>
                  <td>{dt.category}</td>
                  <td>{dt.linked}</td>
                  <td>{new Date(dt.start_timestamp).toLocaleString("en-GB", { hour12: false })}</td>
                  <td>{new Date(dt.end_timestamp).toLocaleString("en-GB", { hour12: false })}</td>
                  <td>{dt.remark}</td>
                  <td>
                    <button className="btn btn-sm btn-light" onClick={() => handleEdit(dt)}>
                      <BsPencil style={{ color: "blue" }} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="11" className="text-center text-danger">
                  No records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      ) : (
        <button className="btn btn-secondary mb-3" onClick={() => setShowForm(false)}>
          Cancel
        </button>
      )}
    </div>
  );
};

export default DowntimeForm;
