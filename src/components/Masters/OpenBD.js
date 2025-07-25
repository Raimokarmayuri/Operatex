import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select"; // Importing react-select for searchable dropdown
import { BsPencil, BsTrash } from "react-icons/bs";
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../config";

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
    machineId: "",
    breakdownType: "",
    shift: "",
    breakdownReason: "",
    breakdownStartDateTime: "",
    // breakdownEndDateTime: "",
    breakdownEndDateTime: new Date().toISOString().slice(0, 16),
    rootCause: "",
    assignedTechnician: "",
    responsibility: "",
    actionTaken: "",
    status: "pending", // Default status
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
      const breakdownDate = new Date(b.breakdownStartDateTime);
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
      const response = await axios.get(`${API_BASE_URL}/api/breakdowns`);

      // Process data: Sort and calculate duration
      const processedBreakdowns = response.data
        .map((breakdown) => {
          const startTime = new Date(breakdown.breakdownStartDateTime);
          const endTime = new Date(breakdown.breakdownEndDateTime);

          const durationMs = endTime - startTime;
          const durationHours = Math.floor(durationMs / (1000 * 60 * 60)); // Get hours
          const durationMinutes = Math.floor(
            (durationMs % (1000 * 60 * 60)) / (1000 * 60)
          ); // Get remaining minutes
          const formattedDuration = `${durationHours}h ${durationMinutes}m`;

          return {
            ...breakdown,
            startTime: startTime.toLocaleString(), // Format date
            endTime: endTime.toLocaleString(),
            duration: formattedDuration, // Add formatted duration
          };
        })
        .filter((breakdown) => breakdown.status.toLowerCase() === "open"); // Filter only pending breakdowns

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
      const response = await axios.get(`${API_BASE_URL}/api/machines/ORG001`);
      const machineOptions = response.data.map((machine) => ({
        value: machine.machineId,
        label: machine.machineId,
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

  // Submit new breakdown
  //   const handleSubmit = async (e) => {
  //     e.preventDefault();
  //     try {
  //       await axios.post("${API_BASE_URL}/api/breakdowns", formData);
  //       window.alert("Record created successfully!");
  //       fetchBreakdowns();
  //       resetForm();
  //       setShowForm(false);
  //     } catch (error) {
  //       console.error("Error submitting form:", error);
  //     }
  //   };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const currentTimestamp = new Date().toISOString();
      const updatedFormData = {
        ...formData,
        status: "pending", // Ensure status is always "pending"
        breakdownEndDateTime: currentTimestamp,
      };

      if (isEditing) {
        await axios.put(
          `${API_BASE_URL}/api/breakdowns/${editId}`,
          updatedFormData
        );
        setIsEditing(false);
        setEditId(null);
        window.alert("Record updated successfully!");
      } else {
        await axios.post(`${API_BASE_URL}/api/breakdowns`, updatedFormData);
        window.alert("Record created successfully!");
      }

      fetchBreakdowns(); // Refresh breakdown list
      resetForm();
      setShowForm(false);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const handleEdit = (breakdown) => {
    setIsEditing(true);
    setEditId(breakdown._id);

    // Function to convert UTC date-time to local date-time
    const formatDateTime = (dateTime) => {
      const date = new Date(dateTime);
      const localDateTime = new Date(
        date.getTime() - date.getTimezoneOffset() * 60000
      );
      return localDateTime.toISOString().slice(0, 16);
    };

    // Convert local date to 'YYYY-MM-DD'
    const formatDate = (date) => {
      const d = new Date(date);
      return d.toISOString().slice(0, 10);
    };

    setFormData({
      ...breakdown,
      //   breakdownStartDateTime: breakdown.breakdownStartDateTime
      //     ? formatDateTime(breakdown.breakdownStartDateTime)
      //     : "",
      breakdownStartDateTime: formatDateTime(breakdown.breakdownStartDateTime),
      breakdownEndDateTime: breakdown.breakdownEndDateTime
        ? formatDateTime(breakdown.breakdownEndDateTime)
        : "",
      targetDate: breakdown.targetDate ? formatDate(breakdown.targetDate) : "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this breakdown?")) {
      try {
        await axios.delete(`${API_BASE_URL}/api/breakdowns/${id}`);
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
      //   breakdownStartDateTime: new Date().toISOString().slice(0, 16),

      breakdownEndDateTime: "",
      assignedTechnician: "",
      remark: "",
      // shift: "",
      lineName: "",
      operations: "",
      breakdownPhenomenons: "",
      // breakdownType: "",
      actionTaken: "",
      whyWhyAnalysis: "",
      rootCause: "",
      targetDate: "",
      responsibility: "",
      hd: "",
      status: "pending",
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
      const response = await axios.get(`${API_BASE_URL}/api/workforce`);
      setTechNames(response.data);
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

  const getLocalDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset()); // Adjust for timezone
    return now.toISOString().slice(0, 16); // Format to YYYY-MM-DDTHH:MM
  };

  return (
    <div className="" style={{ marginTop: "3rem" }}>
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2 p-2 border rounded bg-light">
        <div className="fs-4 fw-bold" style={{ color: "#034694" }}>
          Pending Breakdowns
        </div>
        {!showForm && (
          <div className="d-flex flex-wrap align-items-center justify-content-end gap-2">
           
              <Select
                className=" me-2 "
                options={machineIds}
                value={selectedMachineId}
                onChange={(option) => setSelectedMachineId(option)}
                placeholder="Select Machine ID"
                isClearable
              />
            
              
              <input
                type="text"
                className="form-control form-control-sm fs-6"
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
                className="form-control form-control-sm fs-6"
                name="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="EndDate dd-mm-yyyy"
                onFocus={(e) => (e.target.type = "date")}
                onBlur={(e) => (e.target.type = "text")}
                style={{ width: "160px" }}
              />
           

            {/* <div className="mt-3 me-5"> */}
              <button
                className="btn btn-outline-primary me-2"
                title="Apply Filter"
                onClick={applyFilters}
              >
                <i className="fas fa-filter"></i>
              </button>
              <button
                className="btn btn-outline-success me-2"
                title="Reset Filters"
                onClick={resetFilters}
              >
                <i className="fas fa-sync-alt"></i>
              </button>

              {/* Toggle Between Today's Breakdown and All Breakdown */}
              {!isTodayScheduleFilter ? (
                <button
                  className="btn btn-outline-danger me-2"
                  onClick={() => {
                    setIsTodayScheduleFilter(true);
                    filterTodaysSchedule();
                  }}
                  title="View Today's Data"
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
                <i className="fas fa-file-excel me-"></i>
              </button>
            </div>
          // </div>
        )}
      </div>

      {/* Add Breakdown Form */}
      {showForm && (
        <form className="mt-4" onSubmit={handleSubmit}>
          <div className="row">
            {/* Machine ID - Disabled */}
            <div className="col-md-4">
              <div className="form-group mb-3">
                <label className="form-label">Machine ID</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={formData.machineId}
                  //    disabled
                />
              </div>
            </div>

            {/* Breakdown Start Date - Disabled */}
            <div className="col-md-4">
              <div className="form-group mb-3">
                <label className="form-label">Breakdown Start Date</label>
                <input
                  type="datetime-local"
                  name="breakdownStartDateTime"
                  className="form-control form-control-sm"
                  value={formData.breakdownStartDateTime}
                  disabled
                />
              </div>
            </div>
            <div className="col-md-4">
              <div className="form-group mb-3">
                <label className="form-label">Breakdown Type</label>
                <input
                  type="text"
                  name="breakdownType"
                  className="form-control form-control-sm"
                  value={formData.breakdownType}
                  disabled
                />
              </div>
            </div>

            {/* Breakdown End Date - Disabled */}
            {/* <div className="col-md-4">
              <div className="form-group mb-3">
                <label className="form-label">Breakdown End Date</label>
                <input
                  type="datetime-local"
                  name="breakdownEndDateTime"
                  className="form-control form-control-sm"
                  // value={getLocalDateTime()}
                  onChange={handleChange}
                  //    value={formData.breakdownEndDateTime}
                  //    disabled
                />
              </div>
            </div> */}
          </div>

          <div className="row">
            <div className="col-md-4">
              <div className="form-group mb-3">
                <label className="form-label">Assigned Technician</label>
                <input
                  type="text"
                  name="assignedTechnician"
                  className="form-control form-control-sm"
                  value={formData.assignedTechnician}
                  disabled
                />
              </div>
            </div>
            {/* Breakdown Reason - Disabled */}

            {/* Location - Disabled */}
            <div className="col-md-4">
              <div className="form-group mb-3">
                <label className="form-label">Location</label>
                <input
                  type="text"
                  name="location"
                  className="form-control form-control-sm"
                  value={formData.location}
                  disabled
                />
              </div>
            </div>

            <div className="col-md-4">
              <div className="form-group mb-3">
                <label>Shift Number</label>
                <input
                  name="shift" // Add the name attribute to match formData key
                  className="form-control"
                  value={formData.shift} // Bind value to formData.shift
                  onChange={handleChange} // Use the handleInputChange function
                  disabled
                />
              </div>
            </div>
            {/* Action Taken - Disabled */}
          </div>

          <div className="row">
            {/* Root Cause - Disabled */}
            <div className="col-md-4">
              <div className="form-group mb-3">
                <label className="form-label">Root Cause</label>
                <input
                  type="text"
                  name="rootCause"
                  className="form-control form-control-sm"
                  value={formData.rootCause}
                  onChange={handleChange}
                  //    disabled
                />
              </div>
            </div>

            {/* Responsibility - Disabled */}
            <div className="col-md-4">
              <div className="form-group mb-3">
                <label className="form-label">Responsibility</label>
                <input
                  type="text"
                  name="responsibility"
                  className="form-control form-control-sm"
                  value={formData.responsibility}
                  onChange={handleChange}
                  //    disabled
                />
              </div>
            </div>

            {/* Assigned Technician - Disabled */}
            <div className="col-md-4">
              <div className="form-group mb-3">
                <label className="form-label">Breakdown Reason</label>
                <input
                  type="text"
                  name="breakdownReason"
                  className="form-control form-control-sm"
                  value={formData.breakdownReason}
                  onChange={handleChange}
                  //    disabled
                />
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-4">
              <div className="form-group mb-3">
                <label className="form-label">Action Taken</label>
                <input
                  type="text"
                  name="actionTaken"
                  className="form-control form-control-sm"
                  value={formData.actionTaken}
                  onChange={handleChange}
                  //    disabled
                />
              </div>
            </div>
            {/* Status - Editable */}
            {/* <div className="col-md-4">
              <div className="form-group mb-3">
                <label className="form-label">Status</label>
                <select
                  name="status"
                  className="form-control form-control-sm"
                  value={formData.status}
                  onChange={handleChange}
                  required
                >
                  <option value="Open">Open</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            </div> */}
          </div>

          {/* Save and Cancel Buttons */}
          <div className="d-flex justify-content-start mb-5">
            <button type="submit" className="btn btn-primary btn-sm me-2">
              {isEditing ? "Update Breakdown" : "Add Breakdown"}
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => {
                resetForm();
                setShowForm(false);
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Breakdown List */}
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
                // position: "sticky",
                top: 1,
                zIndex: 1020,
              }}
            >
              <tr>
                <th style={{ padding: "10px", color: "#034694" }}> Date</th>
                <th style={{ padding: "10px", color: "#034694" }}>
                  Machine ID
                </th>
                <th style={{ padding: "10px", color: "#034694" }}>
                  Technician
                </th>
                {/* <th style={{ padding: "10px" }}>Breakdown Reason</th> */}
                {/* <th style={{ padding: "10px" }}>Breakdown Duration</th> */}
                <th style={{ padding: "10px", color: "#034694" }}>
                  Start Date
                </th>
                {/* <th style={{ padding: "10px" }}>End Date</th> */}

                <th style={{ padding: "10px", color: "#034694" }}>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody className="text-center">
              {filteredBreakdowns.length > 0 ? (
                filteredBreakdowns.map((breakdown) => (
                  <tr key={breakdown._id}>
                    <td style={{ padding: "10px" }}>
                      {new Date(breakdown.date).toLocaleDateString()}
                    </td>
                    <td style={{ padding: "10px" }}>{breakdown.machineId}</td>
                    <td style={{ padding: "10px" }}>
                      {breakdown.assignedTechnician}
                    </td>
                    {/* <td style={{ padding: "10px" }}>
                      {breakdown.breakdownReason}
                    </td> */}
                    {/* <td style={{ padding: "8px" }}>{breakdown.duration}</td> */}
                    <td style={{ padding: "10px" }}>
                      {new Date(
                        breakdown.breakdownStartDateTime
                      ).toLocaleString()}
                    </td>
                    {/* <td style={{ padding: "10px" }}>
                      {new Date(
                        breakdown.breakdownEndDateTime
                      ).toLocaleString()}
                    </td> */}

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
                        onClick={() => handleDelete(breakdown._id)}
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
