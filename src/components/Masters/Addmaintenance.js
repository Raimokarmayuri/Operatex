// work
import React, { useState, useEffect } from "react";
import axios from "axios";
import { BsPencil, BsTrash } from "react-icons/bs";
import Select from "react-select";
import API_BASE_URL from "../config";
// const API_BASE_URL = "http://localhost:5003";

const MaintenanceScheduleForm = () => {
  // const machineId = localStorage.getItem("selectedMachineId");
  const [schedules, setSchedules] = useState([]);
  const [pmcOptions, setPmcOptions] = useState([]);
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0]; // Format as YYYY-MM-DD
  };
  const [formData, setFormData] = useState({
    machine_id: "",
    maintenance_type: "", // (JH, PM, TBM, CBM)
    maintenance_name: "",
    frequency: "",
    trigger_type: "", // "calendar" or "counter"
    last_calendar_date: "",
    // next_cycle: "",
    last_count: "",
    next_count: "",
    pmc_parameter_id: "",
    is_critical: false,
    estimated_duration_mins: "",
    // assigned_role: "",
    status: "",
    documentation: "",
    auto_alert_required: false,
    escalation_level: "",
    pm_schedule_date: getTodayDate(),
    next_schedule_date: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [machineIds, setMachineIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [alertMessage, setAlertMessage] = useState(null); // Alert message state
  const [alertType, setAlertType] = useState(""); // Success or danger alert
  const [selectedMachineId, setSelectedMachineId] = useState(""); // For dropdown filter
  const [showModal, setShowModal] = useState(false);

  const frequencyOptions = [
    "Daily",
    "Weekly",
    "Monthly",
    "Quarterly",
    "Half-Yearly",
    "Yearly",
    "500 Hours",
    "200 Cycles",
    "500 Cycles",
    "1000 Cycles",
  ];

  const fetchPMCParameters = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/pmc-parameters`); // 🔁 Replace with your actual endpoint
      const options = response.data.map((pmc) => ({
        value: pmc.pmc_parameter_id,
        label: pmc.parameter_name,
      }));
      setPmcOptions(options);
    } catch (error) {
      console.error("Error fetching PMC parameters", error);
    }
  };

  useEffect(() => {
    fetchShiftOptions();
    fetchMachineData();
    fetchSchedules();
    fetchPMCParameters(); // <-- new
  }, []);

  // Fetch machine data for dropdown
  const fetchMachineData = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/machines/getallmachine`
      );
      const machineOptions = response.data.map((machine) => ({
        value: machine.machine_id,
        label: machine.machine_name_type,
      }));
      setMachineIds(machineOptions);
    } catch (error) {
      // console.error("Error fetching machine data:", error);
    }
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

  const fetchSchedules = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/maintenance`);
      const sortedSchedules = response.data.sort((a, b) => {
        return new Date(b.pm_schedule_date) - new Date(a.pm_schedule_date);
      });
      setSchedules(sortedSchedules);
      setFilteredSchedules(sortedSchedules);
    } catch (error) {
      setAlertMessage("Error fetching maintenance schedules");
      setAlertType("danger");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prevData) => {
      const updatedData = {
        ...prevData,
        [name]: value,
        machineId: prevData.machine_id, // Ensure machineId is preserved
      };

      // Dynamically calculate next_schedule_date if frequency or pmScheduleDate changes
      if (name === "frequency" || name === "pm_schedule_date") {
        const { next_schedule_date } = calculatenext_schedule_date(
          updatedData.pm_schedule_date,
          updatedData.frequency
        );
        updatedData.next_schedule_date = next_schedule_date;
        // updatedData.next_cycle = next_cycle;
      }

      return updatedData;
    });
  };

  const sanitize = (value) => {
    if (value === "") return null;
    if (!isNaN(value) && value !== null) return Number(value);
    return value;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { next_schedule_date } = calculatenext_schedule_date(
      formData.pm_schedule_date,
      formData.frequency
    );

    const dataToSave = {
      ...formData,
      machine_id: Number(formData.machine_id), // ✅ restore and sanitize
      last_calendar_date: sanitize(formData.last_calendar_date),
      estimated_duration_mins: sanitize(formData.estimated_duration_mins),
      next_schedule_date,
      maintenance_type: formData.maintenance_type || "",
      maintenance_name: formData.maintenance_name || "",
      frequency: formData.frequency || "",
      trigger_type: formData.trigger_type || "",
      pmc_parameter_id: formData.pmc_parameter_id || null,
      is_critical: formData.is_critical || false,
      status: formData.status || "",
      documentation: formData.documentation || "",
      auto_alert_required: formData.auto_alert_required || false,
      escalation_level: formData.escalation_level || "",
      pm_schedule_date: formData.pm_schedule_date || "",
    };

    if (formData.maintenance_type === "CBM" && !formData.pmc_parameter_id) {
      setAlertMessage("PMC Parameter is required for CBM type.");
      setAlertType("danger");
      return;
    }
    console.log("Submitting dataToSave:", dataToSave);

    try {
      if (isEditing) {
        await axios.put(
          `${API_BASE_URL}/api/maintenance/${editId}`,
          dataToSave
        );
        setAlertMessage("Schedule updated successfully!");
        setAlertType("success");
      } else {
        await axios.post(`${API_BASE_URL}/api/maintenance`, dataToSave);
        setAlertMessage("Schedule added successfully!");
        setAlertType("success");
      }

      fetchSchedules();
      resetForm();
      setShowForm(false);
    } catch (error) {
      console.error("Submit Error:", error);
      setAlertMessage("An error occurred while saving the schedule.");
      setAlertType("danger");
    }
  };

  const resetForm = () => {
    setFormData({
      machine_id: "",
      maintenance_type: "", // (JH, PM, TBM, CBM)
      maintenance_name: "",
      frequency: "",
      trigger_type: "", // "calendar" or "counter"
      last_calendar_date: "",
      // next_cycle: "",
      // last_count: "",
      // next_count: "",
      pmc_parameter_id: "",
      // is_critical: false,
      estimated_duration_mins: "",
      // assigned_role: "",
      status: "",
      documentation: "",
      // auto_alert_required: false,
      escalation_level: "",
    });
  };

  const handleEdit = (schedule) => {
    setIsEditing(true);
    setEditId(schedule.id);
    setFormData(schedule);
    setShowForm(true);
  };

  const handleEditClick = (schedule) => {
    setFormData({
      machine_id: schedule.machine_id,
      maintenance_name: schedule.maintenance_name || "",
      maintenance_type: schedule.maintenance_type || "",
      frequency: schedule.frequency || "",
      trigger_type: schedule.trigger_type || "",
      pmc_parameter_id: schedule.pmc_parameter_id || "",
      next_schedule_date: schedule.next_schedule_date || "",
      status: schedule.status || "",
    });
    setEditId(schedule.maintenance_id);
    setShowModal(true);
  };

  const handleDelete = async (maintenance_id) => {
    if (window.confirm("Are you sure you want to delete this schedule?")) {
      try {
        await axios.delete(`${API_BASE_URL}/api/maintenance/${maintenance_id}`);
        setAlertMessage("Schedule deleted successfully!");
        setAlertType("success");
        fetchSchedules();
      } catch (error) {
        setAlertMessage("An error occurred while deleting the schedule.");
        setAlertType("danger");
      }
    }
  };

  const handleAddClick = () => {
    setShowForm(true);
    setIsEditing(false);
    resetForm();
  };

  const [filteredSchedule, setFilteredSchedules] = useState([]);
  const [activeFilter, setActiveFilter] = useState("");

  const handleFilter = (trigger_type) => {
    if (trigger_type === activeFilter) {
      setFilteredSchedules(schedules); // Reset to show all if clicked again
      setActiveFilter("");
    } else {
      const filtered = schedules.filter(
        (schedule) => schedule.trigger_type === trigger_type
      );
      setFilteredSchedules(filtered);
      setActiveFilter(trigger_type);
    }
  };

  const filterTodayData = () => {
    const today = new Date().toISOString()[0];
    const filtered = schedules.filter(
      (schedule) => schedule.next_schedule_date[0] === today
    );
    setFilteredSchedules(filtered);
    setActiveFilter("today");
  };

  const calculatenext_schedule_date = (pm_schedule_date, frequency) => {
    const date = new Date(pm_schedule_date);
    let next_schedule_date = null;

    // eslint-disable-next-line default-case
    switch (frequency) {
      case "Daily":
        date.setDate(date.getDate() + 1);
        next_schedule_date = 1;
        break;
      case "Weekly":
        date.setDate(date.getDate() + 7);
        next_schedule_date = 7;
        break;
      case "Monthly":
        date.setMonth(date.getMonth() + 1);
        next_schedule_date = 30;
        break;
      case "Quarterly":
        date.setMonth(date.getMonth() + 3);
        next_schedule_date = 90;
        break;
      case "Half-Yearly":
        date.setMonth(date.getMonth() + 6);
        next_schedule_date = 180;
        break;
      case "Yearly":
        date.setFullYear(date.getFullYear() + 1);
        next_schedule_date = 365;
        break;
      case "500 Cycles":
      case "1000 Cycles":
        next_schedule_date = parseInt(frequency.split(" ")[0]);
        break;
    }

    return {
      next_schedule_date: date.toISOString().split("T")[0],
      // next_cycle,
    };
  };

  const handleUpdateStatus = async () => {
    try {
      await axios.put(`${API_BASE_URL}/api/maintenance/${editId}`, {
        status: formData.status,
      });
      setAlertMessage("Status updated successfully!");
      setAlertType("success");
      setShowModal(false); // Hide the modal
      fetchSchedules(); // Refresh the schedule list
    } catch (error) {
      setAlertMessage("Error updating status.");
      setAlertType("danger");
    }
  };

  const handleStatusChange = (e) => {
    setFormData({ ...formData, status: e.target.value });
  };

  return (
    <div className="ms-3" style={{ marginTop: "3rem" }}>
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mt-2 mb-2 p-2 border rounded bg-light">
        {/* Left side: Title */}
        <div className="fs-4 fw-bold" style={{ color: "#034694" }}>
          Maintenance Schedule
        </div>
        {!showForm && (
          <div className="d-flex flex-wrap align-items-center justify-content-end gap-2">
            <button
              className="btn btn-primary me-3 "
              title="Add Schedule Data"
              onClick={handleAddClick}
            >
              <i className="fas fa-file-medical"></i>
            </button>
            <div className="d-flex flex-wrap">
              {["JH", "PM", "CBM", "TBM"].map((type) => (
                <button
                  key={type}
                  className={`btn me-2 shadow-sm px-4 py-2 rounded-pill ${
                    activeFilter === type
                      ? "btn-primary"
                      : "btn-outline-primary"
                  }`}
                  onClick={() => handleFilter(type)}
                >
                  {type}
                </button>
              ))}
              {/* <button
                className="btn btn-outline-primary me-2"
                onClick={() => filterTodayData()}
              >
                Today's Schedule
              </button> */}

              {/* Reset Filter Button */}
              <button
                className="btn btn-outline-secondary shadow-sm px-4 py-2 rounded-pill "
                onClick={() => {
                  setFilteredSchedules(schedules);
                  setActiveFilter("");
                }}
              >
                Reset
              </button>
            </div>
          </div>
        )}
      </div>
      {/* Alert Messages */}
      {alertMessage && (
        <div
          className={`alert alert-${alertType} alert-dismissible fade show`}
          role="alert"
        >
          {alertMessage}
          <button
            type="button"
            className="btn-close"
            onClick={() => setAlertMessage(null)}
          ></button>
        </div>
      )}

      {showForm && (
        // Updated MaintenanceScheduleForm - Only Form Part
        <form onSubmit={handleSubmit} className="m-3 mt-3 ">
          <div className="row">
            <div className="col-md-4 mb-3">
              <label className="form-label">Machine ID</label>
              <Select
                required
                options={machineIds}
                value={machineIds.find((m) => m.value === formData.machine_id)}
                onChange={(option) =>
                  setFormData({ ...formData, machine_id: option.value })
                }
              />
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label">Maintenance Name</label>
              <input
                type="text"
                name="maintenance_name"
                className="form-control"
                value={formData.maintenance_name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label">Maintenance Type</label>
              <select
                name="maintenance_type"
                className="form-control"
                value={formData.maintenance_type}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Type</option>
                <option value="JH">JH</option>
                <option value="PM">PM</option>
                <option value="CBM">CBM</option>
                <option value="TBM">TBM</option>
              </select>
            </div>
          </div>
          <div className="row">
            <div className="col-md-4 mb-3">
              <label className="form-label">Trigger Type</label>
              <select
                name="trigger_type"
                className="form-control"
                value={formData.trigger_type}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Trigger Type</option>
                <option value="calendar">Calendar</option>
                <option value="counter">Counter</option>
              </select>
            </div>
            {formData.maintenance_type === "CBM" && (
              <div className="col-md-4 mb-3">
                <label className="form-label">PMC Parameter</label>
                <Select
                  options={pmcOptions}
                  value={pmcOptions.find(
                    (opt) => opt.value === formData.pmc_parameter_id
                  )}
                  onChange={(selected) =>
                    setFormData({
                      ...formData,
                      pmc_parameter_id: selected.value,
                    })
                  }
                  placeholder="Select PMC Parameter"
                />
              </div>
            )}
          </div>
          <div className="row">
            <div className="col-md-4 mb-3">
              <label className="form-label">Last Calendar Date</label>
              <input
                type="date"
                name="last_calendar_date"
                className="form-control"
                value={formData.last_calendar_date}
                onChange={handleInputChange}
              />
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label">Estimated Duration (mins)</label>
              <input
                type="number"
                name="estimated_duration_mins"
                className="form-control"
                value={formData.estimated_duration_mins}
                onChange={handleInputChange}
              />
            </div>
            {/* <div className="col-md-4 mb-3">
              <label className="form-label">Assigned Role</label>
              <input
                type="text"
                name="assigned_role"
                className="form-control"
                value={formData.assigned_role}
                onChange={handleInputChange}
              />
            </div> */}
          </div>
          <div className="row">
            {/* <div className="col-md-4 mb-3">
      <label className="form-label">Critical</label>
      <select
        name="is_critical"
        className="form-control"
        value={formData.is_critical}
        onChange={(e) =>
          setFormData({ ...formData, is_critical: e.target.value === "true" })
        }
      >
        <option value="false">No</option>
        <option value="true">Yes</option>
      </select>
    </div> */}
            <div className="col-md-4 mb-3">
              <label className="form-label">Status</label>
              <select
                name="status"
                className="form-control"
                value={formData.status}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Status</option>
                <option value="pending">Pending</option>
                <option value="complete">Complete</option>
              </select>
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label">PM Schedule Date</label>
              <input
                type="date"
                name="pm_schedule_date"
                className="form-control"
                value={formData.pm_schedule_date}
                onChange={handleInputChange}
                required
              />
            </div>
            {formData.maintenance_type !== "CBM" && (
              <div className="col-md-4 mb-3">
                <label className="form-label">Frequency</label>
                <select
                  name="frequency"
                  className="form-control"
                  value={formData.frequency}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Frequency</option>
                  {frequencyOptions.map((freq, index) => (
                    <option key={index} value={freq}>
                      {freq}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {formData.maintenance_type !== "CBM" && (
              <div className="col-md-4 mb-3">
                <label className="form-label">Next Schedule Date</label>
                <input
                  type="date"
                  name="next_schedule_date"
                  className="form-control"
                  value={formData.next_schedule_date}
                  onChange={handleInputChange}
                  required
                />
              </div>
            )}
          </div>
          <div className="d-flex justify-content-start">
            <button type="submit" className="btn btn-primary">
              {isEditing ? "Update Schedule" : "Save Schedule"}
            </button>
            <button
              type="button"
              className="btn btn-secondary ms-3 "
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {!showForm && (
        <div
          className="table-responsive "
          style={{ maxHeight: "550px", overflowY: "auto" }}
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
            >
              <tr style={{ lineHeight: "1.5rem" }}>
                {" "}
                {/* Reduce row height */}
                <th style={{ padding: "8px", color: "#034694" }}>MachineID</th>
                <th style={{ padding: "8px", color: "#034694" }}>
                  Maintenance Name
                </th>
                {/* <th style={{ padding: "8px" }}>Element Description</th> */}
                <th style={{ padding: "8px", color: "#034694" }}>Type</th>
                <th style={{ padding: "8px", color: "#034694" }}>Frequency</th>
                {/* <th style={{ padding: "8px" }}>Maintenance Parameter</th> */}
                {/* <th style={{ padding: "8px" }}>Date</th> */}
                <th style={{ padding: "8px", color: "#034694" }}>
                  Next Schedule Date
                </th>
                <th style={{ padding: "8px", color: "#034694" }}>Status</th>
                <th style={{ padding: "8px", color: "#034694" }}>Actions</th>
              </tr>
            </thead>
            <tbody className="">
              {filteredSchedule.map((schedule) => (
                <tr key={schedule.id} style={{ lineHeight: "1.2rem" }}>
                  {" "}
                  {/* Reduce row height */}
                  <td style={{ padding: "8px" }}>{schedule.machine_id}</td>
                  <td style={{ padding: "8px" }}>
                    {schedule.maintenance_name}
                  </td>
                  {/* <td style={{ padding: "8px" }}>{schedule.elementDescription}</td> */}
                  <td style={{ padding: "8px" }}>
                    {schedule.maintenance_type}
                  </td>
                  <td style={{ padding: "8px" }}>{schedule.frequency}</td>
                  {/* <td style={{ padding: "8px" }}>{schedule.conditionTag}</td> */}
                  {/* <td style={{ padding: "8px" }}>
                    {new Date(schedule.pmScheduleDate).toLocaleDateString()}
                  </td> */}
                  <td style={{ padding: "8px" }}>
                    {schedule.next_schedule_date
                      ? new Date(
                          schedule.next_schedule_date
                        ).toLocaleDateString()
                      : ""}
                  </td>
                  <td style={{ padding: "8px" }}>{schedule.status}</td>
                  <td style={{ padding: "8px" }}>
                    <button
                      className="btn btn-sm me-2 border-0 bg-transparent "
                      onClick={() => handleEditClick(schedule)}
                    >
                      <BsPencil className="me-1 " style={{ color: "blue" }} />
                    </button>
                    <button
                      className="btn btn-sm border-0 bg-transparent"
                      onClick={() => handleDelete(schedule.maintenance_id)}
                    >
                      <BsTrash className="text-danger " />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {showModal && (
        <div
          className="modal show d-block mt-5"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          tabIndex="-1"
          role="dialog"
        >
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  Edit Schedule Status for Machine {formData.machine_id}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-2">
                  <strong>Maintenance Name:</strong>{" "}
                  {formData.maintenance_name || "N/A"}
                </div>
                <div className="mb-2">
                  <strong>Type:</strong> {formData.maintenance_type || "N/A"}
                </div>
                <div className="mb-2">
                  <strong>Frequency:</strong> {formData.frequency || "N/A"}
                </div>
                <div className="mb-2">
                  <strong>Trigger Type:</strong>{" "}
                  {formData.trigger_type || "N/A"}
                </div>
                <div className="mb-2">
                  <strong>PMC Parameter:</strong>{" "}
                  {formData.pmc_parameter_id || "N/A"}
                </div>
                <div className="mb-2">
                  <strong>Next Schedule Date:</strong>{" "}
                  {formData.next_schedule_date
                    ? new Date(formData.next_schedule_date).toLocaleDateString()
                    : "N/A"}
                </div>
                <div className="mb-3">
                  <strong>Current Status:</strong> {formData.status || "N/A"}
                </div>

                {/* Status dropdown */}
                <label htmlFor="status" className="form-label">
                  Update Status
                </label>
                <select
                  id="status"
                  className="form-control"
                  value={formData.status}
                  onChange={handleStatusChange}
                >
                  <option value="">Select Status</option>
                  <option value="pending">Pending</option>
                  <option value="complete">Complete</option>
                </select>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleUpdateStatus}
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenanceScheduleForm;
