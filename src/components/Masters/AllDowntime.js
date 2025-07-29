 // Full DowntimeForm Component with plan_id and operator_id dropdowns
import React, { useState, useEffect } from "react";
import Select from "react-select";
import axios from "axios";
import API_BASE_URL from "../config";
import { BsPencil } from "react-icons/bs";
// const API_BASE_URL = "http://localhost:5003";

const DowntimeForm = () => {
  const [downtimes, setDowntimes] = useState([]);
  const [filteredDowntimes, setFilteredDowntimes] = useState([]);
  const [selectedMachine, setSelectedMachine] = useState("All");
  const [machines, setMachines] = useState([]);
  const [planIds, setPlanIds] = useState([]);
  const [operatorIds, setOperatorIds] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState({
    machine_id: localStorage.getItem("selectedMachineId"),
    shift_no: "",
    start_timestamp: "",
    end_timestamp: "",
    downtime_reason: "",
    duration: "",
    status: "",
    category: "",
    linked: false,
    remark: "",
    date: new Date().toISOString().split("T")[0],
    plan_id: null,
    operator_id: null,
  });

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

  useEffect(() => {
    fetchDowntimeData();
    axios.get(`${API_BASE_URL}/api/machines/getallmachine`).then((res) => {
      const formattedMachines = res.data.map((m) => ({
        label: `${m.machine_name_type} (${m.machine_id})`,
        value: m.machine_id,
      }));
      console.log("Formatted Machines:", formattedMachines);
      setMachines(formattedMachines);
    });

    // axios.get(`${API_BASE_URL}/api/planentry`).then((res) => {
    //   setPlanIds(
    //     res.data.map((p) => ({ label: `Plan ${p.plan_id}`, value: p.plan_id }))
    //   );
    // });
    // axios.get(`${API_BASE_URL}/api/users`).then((res) => {
    //   setOperatorIds(
    //     res.data.map((u) => ({ label: u.username, value: u.user_id }))
    //   );
    // });
  }, []);

  const fetchDowntimeData = () => {
    axios.get(`${API_BASE_URL}/api/downtimes`).then((res) => {
      const sorted = res.data.sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );
      setDowntimes(sorted);
      setFilteredDowntimes(sorted);
    });
  };

  const filterByMachine = (machine_id) => {
    setSelectedMachine(machine_id);
    setFilteredDowntimes(
      machine_id === "All"
        ? downtimes
        : downtimes.filter((d) => d.machine_id === machine_id)
    );
  };

  const filterToday = () => {
    const today = new Date().toISOString().split("T")[0];
    setFilteredDowntimes(
      downtimes.filter((d) => d.start_timestamp?.split("T")[0] === today)
    );
  };

const handleEdit = (downtime) => {
  const formatDateTimeLocal = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  setFormData({
    ...downtime,
    start_timestamp: formatDateTimeLocal(downtime.start_timestamp),
    end_timestamp: formatDateTimeLocal(downtime.end_timestamp),
    date: formatDate(downtime.date),
  });

  setEditId(downtime.id);
  setIsEditMode(true);
  setShowForm(true);
};


  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      shift_no: parseInt(formData.shift_no),
      duration: parseInt(formData.duration, 10),
    };

    try {
      if (isEditMode) {
        await axios.put(`${API_BASE_URL}/api/downtimes/${editId}`, payload);
      } else {
        await axios.post(`${API_BASE_URL}/api/downtimes`, payload);
      }
      fetchDowntimeData();
      setShowForm(false);
      setIsEditMode(false);
    } catch (err) {
      alert("Error saving downtime entry");
    }
  };

  return (
    <div className="" style={{ marginTop: "3rem" }}>
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mt-2 mb-2 p-2 border rounded bg-light">
        {/* Left side: Title */}
        <div className="fs-4 fw-bold" style={{ color: "#034694" }}>
          Downtime Management
        </div>
        <div className="d-flex gap-2">
          <Select
            options={[{ label: "All Machines", value: "All" }, ...machines]}
            value={
              machines.find((m) => m.value === selectedMachine) || {
                label: "All Machines",
                value: "All",
              }
            }
            onChange={(selected) => filterByMachine(selected.value)}
            className="mb-2"
            styles={{ container: (base) => ({ ...base, width: 200 }) }}
          />
          <button className="btn btn-info" onClick={filterToday}>
            Today's
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => setFilteredDowntimes(downtimes)}
          >
            All
          </button>
          <button className="btn btn-success" onClick={() => setShowForm(true)}>
            + Add
          </button>
        </div>
      </div>

      {!showForm && (
        <table className="table table-bordered">
          <thead className="table-light">
            <tr>
              <th style={{ color: "#034694" }}>Date</th>
              <th style={{ color: "#034694" }}>Machine</th>
              <th style={{ color: "#034694" }}>Shift</th>
              <th style={{ color: "#034694" }}>Reason</th>
              <th style={{ color: "#034694" }}>Duration</th>
              <th style={{ color: "#034694" }}>Category</th>
              <th style={{ color: "#034694" }}>Start</th>
              <th style={{ color: "#034694" }}>End</th>
              <th style={{ color: "#034694" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDowntimes.map((d) => (
              <tr key={d.id}>
                <td>{new Date(d.date).toLocaleDateString()}</td>
                <td>{d.machine_id}</td>
                <td>{d.shift_no}</td>
                <td>{d.downtime_reason}</td>
                <td>{d.duration}</td>
                <td>{d.category}</td>
                <td>{new Date(d.start_timestamp).toLocaleString()}</td>
                <td>{new Date(d.end_timestamp).toLocaleString()}</td>
                <td>
                  <button
                    className="btn btn-sm text-primary"
                    onClick={() => handleEdit(d)}
                  >
                    <BsPencil />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showForm && (
        <form onSubmit={handleFormSubmit} className="bg-light p-4 rounded mt-4">
          <div className="row g-3">
            <div className="col-md-3">
              <label>Machine</label>
              <Select
                options={machines}
                value={machines.find((m) => m.value === formData.machine_id)}
                onChange={(opt) =>
                  setFormData({ ...formData, machine_id: opt.value })
                }
              />
            </div>
            <div className="col-md-3">
              <label>Shift No</label>
              <input
                type="number"
                className="form-control"
                value={formData.shift_no}
                onChange={(e) =>
                  setFormData({ ...formData, shift_no: e.target.value })
                }
                required
              />
            </div>
            <div className="col-md-3">
              <label>Start Timestamp</label>
              <input
                type="datetime-local"
                className="form-control"
                value={formData.start_timestamp}
                onChange={(e) =>
                  setFormData({ ...formData, start_timestamp: e.target.value })
                }
                required
              />
            </div>
            <div className="col-md-3">
              <label>End Timestamp</label>
              <input
                type="datetime-local"
                className="form-control"
                value={formData.end_timestamp}
                onChange={(e) =>
                  setFormData({ ...formData, end_timestamp: e.target.value })
                }
                required
              />
            </div>
            <div className="col-md-3">
              <label>Date</label>
              <input
                type="date"
                className="form-control"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                required
              />
            </div>
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

            
            <div className="col-md-2">
              <label>Category</label>
              <input
                type="text"
                className="form-control"
                value={formData.category}
                readOnly
              />
            </div>
            <div className="col-md-2">
              <label>Status</label>
              <select
                className="form-select"
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value === "true",
                  })
                }
              >
                <option value="false">Inactive</option>
                <option value="true">Active</option>
              </select>
            </div>

            <div className="col-md-6">
              <label>Linked</label>
              <textarea
                className="form-control"
                value={formData.linked}
                readOnly
              />
            </div>
            <div className="col-md-6">
              <label>Remark</label>
              <textarea
                className="form-control"
                value={formData.remark}
                onChange={(e) =>
                  setFormData({ ...formData, remark: e.target.value })
                }
              ></textarea>
            </div>
            <div className="col-md-2">
              <label>Duration (min)</label>
              <input
                type="number"
                className="form-control"
                value={formData.duration}
                onChange={(e) =>
                  setFormData({ ...formData, duration: e.target.value })
                }
                required
              />
            </div>
            {/* <div className="col-md-3">
              <label>Plan ID</label>
              <Select options={planIds} value={planIds.find(p => p.value === formData.plan_id)} onChange={(opt) => setFormData({ ...formData, plan_id: opt.value })} />
            </div>
            <div className="col-md-3">
              <label>Operator</label>
              <Select options={operatorIds} value={operatorIds.find(o => o.value === formData.user_id)} onChange={(opt) => setFormData({ ...formData, user_id: opt.value })} />
            </div> */}
          </div>
          <div className="mt-3">
            <button type="submit" className="btn btn-primary me-2">
              {isEditMode ? "Update" : "Submit"}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default DowntimeForm;
