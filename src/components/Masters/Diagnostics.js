import React, { useState, useEffect } from "react";
import axios from "axios";
import { Container, Form, Button, Table, Modal } from "react-bootstrap";
import { BsPencil, BsTrash } from "react-icons/bs";
import API_BASE_URL from "../config";

const DiagnosticManager = () => {
  const [machineId, setMachineId] = useState("");
  const [parameterName, setParameterName] = useState("");
  const [highThreshold, setHighThreshold] = useState("");
  const [lowThreshold, setLowThreshold] = useState("");
  const [machineIds, setMachineIds] = useState([]);
  const [diagnostics, setDiagnostics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedDiagnosticId, setSelectedDiagnosticId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // **🔹 Fetch Machine IDs**
  useEffect(() => {
    const fetchMachineIds = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/machines/ORG001`);
        setMachineIds(response.data.map((machine) => machine.machineId));
      } catch (err) {
        console.error("Error fetching machine IDs:", err);
      }
    };

    fetchMachineIds();
    fetchDiagnostics();
  }, []);

  // **🔹 Fetch Existing Diagnostic Data**
  const fetchDiagnostics = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/diagnostics`);
      setDiagnostics(response.data);
    } catch (err) {
      console.error("Error fetching diagnostics:", err);
    }
  };

  // **🔹 Handle Form Submission (Add or Edit)**
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!machineId || !parameterName || !highThreshold || !lowThreshold) {
      alert("All fields are required!");
      return;
    }

    const diagnosticData = {
      machineId: machineId,
      parameters: [
        {
          name: parameterName,
          highThreshold: Number(highThreshold),
          lowThreshold: Number(lowThreshold),
        },
      ],
    };

    setLoading(true);
    try {
      if (editMode) {
        await axios.put(
          `${API_BASE_URL}/api/diagnostics/${selectedDiagnosticId}`,
          diagnosticData
        );
        alert("Threshold updated successfully!");
      } else {
        await axios.post(`${API_BASE_URL}/api/diagnostics`, diagnosticData);
        alert("Threshold added successfully!");
      }

      fetchDiagnostics();
      resetForm();
    } catch (err) {
      console.error("Error saving diagnostic:", err);
    } finally {
      setLoading(false);
    }
  };

  // **🔹 Handle Edit Click**
  const handleEdit = (diagnosticId, param) => {
    setMachineId(param.machineId);
    setParameterName(param.name);
    setHighThreshold(param.highThreshold);
    setLowThreshold(param.lowThreshold);
    setSelectedDiagnosticId(diagnosticId);
    setEditMode(true);
  };

  // **🔹 Handle Delete Click**
  const handleDelete = async () => {
    try {
      await axios.delete(`${API_BASE_URL}/api/diagnostics/${deleteId}`);
      alert("Threshold deleted successfully!");
      fetchDiagnostics();
    } catch (err) {
      console.error("Error deleting diagnostic:", err);
    } finally {
      setShowDeleteModal(false);
    }
  };

  // **🔹 Reset Form**
  const resetForm = () => {
    setMachineId("");
    setParameterName("");
    setHighThreshold("");
    setLowThreshold("");
    setEditMode(false);
    setSelectedDiagnosticId(null);
  };

  return (
    <div className="container3" style={{ marginTop: "3rem" }}>
      <h3 className="text-center">
        {editMode ? "Edit Threshold" : "Add Diagnostic Threshold"}
      </h3>

      {/* **🔹 Add/Edit Diagnostic Form** */}
      <Form onSubmit={handleSubmit} className="border p-3 mb-4 shadow-sm">
        <div className="row">
          <div className="col-md-3">
            <Form.Group>
              <Form.Label>Machine ID</Form.Label>
              <Form.Select
                value={machineId}
                onChange={(e) => setMachineId(e.target.value)}
                required
              >
                <option value="">Select Machine ID</option>
                {machineIds.map((id) => (
                  <option key={id} value={id}>
                    {id}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </div>

          <div className="col-md-3">
            <Form.Group>
              <Form.Label>Parameter Name</Form.Label>
              <Form.Select
                value={parameterName}
                onChange={(e) => setParameterName(e.target.value)}
                required
              >
                <option value="">-- Select Parameter --</option>
                <option value="SpindleSpeed">SpindleSpeed</option>
                <option value="SpindleLoad">SpindleLoad</option>
                <option value="ServoTemp1">ServoTemp1</option>
                <option value="ServoTemp2">ServoTemp2</option>
                <option value="ServoTemp3">ServoTemp3</option>
                <option value="ServoTemp4">ServoTemp4</option>
                <option value="ServoLoad1">ServoLoad1</option>
                <option value="ServoLoad2">ServoLoad2</option>
                <option value="ServoLoad3">ServoLoad3</option>
                <option value="ServoLoad4">ServoLoad4</option>
                <option value="Encoder1">Encoder1</option>
                <option value="Encoder2">Encoder2</option>
                <option value="Encoder3">Encoder3</option>
                <option value="Encoder4">Encoder4</option>
              </Form.Select>
            </Form.Group>
          </div>

          <div className="col-md-3">
            <Form.Group>
              <Form.Label>High Threshold</Form.Label>
              <Form.Control
                type="number"
                value={highThreshold}
                onChange={(e) => setHighThreshold(e.target.value)}
                required
              />
            </Form.Group>
          </div>

          <div className="col-md-3">
            <Form.Group>
              <Form.Label>Low Threshold</Form.Label>
              <Form.Control
                type="number"
                value={lowThreshold}
                onChange={(e) => setLowThreshold(e.target.value)}
                required
              />
            </Form.Group>
          </div>
        </div>

        <Button className="mt-3" type="submit" disabled={loading}>
          {loading
            ? "Saving..."
            : editMode
            ? "Update Threshold"
            : "Add Threshold"}
        </Button>
        {editMode && (
          <Button className="mt-3 ms-2" variant="secondary" onClick={resetForm}>
            Cancel
          </Button>
        )}
      </Form>

      {/* **🔹 Diagnostic Threshold Table** */}
      <h4 className="text-center text-secondary">Existing Thresholds</h4>
      <table
        className="table table-bordered table-hover mt-4"
        style={{
          fontSize: "0.9rem", // Reduce font size
          lineHeight: "1.2", // Adjust line height
        }}
      >
        <thead
          className="table-light"
          style={{
            position: "sticky",
            top: 1,
            zIndex: 1020,
          }}
        >
          <tr>
            <th style={{ color: "#034694" }}>#</th>
            <th style={{ color: "#034694" }}>Machine ID</th>
            <th style={{ color: "#034694" }}>Parameter Name</th>
            <th style={{ color: "#034694" }}>High Threshold</th>
            <th style={{ color: "#034694" }}>Low Threshold</th>
            <th style={{ color: "#034694" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {diagnostics.length > 0 ? (
            diagnostics.map((item, index) =>
              item.parameters.map((param, idx) => (
                <tr key={`${index}-${idx}`}>
                  <td>{index + 1}</td>
                  <td>{item.machineId}</td>
                  <td>{param.name}</td>
                  <td>{param.highThreshold}</td>
                  <td>{param.lowThreshold}</td>
                  <td>
                    <button
                      className="btn border-0 bg-transparent text-dark btn-sm me-2"
                      onClick={() => handleEdit(item._id, param)}
                    >
                      <BsPencil className="me-1" style={{ color: "blue" }} />
                    </button>{" "}
                    <button
                      className="btn border-0 bg-transparent text-danger btn-sm"
                      onClick={() => {
                        setDeleteId(item._id);
                        setShowDeleteModal(true);
                      }}
                    >
                      <BsTrash className="me-1" style={{ color: "red" }} />
                    </button>
                  </td>
                </tr>
              ))
            )
          ) : (
            <tr>
              <td colSpan="6" className="text-center">
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* **🔹 Delete Confirmation Modal** */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this threshold?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default DiagnosticManager;
