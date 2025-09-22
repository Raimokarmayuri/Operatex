import React, { useState, useEffect } from "react";
import axios from "axios";
import { BsPencil, BsTrash } from "react-icons/bs";
import API_BASE_URL from "../config";

export default function PartMasterForm() {
  const [form, setForm] = useState({
    part_name: "",
    part_name_code: "",
    drawing_no_revision: "",
    customer: "",
    product_family: "",
    material: "",
    part_weight_dimensions: "",
    cad_design_upload: null,
    max_production_per_day: "",
    takt_time: "",
  });
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const apiUrl = `${API_BASE_URL}/api/parts`;

  useEffect(() => {
    fetchParts();
  }, []);

  const fetchParts = async () => {
    try {
      const res = await axios.get(apiUrl);
      setParts(res.data);
    } catch (err) {
      console.error("Error fetching parts:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "cad_design_upload") {
      setForm((f) => ({ ...f, [name]: files?.[0] ?? null }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        // only append defined/non-empty values
        if (value !== null && value !== "") formData.append(key, value);
      });

      if (isEditing) {
        await axios.put(`${apiUrl}/${editId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setSuccess("Part updated successfully");
      } else {
        await axios.post(apiUrl, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setSuccess("Part created successfully");
      }

      fetchParts();
      resetForm();
      setShowForm(false);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      part_name: "",
      part_name_code: "",
      drawing_no_revision: "",
      customer: "",
      product_family: "",
      material: "",
      part_weight_dimensions: "",
      cad_design_upload: null,
      max_production_per_day: "",
      takt_time: "",
    });
    setIsEditing(false);
    setEditId(null);
  };

  const handleEdit = (part) => {
    // preload editable fields; clear file field (cannot be prefilled)
    setForm({
      part_name: part.part_name ?? "",
      part_name_code: part.part_name_code ?? "",
      drawing_no_revision: part.drawing_no_revision ?? "",
      customer: part.customer ?? "",
      product_family: part.product_family ?? "",
      material: part.material ?? "",
      part_weight_dimensions: part.part_weight_dimensions ?? "",
      cad_design_upload: null, // file inputs must be re-selected
      max_production_per_day: part.max_production_per_day ?? "",
      takt_time: part.takt_time ?? "",
    });
    setIsEditing(true);
    setEditId(part.part_id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this part?")) {
      try {
        await axios.delete(`${apiUrl}/${id}`);
        fetchParts();
      } catch (err) {
        console.error("Delete failed:", err);
      }
    }
  };

  return (
    <div className="container3 mb-4" style={{ marginTop: "50px" }}>
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2 p-2 border rounded bg-light">
        <div className="fs-4 fw-bold" style={{ color: "#034694" }}>
          Part Master{" "}
          {isEditing && showForm ? (
            <span className="text-secondary">/ Edit</span>
          ) : null}
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          disabled={showForm}
          title={showForm ? "Close the form to add new" : "Add new part"}
        >
          + Add New
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="row ms-2"
          encType="multipart/form-data"
        >
          <div className="col-md-4 mb-3">
            <label className="form-label">Part Name</label>
            <input
              type="text"
              name="part_name"
              className="form-control"
              value={form.part_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-4 mb-3">
            <label className="form-label">Part Code</label>
            <input
              type="text"
              name="part_name_code"
              className="form-control"
              value={form.part_name_code}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-4 mb-3">
            <label className="form-label">Drawing / Revision</label>
            <input
              type="text"
              name="drawing_no_revision"
              className="form-control"
              value={form.drawing_no_revision}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-4 mb-3">
            <label className="form-label">Customer</label>
            <input
              type="text"
              name="customer"
              className="form-control"
              value={form.customer}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-4 mb-3">
            <label className="form-label">Product Family</label>
            <input
              type="text"
              name="product_family"
              className="form-control"
              value={form.product_family}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-4 mb-3">
            <label className="form-label">Material</label>
            <input
              type="text"
              name="material"
              className="form-control"
              value={form.material}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-4 mb-3">
            <label className="form-label">Weight / Dimensions</label>
            <input
              type="text"
              name="part_weight_dimensions"
              className="form-control"
              value={form.part_weight_dimensions}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-4 mb-3">
            <label className="form-label">CAD File (Image or PDF)</label>
            <input
              type="file"
              name="cad_design_upload"
              className="form-control"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={handleChange}
            />
          </div>

          <div className="col-md-4 mb-3">
            <label className="form-label">Max Production / Day</label>
            <input
              type="number"
              name="max_production_per_day"
              className="form-control"
              value={form.max_production_per_day}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-4 mb-3">
            <label className="form-label">Takt Time (in seconds)</label>
            <input
              type="number"
              step="1"
              name="takt_time"
              className="form-control"
              value={form.takt_time}
              onChange={handleChange}
            />
          </div>

          <div className="text-center mb-3">
            <button
              type="submit"
              className="btn btn-primary me-2"
              disabled={loading}
            >
              {loading
                ? isEditing
                  ? "Updating…"
                  : "Saving…"
                : isEditing
                ? "Update Part"
                : "Save Part"}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setShowForm(false);
                resetForm();
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {!showForm && (
        <div className="table-responsive">
          <table className="table table-bordered table-hover mt-3">
            <thead className="table-light">
              <tr>
                <th style={{ color: "#034694" }}>Part Name</th>
                <th style={{ color: "#034694" }}>Code</th>
                <th style={{ color: "#034694" }}>Customer</th>
                <th style={{ color: "#034694" }}>Material</th>
                <th style={{ color: "#034694" }}>Max Prod/Day</th>
                <th style={{ color: "#034694" }}>Takt Time</th>
                <th style={{ color: "#034694" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {parts.map((part) => (
                <tr key={part.part_id}>
                  <td>{part.part_name}</td>
                  <td>{part.part_name_code}</td>
                  <td>{part.customer}</td>
                  <td>{part.material}</td>
                  <td>{part.max_production_per_day}</td>
                  <td>{part.takt_time}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-primary me-1"
                      onClick={() => handleEdit(part)}
                    >
                      <BsPencil />
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(part.part_id)}
                    >
                      <BsTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
