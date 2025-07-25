import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select"; // Importing react-select for searchable dropdown
import { BsPencil, BsTrash } from "react-icons/bs";
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom";
// import API_BASE_URL from "../config";
const API_BASE_URL = "http://localhost:5003";

const BreakdownForm = () => {
  const navigate = useNavigate();

  const [breakdowns, setBreakdowns] = useState([]);
  const [filteredBreakdowns, setFilteredBreakdowns] = useState([]);
  const [machineIds, setMachineIds] = useState([]); // Machine IDs for dropdown
  const [selectedMachineId, setSelectedMachineId] = useState(null);
  const [isTodayFilter, setIsTodayFilter] = useState(false);
  const [startDate, setStartDate] = useState(""); // Start Date Filter
  const [endDate, setEndDate] = useState(""); // End Date Filter
  const [showForm, setShowForm] = useState(false); // Show/hide add breakdown form
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [techNames, setTechNames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null); // Track ID for editing
  const [formData, setFormData] = useState({
  machine_id: "",
  breakdown_reason: "",
  breakdown_start: new Date().toISOString().slice(0, 16),
  breakdown_end: "",
  assigned_technician: "",
  remark: "",
  shift_no: "",
  breakdown_type: "",
  action_taken: "",
  root_cause: "",
  responsibility: "",
  status: "open",
  location: "",
   user_id: "",
});

  // const [isTodayScheduleFilter, setIsTodayScheduleFilter] = useState(true); // Separate filter for today's schedule
  // const [isTodayFilter, setIsTodayFilter] = useState(false);
  const [isTodayScheduleFilter, setIsTodayScheduleFilter] = useState(false); // Track Today's Schedule filter
  const [isScheduleActive, setIsScheduleActive] = useState(false); // Store table flag

  // Function to export data to Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredBreakdowns);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Breakdown Data");

    // Trigger the download
    XLSX.writeFile(workbook, "Breakdown_Report.xlsx");
  };

  const filterTodaysSchedule = () => {
    let today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today
    let tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1); // Start of next day

    const filtered = breakdowns.filter((b) => {
      const breakdownDate = new Date(b.created_at);
      return breakdownDate >= today && breakdownDate < tomorrow;
    });

    // console.log("Today's Scheduled Breakdowns:", filtered);
    setFilteredBreakdowns(filtered);
    setIsScheduleActive(true); // Set flag to show "Today's Schedule: True"
  };

  useEffect(() => {
    fetchBreakdowns();
    fetchShiftOptions();
    fetchMachineData();
    fetchTechnicianNames();
  }, []);

const fetchBreakdowns = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/breakdown`);

    // Process data: Sort and calculate duration
    const processedBreakdowns = response.data
      // .filter((breakdown) => breakdown.status?.toLowerCase() === "closed") // ✅ Filter only closed breakdowns
      .map((breakdown) => {
        const startTime = new Date(breakdown.breakdown_start);
        const endTime = new Date(breakdown.breakdown_end);

        const durationMs = endTime - startTime;
        const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
        const durationMinutes = Math.floor(
          (durationMs % (1000 * 60 * 60)) / (1000 * 60)
        );
        const formattedDuration = `${durationHours}h ${durationMinutes}m`;

        return {
          ...breakdown,
          startTime: startTime.toLocaleString(),
          endTime: endTime.toLocaleString(),
          duration: formattedDuration,
        };
      });

    // Sort by breakdown start time (latest first)
    const sortedBreakdowns = processedBreakdowns.sort(
      (a, b) =>
        new Date(b.breakdownStartDateTime) -
        new Date(a.breakdownStartDateTime)
    );

    setBreakdowns(sortedBreakdowns);
    setFilteredBreakdowns(sortedBreakdowns);
  } catch (error) {
    console.error("Error fetching breakdown data:", error);
  }
};


  // Fetch machine data for dropdown
  const fetchMachineData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/machines/getallmachine`);
      const machineOptions = response.data.map((machine) => ({
        value: machine.machine_id,
        label: machine.machine_name_type,
      }));
      setMachineIds(machineOptions);
    } catch (error) {
      // console.error("Error fetching machine data:", error);
    }
  };

  // Apply Filters on Click
  const applyFilters = () => {
    let filtered = [...breakdowns];

    // Filter by Machine ID
    if (selectedMachineId) {
      filtered = filtered.filter(
        (b) => b.machineId === selectedMachineId.value
      );
    }

    // Filter by Date Range
    if (startDate) {
      filtered = filtered.filter(
        (b) => new Date(b.breakdownStartDateTime) >= new Date(startDate)
      );
    }
    if (endDate) {
      filtered = filtered.filter(
        (b) => new Date(b.breakdownEndDateTime) <= new Date(endDate)
      );
    }

    // **Filter for Today's Breakdown Records**
    if (isTodayFilter) {
      let today = new Date();
      today.setHours(0, 0, 0, 0); // Start of today
      let tomorrow = new Date();
      tomorrow.setDate(today.getDate() + 1); // Start of next day

      filtered = filtered.filter((b) => {
        const breakdownDate = new Date(b.breakdownStartDateTime);
        return breakdownDate >= today && breakdownDate < tomorrow;
      });

      // console.log("Filtered Today's Breakdowns:", filtered);
    }

    setFilteredBreakdowns(filtered);
    setIsScheduleActive(false); // Reset flag when other filters apply
  };

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const selectedUser = techNames.find((u) => u.user_id === formData.user_id);

  // Submit new breakdown
const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const payload = {
      ...formData,
      shift_no: parseInt(formData.shift_no),
      assigned_technician: selectedUser?.full_name || "",
      breakdown_start: new Date(formData.breakdown_start).toISOString(),
      breakdown_end: new Date(formData.breakdown_end).toISOString(),
    };

    if (isEditing && editingId) {
      await axios.put(`${API_BASE_URL}/api/breakdown/${editingId}`, payload);
      alert("Breakdown updated successfully!");
    } else {
      await axios.post(`${API_BASE_URL}/api/breakdown`, payload);
      alert("Breakdown added successfully!");
    }

    fetchBreakdowns();
    resetForm();
    setShowForm(false);
    setIsEditing(false);
    setEditingId(null);
  } catch (err) {
    console.error("Error submitting breakdown:", err);
    alert("Submission failed");
  }
};


  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this breakdown?")) {
      try {
        await axios.delete(`${API_BASE_URL}/api/breakdown/${id}`);
        fetchBreakdowns();
      } catch (error) {
        // console.error("Error deleting breakdown:", error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      machineName: "",
      machineId: "",
      breakdownReason: "",
      // breakdownStartDateTime: new Date().toISOString().slice(0, 16),

      breakdownEndDateTime: "",
      assignedTechnician: "",
      remark: "",
      shift: "",
      lineName: "",
      operations: "",
      breakdownPhenomenons: "",
      breakdownType: "",
      actionTaken: "",
      whyWhyAnalysis: "",
      rootCause: "",
      targetDate: "",
      responsibility: "",
      hd: "",
      status: "open",
      location: "",
    });
  };

  const [shiftOptions, setShiftOptions] = useState([]); // Dynamic shifts

  // Fetch shifts dynamically from API
  const fetchShiftOptions = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/shifts`);
      setShiftOptions(response.data); // Assuming API returns an array of shifts
    } catch (error) {
      // console.error("Error fetching shift options:", error);
    }
  };

 const fetchTechnicianNames = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/users`);
    setTechNames(response.data);  // This is an array of user objects
    setLoading(false);
  } catch (err) {
    setError("Error fetching technician names");
    setLoading(false);
  }
};


  // Reset Filters
  const resetFilters = () => {
    setSelectedMachineId(null);
    setStartDate("");
    setEndDate("");
    setIsTodayFilter(false);
    setIsTodayScheduleFilter(true);
    setFilteredBreakdowns(breakdowns);
  };

  // const handleEditNavigate = (id) => {
  //   navigate(`/editBD/${id}`);
  // };

  const handleEdit = (bd) => {
  setFormData({
    ...bd,
    breakdown_start: new Date(bd.breakdown_start).toISOString().slice(0, 16),
    breakdown_end: new Date(bd.breakdown_end).toISOString().slice(0, 16),
    user_id: techNames.find(t => t.full_name === bd.assigned_technician)?.user_id || "",
  });
  setShowForm(true);
  setIsEditing(true);
  setEditingId(bd.breakdown_id);
};


  const getLocalDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset()); // Adjust for timezone
    return now.toISOString().slice(0, 16); // Format to YYYY-MM-DDTHH:MM
  };

  return (
    <div className="" style={{ marginTop: "3rem" }}>
      {/* Centered Heading */}
      {/* <h3 className="text-center mt-4">Breakdown</h3> */}
      {/* Filter Section - Hide when form is open */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mt-2 mb-2 p-2 border rounded bg-light">
        {/* Left side: Title */}
        <div className="fs-4 fw-bold" style={{ color: "#034694" }}>
          Breakdowns
        </div>
         {!showForm && (
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            + Add Breakdown
          </button>
        )}
        {!showForm && (
          <div className="d-flex justify-content-start align-items-start mb-3 flex-wrap">
            <Select
              className=" me-2"
              options={machineIds}
              value={selectedMachineId}
              onChange={(option) => setSelectedMachineId(option)}
              placeholder="Select Machine ID"
              isClearable
            />

            <input
              type="text"
              className="form-control form-control-sm fs-6 me-2"
              name="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="StartDate dd-mm-yyyy"
              onFocus={(e) => (e.target.type = "date")}
              onBlur={(e) => (e.target.type = "text")}
              style={{ width: "160px" }}
            />

            <input
              type="text"
              className="form-control form-control-sm fs-6 me-2"
              name="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              placeholder="EndDate dd-mm-yyyy"
              onFocus={(e) => (e.target.type = "date")}
              onBlur={(e) => (e.target.type = "text")}
              style={{ width: "160px" }}
            />

            <button
              className="btn btn-outline-primary me-2"
              title="Apply Filter"
              onClick={applyFilters}
            >
              <i className="fas fa-filter"></i>
            </button>
            <button
              title="Reset Filters"
              className="btn btn-outline-success me-2"
              onClick={resetFilters}
            >
              <i className="fas fa-sync-alt"></i>
            </button>

            {/* Toggle Between Today's Breakdown and All Breakdown */}
            {!isTodayScheduleFilter ? (
              <button
                className="btn btn-outline-danger me-2"
                title="View Today's Data"
                onClick={() => {
                  setIsTodayScheduleFilter(true);
                  filterTodaysSchedule();
                }}
              >
                <i class="fas fa-eye"></i>
              </button>
            ) : (
              <button
                className="btn btn-outline-info me-2"
                onClick={() => {
                  setIsTodayScheduleFilter(false);
                  setFilteredBreakdowns(breakdowns);
                }}
              >
                All Breakdown
              </button>
            )}
            <button
              className="btn btn-outline-secondary"
              title="Export to Excel"
              onClick={exportToExcel}
            >
              <i className="fas fa-file-excel me-2"></i>
            </button>
          </div>
        )}
      </div>

      {/* Add Breakdown Form */}
      {showForm && (
        <form className="m-4" onSubmit={handleSubmit}>
  <div className="row">
    <div className="col-md-4">
      <label>Machine</label>
      <Select
        options={machineIds} // Ensure label = machine_name_type, value = machine_id
        value={machineIds.find(m => m.value === formData.machine_id)}
        onChange={(opt) => setFormData({ ...formData, machine_id: opt.value })}
        placeholder="Select Machine"
        required
      />
    </div>

    <div className="col-md-4">
      <label>Breakdown Start</label>
      <input
        type="datetime-local"
        className="form-control"
        value={formData.breakdown_start}
        onChange={(e) => setFormData({ ...formData, breakdown_start: e.target.value })}
        required
      />
    </div>

    <div className="col-md-4">
      <label>Breakdown End</label>
      <input
        type="datetime-local"
        className="form-control"
        value={formData.breakdown_end}
        onChange={(e) => setFormData({ ...formData, breakdown_end: e.target.value })}
        required
      />
    </div>

    <div className="col-md-4">
      <label>Reason</label>
      <input
        type="text"
        className="form-control"
        value={formData.breakdown_reason}
        onChange={(e) => setFormData({ ...formData, breakdown_reason: e.target.value })}
        required
      />
    </div>

  <div className="col-md-4">
  <label>Technician</label>
  <select
    className="form-control"
    value={formData.user_id}
    onChange={(e) => setFormData({ ...formData, user_id: parseInt(e.target.value) })}
    required
  >
    <option value="">Select Technician</option>
    {techNames.map((user) => (
      <option key={user.user_id} value={user.user_id}>
        {user.full_name} ({user.employee_code})
      </option>
    ))}
  </select>
</div>



    <div className="col-md-4">
      <label>Shift No</label>
      <select
        className="form-control"
        value={formData.shift_no}
        onChange={(e) => setFormData({ ...formData, shift_no: e.target.value })}
        required
      >
        <option value="">Select Shift</option>
        {shiftOptions.map((s) => (
          <option key={s.shift_no} value={s.shift_no}>{s.shift_no}</option>
        ))}
      </select>
    </div>

    <div className="col-md-4">
      <label>Breakdown Type</label>
      <select
        className="form-control"
        value={formData.breakdown_type}
        onChange={(e) => setFormData({ ...formData, breakdown_type: e.target.value })}
        required
      >
        <option value="">Select Type</option>
        <option value="Mechanical">Mechanical</option>
        <option value="Electrical">Electrical</option>
        <option value="Electronic">Electronic</option>
        <option value="Hydraulic">Hydraulic</option>
        <option value="Pneumatic">Pneumatic</option>
        <option value="Production Setting">Production Setting</option>
      </select>
    </div>

    <div className="col-md-4">
      <label>Action Taken</label>
      <input
        type="text"
        className="form-control"
        value={formData.action_taken}
        onChange={(e) => setFormData({ ...formData, action_taken: e.target.value })}
      />
    </div>

    <div className="col-md-4">
      <label>Root Cause</label>
      <input
        type="text"
        className="form-control"
        value={formData.root_cause}
        onChange={(e) => setFormData({ ...formData, root_cause: e.target.value })}
      />
    </div>

    <div className="col-md-4">
      <label>Responsibility</label>
      <input
        type="text"
        className="form-control"
        value={formData.responsibility}
        onChange={(e) => setFormData({ ...formData, responsibility: e.target.value })}
      />
    </div>

    <div className="col-md-4">
      <label>Status</label>
      <select
        className="form-control"
        value={formData.status}
        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
      >
        <option value="open">Open</option>
        <option value="closed">Closed</option>
      </select>
    </div>

    <div className="col-md-4">
      <label>Location</label>
      <input
        type="text"
        className="form-control"
        value={formData.location}
        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
      />
    </div>

    <div className="col-md-6">
      <label>Remark</label>
      <textarea
        className="form-control"
        rows={2}
        value={formData.remark}
        onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
      />
    </div>
  </div>

  <div className="mt-3">
    <button type="submit" className="btn btn-primary me-2">Submit</button>
    <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
  </div>
</form>

      )}

      {/* Breakdown List */}
      {!showForm && (
        <div
          className="table-responsive"
          style={{ maxHeight: "600px", overflowY: "auto" }}
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
                // position: "sticky",
                top: 1,
                zIndex: 1020,
              }}
            >
              {/* style={{ color: "#034694" }}  */}
              <tr>
                <th style={{ padding: "10px", color: "#034694" }}> Date</th>
                <th style={{ padding: "10px", color: "#034694" }}>
                  Machine ID
                </th>
                <th style={{ padding: "10px", color: "#034694" }}>
                  Technician
                </th>
                <th style={{ padding: "10px", color: "#034694" }}>
                  Breakdown Reason
                </th>
                <th style={{ padding: "10px", color: "#034694" }}>
                  Breakdown Duration
                </th>
                <th style={{ padding: "10px", color: "#034694" }}>
                  Start Date
                </th>
                <th style={{ padding: "10px", color: "#034694" }}>End Date</th>

                <th style={{ padding: "10px" }}>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody className="text-center">
              {filteredBreakdowns.length > 0 ? (
                filteredBreakdowns.map((breakdown) => (
                  <tr key={breakdown._id}>
                    <td style={{ padding: "10px" }}>
                      {new Date(breakdown.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: "10px" }}>{breakdown.machine_id}</td>
                    <td style={{ padding: "10px" }}>
                      {breakdown.assigned_technician}
                    </td>
                    <td style={{ padding: "10px" }}>
                      {breakdown.breakdown_reason}
                    </td>
                    <td style={{ padding: "8px" }}>{breakdown.duration}</td>
                    <td style={{ padding: "10px" }}>
                      {breakdown.breakdown_start}
                    </td>
                    <td style={{ padding: "10px" }}>
                      {breakdown.breakdown_end}
                    </td>

                    <td style={{ padding: "10px" }}>{breakdown.status}</td>
                    <td>
                      <button
    className="btn border-0 bg-transparent text-dark btn-sm me-2"
    onClick={() => handleEdit(breakdown)}
  >
    <BsPencil className="me-1" style={{ color: "blue" }} />
  </button>
                      <button
                        className="btn border-0 bg-transparent text-danger btn-sm"
                        onClick={() => handleDelete(breakdown.breakdown_id)}
                      >
                        <BsTrash className="me-1" style={{ color: "red" }} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center text-danger">
                    No breakdowns found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BreakdownForm;
