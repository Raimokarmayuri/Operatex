import React, { useState, useEffect } from "react";
import axios from "axios";
import { BsPencil, BsTrash } from "react-icons/bs";
import API_BASE_URL from "../config";
// const API_BASE_URL = "http://localhost:5003";


const MaintenanceScheduleForm = () => {
  const machineId = localStorage.getItem("selectedmachine_id");
  const [schedules, setSchedules] = useState([]);
  const [filteredSchedules, setFilteredSchedules] = useState([]);
  const [formData, setFormData] = useState({
    maintenance_type: "",
    frequency: "",
    status: "",
    pm_schedule_date: "",
    next_schedule_date: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertType, setAlertType] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState("");

  const frequencyOptions = [
    "Daily", "Weekly", "Monthly", "Quarterly", "Half-Yearly", "Yearly"
  ];

  const fetchSchedules = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/maintenance/machine/${machineId}`);
      const sorted = response.data.sort((a, b) =>
        new Date(b.pm_schedule_date) - new Date(a.pm_schedule_date)
      );
      setSchedules(sorted);
      setFilteredSchedules(sorted);
    } catch (error) {
      setAlertMessage("No data forund");
      setAlertType("danger");
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const calculateNextDate = (startDate, frequency) => {
    const date = new Date(startDate);
    switch (frequency) {
      case "Daily": date.setDate(date.getDate() + 1); break;
      case "Weekly": date.setDate(date.getDate() + 7); break;
      case "Monthly": date.setMonth(date.getMonth() + 1); break;
      case "Quarterly": date.setMonth(date.getMonth() + 3); break;
      case "Half-Yearly": date.setMonth(date.getMonth() + 6); break;
      case "Yearly": date.setFullYear(date.getFullYear() + 1); break;
      default: return "";
    }
    return date.toISOString().split("T")[0];
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const updatedData = { ...formData, [name]: value };

    if (name === "frequency" || name === "pm_schedule_date") {
      updatedData.next_schedule_date = calculateNextDate(updatedData.pm_schedule_date, updatedData.frequency);
    }

    setFormData(updatedData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextDate = calculateNextDate(formData.pm_schedule_date, formData.frequency);
    const payload = { ...formData, machine_id: machineId, next_schedule_date: nextDate };

    try {
      if (isEditing) {
        await axios.put(`${API_BASE_URL}/api/maintenance/${editId}`, payload);
        setAlertMessage("Schedule updated!");
      } else {
        await axios.post(`${API_BASE_URL}/api/maintenance`, payload);
        setAlertMessage("Schedule added!");
      }
      setAlertType("success");
      fetchSchedules();
      setFormData({});
      setShowForm(false);
    } catch (error) {
      setAlertMessage("Error saving schedule.");
      setAlertType("danger");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this schedule?")) {
      try {
        await axios.delete(`${API_BASE_URL}/api/maintenance/${id}`);
        setAlertMessage("Deleted successfully!");
        setAlertType("success");
        fetchSchedules();
      } catch {
        setAlertMessage("Delete failed.");
        setAlertType("danger");
      }
    }
  };

  const handleEditClick = (schedule) => {
    setEditId(schedule.id);
    setFormData({
      maintenance_type: schedule.maintenance_type,
      frequency: schedule.frequency,
      status: schedule.status,
      pm_schedule_date: schedule.pm_schedule_date?.split("T")[0],
      next_schedule_date: schedule.next_schedule_date?.split("T")[0],
    });
    setShowModal(true);
  };

  const handleUpdateStatus = async () => {
    try {
      await axios.put(`${API_BASE_URL}/api/maintenance/${editId}`, {
        status: formData.status,
      });
      setAlertMessage("Status updated!");
      setAlertType("success");
      setShowModal(false);
      fetchSchedules();
    } catch {
      setAlertMessage("Update failed.");
      setAlertType("danger");
    }
  };

  const handleFilter = (type) => {
    if (activeFilter === type) {
      setFilteredSchedules(schedules);
      setActiveFilter("");
    } else {
      setFilteredSchedules(schedules.filter(s => s.maintenance_type === type));
      setActiveFilter(type);
    }
  };

  return (
    <div className="container mt-3">
      {alertMessage && (
        <div className={`alert alert-${alertType}`} role="alert">
          {alertMessage}
        </div>
      )}

      <div className="d-flex justify-content-between align-items-center mb-3">
        {!showForm && (
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            Add Schedule
          </button>
        )}
        <div>
          {["JH", "PM", "CBM", "TBM"].map((type) => (
            <button
              key={type}
              className={`btn btn-sm me-2 ${activeFilter === type ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => handleFilter(type)}
            >
              {type}
            </button>
          ))}
          <button className="btn btn-sm btn-outline-secondary" onClick={() => {
            setFilteredSchedules(schedules);
            setActiveFilter("");
          }}>
            Reset
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="row g-3 mb-3">
          <div className="col-md-3">
            <label>Maintenance Type</label>
            <select name="maintenance_type" className="form-control" value={formData.maintenance_type} onChange={handleInputChange} required>
              <option value="">Select</option>
              <option value="PM">PM</option>
              <option value="JH">JH</option>
              <option value="CBM">CBM</option>
              <option value="TBM">TBM</option>
            </select>
          </div>
          <div className="col-md-3">
            <label>Frequency</label>
            <select name="frequency" className="form-control" value={formData.frequency} onChange={handleInputChange} required>
              <option value="">Select</option>
              {frequencyOptions.map((f, i) => <option key={i} value={f}>{f}</option>)}
            </select>
          </div>
          <div className="col-md-3">
            <label>PM Schedule Date</label>
            <input type="date" className="form-control" name="pm_schedule_date" value={formData.pm_schedule_date} onChange={handleInputChange} required />
          </div>
          <div className="col-md-3">
            <label>Status</label>
            <select name="status" className="form-control" value={formData.status} onChange={handleInputChange} required>
              <option value="">Select</option>
              <option value="pending">Pending</option>
              <option value="complete">Complete</option>
            </select>
          </div>
          <div className="col-12">
            <button className="btn btn-success me-2" type="submit">{isEditing ? "Update" : "Save"}</button>
            <button className="btn btn-secondary" type="button" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      )}

      <div className="table-responsive">
        <table className="table table-bordered">
          <thead className="table-light">
            <tr>
              <th>Type</th>
              <th>Frequency</th>
              <th>Schedule Date</th>
              <th>Next Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSchedules.map((s) => (
              <tr key={s.id}>
                <td>{s.maintenance_type}</td>
                <td>{s.frequency}</td>
                <td>{new Date(s.pm_schedule_date).toLocaleDateString()}</td>
                <td>{s.next_schedule_date ? new Date(s.next_schedule_date).toLocaleDateString() : ""}</td>
                <td>{s.status}</td>
                <td>
                  <button className="btn btn-sm me-2" onClick={() => handleEditClick(s)}>
                    <BsPencil style={{ color: "blue" }} />
                  </button>
                  <button className="btn btn-sm" onClick={() => handleDelete(s.id)}>
                    <BsTrash style={{ color: "red" }} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5>Edit Status</h5>
                <button className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <label>Status</label>
                <select className="form-control" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                  <option value="pending">Pending</option>
                  <option value="complete">Complete</option>
                </select>
              </div>
              <div className="modal-footer">
                <button className="btn btn-primary" onClick={handleUpdateStatus}>Save</button>
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenanceScheduleForm;
