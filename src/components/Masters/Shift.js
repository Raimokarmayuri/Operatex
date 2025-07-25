import React, { useState, useEffect } from "react";
import axios from "axios";
import { BsPencil, BsTrash } from "react-icons/bs";
import API_BASE_URL from "../config";
// const API_BASE_URL = "http://localhost:5003";

const Shiftform = () => {
  const [shifts, setShifts] = useState([]);
 const [shiftForm, setShiftForm] = useState({
  shift_no: "",
  shift_name: "",
  shift_start_time: "",
  shift_end_time: "",
  shift_duration_mins: "",
  is_night_shift: false,
  plant_id: "",
  line_id: "",
  status: "Active",
  created_by: "",
});
  const [editingShiftId, setEditingShiftId] = useState(null);
 const [showForm, setShowForm] = useState(false);

  const fetchShifts = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/shifts`);
      setShifts(response.data);
    } catch (error) {
      console.error("Error fetching shifts", error);
    }
  };

  useEffect(() => {
    fetchShifts();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShiftForm({ ...shiftForm, [name]: value });
  };

const handleFormSubmit = async (e) => {
  e.preventDefault();
  const payload = {
    ...shiftForm,
    shift_no: parseInt(shiftForm.shift_no),
    shift_duration_mins: parseInt(shiftForm.shift_duration_mins),
    plant_id: parseInt(shiftForm.plant_id),
    line_id: parseInt(shiftForm.line_id),
    created_by: parseInt(shiftForm.created_by),
  };

  try {
    if (editingShiftId) {
      await axios.put(`${API_BASE_URL}/api/shifts/${editingShiftId}`, payload);
      alert("Shift updated");
    } else {
      await axios.post(`${API_BASE_URL}/api/shifts`, payload);
      alert("Shift created");
    }
    resetForm();
    fetchShifts();
  } catch (error) {
    console.error("Error saving shift:", error);
    alert("❌ Error while saving shift. Check required fields.");
  }
};


  const resetForm = () => {
    setShiftForm({
      shift_no: "",
      shift_name: "",
      shift_start_time: "",
      shift_end_time: "",
      plant_id: "",
      line_id: "",
      status: "Active",
      created_by: "",
    });
    setEditingShiftId(null);
 setShowForm(false);
  };

  const handleEdit = (shift) => {
    setShiftForm({ ...shift });
    setEditingShiftId(shift.shift_id);
     setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/shifts/${id}`);
      fetchShifts();
    } catch (error) {
      console.error("Error deleting shift", error);
    }
  };

  return (
    <div className="container3 mt-5">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2 p-2 border rounded bg-light">
        <div className="fs-4 fw-bold" style={{ color: "#034694" }}>
          Shift Master
        </div>
         {!showForm && (
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            + Add Shift
          </button>
        )}
      </div>
{showForm && (
      <form onSubmit={handleFormSubmit} className="row g-3 mt-5">
        <div className="col-md-3">
          <label className="form-label">Shift No</label>
          <input
            type="text"
            className="form-control"
            name="shift_no"
            value={shiftForm.shift_no}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="col-md-3">
          <label className="form-label">Shift Name</label>
          <input
            type="text"
            className="form-control"
            name="shift_name"
            value={shiftForm.shift_name}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="col-md-3">
          <label className="form-label">Start Time</label>
          <input
            type="time"
            className="form-control"
            name="shift_start_time"
            value={shiftForm.shift_start_time}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="col-md-3">
          <label className="form-label">End Time</label>
          <input
            type="time"
            className="form-control"
            name="shift_end_time"
            value={shiftForm.shift_end_time}
            onChange={handleInputChange}
            required
          />
        </div>

        {/* <div className="col-md-3">
          <label className="form-label">Plant ID</label>
          <input
            type="text"
            className="form-control"
            name="plant_id"
            value={shiftForm.plant_id}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="col-md-3">
          <label className="form-label">Line ID</label>
          <input
            type="text"
            className="form-control"
            name="line_id"
            value={shiftForm.line_id}
            onChange={handleInputChange}
            required
          />
        </div> */}

        <div className="col-md-3">
          <label className="form-label">Created By</label>
          <input
            type="text"
            className="form-control"
            name="created_by"
            value={shiftForm.created_by}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="col-md-3">
          <label className="form-label">Status</label>
          <select
            className="form-control"
            name="status"
            value={shiftForm.status}
            onChange={handleInputChange}
            required
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
<div className="col-md-3">
  <label className="form-label">Is Night Shift</label><br />
  <input
    type="checkbox"
    name="is_night_shift"
    checked={shiftForm.is_night_shift}
    onChange={(e) =>
      setShiftForm({ ...shiftForm, is_night_shift: e.target.checked })
    }
  /> Yes
</div>
        <div className="col-12">
          <button type="submit" className="btn btn-primary">
            <i className={`fas ${editingShiftId ? "fa-edit" : "fa-plus"} me-2`} />
            {editingShiftId ? "Update Shift" : "Add Shift"}
          </button>
          <button
            type="button"
            className="btn btn-secondary ms-2"
            onClick={resetForm}
          >
            <i className="fas fa-times"></i> Cancel
          </button>
        </div>
      </form>
)}

{!showForm && (

      <table
        className="table table-bordered table-hover mt-4"
        style={{ fontSize: "0.9rem", lineHeight: "1.2" }}
      >
        <thead className="table-light" style={{ position: "sticky", top: 1, zIndex: 1020 }}>
          <tr>
            <th style={{ color: "#034694" }}>Shift Number</th>
            <th style={{ color: "#034694" }}>Shift Name</th>
            <th style={{ color: "#034694" }}>Start Time</th>
            <th style={{ color: "#034694" }}>End Time</th>
            {/* <th style={{ color: "#034694" }}>Plant ID</th>
            <th style={{ color: "#034694" }}>Line ID</th> */}
            <th style={{ color: "#034694" }}>Status</th>
            <th style={{ color: "#034694" }}>Created By</th>
            <th style={{ color: "#034694" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {shifts.map((shift) => (
            <tr key={shift.id}>
              <td>{shift.shift_no}</td>
              <td>{shift.shift_name}</td>
              <td>{shift.shift_start_time}</td>
              <td>{shift.shift_end_time}</td>
              {/* <td>{shift.plant_id}</td>
              <td>{shift.line_id}</td> */}
              <td>{shift.status}</td>
              <td>{shift.created_by}</td>
              <td>
                <button className="btn btn-sm me-2" onClick={() => handleEdit(shift)}>
                  <BsPencil className="me-1" style={{ color: "black" }} />
                </button>
                <button className="btn btn-sm" onClick={() => handleDelete(shift.shift_id)}>
                  <BsTrash className="me-0" style={{ color: "red" }} />
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

export default Shiftform;
