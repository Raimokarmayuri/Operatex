import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Select from "react-select";
import API_BASE_URL from "../config";

const EditBreakdown = () => {
  const { id } = useParams(); // Get breakdown ID from URL
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    machineId: "",
    breakdownReason: "",
    shift: "",
    breakdownType: "",
    breakdownStartDateTime: "",
    breakdownEndDateTime: "",
    location: "",
    actionTaken: "",
    rootCause: "",
    responsibility: "",
    assignedTechnician: "",
    status: "",
  });

  useEffect(() => {
    fetchBreakdownDetails();
  }, []);

  // Fetch Breakdown Data
  const fetchBreakdownDetails = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/breakdowns/${id}`
      );
      const breakdown = response.data;

      setFormData({
        machineId: breakdown.machineId,
        breakdownReason: breakdown.breakdownReason,
        breakdownStartDateTime: breakdown.breakdownStartDateTime
          ? new Date(breakdown.breakdownStartDateTime).toISOString().slice(0, 16)
          : "",
        breakdownEndDateTime: breakdown.breakdownEndDateTime
          ? new Date(breakdown.breakdownEndDateTime).toISOString().slice(0, 16)
          : "",
        location: breakdown.location || "",
        actionTaken: breakdown.actionTaken || "",
        rootCause: breakdown.rootCause || "",
        responsibility: breakdown.responsibility || "",
        assignedTechnician: breakdown.assignedTechnician || "",
        status: breakdown.status || "Open",
        shift: breakdown.shift || "",  // ✅ Include shift
        breakdownType: breakdown.breakdownType || "",
      });

      setLoading(false);
    } catch (error) {
      console.error("Error fetching breakdown details:", error);
      setError("Failed to load breakdown details");
      setLoading(false);
    }
  };

  // Handle Form Input Changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Submit Updated Breakdown
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_BASE_URL}/api/breakdowns/${id}`, formData);
      window.alert("Breakdown updated successfully!");
      navigate("/breakdowntable"); // Navigate back to Breakdown list
    } catch (error) {
      console.error("Error updating breakdown:", error);
      setError("Failed to update breakdown");
    }
  };

  if (loading) return <p>Loading breakdown details...</p>;
  if (error) return <p className="text-danger">{error}</p>;

  return (
    <div className="container" style={{ marginTop:"6rem"}}>
      <h3 className="text-center">Update Breakdown</h3>
      <form className="mt-4" onSubmit={handleSubmit}>
        <div className="row">
          {/* Machine ID - Disabled */}
          <div className="col-md-4">
            <div className="form-group mb-3">
              <label className="form-label">Machine ID</label>
              <input
                type="text"
                className="form-control form-control-sm"
                value={formData.machineId}
                disabled
              />
            </div>
          </div>

          {/* Breakdown Start Date - Disabled */}
          <div className="col-md-4">
            <div className="form-group mb-3">
              <label className="form-label">Breakdown Start Date</label>
              <input
                type="datetime-local"
                name="breakdownStartDateTime"
                className="form-control form-control-sm"
                value={formData.breakdownStartDateTime}
                disabled
              />
            </div>
          </div>

          {/* Breakdown End Date - Disabled */}
          <div className="col-md-4">
            <div className="form-group mb-3">
              <label className="form-label">Breakdown End Date</label>
              <input
                type="datetime-local"
                name="breakdownEndDateTime"
                className="form-control form-control-sm"
                value={formData.breakdownEndDateTime}
                disabled
              />
            </div>
          </div>
        </div>

        <div className="row">
          {/* Breakdown Reason - Disabled */}
          <div className="col-md-4">
            <div className="form-group mb-3">
              <label className="form-label">Breakdown Reason</label>
              <input
                type="text"
                name="breakdownReason"
                className="form-control form-control-sm"
                value={formData.breakdownReason}
                disabled
              />
            </div>
          </div>

          {/* Location - Disabled */}
          <div className="col-md-4">
            <div className="form-group mb-3">
              <label className="form-label">Location</label>
              <input
                type="text"
                name="location"
                className="form-control form-control-sm"
                value={formData.location}
                disabled
              />
            </div>
          </div>

          {/* Action Taken - Disabled */}
          <div className="col-md-4">
            <div className="form-group mb-3">
              <label className="form-label">Action Taken</label>
              <input
                type="text"
                name="actionTaken"
                className="form-control form-control-sm"
                value={formData.actionTaken}
                disabled
              />
            </div>
          </div>
        </div>

        <div className="row">
          {/* Root Cause - Disabled */}
          <div className="col-md-4">
            <div className="form-group mb-3">
              <label className="form-label">Physical Phenomenon</label>
              <input
                type="text"
                name="rootCause"
                className="form-control form-control-sm"
                value={formData.rootCause}
                disabled
              />
            </div>
          </div>

          {/* Responsibility - Disabled */}
          <div className="col-md-4">
            <div className="form-group mb-3">
              <label className="form-label">Responsibility</label>
              <input
                type="text"
                name="responsibility"
                className="form-control form-control-sm"
                value={formData.responsibility}
                disabled
              />
            </div>
          </div>

          {/* Assigned Technician - Disabled */}
          <div className="col-md-4">
            <div className="form-group mb-3">
              <label className="form-label">Assigned Technician</label>
              <input
                type="text"
                name="assignedTechnician"
                className="form-control form-control-sm"
                value={formData.assignedTechnician}
                disabled
              />
            </div>
          </div>
        </div>

        <div className="row">
        <div className="col-md-4">
              <div className="form-group mb-3">
                <label>Shift Number</label>
                <input
                  name="shift" // Add the name attribute to match formData key
                  className="form-control"
                  value={formData.shift} // Bind value to formData.shift
                  onChange={handleChange} // Use the handleInputChange function
                  disabled
                />
              </div>
            </div>
            <div className="col-md-4">
              <div className="form-group mb-3">
                <label>Breakdown Type</label>
                <input
                  name="breakdownType" // Add the name attribute to match formData key
                  className="form-control"
                  value={formData.breakdownType} // Bind value to formData.shift
                  onChange={handleChange} // Use the handleInputChange function
                  disabled
                />
              </div>
            </div>
          {/* Status - Editable */}
          <div className="col-md-4">
            <div className="form-group mb-3">
              <label className="form-label">Status</label>
              <select
                name="status"
                className="form-control form-control-sm"
                value={formData.status}
                onChange={handleChange}
                required
              >
                <option value="">select</option>
                <option value="Open">Open</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Save and Cancel Buttons */}
        <div className="d-flex justify-content-start mb-5">
          <button type="submit" className="btn btn-success btn-sm me-2">
            Save
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => navigate("/breakdowntable")}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditBreakdown;
