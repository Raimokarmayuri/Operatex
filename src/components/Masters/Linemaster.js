import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Form } from 'react-bootstrap';
import { BsPencil, BsTrash } from 'react-icons/bs';
import API_BASE_URL from "../config";

export default function LineMasterForm() {
  const [lines, setLines] = useState([]);
  const [show, setShow] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    line_name: '',
    plant_shop_id: '',
    line_type: '',
    process_type: '',
    target_oee_output: null,
    layout_upload: '',
    status: '',
    remarks: ''
  });
  const [file, setFile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('');

  const apiUrl = `${API_BASE_URL}/api/lines`;

  useEffect(() => {
    fetchLines();
  }, []);

  const fetchLines = async () => {
    const res = await axios.get(apiUrl);
    setLines(res.data);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData();
    for (const key in formData) {
      form.append(key, formData[key]);
    }
    if (file) {
      form.append('layout_upload', file);
    }

    try {
      if (editMode) {
        await axios.put(`${apiUrl}/${editingId}`, form, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setAlertMessage("Line updated successfully!");
      } else {
        await axios.post(apiUrl, form, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setAlertMessage("Line added successfully!");
      }
      setAlertType("success");
      fetchLines();
      resetForm();
      setShow(false);
    } catch (err) {
      console.error('Submit failed:', err.response?.data || err.message);
      setAlertMessage('Error submitting form: ' + (err.response?.data?.error || err.message));
      setAlertType('danger');
    }
  };

  const handleEdit = (line) => {
    setEditMode(true);
    setEditingId(line.line_id);
    setFormData(line);
    setShow(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this line?')) {
      await axios.delete(`${apiUrl}/${id}`);
      fetchLines();
    }
  };

  const resetForm = () => {
    setFormData({
      line_name: '',
      plant_shop_id: '',
      line_type: '',
      process_type: '',
      target_oee_output: null,
      layout_upload: '',
      status: '',
      remarks: ''
    });
    setFile(null);
    setEditMode(false);
    setEditingId(null);
  };

  return (
    <div className="container3 mb-4" style={{ marginTop: "50px" }}>
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2 p-2 border rounded bg-light">
        <div className="fs-4 fw-bold" style={{ color: "#034694" }}>
          Manage Line Master
        </div>
        {!show && (
          <button
            className="btn btn-primary"
            title="Add Line"
            onClick={() => setShow(true)}
          >
            <i className="fas fa-file-medical"></i>
          </button>
        )}
      </div>

      {alertMessage && (
        <div className={`alert alert-${alertType} alert-dismissible fade show`} role="alert">
          {alertMessage}
          <button
            type="button"
            className="btn-close"
            data-bs-dismiss="alert"
            aria-label="Close"
            onClick={() => setAlertMessage("")}
          ></button>
        </div>
      )}

      {show && (
        <form onSubmit={handleSubmit} className="row ms-2">
          {Object.entries(formData).map(([key, val]) => (
            key !== 'layout_upload' && (
              <div className="col-md-3 mb-3" key={key}>
                <label className="form-label">{key.replace(/_/g, ' ').toUpperCase()}</label>
                <input
                  type={key === "target_oee_output" ? "number" : "text"}
                  name={key}
                  className="form-control"
                  value={val || ''}
                  onChange={handleChange}
                  required={key !== "remarks"}
                />
              </div>
            )
          ))}

          <div className="col-md-3 mb-3">
            <label className="form-label">LAYOUT UPLOAD</label>
            <input
              type="file"
              name="layout_upload"
              className="form-control"
              onChange={handleFileChange}
              accept=".pdf,.jpg,.jpeg,.png"
            />
          </div>

          <div className="text-center mb-3">
            <button type="submit" className="btn btn-primary me-2">
              {editMode ? "Update Line" : "Save Line"}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => setShow(false)}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {!show && (
        <div className="table-responsive" style={{ maxHeight: "600px", overflowY: "auto" }}>
          <table className="table table-bordered table-hover mt-4" style={{ fontSize: "0.9rem", lineHeight: "1.2" }}>
            <thead className="table-light" style={{ position: "sticky", top: 1, zIndex: 1020 }}>
              <tr>
                <th style={{ color: "#034694" }}>Line ID</th>
                <th style={{ color: "#034694" }}>Line Name</th>
                <th style={{ color: "#034694" }}>Plant/Shop ID</th>
                <th style={{ color: "#034694" }}>LineType</th>
                <th style={{ color: "#034694" }}>ProcessType</th>
                <th style={{ color: "#034694" }}>Target_OEE</th>
                <th style={{ color: "#034694" }}>Status</th>
                <th style={{ color: "#034694" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((line) => (
                <tr key={line.line_id}>
                  <td>{line.line_id}</td>
                  <td>{line.line_name}</td>
                  <td>{line.plant_shop_id}</td>
                  <td>{line.line_type}</td>
                  <td>{line.process_type}</td>
                  <td>{line.target_oee_output}</td>
                  <td>{line.status}</td>
                  <td>
                    <button
                      className="btn border-0 bg-transparent text-dark btn-sm me-2"
                      onClick={() => handleEdit(line)}
                    >
                      <BsPencil className="me-1" style={{ color: "black" }} />
                    </button>
                    <button className="btn btn-sm" onClick={() => handleDelete(line.line_id)}>
                      <BsTrash style={{ color: "red" }} />
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
