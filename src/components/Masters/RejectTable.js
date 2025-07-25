import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Form, Button, Container, Row, Col } from "react-bootstrap";
import { BsPencil, BsTrash } from "react-icons/bs";
import API_BASE_URL from "../config";

// const API_BASE_URL = "http://localhost:5003";

const RejectionForm = () => {
  const [formData, setFormData] = useState({
    machine_id: "",
    plan_id: "",
    shift_no: "",
    part_name: "",
    quantity: "",
    rejectionreason: "",
    rejectiontype: "",
    date: "",
  });

  const [rejections, setRejections] = useState([]);
  const [machines, setMachines] = useState([]);
  const [editId, setEditId] = useState(null); // For tracking edit mode

  useEffect(() => {
    fetchMachines();
    fetchRejections();
  }, []);

  const fetchMachines = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/machines/getallmachine`);
      setMachines(res.data);
    } catch (err) {
      console.error("Failed to fetch machines", err);
    }
  };

  const fetchRejections = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/partrejections`);
      setRejections(res.data);
    } catch (err) {
      console.error("Failed to fetch rejections", err);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editId) {
        await axios.put(`${API_BASE_URL}/api/partrejections/${editId}`, formData);
        alert("Rejection updated!");
      } else {
        await axios.post(`${API_BASE_URL}/api/partrejections`, formData);
        alert("Rejection submitted!");
      }

      setFormData({
       machine_id: Number(formData.machine_id),
  plan_id: Number(formData.plan_id),
  shift_no: Number(formData.shift_no),
  quantity: Number(formData.quantity),
        part_name: "",
        // quantity: "",
        rejectionreason: "",
        rejectiontype: "",
        date: "",
      });

      setEditId(null);
      fetchRejections();
    } catch (err) {
      console.error("Submit error", err);
      alert("Failed to submit or update rejection");
    }
  };

  const handleEdit = (rej) => {
    setFormData({
      machine_id: rej.machine_id,
      plan_id: rej.plan_id,
      shift_no: rej.shift_no,
      part_name: rej.part_name,
      quantity: rej.quantity,
      rejectionreason: rej.rejectionreason,
      rejectiontype: rej.rejectiontype,
      date: rej.date.split("T")[0], // ISO format
    });
    setEditId(rej.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this rejection?")) {
      try {
        await axios.delete(`${API_BASE_URL}/api/partrejections/${id}`);
        fetchRejections();
        alert("Rejection deleted");
      } catch (err) {
        console.error("Delete error", err);
        alert("Failed to delete rejection");
      }
    }
  };

  return (
    <div className="mt-5 p-2">
      <h4 className="text-primary mb-3">
        {editId ? "Edit Rejection Entry" : "Rejection Entry Form"}
      </h4>
      <Form onSubmit={handleSubmit} className="border p-3 rounded bg-light mt-4">
        <Row className="mb-3">
          <Col md={4}>
            <Form.Group>
              <Form.Label>Machine ID</Form.Label>
              <Form.Select
                name="machine_id"
                value={formData.machine_id}
                onChange={handleChange}
                required
              >
                <option value="">Select Machine</option>
                {machines.map((m) => (
                  <option key={m.machine_id} value={m.machine_id}>
                    {m.machine_id}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>Plan ID</Form.Label>
              <Form.Control
                type="number"
                name="plan_id"
                value={formData.plan_id}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>Shift No</Form.Label>
              <Form.Control
                type="number"
                name="shift_no"
                value={formData.shift_no}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={4}>
            <Form.Group>
              <Form.Label>Part Name</Form.Label>
              <Form.Control
                type="text"
                name="part_name"
                value={formData.part_name}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>Quantity</Form.Label>
              <Form.Control
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>Date</Form.Label>
              <Form.Control
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Rejection Reason</Form.Label>
              <Form.Control
                type="text"
                name="rejectionreason"
                value={formData.rejectionreason}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Rejection Type</Form.Label>
              <Form.Control
                type="text"
                name="rejectiontype"
                value={formData.rejectiontype}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
        </Row>

        <Button type="submit" variant={editId ? "warning" : "primary"}>
          {editId ? "Update Rejection" : "Submit Rejection"}
        </Button>
      </Form>

      <h5 className="mt-5">Rejection History</h5>
      <div className="table-responsive mt-3">
        <Table striped bordered hover>
          <thead className="table-light">
            <tr>
              <th>#</th>
              <th>Date</th>
              <th>Machine</th>
              <th>Shift</th>
              <th>Part Name</th>
              <th>Qty</th>
              <th>Reason</th>
              <th>Type</th>
              <th>Updated At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rejections.length > 0 ? (
              rejections.map((rej, index) => (
                <tr key={rej.id}>
                  <td>{index + 1}</td>
                  <td>{new Date(rej.date).toLocaleDateString()}</td>
                  <td>{rej.machine_id}</td>
                  <td>{rej.shift_no}</td>
                  <td>{rej.part_name}</td>
                  <td>{rej.quantity}</td>
                  <td>{rej.rejectionreason}</td>
                  <td>{rej.rejectiontype}</td>
                  <td>{new Date(rej.updated_at).toLocaleString()}</td>
                  <td>
                    <Button size="sm" variant="outline-primary" className="me-1" onClick={() => handleEdit(rej)}>
                      <BsPencil />
                    </Button>
                    <Button size="sm" variant="outline-danger" onClick={() => handleDelete(rej.id)}>
                      <BsTrash />
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" className="text-center">No rejections found.</td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default RejectionForm;
