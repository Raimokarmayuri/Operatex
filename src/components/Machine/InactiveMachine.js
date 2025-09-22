import React, { useState, useEffect } from 'react';
import axios from 'axios';
// import '../View/form.css'
import { ipv4 } from 'ip-validator';
import API_BASE_URL from "../config";

const CncMachineform = () => {
  const [machines, setMachines] = useState([]);
  const [formData, setFormData] = useState({
    machine_id: '',
    organizationId: '',
    // assetId: '',
    machineName: '',
    machineType: '',
    status: '',
    location: '',
    cell: '',
    AssignedOperator: '',
    machineMake: '',
    machineModel: '',
    machineController: '',
    yearOfManufacturing: '',
    machineIP: '',
    spindleCount: '',
    batteryCount: '',
    machineCapacity: '',
    powerRating: '',
    machineCategory: '',
    otherDetails: ''
  });

  
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchMachines();
  }, []);

  const orgid = "ORG001";

  const fetchMachines = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/machines/getallmachine`);
      // Filter only active machines
      const activeMachines = response.data.filter(machine => machine.status === 'INACTIVE');
      setMachines(activeMachines);
    } catch (error) {
      console.error('Error fetching machine data:', error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateIPv4(formData.machineIP)) {
      alert('Invalid IPv4 address format.');
      return;
    }
    try {
      if (isEditing) {
        await axios.put(`${API_BASE_URL}/api/machines/machine/${editId}`, formData);
        alert('Record updated successfully');
        setIsEditing(false);
        setEditId(null);
      } else {
        await axios.post(`${API_BASE_URL}/api/machines/register`, formData);
        alert('Data saved successfully');
      }
      fetchMachines();
      resetForm();
      setShowForm(false);
    } catch (error) {
      console.error('Error saving data:', error);
      alert('An error occurred while saving data');
    }
  };

  const resetForm = () => {
    setFormData({
      machine_id: '',
      organizationId: '',
      // assetId: '',
      machineName: '',
      machineType: '',
      status: '',
      location: '',
      cell: '',
      AssignedOperator: '',
      machineMake: '',
      machineModel: '',
      machineController: '',
      yearOfManufacturing: '',
      machineIP: '',
      spindleCount: '',
      batteryCount: '',
      machineCapacity: '',
      powerRating: '',
      machineCategory: '',
      otherDetails: ''
    });
  };

  const handleEdit = (machine) => {
    setIsEditing(true);
    setEditId(machine.machine_id);
    setFormData(machine);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        await axios.delete(`${API_BASE_URL}/api/machines/machine/${id}`);
        alert('Record deleted successfully');
        fetchMachines();
      } catch (error) {
        console.error('Error deleting record:', error);
        alert('An error occurred while deleting the record');
      }
    }
  };

  const [techNames, setTechNames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to fetch technician names
  const fetchTechnicianNames = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/workforce`);
      setTechNames(response.data); // Set the technician names in state
      setLoading(false); // Set loading to false after data is loaded
    } catch (err) {
      setError('Error fetching technician names');
      setLoading(false);
    }
  };

  // Use useEffect to fetch data when component mounts
  useEffect(() => {
    fetchTechnicianNames();
  }, []);

  const validateIPv4 = (ip) => {
    // Use ipv4 from ip-validator to check if the IP is valid
    return ipv4(ip);
  };

  return (
    <div className="container3"  style={{ marginTop: "6rem"}}>
            <h3
              className="text-center text-md-center"
              style={{ color: "red", fontWeight: "bold", fontSize: "26px", marginTop:"rem" }}
            >
              {" "}
              Inactive Machines
      </h3>

    {/* {!showForm && (
      <button className="btn btn-primary mb-1" onClick={() => setShowForm(true)}>
        Add Data
      </button>
    )} */}

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
            <th style={{ color: "#034694" }}>Machine ID</th>
            <th style={{ color: "#034694" }}>Machine Name</th>
            <th style={{ color: "#034694" }}>Status</th>
            {/* <th>Machine Name</th> */}
            {/* <th>Actions</th> */}
          </tr>
        </thead>
        <tbody>
          {machines.map((machine) => (
            <tr key={machine.machine_id}>
              <td>{machine.machine_id}</td>
              <td>{machine.machine_name_type}</td>
              <td>{machine.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    
  </div>
  );
};

export default CncMachineform;
