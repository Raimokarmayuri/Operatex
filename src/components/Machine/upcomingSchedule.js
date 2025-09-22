import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Table } from "react-bootstrap";
import axios from "axios";
import MaintenanceOverview from "./MaintenanceNavbar";
import Files from "./Files";
import { useNavigate } from "react-router-dom";

import { useLocation, useParams } from "react-router-dom";
import { BsPencil } from "react-icons/bs";
import API_BASE_URL from "../config";

const Schedules = () => {
  const { frequency } = useParams();
  const location = useLocation();
 const machine_id = localStorage.getItem("selectedmachine_id");
  const navigate = useNavigate();
const machine_name_type = localStorage.getItem("selectedMachineName");
  const searchParams = new URLSearchParams(location.search);
  const selectedDate = searchParams.get("date");

  const [groupedData, setGroupedData] = useState([]);
  const [formData, setFormData] = useState({
    maintenance_name: "",
    trigger_type: "",
    frequency: "",
    assigned_role: "",
    next_schedule_date: "",
    status: "",
  });

  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertType, setAlertType] = useState("");

  useEffect(() => {
    fetchScheduleData();
  }, [selectedDate]);

  const fetchScheduleData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/maintenance/machine/${machine_id}`);
      const data = response.data;

      if (selectedDate) {
        const formattedDate = new Date(selectedDate).toISOString().split("T")[0];
        const filtered = data.filter(
          (item) =>
            item.next_schedule_date &&
            new Date(item.next_schedule_date).toISOString().split("T")[0] === formattedDate
        );
        setGroupedData(filtered);
      } else {
        setGroupedData(data);
      }
    } catch (error) {
      console.error("Error fetching schedule data:", error);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "No Date";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleEditClick = (schedule) => {
    setFormData({
      maintenance_name: schedule.maintenance_name || "N/A",
      trigger_type: schedule.trigger_type || "N/A",
      frequency: schedule.frequency || "N/A",
      assigned_role: schedule.assigned_role || "N/A",
      next_schedule_date: schedule.next_schedule_date || "",
      status: schedule.status || "pending",
    });
    setEditId(schedule.id); // Use actual primary key field
    setShowModal(true);
  };

  const handleStatusChange = (e) => {
    setFormData({ ...formData, status: e.target.value });
  };

  const handleUpdateStatus = async () => {
    try {
      await axios.put(`${API_BASE_URL}/api/maintenance/${editId}`, {
        status: formData.status,
      });
      setAlertMessage("Status updated successfully!");
      setAlertType("success");
      setShowModal(false);
      fetchScheduleData();
    } catch (error) {
      console.error(error);
      setAlertMessage("Error updating status.");
      setAlertType("danger");
    }
  };

  return (
    <div className="bg-white" style={{ marginTop: "3.7rem" }}>
      <Files />
      <MaintenanceOverview />
      <Row className="mt-4 mb-2">
        <Col>
          <h5 className="text-center" style={{ color: "red", fontWeight: "bold", fontSize: "26px" }}>
            {selectedDate
              ? `Maintenance Schedules for ${selectedDate}`
              : "Maintenance Schedules"}
          </h5>
        </Col>
      </Row>

      <Row>
        <Col>
          <div className="p-1">
            <Card.Body>
              {groupedData.length > 0 ? (
                <Table striped bordered hover responsive style={{ fontSize: "0.9rem", lineHeight: "1.2" }}>
                  <thead className="table-light" style={{ position: "sticky", top: 1, zIndex: 1020 }}>
                    <tr>
                      <th>#</th>
                      <th>Maintenance Name</th>
                      <th>Frequency</th>
                      <th>Assigned Role</th>
                      <th>Trigger Type</th>
                      <th>Next Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupedData.map((item, index) => (
                      <tr key={item.id}>
                        <td>{index + 1}</td>
                        <td>{item.maintenance_name}</td>
                        <td>{item.frequency}</td>
                        <td>{item.assigned_role}</td>
                        <td>{item.trigger_type}</td>
                        <td>{formatDate(item.next_schedule_date)}</td>
                        <td>{item.status}</td>
                        <td>
                          <button
                            className="btn btn-sm border-0 bg-transparent"
                            onClick={() => handleEditClick(item)}
                          >
                            <BsPencil style={{ color: "blue" }} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <p className="text-center">No schedules available for this date.</p>
              )}
            </Card.Body>
          </div>
        </Col>
      </Row>

      {showModal && (
        <div className="modal show d-block mt-5" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Schedule Status</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <p><strong>Meintenance Name:</strong> {formData.maintenance_name}</p>
                <p><strong>Frequency:</strong> {formData.frequency}</p>
                <p><strong>Trigger Type:</strong> {formData.trigger_type}</p>
                <p><strong>Next Schedule:</strong> {formatDate(formData.next_schedule_date)}</p>

                <label htmlFor="status" className="form-label">Update Status</label>
                <select
                  id="status"
                  className="form-control"
                  value={formData.status}
                  onChange={handleStatusChange}
                >
                  <option value="pending">Pending</option>
                  <option value="complete">Complete</option>
                </select>
              </div>
              <div className="modal-footer">
                <button className="btn btn-primary" onClick={handleUpdateStatus}>Save</button>
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Schedules;
