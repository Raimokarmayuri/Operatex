import React, { useEffect, useState } from "react";
import axios from "axios";
import { BsTrash, BsPencil } from "react-icons/bs";
import * as XLSX from "xlsx";
import API_BASE_URL from "../config";
import { useAuth } from "../../context/AuthContext";

const ChecksheetForm = () => {
  const { user } = useAuth();
  const machineId = user?.machine_id || "2";

  const [checksheets, setChecksheets] = useState([]);
  const [filteredChecksheets, setFilteredChecksheets] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [parts, setParts] = useState([]);

  const [formData, setFormData] = useState({
    machine_id: machineId,
    part_id: "",
    Parameter: "",
    Specification: "",
    "Inspection Method": "",
  });

  const fetchParts = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/parts`);
      setParts(res.data);
    } catch (err) {
      console.error("Error fetching parts:", err);
    }
  };

  // Fetch checksheets for current machine
  const fetchChecksheets = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/checksheets`);
      const filtered = res.data.filter((item) => item.machine_id === machineId);
      setChecksheets(filtered);
      setFilteredChecksheets(filtered);
    } catch (err) {
      console.error("Error fetching checksheets:", err);
    }
  };

  useEffect(() => {
    fetchChecksheets();
    fetchParts();
  }, [machineId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        machine_id: machineId,
      };

      if (isEditing && editingId) {
        await axios.put(
          `${API_BASE_URL}/api/checksheets/${editingId}`,
          payload
        );
        alert("Checksheet updated successfully");
      } else {
        await axios.post(`${API_BASE_URL}/api/checksheets`, payload);
        alert("Checksheet added successfully");
      }

      fetchChecksheets();
      resetForm();
      setShowForm(false);
    } catch (err) {
      alert("Failed to submit");
      console.error(err);
    }
  };

  const handleEdit = (item) => {
    setFormData({
      machine_id: item.machine_id,
      part_id: item.part_id,
      Parameter: item.Parameter,
      Specification: item.Specification,
      "Inspection Method": item["Inspection Method"],
    });
    setIsEditing(true);
    setEditingId(item.checksheet_id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      try {
        await axios.delete(`${API_BASE_URL}/api/checksheets/${id}`);
        fetchChecksheets();
      } catch (err) {
        console.error("Error deleting checksheet:", err);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      machine_id: machineId,
      part_id: "",
      Parameter: "",
      Specification: "",
      "Inspection Method": "",
    });
    setIsEditing(false);
    setEditingId(null);
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredChecksheets);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Checksheet");
    XLSX.writeFile(workbook, "Checksheet_Report.xlsx");
  };

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3 p-2 border rounded bg-light">
        {/* Heading */}
        <div className="fs-4 fw-bold text-primary">Checksheet Parameters</div>

        {/* Right Side Controls */}
        {!showForm && (
          <div className="d-flex gap-2 flex-wrap">
            <button className="btn btn-outline-success" onClick={exportToExcel}>
              Export Excel
            </button>
            <button
              className="btn btn-primary"
              onClick={() => setShowForm(true)}
            >
              + Add Checksheet
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="border p-4 rounded mb-4">
          <div className="row">
            <div className="col-md-4">
              <label>Part ID</label>
              <select
                className="form-control"
                name="part_id"
                value={formData.part_id}
                onChange={handleChange}
                required
              >
                <option value="">Select Part</option>
                {parts.map((part) => (
                  <option key={part.part_id} value={part.part_id}>
                    {part.part_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <label>Parameter</label>
              <input
                type="text"
                name="Parameter"
                className="form-control"
                value={formData.Parameter}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-4">
              <label>Specification</label>
              <input
                type="text"
                name="Specification"
                className="form-control"
                value={formData.Specification}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-4">
              <label>Inspection Method</label>
              <input
                type="text"
                name="Inspection Method"
                className="form-control"
                value={formData["Inspection Method"]}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="mt-3">
            <button type="submit" className="btn btn-success me-2">
              Submit
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Table */}
      {!showForm && (
        <>
          <div className="table-responsive">
            <table className="table table-bordered table-hover">
              <thead className="table-light">
                <tr>
                  <th>Parameter</th>
                  <th>Specification</th>
                  <th>Inspection Method</th>
                  <th>Part ID</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredChecksheets.length ? (
                  filteredChecksheets.map((item) => (
                    <tr key={item.checksheet_id}>
                      <td>{item.Parameter}</td>
                      <td>{item.Specification}</td>
                      <td>{item["Inspection Method"]}</td>
                      <td>{item.part_id}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={() => handleEdit(item)}
                        >
                          <BsPencil />
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(item.checksheet_id)}
                        >
                          <BsTrash />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center text-danger">
                      No checksheets found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default ChecksheetForm;
