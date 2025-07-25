import React, { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../config";

const PartEntryForm = () => {
  const [allParts, setAllParts] = useState([]);
  const [filteredParts, setFilteredParts] = useState([]);
  const [machines, setMachines] = useState([]);
  const [formData, setFormData] = useState({
    machineId: "",
    partName: "",
    cycleTime: "",
    programNo: "",
    loadUnLoad: "",
    status: "Running",
  });

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/part/getall`)
      .then(res => setAllParts(res.data))
      .catch(err => console.error("Failed to fetch parts", err));

    axios.get(`${API_BASE_URL}/api/machines/getallmachine`)
      .then(res => setMachines(res.data))
      .catch(err => console.error("Failed to fetch machines", err));
  }, []);

  const handleMachineChange = (e) => {
    const machineId = e.target.value;
    const filtered = allParts.filter(p => p.machineId === machineId);

    setFormData({
      machineId,
      partName: "",
      cycleTime: "",
      programNo: "",
      loadUnLoad: "",
      status: "Running",
    });
    setFilteredParts(filtered);
  };

  const handlePartChange = (e) => {
    const selectedPart = filteredParts.find(part => part.PartName === e.target.value);
    if (selectedPart) {
      setFormData(prev => ({
        ...prev,
        partName: selectedPart.PartName,
        cycleTime: selectedPart.CycleTime,
        programNo: selectedPart.ProgramNo,
        loadUnLoad: selectedPart.LoadUnLoad ?? selectedPart.LoadUnloadTime ?? "", // support for both field names
      }));
    }
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  const payload = {
    machineId: formData.machineId,
    PartName: formData.partName,
    CycleTime: formData.cycleTime,
    ProgramNo: formData.programNo,
    LoadUnLoad: formData.loadUnLoad,
    status: formData.status,
     date: new Date().toISOString().split("T")[0], // only date
  createdAt: new Date().toISOString()  
  };

  console.log("Submitting:", payload);

  try {
    await axios.post(`${API_BASE_URL}/api/part/create`, payload);
    alert("Part entry submitted successfully");
    setFormData({
      machineId: "",
      partName: "",
      cycleTime: "",
      programNo: "",
      loadUnLoad: "",
      status: "Running",
    });
    setFilteredParts([]);
  } catch (err) {
    if (err.response) {
      console.error("Server response:", err.response.data);
      alert("Server error: " + JSON.stringify(err.response.data));
    } else {
      console.error("Error:", err.message);
      alert("Submission failed: " + err.message);
    }
  }
};



  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 500, margin: "0 auto" }}>
      <h2>Part Entry Form</h2>

      <label>Machine</label>
      <select
        value={formData.machineId}
        onChange={handleMachineChange}
        required
      >
        <option value="">Select Machine</option>
        {machines.map((m) => (
          <option key={m._id} value={m.machineId}>{m.machineId}</option>
        ))}
      </select>

      <label>Part Name</label>
      <select
        value={formData.partName}
        onChange={handlePartChange}
        required
        disabled={!filteredParts.length}
      >
        <option value="">Select Part</option>
        {filteredParts.map((p) => (
          <option key={p._id} value={p.PartName}>{p.PartName}</option>
        ))}
      </select>

      <label>Cycle Time</label>
      <input type="text" value={formData.cycleTime} readOnly />

      <label>Program No</label>
      <input type="text" value={formData.programNo} readOnly />

      <label>Load / Unload Time</label>
      <input type="text" value={formData.loadUnLoad} readOnly />

      <label>Status</label>
      <select
        value={formData.status}
        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
        required
      >
        <option value="Running">Running</option>
        <option value="Completed">Completed</option>
        <option value="Stopped">Stopped</option>
      </select>

      <button type="submit" style={{ marginTop: 20 }}>Submit</button>
    </form>
  );
};

export default PartEntryForm;