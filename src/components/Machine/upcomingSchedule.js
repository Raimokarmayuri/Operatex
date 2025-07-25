import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, Table } from "react-bootstrap";
import axios from "axios";
import MaintenanceOverview from "./MaintenanceNavbar";
import Files from "./Files";
import { useLocation, useParams } from "react-router-dom";
import { BsPencil, BsTrash } from "react-icons/bs";
import API_BASE_URL from "../config";

const Schedules = () => {
  const { frequency } = useParams(); // Get frequency from the URL params
  const location = useLocation(); // Get state passed from navigation
  const machineId = localStorage.getItem("selectedMachineId");
  const [groupedData, setGroupedData] = useState([]);
  const [filter, setFilter] = useState(frequency || "All"); // Set default filter to passed frequency or "All"
  const searchParams = new URLSearchParams(location.search);
  const selectedDate = searchParams.get("date"); // Get the clicked date
  // Fetch schedule data
  const fetchScheduleData = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/maintenance/machine/${machineId}`
      );
      const data = response.data;

      if (selectedDate) {
        // Convert selectedDate to YYYY-MM-DD format
        const formattedSelectedDate = new Date(selectedDate)
          .toISOString()
          .split("T")[0];

        // Filter data to only include the selected date's records
        const filteredData = data.filter(
          (item) =>
            item.nextScheduleDate &&
            new Date(item.nextScheduleDate).toISOString().split("T")[0] ===
              formattedSelectedDate
        );

        // console.log("Filtered Data:", filteredData); // Debugging
        setGroupedData(filteredData);
      } else {
        // Show all records if no specific date is selected
        setGroupedData(data);
      }
    } catch (error) {
      // console.error("Error fetching schedule data:", error.message);
    }
  };

  useEffect(() => {
    fetchScheduleData();
  }, [selectedDate]);

  const formatDate = (dateString) => {
    if (!dateString) return "No Date Available";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const [schedules, setSchedules] = useState([]);
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0]; // Format as YYYY-MM-DD
  };
  const [formData, setFormData] = useState({
    machineId: "",
    elementName: "",
    elementDescription: "",
    shiftNumber: "",
    type: "",
    frequency: "",
    conditionTag: "",
    remark: "",
    pmScheduleDate: getTodayDate(),
    nextScheduleDate: "",
    status: "",
    // nextScheduleDate: "",
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
    "Yearly",
    "500 Hours",
    "200 Cycles",
    "500 Cycles",
    "1000 Cycles",
  ];

  useEffect(() => {
    fetchShiftOptions();
    // fetchMachineData();
    fetchSchedules();
  }, []);

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
      const response = await axios.get(
        `${API_BASE_URL}/api/maintenance/machine/${machineId}`
      );
      const sortedSchedules = response.data.sort((a, b) => {
        return new Date(b.pmScheduleDate) - new Date(a.pmScheduleDate);
      });
      setSchedules(sortedSchedules);
      setFilteredSchedules(sortedSchedules);
    } catch (error) {
      setAlertMessage("Error fetching maintenance schedules");
      setAlertType("danger");
    }
  };

  useEffect(() => {
    handleSubmit();
  }, []);

  const handleSubmit = async (e) => {
    // e.preventDefault();

    try {
      // const nextScheduleDate = calculateNextScheduleDate(
      //   formData.pmScheduleDate,
      //   formData.frequency
      // );

      const dataToSave = { ...formData };

      // console.log("Submitting Data:", dataToSave); // Log the request payload

      if (isEditing) {
        await axios.put(
          `${API_BASE_URL}/api/maintenance/${editId}`,
          dataToSave
        );
        setAlertMessage("Schedule updated successfully!");
        setAlertType("success");
        fetchScheduleData();
      } else {
        await axios.post(`${API_BASE_URL}/api/maintenance`, dataToSave);
        setAlertMessage("Schedule added successfully!");
        setAlertType("success");
      }
      fetchScheduleData();
      resetForm();
      setShowForm(false);
    } catch (error) {
      // console.error("Error Submitting Data:", error.response?.data || error);
      setAlertMessage("An error occurred while saving the schedule.");
      setAlertType("danger");
    }
  };

  const resetForm = () => {
    setFormData({
      machineId: "",
      elementName: "",
      elementDescription: "",
      shiftNumber: "",
      type: "",
      frequency: "",
      conditionTag: "",
      remark: "",
      pmScheduleDate: "",
      nextScheduleDate: "",
      status: "",
    });
  };

  const handleEditClick = (schedule) => {
    setFormData({
      machineId: schedule.machineId || machineId, // Use machineId from schedule or fallback to localStorage
      elementName: schedule.elementName || "N/A",
      frequency: schedule.frequency || "N/A",
      conditionTag: schedule.conditionTag || "N/A",
      elementDescription: schedule.elementDescription || "N/A",
      nextScheduleDate: schedule.nextScheduleDate || "N/A",
      status: schedule.status || "N/A",
    });
    setEditId(schedule._id); // Save the ID of the schedule being edited
    setShowModal(true); // Show the modal
  };

  const [filteredSchedule, setFilteredSchedules] = useState([]);
  const [activeFilter, setActiveFilter] = useState("");

  const handleUpdateStatus = async () => {
    try {
      await axios.put(`${API_BASE_URL}/api/maintenance/${editId}`, {
        status: formData.status,
      });
      setAlertMessage("Status updated successfully!");
      setAlertType("success");
      setShowModal(false); // Hide the modal
      fetchScheduleData(); // Refresh the schedule list
    } catch (error) {
      setAlertMessage("Error updating status.");
      setAlertType("danger");
    }
  };

  const handleStatusChange = (e) => {
    setFormData({ ...formData, status: e.target.value });
  };

  return (
    <div
      style={{
        backgroundColor: "white",
        maxWidth: "100%",
        // borderRadius: "8px",
        padding: "0px",
        // boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
        marginTop: "3.7rem",
        fontFamily: "Montserrat, sans-serif",
      }}
    >
      <Files className="mt-4" />
      <MaintenanceOverview className="mt" />
      {/* <Container fluid className="my-2 me-0 p-1 mt-0"> */}
      {/* Page Header */}
      <Row className="mt-4 mb-2">
        <Col>
      
          <h5  className="text-center text-md-cemter"
              style={{ color: "red", fontWeight: "bold", fontSize: "26px", marginTop:"rem" }}
            >
            {selectedDate
              ? `Maintenance Schedules for ${selectedDate}`
              : "Maintenance Schedules"}
          </h5>
        </Col>
      </Row>
      {/* Display Today's Data in Table */}
      <Row>
        <Col>
          <div className=" p-1">
            <Card.Body>
              {groupedData.length > 0 ? (
                <Table
                  striped
                  bordered
                  hover
                  responsive
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
                      <th style={{ color: "#034694" }}>#</th>
                      <th style={{ color: "#034694" }}>Element Name</th>
                      <th style={{ color: "#034694" }}>Frequency</th>
                      <th style={{ color: "#034694" }}>Condition Tag</th>
                      <th style={{ color: "#034694" }}>Description</th>
                      <th style={{ color: "#034694" }}>Next Date</th>
                      <th style={{ color: "#034694" }}>Status</th>
                      <th style={{ color: "#034694" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupedData.map((item, index) => (
                      <tr key={item._id}>
                        <td>{index + 1}</td>
                        <td>{item.elementName || "Unknown"}</td>
                        <td>
                          {item.frequency
                            ? item.frequency.charAt(0).toUpperCase() +
                              item.frequency.slice(1)
                            : "Unknown"}
                        </td>
                        <td>{item.conditionTag || "No Condition Tag"}</td>
                        <td>{item.elementDescription || "No Description"}</td>
                        <td>{formatDate(item.nextScheduleDate)}</td>
                        <td>{item.status || "Unknown"}</td>
                        <td style={{ padding: "8px" }}>
                          <button
                            className="btn btn-sm me-2 border-0 bg-transparent"
                            onClick={() => handleEditClick(item)}
                          >
                             <BsPencil className="me-1" style={{ color: "blue" }} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <p className="text-center">No schedules available for today.</p>
              )}
            </Card.Body>
          </div>
        </Col>
      </Row>
      {/* </Container> */}
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
                  Edit Schedule Status for {formData.machineId || machineId}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                {/* Show schedule details */}
                <div className="mb-3">
                  <strong>Element Name:</strong>{" "}
                  {formData?.elementName || "N/A"}
                </div>
                <div className="mb-3">
                  <strong>Frequency:</strong> {formData.frequency || "N/A"}
                </div>
                <div className="mb-3">
                  <strong>Condition Tag:</strong>{" "}
                  {formData.conditionTag || "N/A"}
                </div>
                <div className="mb-3">
                  <strong>Description:</strong>{" "}
                  {formData.elementDescription || "N/A"}
                </div>
                <div className="mb-3">
                  <strong>Next Schedule Date:</strong>{" "}
                  {formData.nextScheduleDate
                    ? new Date(formData.nextScheduleDate).toLocaleDateString()
                    : "N/A"}
                </div>
                <div className="mb-3">
                  <strong>Status:</strong> {formData.status || "N/A"}
                </div>

                {/* Status update dropdown */}
                <label htmlFor="status" className="form-label">
                  Status
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

export default Schedules;
