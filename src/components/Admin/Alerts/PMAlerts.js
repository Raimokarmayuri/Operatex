import React, { useEffect, useState } from "react";
import { Container } from "react-bootstrap";
import axios from "axios";
import { BsPencil } from "react-icons/bs";
import API_BASE_URL from "../../config";
// const API_BASE_URL = "http://192.168.29.244:5003";


const MaintenanceAlert = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    status: "",
  });

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/maintenance/frequency/daily`);
      setAlerts(response.data);
    } catch (error) {
      console.error("Error fetching PM alerts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleEditClick = (alert) => {
    setFormData({
      status: alert.status || "",
    });
    setEditId(alert.id);
    setShowModal(true);
  };

  const handleUpdateStatus = async () => {
    try {
      await axios.put(`${API_BASE_URL}/api/maintenance/${editId}`, {
        status: formData.status,
      });
      setShowModal(false);
      fetchAlerts();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  return (
    <Container fluid style={{ marginTop: "3rem" }}>
      <div className="d-flex justify-content-center align-items-center flex-wrap gap-2 mt-2 mb-2 p-2 border rounded bg-light">
        <div className="fs-4 fw-bold" style={{ color: "#034694" }}>
          PM Alerts
        </div>
      </div>

      {loading ? (
        <p className="text-center">Loading PM alerts...</p>
      ) : alerts.length > 0 ? (
        <div className="table-responsive" style={{ maxHeight: "600px", overflowY: "auto" }}>
          <table className="table table-bordered table-hover mt-4" style={{ fontSize: "0.9rem", lineHeight: "1.2" }}>
            <thead className="table-light" style={{ position: "sticky", top: 1, zIndex: 1020 }}>
              <tr>
                <th style={{ color: "#034694" }}>#</th>
                <th style={{ color: "#034694" }}>Machine ID</th>
                <th style={{ color: "#034694" }}>MaintenanceType</th>
                <th style={{ color: "#034694" }}>frequency</th>
                <th style={{ color: "#034694" }}>Status</th>
                <th style={{ color: "#034694" }}>NextScheduleDate</th>
                {/* <th style={{ color: "#034694" }}>Defective</th>
                <th style={{ color: "#034694" }}>OEE</th> */}
                <th style={{ color: "#034694" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((alert, index) => (
                <tr key={alert.id}>
                  <td>{index + 1}</td>
                  <td>{alert.machine_id}</td>
                  <td>{alert.maintenance_type}</td>
                  <td>{alert.frequency}</td>
                  <td>{alert.status }</td>
                  <td>{alert.next_schedule_date}</td>
                  {/* <td>{alert.defectiveParts}</td> */}
                  {/* <td>{parseFloat(alert.OEE).toFixed(2)}</td> */}
                  <td>
                    <button className="btn btn-sm me-2" onClick={() => handleEditClick(alert)}>
                      <BsPencil className="me-1" style={{ color: "blue" }} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center">No PM alerts available.</p>
      )}

      {showModal && (
        <div className="modal show d-block mt-5" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Update Status</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <label htmlFor="status" className="form-label">Status</label>
                <select
                  id="status"
                  className="form-control"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="">Select Status</option>
                  <option value="pending">Pending</option>
                  <option value="complete">Complete</option>
                </select>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-primary" onClick={handleUpdateStatus}>Save</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
};

export default MaintenanceAlert;