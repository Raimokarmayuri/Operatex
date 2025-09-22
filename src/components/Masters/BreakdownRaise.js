import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import { BsPencil, BsTrash } from "react-icons/bs";
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom";
import {
  FaFilter,
  FaSyncAlt,
  FaPlusCircle,
  FaFileExcel,
} from "react-icons/fa";
import API_BASE_URL from "../config";

const BreakdownForm = () => {
  const navigate = useNavigate();

  const [breakdowns, setBreakdowns] = useState([]);
  const [filteredBreakdowns, setFilteredBreakdowns] = useState([]);
  const [machineIds, setMachineIds] = useState([]);
  const [selectedMachineId, setSelectedMachineId] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [techNames, setTechNames] = useState([]);
  const [shiftOptions, setShiftOptions] = useState([]);
  const [formData, setFormData] = useState({
    machineId: "",
    breakdownReason: "",
    breakdownEndDateTime: "",
    assignedTechnician: "",
    breakdownType: "",
    shift: "",
    status: "open",
    location: "",
    remark: "",
  });

  useEffect(() => {
    fetchBreakdownData();
  }, []);

  const fetchBreakdownData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/breakdown`);
      const rawData = response.data;

      const processedBreakdowns = rawData.map((item) => {
        const start = new Date(item.breakdown_start);
        const end = new Date(item.breakdown_end);
        const durationMs = end - start;
        const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
        const durationMinutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
        return {
          ...item,
          startTime: start.toLocaleString(),
          endTime: end.toLocaleString(),
          duration: `${durationHours}h ${durationMinutes}m`,
        };
      });

      setBreakdowns(processedBreakdowns);
      setFilteredBreakdowns(processedBreakdowns);

      const uniqueMachineIds = [...new Set(rawData.map((d) => d.machine_id))];
      const machineOptions = uniqueMachineIds.map((id) => ({
        value: id,
        label: id.toString(),
      }));
      setMachineIds(machineOptions);

      const uniqueTechs = [...new Set(rawData.map((d) => d.assigned_technician).filter(Boolean))];
      setTechNames(uniqueTechs);

      const uniqueShifts = [...new Set(rawData.map((d) => d.shift_no))].map((s) => ({
        shiftNumber: s,
      }));
      setShiftOptions(uniqueShifts);
    } catch (error) {
      console.error("Error fetching breakdown data:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const currentTimestamp = new Date().toISOString();
      const payload = {
        ...formData,
        status: "open",
        breakdown_start: currentTimestamp,
      };
      await axios.post(`${API_BASE_URL}/api/breakdown`, payload);
      alert("Breakdown added!");
      fetchBreakdownData();
      resetForm();
      setShowForm(false);
    } catch (err) {
      console.error("Error adding breakdown:", err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure to delete this breakdown?")) {
      try {
        await axios.delete(`${API_BASE_URL}/api/breakdown/${id}`);
        fetchBreakdownData();
      } catch (err) {
        console.error("Delete failed", err);
      }
    }
  };

  const handleEditNavigate = (id) => {
    navigate(`/editBD/${id}`);
  };

  const resetForm = () => {
    setFormData({
      machineId: "",
      breakdownReason: "",
      breakdownEndDateTime: "",
      assignedTechnician: "",
      breakdownType: "",
      shift: "",
      status: "open",
      location: "",
      remark: "",
    });
  };

  const applyFilters = () => {
    let filtered = [...breakdowns];

    if (selectedMachineId) {
      filtered = filtered.filter((b) => b.machine_id === selectedMachineId.value);
    }
    if (startDate) {
      filtered = filtered.filter((b) => new Date(b.breakdown_start) >= new Date(startDate));
    }
    if (endDate) {
      filtered = filtered.filter((b) => new Date(b.breakdown_end) <= new Date(endDate));
    }

    setFilteredBreakdowns(filtered);
  };

  const resetFilters = () => {
    setSelectedMachineId(null);
    setStartDate("");
    setEndDate("");
    setFilteredBreakdowns(breakdowns);
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredBreakdowns);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Breakdown Data");
    XLSX.writeFile(workbook, "Breakdown_Report.xlsx");
  };

  return (
    <div className="container-fluid mt-5">
          {/* Heading + Filters + Buttons All In One Line */}
          <div
            className="d-flex justify-content-between align-items-center mb-3 p-2 border rounded bg-light"
            style={{ flexWrap: "nowrap", gap: "1rem" }}
          >
            <div className="fs-4 fw-bold mb-0" style={{ color: "#034694", whiteSpace: "nowrap" }}>
              Breakdown Table
            </div>
    
            <div className="d-flex align-items-center flex-wrap gap-2">
    
              <Select
                options={machineIds}
                value={selectedMachineId}
                onChange={(opt) => setSelectedMachineId(opt)}
                placeholder="Machine"
                isClearable
                styles={{
                  container: (base) => ({
                    ...base,
                    width: 180,
                    minWidth: 120,
                    flexShrink: 0,
                  }),
                  menu: (base) => ({ ...base, zIndex: 9999 }),
                }}
              />
    
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="form-control form-control-sm"
                style={{ width: 130 }}
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="form-control form-control-sm"
                style={{ width: 130 }}
              />
    
              <button className="btn btn-sm btn-outline-danger" onClick={resetFilters}>
                <FaSyncAlt className="me-1" />
                Reset
              </button>
              <button className="btn btn-sm btn-outline-dark" onClick={() => setShowForm(true)}>
                <FaPlusCircle className="me-1" />
                Add
              </button>
              <button className="btn btn-sm btn-outline-success" onClick={exportToExcel}>
                <FaFileExcel className="me-1" />
                Export
              </button>
            </div>
          </div>
    
          {showForm && (
            <form onSubmit={handleSubmit} className="mb-4 border p-3 rounded bg-light">
              <div className="row">
                <div className="col-md-4 mb-3">
                  <label>Machine</label>
                  <Select
                    options={machineIds}
                    value={machineIds.find((m) => m.value === formData.machineId)}
                    onChange={(opt) => setFormData({ ...formData, machineId: opt?.value || "" })}
                  />
                </div>
                <div className="col-md-4 mb-3">
                  <label>Location</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
                <div className="col-md-4 mb-3">
                  <label>Technician</label>
                  <select
                    className="form-control"
                    value={formData.assignedTechnician}
                    onChange={(e) => setFormData({ ...formData, assignedTechnician: e.target.value })}
                  >
                    <option value="">Select</option>
                    {techNames.map((name, i) => (
                      <option key={i} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
    
              <div className="row">
                <div className="col-md-4 mb-3">
                  <label>Shift</label>
                  <select
                    className="form-control"
                    value={formData.shift}
                    onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                  >
                    <option value="">Select</option>
                    {shiftOptions.map((s, i) => (
                      <option key={i} value={s.shiftNumber}>
                        {s.shiftNumber}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-4 mb-3">
                  <label>Breakdown Type</label>
                  <select
                    className="form-control"
                    value={formData.breakdownType}
                    onChange={(e) => setFormData({ ...formData, breakdownType: e.target.value })}
                  >
                    <option value="">Select</option>
                    <option value="Mechanical">Mechanical</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Hydraulic">Hydraulic</option>
                  </select>
                </div>
                <div className="col-md-4 mb-3">
                  <label>Remark</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.remark}
                    onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
                  />
                </div>
              </div>
    
              <button className="btn btn-success btn-sm me-2" type="submit">
                Save
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowForm(false)}>
                Cancel
              </button>
            </form>
          )}
    
          <div style={{ maxHeight: "65vh", overflowY: "auto" }}>
            <table
              className="table table-striped table-bordered table-hover text-center"
              style={{ fontSize: "0.9rem", lineHeight: "1.2", width: "100%" }}
            >
              <thead
                className="table-light"
                style={{ position: "sticky", top: 0, background: "#fff", zIndex: 1020 }}
              >
                <tr>
                  <th style={{ color: "#034694" }}>Sr No.</th>
                  <th style={{ color: "#034694" }}>Machine Name</th>
                  <th style={{ color: "#034694" }}>Technician</th>
                  <th style={{ color: "#034694" }}>Reason</th>
                  <th style={{ color: "#034694" }}>Duration</th>
                  <th style={{ color: "#034694" }}>Start</th>
                  <th style={{ color: "#034694" }}>End</th>
                  <th style={{ color: "#034694" }}>Status</th>
                  <th style={{ color: "#034694" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBreakdowns.length > 0 ? (
                  filteredBreakdowns.map((b, index) => (
                    <tr key={b.breakdown_id}>
                      <td>{index + 1}</td>
                      <td>{b.machine_name_type}</td>
                      <td>{b.assigned_technician}</td>
                      <td>{b.breakdown_reason}</td>
                      <td>{b.duration}</td>
                      <td>{b.startTime}</td>
                      <td>{b.endTime}</td>
                      <td
                        className={
                          b.status.toLowerCase() === "closed"
                            ? "text-success fw-bold"
                            : "text-danger fw-bold"
                        }
                      >
                        {b.status}
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-primary me-1"
                          onClick={() => handleEditNavigate(b.breakdown_id)}
                        >
                          <BsPencil />
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(b.breakdown_id)}
                        >
                          <BsTrash />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="text-danger text-center">
                      No breakdowns found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
  );
};

export default BreakdownForm;
