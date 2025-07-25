import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import API_BASE_URL from "../config";
// const API_BASE_URL = "http://localhost:5003";


const PartRejectionForm = () => {
  const machine_id = localStorage.getItem("selectedmachine_id");
  const plan_id = localStorage.getItem("part_id");
  const shift_no = localStorage.getItem("shift_no");
  const part_name = localStorage.getItem("part_name");
const [planId, setPlanId] = useState("");
const [shiftNo, setShiftNo] = useState("");
const [partName, setPartName] = useState("");
  const [partRejections, setPartRejections] = useState([]);
  const [formData, setFormData] = useState({
    quantity: "",
    rejectiontype: "",
    mainDefect: "",
    defect: "",
    rejectionDescription: "",
    rejectionReason: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");

  // Defect structure from your earlier code
  const rejectiontypes = {
    Rework: ["Surface Defects", "Dimensional Defects"],
    Rejected: ["Surface Defects", "Dimensional Defects"],
  };

  const mainDefectCategories = {
    "Surface Defects": ["Scratches", "Burn Marks"],
    "Dimensional Defects": ["Oversize", "Undersize"],
  };

  const defectDetails = {
    Scratches: {
      description: "Scratches on surface",
      reasons: ["Improper handling", "Loose clamping"],
    },
    "Burn Marks": {
      description: "Burn due to heat",
      reasons: ["Overheating", "Friction"],
    },
    Oversize: {
      description: "Part is larger than spec",
      reasons: ["Tool wear", "Improper setup"],
    },
    Undersize: {
      description: "Part is smaller than spec",
      reasons: ["Wrong tool", "High feed rate"],
    },
  };

 useEffect(() => {
  fetchRunningPlan();
  fetchPartRejections();
}, []);

const fetchRunningPlan = async () => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/planentries/running/${machine_id}`
    );
    const running = response.data?.[0];

    if (running) {
      setPlanId(running.plan_id);
      setShiftNo(running.shift_no);
      setPartName(running.part_name);
    }
  } catch (error) {
    console.error("Error fetching running plan:", error);
  }
};


  const fetchPartRejections = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/partrejections/bymachineid/${machine_id}`
      );
      setPartRejections(response.data);
      console.log("Fetched part rejections:", response.data);
    } catch (error) {
      console.error("Error fetching part rejections:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "rejectiontype") {
      setFormData({
        ...formData,
        [name]: value,
        mainDefect: "",
        defect: "",
        rejectionDescription: "",
        rejectionReason: "",
      });
    } else if (name === "mainDefect") {
      setFormData({
        ...formData,
        [name]: value,
        defect: "",
        rejectionDescription: "",
        rejectionReason: "",
      });
    } else if (name === "defect") {
      setFormData({
        ...formData,
        [name]: value,
        rejectionDescription: defectDetails[value]?.description || "",
        rejectionReason: "",
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      machine_id: parseInt(machine_id),
       plan_id: parseInt(planId),
  shift_no: parseInt(shiftNo),
  part_name: partName,
      quantity: parseInt(formData.quantity),
      rejectionreason: formData.rejectionReason,
      rejectiontype: formData.rejectiontype,
      date: new Date().toISOString(),
    };

    try {
      await axios.post(`${API_BASE_URL}/api/partrejections`, payload);
      alert("Rejection submitted successfully");
      setFormData({
        quantity: "",
        rejectiontype: "",
        mainDefect: "",
        defect: "",
        rejectionDescription: "",
        rejectionReason: "",
      });
      fetchPartRejections();
    } catch (err) {
      console.error("Submit error:", err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this?")) {
      try {
        await axios.delete(`${API_BASE_URL}/api/partrejections/${id}`);
        fetchPartRejections();
        setSuccessMessage("Deleted successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
      } catch (err) {
        console.error("Delete error:", err);
      }
    }
  };

  const handleEdit = (record) => {
    setEditingId(record.id);
    setFormData({
      quantity: record.quantity,
      rejectiontype: record.rejectiontype,
      rejectionReason: record.rejectionreason,
      mainDefect: "",
      defect: "",
      rejectionDescription: "",
    });
    setShowForm(true);
  };

  return (
    <div className="container mt-3">
      {successMessage && <div className="alert alert-success">{successMessage}</div>}

      {!showForm ? (
        <>
          <button className="btn btn-primary mb-3" onClick={() => setShowForm(true)}>
            Add Rejection
          </button>
          <div className="table-responsive">
            <table className="table table-bordered table-hover">
              <thead className="table-light">
                <tr>
                  <th>Machine ID</th>
                  <th>Shift No</th>
                  <th>Part Name</th>
                  <th>Quantity</th>
                  <th>Rejection Reason</th>
                  <th>Rejection Type</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {partRejections.map((item) => (
                  <tr key={item.id}>
                    <td>{item.machine_id}</td>
                    <td>{item.shift_no}</td>
                    <td>{item.part_name}</td>
                    <td>{item.quantity}</td>
                    <td>{item.rejectionreason}</td>
                    <td>{item.rejectiontype}</td>
                    <td>{new Date(item.date).toLocaleString()}</td>
                    <td>
                      <button className="btn btn-sm me-2" onClick={() => handleEdit(item)}>
                        ✏️
                      </button>
                      <button className="btn btn-sm" onClick={() => handleDelete(item.id)}>
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <form onSubmit={handleSubmit} className="border p-4 bg-light shadow rounded">
          <div className="row mb-3">
            <div className="col-md-4">
              <label>Machine ID</label>
              <input className="form-control" value={machine_id} disabled />
            </div>
            <div className="col-md-4">
              <label>Shift No</label>
              <input className="form-control" value={shiftNo} disabled />
            </div>
            <div className="col-md-4">
              <label>Part Name</label>
              <input className="form-control" value={partName} disabled />
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-md-4">
              <label>Quantity</label>
              <input
                type="number"
                className="form-control"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-4">
              <label>Rejection Type</label>
              <select
                className="form-select"
                name="rejectiontype"
                value={formData.rejectiontype}
                onChange={handleChange}
                required
              >
                <option value="">Select</option>
                {Object.keys(rejectiontypes).map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="col-md-4">
              <label>Main Defect</label>
              <select
                className="form-select"
                name="mainDefect"
                value={formData.mainDefect}
                onChange={handleChange}
              >
                <option value="">Select</option>
                {rejectiontypes[formData.rejectiontype]?.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </div>

            <div className="col-md-4">
              <label>Defect</label>
              <select
                className="form-select"
                name="defect"
                value={formData.defect}
                onChange={handleChange}
              >
                <option value="">Select</option>
                {mainDefectCategories[formData.mainDefect]?.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </div>

            <div className="col-md-4">
              <label>Rejection Description</label>
              <input className="form-control" value={formData.rejectionDescription} readOnly />
            </div>

            <div className="col-md-4">
              <label>Rejection Reason</label>
              <select
                className="form-select"
                name="rejectionReason"
                value={formData.rejectionReason}
                onChange={handleChange}
                required
              >
                <option value="">Select</option>
                {defectDetails[formData.defect]?.reasons?.map((r, i) => (
                  <option key={i}>{r}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="text-center">
            <button type="submit" className="btn btn-success px-5 me-2">Submit</button>
            <button type="button" className="btn btn-secondary px-5" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      )}
    </div>
  );
};

export default PartRejectionForm;
