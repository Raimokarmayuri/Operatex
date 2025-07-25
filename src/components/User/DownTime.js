import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table, Button, Form } from "react-bootstrap";
import { useAuth } from "../../context/AuthContext";
import BackButton from "../BackButton";
import API_BASE_URL from "../config";

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

const DowntimeTable = () => {
  const [data, setData] = useState([]);
  const [allData, setAllData] = useState([]); // For storing all downtime data
  // const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});
  const [showAll, setShowAll] = useState(false); // Track whether to show all downtimes or current
  const [customReason, setCustomReason] = useState("");
  const [showForm, setShowForm] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editId, setEditId] = useState(null);
  const [machines, setMachines] = useState([]);


  const { user } = useAuth();
  const machineId = user?.machineId || "";

  useEffect(() => {
    if (showAll) {
      fetchAllDowntime(); // If we're showing all, fetch all data
    } else {
      fetchCurrentDowntime(); // If we're showing current downtime, fetch specific machine data
    }
  }, [machineId, showAll]); // Fetch based on machineId or showAll state

  // Fetch current downtime for the specific machine
  const fetchCurrentDowntime = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/downtime/runningplanid/${machineId}`
      );
      setData(response.data);
    } catch (error) {
      console.error("Error fetching current downtime data:", error);
    }
  };

  
  // Fetch all downtime data
  const fetchAllDowntime = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/downtime/machine/${machineId}`
      );
      setAllData(response.data);
      setData(response.data); // Update the table to show all downtime data
    } catch (error) {
      console.error("Error fetching all downtime data:", error);
    }
  };

  // Show current downtime (for the specific machine)
  const showCurrentDowntime = () => {
    setShowAll(false); // Switch back to current downtime view
  };

  // Show all downtime
  const showAllDowntime = () => {
    setShowAll(true); // Switch to showing all downtime
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "DownTimeReason") {
      const matchedReason = downtimeReasons.find((r) => r.reason === value);
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        category: matchedReason?.category || "",
        linked: matchedReason?.linked || "",
      }));

      // Reset customReason if not "Other"
      if (value !== "Other") {
        setCustomReason("");
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

   const [formData, setFormData] = useState({
      machineId: machineId,
      DownTimeReason: "",
      duration: "",
      category: "",
      status: "",
      linked: "",
      remark: "",
      shiftNumber: "",
      startTimestamp: "",
      endTimestamp: "",
      date: "",
    });

  const resetForm = () => {
  setFormData({
    machineId: user?.machineId || "",
    DownTimeReason: "",
    duration: "",
    category: "",
    linked: "",
    remark: "",
    shiftNumber: "",
    startTimestamp: "",
    endTimestamp: "",
    date: "",
  });
  setCustomReason("");
  setShowForm(false);
  setIsEditMode(false);
  setEditId(null);
};


 const handleSubmit = async (e) => {
     e.preventDefault();
 
     try {
       const requestData = {
         ...formData,
         DownTimeReason:
           formData.DownTimeReason === "Other"
             ? customReason
             : formData.DownTimeReason,
         status: false,
         startTimestamp: new Date(formData.startTimestamp).toISOString(),
         endTimestamp: new Date(formData.endTimestamp).toISOString(),
       };
 
       if (isEditMode && editId) {
         // Update existing downtime
         await axios.put(`${API_BASE_URL}/api/downtime/${editId}`, requestData);
       } else {
         // Add new downtime
         await axios.post(`${API_BASE_URL}/api/downtime`, requestData);
       }
 
       fetchAllDowntime(); // Refresh data
       resetForm(); // Reset the form
     } catch (error) {
       // console.error("Error saving downtime record:", error);
     }
   };

     const handleEdit = (downtime) => {
    setFormData({
      ...downtime,
      startTimestamp: new Date(
        new Date(downtime.startTimestamp).getTime() + 5.5 * 60 * 60 * 1000
      ) // Adding 5 hours 30 minutes
        .toISOString()
        .slice(0, 16),
      endTimestamp: new Date(
        new Date(downtime.endTimestamp).getTime() + 5.5 * 60 * 60 * 1000
      ) // Adding 5 hours 30 minutes
        .toISOString()
        .slice(0, 16),
      date: new Date(new Date(downtime.date).getTime() + 5.5 * 60 * 60 * 1000) // Adding 5 hours 30 minutes
        .toISOString()
        .split("T")[0],
    });

    setEditId(downtime._id); // Set the ID of the downtime being edited
    setIsEditMode(true); // Enable Edit Mode
    setShowForm(true); // Show the form
  };

  return (
    <>
      <BackButton />

      <div className=" mt-2 ms-3">
        {/* <h2>Downtime Records for Machine: {machineId}</h2> */}

        {/* Toggle button between current and all downtimes */}
        {!showAll && (
          <Button variant="primary" onClick={showAllDowntime} className="mb-3">
            Show All Downtimes
          </Button>
        )}
        {showAll && (
          <>
            <Button
              variant="secondary"
              onClick={showCurrentDowntime}
              className="mb-3"
            >
              Show Current Downtime
            </Button>
          </>
        )}

         {showForm && (
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-4 mb-3">
              <label>Machine ID</label>
  <input
    type="text"
    className="form-control"
    value={formData.machineId}
    readOnly
  />
            </div>
            <div className="col-md-4 mb-3">
              <label>Downtime Reason</label>
              <select
                name="DownTimeReason"
                className="form-control"
                value={formData.DownTimeReason}
                onChange={handleChange}
                required
              >
                <option value="">Select Reason</option>
                {[
                  ...downtimeReasons.map((reason) => reason.reason),
                  // Add the current value if it's not in predefined list
                  ...(formData.DownTimeReason &&
                  !downtimeReasons.some(
                    (r) => r.reason === formData.DownTimeReason
                  )
                    ? [formData.DownTimeReason]
                    : []),
                ].map((reasonOption, index) => (
                  <option key={index} value={reasonOption}>
                    {reasonOption}
                  </option>
                ))}
              </select>
            </div>

            {formData.DownTimeReason === "Other" && (
              <div className="col-md-4 mb-3">
                <label>Custom Reason</label>
                <input
                  type="text"
                  className="form-control"
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  required
                />
              </div>
            )}
            <div className="col-md-4 mb-3">
              <label>Category</label>
              <input
                type="text"
                name="category"
                className="form-control"
                value={formData.category}
                readOnly={isEditMode}
              />
            </div>
            <div className="col-md-4 mb-3">
              <label>Linked</label>
              <input
                type="text"
                name="linked"
                className="form-control"
                value={formData.linked}
                readOnly={isEditMode}
              />
            </div>
            <div className="col-md-4 mb-3">
              <label>Duration (minutes)</label>
              <input
                type="number"
                name="duration"
                className="form-control"
                value={formData.duration}
                onChange={handleChange}
                required
                readOnly={isEditMode}
              />
            </div>
            <div className="col-md-4 mb-3">
              <label>Shift Number</label>
              <input
                type="number"
                name="shiftNumber"
                className="form-control"
                value={formData.shiftNumber}
                onChange={handleChange}
                required
                readOnly={isEditMode}
              />
            </div>
            <div className="col-md-4 mb-3">
              <label>Remark</label>
              <input
                type="text"
                name="remark"
                className="form-control"
                value={formData.remark}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-4 mb-3">
              <label>Start Timestamp</label>
              <input
                type="datetime-local"
                name="startTimestamp"
                className="form-control"
                value={formData.startTimestamp}
                onChange={handleChange}
                required
                // readOnly={isEditMode}
              />
            </div>
            <div className="col-md-4 mb-3">
              <label>End Timestamp</label>
              <input
                type="datetime-local"
                name="endTimestamp"
                className="form-control"
                value={formData.endTimestamp}
                onChange={handleChange}
                required
                // readOnly={isEditMode}
              />
            </div>
            <div className="col-md-4 mb-3">
              <label>Date</label>
              <input
                type="date"
                name="date"
                className="form-control"
                value={formData.date}
                onChange={handleChange}
                required
                readOnly={isEditMode}
              />
            </div>
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!isEditMode && !formData.DownTimeReason}
          >
            {isEditMode ? "Update Downtime" : "Save Downtime"}
          </button>
          <button
            type="button"
            className="btn btn-secondary ms-2"
            onClick={resetForm}
          >
            Cancel
          </button>
        </form>
      )}

       {!showForm && (
        <div
          className="table-responsive"
          style={{ maxHeight: "500px", overflowY: "auto" }}
        >
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
                <th style={{ padding: "10px", color: "#034694" }}>MachineID</th>
                <th style={{ padding: "10px", color: "#034694" }}>
                  ShiftNumber
                </th>
                <th style={{ padding: "10px", color: "#034694" }}>
                  DownTimeReason
                </th>
                <th style={{ padding: "10px", color: "#034694" }}>Category</th>
                <th style={{ padding: "10px", color: "#034694" }}>
                  StartTimestamp
                </th>
                <th style={{ padding: "10px", color: "#034694" }}>
                  EndTimestamp
                </th>
                <th style={{ padding: "10px", color: "#034694" }}>
                  Duration(min)
                </th>
                {/* <th style={{ padding: "10px", color: "#034694" }}>Remark</th> */}
                <th style={{ padding: "10px", color: "#034694" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item._id}>
                  <td>{item.machineId}</td>
                  <td>{item.shiftNumber}</td>
                  <td style={{ padding: "10px" }}>{item.DownTimeReason}</td>
                  <td style={{ padding: "10px" }}>
                    {editId === item._id ? editData.category : item.category}
                  </td>
                  <td style={{ padding: "10px" }}>
                    {new Date(item.startTimestamp).toLocaleString()}
                  </td>
                  <td style={{ padding: "10px" }}>
                    {new Date(item.endTimestamp).toLocaleString()}
                  </td>
                  <td style={{ padding: "10px" }}>{item.duration}</td>
                  {/* <td style={{ padding: "10px" }}>{item.remark}</td> */}
                  <td style={{ padding: "10px" }}>
                    <Button variant="warning"  onClick={() => handleEdit(item)}>
                      Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
         )}
      </div>
    </>
  );
};

export default DowntimeTable;
