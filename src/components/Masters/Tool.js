import React, { useState, useEffect } from "react";
import { Row, Col, Form, Button, Table, InputGroup, FormControl } from "react-bootstrap";
import axios from "axios";
import API_BASE_URL from "../config";
import { BsPencil, BsTrash } from "react-icons/bs";
// const API_BASE_URL = "http://localhost:5003";

const ToolMasterForm = () => {
  const [formData, setFormData] = useState({
    tool_name: "",
    tool_type: "",
    machine_id: "",
    part_id: "",
    tool_number: "",
    tool_life_limit: "",
    tool_change_threshold: "",
    tool_manufacturer_code: "",
    tool_calibration_required: false,
    tool_calibration_freq: "",
    tool_holder_type: "",
    status: "Active",
    tool_wear_monitoring: false,
    alert_threshold: "",
    offset_no: "",
    nominal_offset_value: "",
    offset_delta: "",
    tool_wear_percent: "",
  });

  // Define which fields should be hidden from the form
  const hiddenFields = [
    'remaining_life_percent',
    'total_tools_used_till',
    'tool_health_status',
    'replacement_reason',
    'last_applied_offset',
    'offset_change_history',
    'tool_usage_counter',
    'last_change_date',
    'tool_drawing_upload',
    'tool_usage_count',
    'last_replacement_date'
  ];

  // Define which fields are integer/number types
  const integerFields = [
    'tool_number',
    'tool_life_limit',
    'tool_change_threshold',
    'tool_calibration_freq',
    'alert_threshold',
    'offset_no',
    'nominal_offset_value',
    'offset_delta',
    'tool_wear_percent',
    'tool_usage_counter',
    'tool_usage_count'
  ];

  // Define which fields are percentage fields (for better UX)
  const percentageFields = [
    'tool_wear_percent'
  ];

  const [tools, setTools] = useState([]);
  const [partList, setPartList] = useState([]);
  const [machineList, setMachineList] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [filter, setFilter] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchTools();
    fetchParts();
    fetchMachines();
  }, []);

  const fetchTools = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/tools`);
      setTools(res.data);
    } catch (error) {
      console.error("Failed to fetch tools", error);
    }
  };

  const fetchParts = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/parts`);
      setPartList(response.data);
    } catch (error) {
      console.error("Failed to fetch parts", error);
    }
  };

  const fetchMachines = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/machines/getallmachine`);
      setMachineList(response.data);
    } catch (error) {
      console.error("Failed to fetch machines", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    let processedValue = value;
    
    // Handle integer fields
    if (integerFields.includes(name) && value !== '') {
      processedValue = parseInt(value) || '';
    }
    
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : processedValue
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Process integer fields before submitting
      const processedFormData = { ...formData };
      integerFields.forEach(field => {
        if (processedFormData[field] !== '' && processedFormData[field] !== null) {
          processedFormData[field] = parseInt(processedFormData[field]) || 0;
        }
      });

      if (isEditing) {
        await axios.put(`${API_BASE_URL}/api/tools/${editId}`, processedFormData);
      } else {
        await axios.post(`${API_BASE_URL}/api/tools`, processedFormData);
      }
      fetchTools();
      resetForm();
    } catch (error) {
      console.error("Failed to submit tool form", error);
    }
  };

  const resetForm = () => {
    setFormData({
      tool_name: "",
      tool_type: "",
      machine_id: "",
      part_id: "",
      tool_number: "",
      tool_life_limit: "",
      tool_change_threshold: "",
      tool_manufacturer_code: "",
      tool_calibration_required: false,
      tool_calibration_freq: "",
      tool_holder_type: "",
      status: "Active",
      tool_wear_monitoring: false,
      alert_threshold: "",
      offset_no: "",
      nominal_offset_value: "",
      offset_delta: "",
      tool_wear_percent: "",
    });
    setIsEditing(false);
    setEditId(null);
    setShowForm(false);
  };

  const handleEdit = (tool) => {
    // Filter out hidden fields from the tool data before setting form data
    const filteredToolData = {};
    Object.keys(formData).forEach(key => {
      if (!hiddenFields.includes(key)) {
        filteredToolData[key] = tool[key] || formData[key];
      }
    });
    setFormData(filteredToolData);
    setIsEditing(true);
    setEditId(tool.tool_id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this tool?")) {
      try {
        await axios.delete(`${API_BASE_URL}/api/tools/${id}`);
        fetchTools();
      } catch (error) {
        console.error("Delete failed", error);
      }
    }
  };

  const filteredTools = tools.filter(tool =>
    tool.tool_name?.toLowerCase().includes(filter.toLowerCase()) ||
    tool.tool_number?.toString().includes(filter)
  );

  // Function to get input type based on field
  const getInputType = (key) => {
    if (integerFields.includes(key)) {
      return "number";
    }
    return "text";
  };

  // Function to get additional props for number inputs
  const getInputProps = (key) => {
    const props = {};
    if (integerFields.includes(key)) {
      props.min = 0;
      props.step = 1;
    }
    if (percentageFields.includes(key)) {
      props.max = 100;
    }
    return props;
  };

  return (
    <div className="container3 mt-5 ms-3">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3 p-2 border rounded bg-light">
  <div className="fs-4 fw-bold" style={{ color: "#034694" }}>
    Tool Master
  </div>

  <div className="d-flex align-items-center gap-2">
    <input
      className="form-control"
      style={{ width: "250px", height: "32px", fontSize: "0.85rem" }}
      placeholder="Search by tool name or number"
      value={filter}
      onChange={(e) => setFilter(e.target.value)}
    />
    {!showForm && (
      <button
        className="btn btn-primary"
        style={{ height: "32px", fontSize: "0.85rem" }}
        onClick={() => setShowForm(true)}
      >
        + Add Tool
      </button>
    )}
  </div>
</div>


      
      {showForm && (
        <Form onSubmit={handleSubmit} className="mb-4">
          <Row>
            {Object.entries(formData)
              .filter(([key]) => !hiddenFields.includes(key)) // Filter out hidden fields
              .map(([key, value], idx) => (
                <Col md={4} key={idx} className="mb-3">
                  <Form.Group>
                    <Form.Label>
                      {key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                      {percentageFields.includes(key) && ' (%)'}
                    </Form.Label>
                    {key === "part_id" ? (
                      <Form.Select required name={key} value={value} onChange={handleInputChange}>
                        <option value="">Select Part</option>
                        {partList.map(part => (
                          <option key={part.part_id} value={part.part_id}>{part.part_name}</option>
                        ))}
                      </Form.Select>
                    ) : key === "machine_id" ? (
                      <Form.Select required name={key} value={value} onChange={handleInputChange}>
                        <option value="">Select Machine</option>
                        {machineList.map(machine => (
                          <option key={machine.machine_id} value={machine.machine_id}>{machine.machine_name_type}</option>
                        ))}
                      </Form.Select>
                    ) : key === "status" ? (
                      <Form.Select required name={key} value={value} onChange={handleInputChange}>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="Maintenance">Maintenance</option>
                      </Form.Select>
                    ) : key === "tool_type" ? (
                      <Form.Select required name={key} value={value} onChange={handleInputChange}>
                        <option value="">Select Tool Type</option>
                        <option value="Cutting">Cutting</option>
                        <option value="Drilling">Drilling</option>
                        <option value="Milling">Milling</option>
                        <option value="Turning">Turning</option>
                        <option value="Grinding">Grinding</option>
                        <option value="Other">Other</option>
                      </Form.Select>
                    ) : typeof value === 'boolean' ? (
                      <Form.Check 
                      required
                        type="checkbox" 
                        name={key} 
                        label="Yes" 
                        checked={value} 
                        onChange={handleInputChange} 
                      />
                    ) : (
                      <Form.Control
                      required
                        type={getInputType(key)}
                        name={key}
                        value={value}
                        onChange={handleInputChange}
                        {...getInputProps(key)}
                      />
                    )}
                  </Form.Group>
                </Col>
              ))}
          </Row>
          <Button type="submit" className="me-2">
            {isEditing ? "Update Tool" : "Add Tool"}
          </Button>
          <Button variant="secondary" onClick={resetForm}>Cancel</Button>
        </Form>
      )}

      {!showForm && (
        <Table bordered hover responsive>
          <thead className="table-light">
  <tr>
    <th style={{ color: "#034694" }}>SR No.</th>
    <th style={{ color: "#034694" }}>Tool Name</th>
    <th style={{ color: "#034694" }}>Tool Number</th>
    <th style={{ color: "#034694" }}>Machine ID</th>
    <th style={{ color: "#034694" }}>Part</th>
    <th style={{ color: "#034694" }}>Life Limit</th>
    <th style={{ color: "#034694" }}>Status</th>
    <th style={{ color: "#034694" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTools.length > 0 ? filteredTools.map((tool, index) => (
              <tr key={tool.id}>
                <td>{index+1}</td>
                <td>{tool.tool_name}</td>
                <td>{tool.tool_number}</td>
                <td>{machineList.find(m => m.machine_id === tool.machine_id)?.machine_name_type || tool.machine_id}</td>

                <td>{tool.part_id}</td>
                <td>{tool.tool_life_limit}</td>
                <td>{tool.status}</td>
                <td>
                  <Button variant="outline-primary" size="sm" onClick={() => handleEdit(tool)} className="me-2">
                    <BsPencil />
                  </Button>
                  <Button variant="outline-danger" size="sm" onClick={() => handleDelete(tool.id)}>
                    <BsTrash />
                  </Button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="7" className="text-center">No tools found</td>
              </tr>
            )}
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default ToolMasterForm;