import React, { useState, useEffect } from "react";
import { Row, Col, Table, Button, Form, InputGroup } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import Files from "../Machine/Files";
import API_BASE_URL from "../config";
// const API_BASE_URL = "http://localhost:5003";


const Alert = () => {
  const machineId = localStorage.getItem("selectedmachine_id");
  const [alerts, setAlerts] = useState([]);
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const fetchAlertsData = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/alerts/alertbymachineid/${machineId}`
      );
      const sorted = response.data.sort((a, b) =>
        new Date(b.triggered_at) - new Date(a.triggered_at)
      );
      setAlerts(sorted);
      setFilteredAlerts(sorted);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch alerts data");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlertsData();
    const interval = setInterval(fetchAlertsData, 60000);
    return () => clearInterval(interval);
  }, []);

  const filterAlertsByShift = (shift) => {
    setFilteredAlerts(alerts.filter((a) => a.shift_number === shift));
  };

  const filterAlertsByToday = () => {
    const today = new Date();
    const start = new Date(today.setHours(0, 0, 0, 0));
    const end = new Date(today.setHours(23, 59, 59, 999));
    setFilteredAlerts(
      alerts.filter((a) => {
        const t = new Date(a.triggered_at);
        return t >= start && t <= end;
      })
    );
  };

  const filterAlertsByYesterday = () => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(start.getDate() - 1);
    start.setHours(0, 0, 0, 0);
    const end = new Date(now);
    end.setDate(end.getDate() - 1);
    end.setHours(23, 59, 59, 999);

    setFilteredAlerts(
      alerts.filter((a) => {
        const t = new Date(a.triggered_at);
        return t >= start && t <= end;
      })
    );
  };

  const filterAlertsByDateRange = () => {
    if (!fromDate || !toDate) {
      alert("Please select both From and To dates");
      return;
    }
    const start = new Date(fromDate);
    const end = new Date(toDate);
    end.setHours(23, 59, 59, 999);
    setFilteredAlerts(
      alerts.filter((a) => {
        const t = new Date(a.triggered_at);
        return t >= start && t <= end;
      })
    );
  };

  return (
    <div
      className="bg-light"
      style={{
        maxWidth: "100%",
        borderRadius: "8px",
        padding: "0px",
        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
        marginTop: "60px",
        height: "auto",
      }}
    >
      <Files />

      {/* Top Filters */}
      <Row className="justify-content-end align-items-center py-2 px-3 shadow-sm bg-white mb-2">
        <Col xs="auto" className="d-flex justify-content-end flex-wrap gap-3">
          <Button variant="link" className="text-dark fw-bold" onClick={() => filterAlertsByShift(1)}>1st Shift</Button>
          <Button variant="link" className="text-dark fw-bold" onClick={() => filterAlertsByShift(2)}>2nd Shift</Button>
          <Button variant="link" className="text-dark fw-bold" onClick={filterAlertsByYesterday}>Last Day</Button>
          <Button variant="link" className="text-dark fw-bold" onClick={filterAlertsByToday}>Today</Button>
        </Col>
      </Row>

      {/* Date Range Filter */}
      <Row className="align-items-center py-2 px-3 shadow-sm">
        <Col xs={12} md={2}>
          <InputGroup>
            <InputGroup.Text>From:</InputGroup.Text>
            <Form.Control type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          </InputGroup>
        </Col>
        <Col xs={12} md={2}>
          <InputGroup>
            <InputGroup.Text>To:</InputGroup.Text>
            <Form.Control type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </InputGroup>
        </Col>
        <Col xs={12} md={2}>
          <Button variant="outline-danger" className="fw-bold w-100" onClick={filterAlertsByDateRange}>Search</Button>
        </Col>
      </Row>

      {/* Alerts Table */}
      <div className="table-responsive" style={{ maxHeight: "72vh", overflowY: "auto" }}>
        <Table bordered hover className="mt-3 ms-3" style={{ fontSize: "0.9rem", lineHeight: "1.4" }}>
          <thead className="table-light" style={{ position: "sticky", top: 0, zIndex: 1020 }}>
            <tr>
              <th style={{ color: "#034694" }}>Sr No</th>
              <th style={{ color: "#034694" }}>Machine ID</th>
              <th style={{ color: "#034694" }}>Alert Name</th>
              <th style={{ color: "#034694" }}>Alert No</th>
              <th style={{ color: "#034694" }}>Triggered At</th>
              <th style={{ color: "#034694" }}>Resolved At</th>
              <th style={{ color: "#034694" }}>Shift</th>
              <th style={{ color: "#034694" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="8" className="text-center py-3">Loading...</td></tr>
            ) : error ? (
              <tr><td colSpan="8" className="text-center text-danger py-3">{error}</td></tr>
            ) : filteredAlerts.length > 0 ? (
              filteredAlerts.map((alert, index) => (
                <tr key={alert.id}>
                  <td>{index + 1}</td>
                  <td>{alert.machine_id}</td>
                  <td>{alert.alert_name}</td>
                  <td>{alert.alert_number}</td>
                  <td>{new Date(alert.triggered_at).toLocaleString()}</td>
                  <td>{alert.resolved_at ? new Date(alert.resolved_at).toLocaleString() : "Not Resolved"}</td>
                  <td>{alert.shift_number}</td>
                  <td className={alert.resolved_at ? "text-success" : "text-danger"}>
                    {alert.resolved_at ? "Resolved" : "Active"}
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="8" className="text-center text-muted py-3">No alerts found.</td></tr>
            )}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default Alert;
