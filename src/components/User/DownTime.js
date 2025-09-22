import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { BsPencil } from "react-icons/bs";
import API_BASE_URL from "../config";
// const API_BASE_URL = "http://192.168.29.244:5003";
import Select from "react-select";

const DowntimeForm = () => {
  const machine_id = localStorage.getItem("selectedmachine_id");
  const [downtimes, setDowntimes] = useState([]);
  
  const [formData, setFormData] = useState({
    machine_id: machine_id,
    shift_no: "",
    plan_id: "",
    downtime_reason: "",
    duration: "",
    category: "",
    linked: "",
    remark: "",
    start_timestamp: "",
    end_timestamp: "",
    date: "",
    status: true
  });
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);

    const downtimeReasons = [
    {
      id: 1,
      reason: "Equipment Failure (Breakdown)",
      category: "Availability",
      linked:
        "Maintenance (Corrective Maintenance) - Machine breakdown requiring unplanned maintenance.",
    },
    {
      id: 2,
      reason: "Setup & Adjustment Loss",
      category: "Availability",
      linked:
        "Process-Related - Time spent setting up machines and making adjustments for new production runs.",
    },
    {
      id: 3,
      reason: "Idling & Minor Stoppages (Small Stops)",
      category: "Availability",
      linked:
        "Physical Phenomenon (Sensors, Material Flow) - Short stops due to sensor issues, material jams, or minor operator actions.",
    },
    {
      id: 4,
      reason: "Start-Up Losses",
      category: "Availability",
      linked:
        "Maintenance (Preventive Maintenance) - Time lost when machines are warming up or after maintenance.",
    },
    {
      id: 5,
      reason: "Shutdown Losses",
      category: "Availability",
      linked:
        "Process-Related - Time lost when the machine is powered down due to non-production activities.",
    },
    {
      id: 6,
      reason: "Waiting for Parts or Material",
      category: "Availability",
      linked:
        "Supply Chain Issues - Lack of raw materials or parts, which causes machine downtime.",
    },
    {
      id: 7,
      reason: "Operator Inefficiency",
      category: "Availability",
      linked:
        "Human-Related - Time lost due to delays or inefficient operator actions after stoppages.",
    },
    {
      id: 8,
      reason: "Tool Changeover Time",
      category: "Availability",
      linked:
        "Maintenance (Tooling) - Time taken to change or replace tools due to wear or breakage.",
    },
    {
      id: 9,
      reason: "Speed Loss",
      category: "Performance",
      linked:
        "Physical Phenomenon (Machine Speed, Cycle Time) - The machine operates slower than its ideal cycle time.",
    },
    {
      id: 10,
      reason: "Reduced Yield",
      category: "Performance",
      linked:
        "Process-Related - Decreased output speed due to inefficiencies in the process.",
    },
    {
      id: 11,
      reason: "Operator's Manual Entries (Training and Mistakes)",
      category: "Performance",
      linked:
        "Human-Related (Training & Experience) - Losses due to mistakes or inexperience in operating the machine, slowing production.",
    },
    {
      id: 12,
      reason: "Tool Wear & Breakage",
      category: "Performance",
      linked:
        "Maintenance (Predictive Maintenance) - Loss of speed and performance due to worn or broken tools. Pre-warning notifications for tool change should be adjusted.",
    },
    {
      id: 13,
      reason: "Machine Cleaning & Maintenance Loss",
      category: "Performance",
      linked:
        "Maintenance (Scheduled Maintenance) - Regular cleaning or maintenance activities that reduce the operational speed of the machine.",
    },
    {
      id: 14,
      reason: "Defects and Rework Loss",
      category: "Quality",
      linked:
        "Physical Phenomenon (Tool Wear, Process Parameters) - Products that do not meet quality standards and need rework or scrapping.",
    },
    {
      id: 15,
      reason: "Process Defects",
      category: "Quality",
      linked:
        "Process-Related - Inconsistent process parameters or tool failure leading to defective parts.",
    },
    {
      id: 16,
      reason: "Tea Break ",
      category: "Breaktime",
      linked: "Tea Break",
    },
    {
      id: 16,
      reason: "Lunch Break",
      category: "Breaktime",
      linked: "Lunch Break",
    },
    {
      id: 17,
      reason: "Other",
      category: "Other",
      linked: "Other",
    },
  ];
  
  const fetchDowntimes = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/downtimes/bymachineid/${machine_id}`
      );
      setDowntimes(res.data);
    } catch (err) {
      console.error("Error fetching downtimes:", err);
    }
  };

  useEffect(() => {
    fetchDowntimes();
  }, [machine_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(`${API_BASE_URL}/api/downtimes/${editId}`, formData);
      }
      fetchDowntimes();
      setShowForm(false);
      setEditId(null);
    } catch (err) {
      console.error("Error submitting downtime:", err);
    }
  };
const handleEdit = (dt) => {
  const formatLocalDateTime = (dateStr) => {
    const date = new Date(dateStr);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
  };

  setFormData({
    machine_id: dt.machine_id,
    shift_no: dt.shift_no,
    plan_id: dt.plan_id,
    downtime_reason: dt.downtime_reason,
    duration: dt.duration,
    category: dt.category,
    linked: dt.linked,
    remark: dt.remark,
    start_timestamp: formatLocalDateTime(dt.start_timestamp),
    end_timestamp: formatLocalDateTime(dt.end_timestamp),
    date: new Date(dt.date).toISOString().split("T")[0], // Just the date in YYYY-MM-DD
    status: dt.status
  });
  setEditId(dt.id);
  setShowForm(true);
};


  return (
    <div className="mt-4">
      <h2 style={{ color: "#034694" }}>Downtime Records</h2>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="row">
            <div className="col-md-4 mb-3">
              <label>Machine ID</label>
              <input type="text" name="machine_id" className="form-control" value={formData.machine_id} readOnly />
            </div>
            <div className="col-md-4 mb-3">
              <label>Shift No</label>
              <input type="number" name="shift_no" className="form-control" value={formData.shift_no} onChange={handleChange} required />
            </div>
            <div className="col-md-4 mb-3">
              <label>Plan ID</label>
              <input type="number" name="plan_id" className="form-control" value={formData.plan_id} onChange={handleChange} required />
            </div>
            {/* <div className="col-md-4 mb-3">
              <label>Reason</label>
              <input type="text" name="downtime_reason" className="form-control" value={formData.downtime_reason} onChange={handleChange} required />
            </div> */}
             <div className="col-md-4">
                          <label>Downtime Reason</label>
                          <Select
                            options={downtimeReasons.map((d) => ({
                              label: d.reason,
                              value: d.reason,
                              category: d.category,
                              linked: d.linked,
                            }))}
                            value={
                              formData.downtime_reason
                                ? {
                                    label: formData.downtime_reason,
                                    value: formData.downtime_reason,
                                  }
                                : null
                            }
                            onChange={(selected) => {
                              setFormData({
                                ...formData,
                                downtime_reason: selected.value,
                                category: selected.category,
                                linked: selected.linked,
                              });
                            }}
                            required
                          />
                        </div>
            <div className="col-md-4 mb-3">
              <label>Category</label>
              <input type="text" name="category" className="form-control" value={formData.category} onChange={handleChange} required />
            </div>
            <div className="col-md-4 mb-3">
              <label>Linked</label>
              <input type="text" name="linked" className="form-control" value={formData.linked} onChange={handleChange} />
            </div>
            <div className="col-md-4 mb-3">
              <label>Remark</label>
              <input type="text" name="remark" className="form-control" value={formData.remark} onChange={handleChange} />
            </div>
            <div className="col-md-4 mb-3">
              <label>Duration (min)</label>
              <input type="number" name="duration" className="form-control" value={formData.duration} onChange={handleChange} required />
            </div>
            <div className="col-md-4 mb-3">
              <label>Start Timestamp</label>
              <input type="datetime-local" name="start_timestamp" className="form-control" value={formData.start_timestamp} onChange={handleChange} required />
            </div>
            <div className="col-md-4 mb-3">
              <label>End Timestamp</label>
              <input type="datetime-local" name="end_timestamp" className="form-control" value={formData.end_timestamp} onChange={handleChange} required />
            </div>
            <div className="col-md-4 mb-3">
              <label>Date</label>
              <input type="date" name="date" className="form-control" value={formData.date} onChange={handleChange} required />
            </div>
          </div>
          <button type="submit" className="btn btn-primary">
            {editId ? "Update" : "Submit"}
          </button>
          
        </form>
      )}
{!showForm ? (
      <div className="table-responsive">
        <table className="table table-bordered table-hover mt-3">
          <thead className="table-light">
            <tr>
              <th>Date</th>
              <th>Machine ID</th>
              <th>Shift No</th>
              <th>Downtime Reason</th>
              <th>Duration</th>
              <th>Category</th>
              <th>Linked</th>
              <th>Start</th>
              <th>End</th>
              <th>Remark</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {downtimes.length > 0 ? (
              downtimes.map((dt) => (
                <tr key={dt.id}>
                  <td>{new Date(dt.date).toLocaleDateString()}</td>
                  <td>{dt.machine_id}</td>
                  <td>{dt.shift_no}</td>
                  <td>{dt.downtime_reason}</td>
                  <td>{dt.duration} min</td>
                  <td>{dt.category}</td>
                  <td>{dt.linked}</td>
                  <td>{new Date(dt.start_timestamp).toLocaleString("en-GB", { hour12: false })}</td>
                  <td>{new Date(dt.end_timestamp).toLocaleString("en-GB", { hour12: false })}</td>
                  <td>{dt.remark}</td>
                  <td>
                    <button className="btn btn-sm btn-light" onClick={() => handleEdit(dt)}>
                      <BsPencil style={{ color: "blue" }} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="11" className="text-center text-danger">
                  No records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      ) : (
        <button className="btn btn-secondary mb-3" onClick={() => setShowForm(false)}>
          Cancel
        </button>
      )}
    </div>
  );
};

export default DowntimeForm;
