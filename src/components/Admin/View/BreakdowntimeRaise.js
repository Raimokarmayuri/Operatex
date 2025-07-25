import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select"; // Importing react-select for searchable dropdown
import { BsPencil, BsTrash } from "react-icons/bs";
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../../config";

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
    breakdownReason: "",
    breakdownStartDateTime: new Date().toISOString().slice(0, 16),
    breakdownEndDateTime: "",
    assignedTechnician: "",
    breakdownType: "",
    shift:"",
    status: "open", // Default status
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
        .filter((breakdown) => breakdown.status.toLowerCase() === "pending"); // Filter only pending breakdowns

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
      const response = await axios.get(
        `${API_BASE_URL}/api/machines/ORG001`
      );
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
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const currentTimestamp = new Date().toISOString(); // Get current date-time in ISO format
      const payload = { 
        ...formData,
        status: "open",
        breakdownStartDateTime: currentTimestamp // Assign current timestamp
      };
  
      await axios.post(`${API_BASE_URL}/api/breakdowns`, payload);
      window.alert("Record created successfully!");
      fetchBreakdowns();
      resetForm();
      setShowForm(false);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
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

  const handleEditNavigate = (id) => {
    navigate(`/editBD/${id}`);
  };

  // const getLocalDateTime = () => {
  //   const now = new Date();
  //   now.setMinutes(now.getMinutes() - now.getTimezoneOffset()); // Adjust for timezone
  //   return now.toISOString().slice(0, 16); // Format to YYYY-MM-DDTHH:MM
  // };

  return (
    <div className="ms-3" style={{ marginTop: "5rem" }}>
      {/* Centered Heading */}
      {/* <h3 className="text-center mt-4">Breakdown</h3> */}
      {/* Filter Section - Hide when form is open */}
      {!showForm && (
        <div className="d-flex justify-content-start align-items-start mb-3 flex-wrap">
          <div
            className=" me-2 mb-1 fs-5"
            style={{ width: "350px", marginTop: "1.8rem" }}
          >
            <Select
              options={machineIds}
              value={selectedMachineId}
              onChange={(option) => setSelectedMachineId(option)}
              placeholder="Select Machine ID"
              isClearable
            />
          </div>
          <div className=" me-2 mb-1 fs-5">
            <label className="me-2" style={{ width: "250px" }}>
              Start Date:
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="form-control fs-5"
            />
          </div>
          <div className=" me-5 mb-1">
            <label className="me-2 fs-5" style={{ width: "250px" }}>
              End Date:
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="form-control fs-4"
            />
          </div>
          <h2 className=" me-2 mt-5 mb-1 text-end"> Raise Breakdown</h2>
          <div>
            <button className="btn btn-primary me-2 fs-3" onClick={applyFilters}>
              Apply Filter
            </button>
            <button className="btn btn-primary me-2" title="Reset Filter" onClick={resetFilters}>
          {/* Reset Filters */}
          <i className="fas fa-sync-alt"></i>
        </button>

            {/* Toggle Between Today's Breakdown and All Breakdown */}
            {!isTodayScheduleFilter ? (
              <button
                className="btn btn-primary me-2 fs-4"
                onClick={() => {
                  setIsTodayScheduleFilter(true);
                  filterTodaysSchedule();
                }}
              >
                Today's Breakdown
              </button>
            ) : (
              <button
                className="btn btn-primary me-2 fs-4"
                onClick={() => {
                  setIsTodayScheduleFilter(false);
                  setFilteredBreakdowns(breakdowns);
                }}
              >
                All Breakdown
              </button>
            )}
            <button
              className="btn btn-primary me-2 fs-4"
              onClick={() => setShowForm(true)}
            >
              Raise Breakdown
            </button>
            <button className="btn btn-primary"  title="Export to Excel" onClick={exportToExcel}>
          <i className="fas fa-file-excel "></i> 
        </button>
          </div>
        </div>
      )}

      {/* Add Breakdown Form */}
      {showForm && (
        <form className="m-4" onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-4">
              <div className="form-group mb-3">
                <label className="form-label">Machine ID</label>
                {loading ? (
                  <p>Loading machine IDs...</p>
                ) : error ? (
                  <p>{error}</p>
                ) : (
                  <Select
                    options={machineIds}
                    value={machineIds.find(
                      (m) => m.value === formData.machineId
                    )}
                    onChange={(option) =>
                      setFormData({ ...formData, machineId: option.value })
                    }
                    placeholder="Select Machine"
                  />
                )}
              </div>
            </div>
            <div className="col-md-4">
              <div className="form-group mb-3">
                <label className="form-label">Location</label>
                <input
                  required
                  type="text"
                  name="location"
                  className="form-control form-control-sm"
                  value={formData.location}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="col-md-4">
              <div className="form-group mb-3">
                <label className="form-label">Breakdown Type</label>
                <select
                  required
                  type="text"
                  name="breakdownType"
                  className="form-control form-control-sm"
                  value={formData.breakdownType}
                  onChange={handleChange}
                >
                 <option value="">Select an option</option>
                  <option value="Mechanical">Mechanical</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Electronic">Electronic</option>
                  <option value="Hydrolic">Hydrolic</option>
                  <option value="Neumatic">Neumatic</option>
                  <option value="Production Setting">Production Setting</option>
                  </select>
              </div>
            </div>
          </div>

          <div className="row">
           
            <div className="col-md-4">
              <div className="form-group mb-3">
                <label>Shift Number</label>
                <select
                  name="shift" // Add the name attribute to match formData key
                  className="form-control"
                  value={formData.shift} // Bind value to formData.shift
                  onChange={handleChange} // Use the handleInputChange function
                  required
                >
                  <option value="">Select Shift</option>
                  {shiftOptions.map((option) => (
                    <option key={option.shiftNumber} value={option.shiftNumber}>
                      {option.shiftNumber || `Shift ${option.shiftNumber}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="col-md-4">
              <div className="form-group mb-3">
                <label className="form-label">Assigned Technician</label>
                {loading ? (
                  <p>Loading...</p>
                ) : error ? (
                  <p>{error}</p>
                ) : (
                  <select
                    required
                    name="assignedTechnician"
                    className="form-control form-control-sm"
                    value={formData.assignedTechnician}
                    onChange={handleChange}
                  >
                    <option value="">Select a technician</option>
                    {techNames.map((name, index) => (
                      <option key={index} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </div>

          <div className="d-flex justify-content-start mb-5">
            <button type="submit"  title=" Add Breakdown Data" className="btn btn-primary btn-sm me-2">
            <i className="fas fa-file-medical"></i>  Add Breakdown
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
          style={{ maxHeight: "400px", overflowY: "auto" }}
        >
         <table
        className="table table-hover mt-4"
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
        ><tr>
               <th style={{ color: "#034694" }}>Machine ID</th>
                <th style={{ color: "#034694" }}>Technician</th>
                <th style={{ color: "#034694" }}>Breakdown Reason</th>
                <th style={{ color: "#034694" }}>Breakdown Duration</th>
                <th style={{ color: "#034694" }}>Start Date</th>
                <th style={{ color: "#034694" }}>End Date</th>
                <th style={{ color: "#034694" }}>Status</th>
                <th style={{ color: "#034694" }}>Actions</th>
              </tr>
            </thead>
            <tbody >
              {filteredBreakdowns.length > 0 ? (
                filteredBreakdowns.map((breakdown) => (
                  <tr key={breakdown._id}>
                     <td >{new Date(breakdown.date).toLocaleDateString()}</td>
                    <td >{breakdown.machineId}</td>
                    <td >
                      {breakdown.assignedTechnician}
                    </td>
                    <td >
                      {breakdown.breakdownReason}
                    </td>
                    <td> {breakdown.duration}</td>
                    <td >
                      {new Date(
                        breakdown.breakdownStartDateTime
                      ).toLocaleString()}
                    </td>
                    <td >
                      {new Date(
                        breakdown.breakdownEndDateTime
                      ).toLocaleString()}
                    </td>
                   
                   
                    <td >{breakdown.status}</td>
                    <td>
                      <button
                        className="btn border-0 bg-transparent text-dark btn-sm me-2 fs-2"
                        onClick={() => handleEditNavigate(breakdown._id)}
                      >
                        <BsPencil className="me-1 fs-3" style={{ color: "blue" }} />
                      </button>
                      <button
                        className="btn border-0 bg-transparent text-danger btn-sm fs-3"
                        onClick={() => handleDelete(breakdown._id)}
                      >
                        <BsTrash className="me-1 fs-3" style={{ color: "red" }} />
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
