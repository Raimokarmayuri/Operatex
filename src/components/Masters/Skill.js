import React, { useState, useEffect } from "react";
import axios from "axios";
import { BsPencil, BsTrash } from "react-icons/bs";
import { Container, Form, Col, Button } from "react-bootstrap";
import API_BASE_URL from "../config";
// const API_BASE_URL = "http://localhost:5003";

const Skillsform = () => {
  const [skills, setSkills] = useState([]);
  const [formData, setFormData] = useState({
    user_id: "",
    machine_id: "",
    skill_role: "",
    skill_level: "",
    certified_by: "",
    certified_on: "",
    valid_till: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [userList, setUserList] = useState([]);
  const [machineList, setMachineList] = useState([]);
  const [machineMap, setMachineMap] = useState({});
  const [machineFilter, setMachineFilter] = useState("");

  useEffect(() => {
    fetchSkills();
    fetchDropdowns();
  }, []);

  const fetchSkills = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/skills`);
      setSkills(response.data);
    } catch (error) {
      console.error("Error fetching skills:", error);
    }
  };

  const fetchDropdowns = async () => {
    try {
      const [usersRes, machinesRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/users`),
        axios.get(`${API_BASE_URL}/api/machines/getallmachine`),
      ]);
      setUserList(usersRes.data);
      setMachineList(machinesRes.data);

      const map = {};
      machinesRes.data.forEach((m) => {
        map[m.machine_id] = m.machine_name_type;
      });
      setMachineMap(map);
    } catch (error) {
      console.error("Error fetching dropdown data:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
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
    } catch (err) {
      console.error("Error submitting form:", err);
    }
  };

  const resetForm = () => {
    setFormData({
      user_id: "",
      machine_id: "",
      skill_role: "",
      skill_level: "",
      certified_by: "",
      certified_on: "",
      valid_till: "",
    });
  };

  const handleEdit = (skill) => {
    setIsEditing(true);
    setEditId(skill.id);
    setFormData(skill);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/skills/delete/${id}`);
      fetchSkills();
    } catch (err) {
      console.error("Error deleting skill:", err);
    }
  };

  return (
    <div className="container3 ms-3" style={{ marginTop: "3rem" }}>
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2 p-2 border rounded bg-light">
        <div className="fs-4 fw-bold" style={{ color: "#034694" }}>
          Skill Assignment
        </div>

        <div className="d-flex align-items-center flex-wrap gap-2 ms-auto">
          <Form.Select
            value={machineFilter}
            onChange={(e) => setMachineFilter(e.target.value)}
            style={{ width: "200px" }}
            className="form-select-sm"
          >
            <option value="">Filter by Machine</option>
            {machineList.map((m) => (
              <option key={m.machine_id} value={m.machine_id}>
                {m.machine_name_type}
              </option>
            ))}
          </Form.Select>

          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => setMachineFilter("")}
          >
            Reset
          </Button>

          {!showForm && (
            <Button
              className="btn btn-sm btn-primary"
              onClick={() => {
                resetForm();
                setShowForm(true);
                setIsEditing(false);
                setEditId(null);
              }}
            >
              + Add Skill
            </Button>
          )}
        </div>
      </div>

      {!showForm && (
        <>
          <table
            className="table table-bordered table-hover mt-4"
            style={{ fontSize: "0.9rem", lineHeight: "1.2" }}
          >
            <thead
              className="table-light"
              style={{ position: "sticky", top: 1, zIndex: 1020 }}
            >
              <tr>
                {Object.keys(formData).map((key, i) => (
                  <th key={i} style={{ color: "#034694" }}>
                    {key
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </th>
                ))}
                <th style={{ color: "#034694" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {skills
                .filter(
                  (skill) =>
                    !machineFilter ||
                    skill.machine_id === parseInt(machineFilter)
                )
                .map((skill) => (
                  <tr key={skill.id}>
                    {Object.keys(formData).map((key, i) => (
                      <td key={i}>
                        {key === "machine_id"
                          ? machineMap[skill.machine_id] || skill.machine_id
                          : skill[key]}
                      </td>
                    ))}
                    <td>
                      <button
                        className="btn btn-sm me-2"
                        onClick={() => handleEdit(skill)}
                        style={{ color: "black" }}
                      >
                        <BsPencil className="me-1" />
                      </button>
                      <button
                        className="btn btn-sm"
                        onClick={() => handleDelete(skill.id)}
                        style={{ color: "red" }}
                      >
                        <BsTrash />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default Skillsform;
