// Updated Skillsform.jsx to include new fields

import React, { useState, useEffect } from "react";
import axios from "axios";
import { BsPencil, BsTrash } from "react-icons/bs";
import { Container, Form, Col, Button } from "react-bootstrap";
import API_BASE_URL from "../config";
// const API_BASE_URL = "http://localhost:5003";

const Skillsform = () => {
  const [skills, setSkills] = useState([]);
  const [formData, setFormData] = useState({
    user_id: '',
    // skill_id: '',
    machine_id: '',
    // part_id: '',
    // process_id: '',
    skill_role: '',
    skill_level: '',
    certified_by: '',
    certified_on: '',
    valid_till: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/skills`);
      setSkills(response.data);
    } catch (error) {}
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isEditing) {
      await axios.put(`${API_BASE_URL}/api/skills/${editId}`, formData);
      setIsEditing(false);
      setEditId(null);
    } else {
      await axios.post(`${API_BASE_URL}/api/skills`, formData);
    }
    fetchSkills();
    resetForm();
    setShowForm(false);
  };

  const resetForm = () => {
    setFormData({
      user_id: '',
      // skill_id: '',
      machine_id: '',
      // part_id: '',
      // process_id: '',
      skill_role: '',
      skill_level: '',
      certified_by: '',
      certified_on: '',
      valid_till: ''
    });
  };

  const handleEdit = (skill) => {
    setIsEditing(true);
    setEditId(skill.id);
    setFormData(skill);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    await axios.delete(`${API_BASE_URL}/api/skills/delete/${id}`);
    fetchSkills();
  };

  const [userList, setUserList] = useState([]);
const [machineList, setMachineList] = useState([]);

useEffect(() => {
  fetchSkills();
  fetchDropdowns(); // 👈 new
}, []);

const fetchDropdowns = async () => {
  try {
    const [usersRes, machinesRes] = await Promise.all([
      axios.get(`${API_BASE_URL}/api/users`),
      axios.get(`${API_BASE_URL}/api/machines`)
    ]);
    setUserList(usersRes.data);
    setMachineList(machinesRes.data);
  } catch (error) {
    console.error("Error fetching dropdown data:", error);
  }
};


  return (
    <div className="container3" style={{ marginTop: "3rem" }}>
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2 p-2 border rounded bg-light">
        <div className="fs-4 fw-bold" style={{ color: "#034694" }}>Skill Assignment</div>
         {!showForm && (
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            + Add Skill
          </button>
        )}
      </div>
{showForm && (
      <Form onSubmit={handleSubmit} className="p-3 mb-4">
  <div className="row">
    {Object.entries(formData).map(([key, value], i) => (
      <div className="col-md-4" key={i}>
        <Form.Group className="mb-3">
          <Form.Label>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</Form.Label>

          {key === "user_id" ? (
            <Form.Select name="user_id" value={value} onChange={handleInputChange} required>
              <option value="">Select User</option>
              {userList.map((u) => (
                <option key={u.user_id} value={u.user_id}>
                  {u.full_name || u.username}
                </option>
              ))}
            </Form.Select>
          ) : key === "machine_id" ? (
            <Form.Select name="machine_id" value={value} onChange={handleInputChange} required>
              <option value="">Select Machine</option>
              {machineList.map((m) => (
                <option key={m.machine_id} value={m.machine_id}>
                  {m.machine_name_type}
                </option>
              ))}
            </Form.Select>
          ) : key.includes("on") || key.includes("till") ? (
            <Form.Control
              type="date"
              name={key}
              value={value}
              onChange={handleInputChange}
              required
            />
          ) : (
            <Form.Control
              type="text"
              name={key}
              value={value}
              onChange={handleInputChange}
              required
            />
          )}
        </Form.Group>
      </div>
    ))}
  </div>

  <Button type="submit" className="mt-3 me-2 btn btn-primary">
    {isEditing ? "Update" : "Add"}
  </Button>
  <Button
    type="button"
    className="btn btn-secondary mt-3"
    onClick={() => {
      resetForm();
      setShowForm(false);
      setIsEditing(false);
      setEditId(null);
    }}
  >
    Cancel
  </Button>
</Form>
)}

      {!showForm && (
      <table className="table table-bordered table-hover mt-4" style={{ fontSize: "0.9rem", lineHeight: "1.2" }}>
        <thead className="table-light" style={{ position: "sticky", top: 1, zIndex: 1020 }}>
          <tr>
            {Object.keys(formData).map((key, i) => (
              <th key={i} style={{ color: "#034694" }}>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</th>
            ))}
            <th style={{ color: "#034694" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {skills.map((skill) => (
            <tr key={skill.id}>
              {Object.keys(formData).map((key, i) => (
                <td key={i}>{skill[key]}</td>
              ))}
              <td>
                <button className="btn btn-sm me-2" onClick={() => handleEdit(skill)} style={{ color: "black" }}>
                  <BsPencil className="me-1" />
                </button>
                <button className="btn btn-sm" onClick={() => handleDelete(skill.id)} style={{ color: "red" }}>
                  <BsTrash />
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

export default Skillsform;