import { useState, useEffect } from "react";
import {  Row, Col, Form, InputGroup, Button } from "react-bootstrap";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend } from "chart.js";
import { FaCalendarDay, FaCalendarTimes, FaClock, FaFilter, } from "react-icons/fa"
import API_BASE_URL from '../../config'
// Register Chart.js components

ChartJS.register(BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);
// import API_BASE_URL from '../../config'


const AlertTable= () => {
  const [machineId, setMachineId] = useState(""); // Store selected machineId
  const [machines, setMachines] = useState([]); // Store machine list
  const [alerts, setAlerts] = useState([]);
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Fetch machine list
  const fetchMachines = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/machines/ORG001`);
      setMachines(response.data);
      if (response.data.length > 0) {
        setMachineId(response.data[0].machineId); // Set default machineId to the first machine in the list
      }
    } catch (err) {
      console.error("Error fetching machines:", err);
    }
  };

  // Fetch machine alerts
  const fetchAlertsData = async (id) => {
    if (!id) return;
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/alerts/machine/${id}`);
      const sortedAlerts = response.data.sort((a, b) => new Date(b.triggeredAt) - new Date(a.triggeredAt));
      setAlerts(sortedAlerts);
      setFilteredAlerts(sortedAlerts);
    } catch (err) {
      setError("Failed to fetch alerts data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMachines();
  }, []);

  useEffect(() => {
    if (machineId) {
      fetchAlertsData(machineId);
    }
  }, [machineId]);

  // Filtering functions
  const filterAlertsByShift = (shiftNumber) => {
    setFilteredAlerts(alerts.filter((alert) => alert.shiftNumber === shiftNumber));
  };

  const filterAlertsByToday = () => {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    setFilteredAlerts(alerts.filter((alert) => {
      const triggeredAt = new Date(alert.triggeredAt);
      return triggeredAt >= startOfDay && triggeredAt <= endOfDay;
    }));
  };

  const filterAlertsByYesterday = () => {
    const now = new Date();
    const yesterdayStart = new Date(now.setDate(now.getDate() - 1));
    yesterdayStart.setHours(0, 0, 0, 0);

    const yesterdayEnd = new Date(now.setDate(now.getDate()));
    yesterdayEnd.setHours(23, 59, 59, 999);

    setFilteredAlerts(alerts.filter((alert) => {
      const triggeredAt = new Date(alert.triggeredAt);
      return triggeredAt >= yesterdayStart && triggeredAt <= yesterdayEnd;
    }));
  };

  const filterAlertsByDateRange = () => {
    if (!fromDate || !toDate) {
      alert("Please select both From and To dates");
      return;
    }

    const startDate = new Date(fromDate);
    const endDate = new Date(toDate);
    endDate.setHours(23, 59, 59, 999);

    setFilteredAlerts(alerts.filter((alert) => {
      const triggeredAt = new Date(alert.triggeredAt);
      return triggeredAt >= startDate && triggeredAt <= endDate;
    }));
  };

  // // Prepare data for the chart
  // const chartData = {
  //   labels: filteredAlerts.map((alert) => new Date(alert.triggeredAt).toLocaleString()),
  //   datasets: [
  //     {
  //       label: "Alerts Triggered",
  //       data: filteredAlerts.map((_, index) => index + 1),
  //       backgroundColor: "rgba(54, 162, 235, 0.6)",
  //       borderColor: "rgba(54, 162, 235, 1)",
  //       borderWidth: 1,
  //     },
  //   ],
  // };

  return (
    <div
      style={{
        backgroundColor: "white",
        maxWidth: "100%",
        borderRadius: "8px",
        padding: "10px",
        marginTop: "3rem",
        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
      }}
    >
      {/* Title and Filter Bar */}
      <Row
        className="align-items-center mb-3"
        style={{
          backgroundColor: "#f8f9fa",
          borderRadius: "6px",
          padding: "10px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
        }}
      >
        {/* Left - Title */}
        <Col xs={12} md={3} className="mb-2 mb-md-0" style={{ color: "#034694" }}>
          <h5 className="mb-0 fw-bold">Alerts</h5>
        </Col>

        {/* Right - Filters */}
        <Col
          xs={12}
          md={9}
          className="d-flex justify-content-md-end flex-wrap align-items-center gap-2"
        >
          {/* Machine Select */}
          <Form.Select
            size="sm"
            value={machineId}
            onChange={(e) => setMachineId(e.target.value)}
            title="Select Machine"
            style={{ width: "160px" }}
          >
            <option value="">Select Machine</option>
            {machines.map((machine) => (
              <option key={machine.machineId} value={machine.machineId}>
                {machine.machineId}
              </option>
            ))}
          </Form.Select>

          {/* Shift Buttons */}
          <Button
            size="sm"
            variant="outline-primary"
            onClick={() => filterAlertsByShift(1)}
            title="1st Shift"
          >
            <FaClock className="me-1" />
            1st
          </Button>
          <Button
            size="sm"
            variant="outline-warning"
            onClick={() => filterAlertsByShift(2)}
            title="2nd Shift"
          >
            <FaClock className="me-1" />
            2nd
          </Button>
          <Button
            size="sm"
            variant="outline-success"
            onClick={filterAlertsByToday}
            title="Today"
          >
            <FaCalendarDay className="me-1" />
            Today
          </Button>
          <Button
            size="sm"
            variant="outline-danger"
            onClick={filterAlertsByYesterday}
            title="Yesterday"
          >
            <FaCalendarTimes className="me-1" />
            Last Day
          </Button>

          {/* Date Range Picker */}
          <InputGroup size="sm" style={{ width: "160px" }}>
            <InputGroup.Text>From</InputGroup.Text>
            <Form.Control
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </InputGroup>

          <InputGroup size="sm" style={{ width: "160px" }}>
            <InputGroup.Text>To</InputGroup.Text>
            <Form.Control
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </InputGroup>

          <Button
            size="sm"
            variant="dark"
            onClick={filterAlertsByDateRange}
            title="Filter by Date Range"
          >
            <FaFilter className="me-1" />
            Search
          </Button>
        </Col>
      </Row>

      {/* Alerts Table */}
      <div
        className="table-responsive"
        style={{ maxHeight: "72vh", overflowY: "auto" }}
      >
       <table
          className="table table-bordered table-hover mt-3"
          style={{
            fontSize: "0.9rem",
            lineHeight: "1.4",
          }}
        >
           <thead
            className="table-light"
            style={{
              position: "sticky",
              top: 0,
              zIndex: 1020,
              boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
            }}
          >
            <tr>
              <th style={{ color: "#034694" }}>SrNo</th>
              <th style={{ color: "#034694" }}>Machine ID</th>
              <th style={{ color: "#034694" }}>Description</th>
              <th style={{ color: "#034694" }}>Triggered At</th>
              <th style={{ color: "#034694" }}>Resolved At</th>
              <th style={{ color: "#034694" }}>Shift</th>
              <th style={{ color: "#034694" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="text-center py-3 text-muted">
                  Loading...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="7" className="text-center text-danger py-3">
                  No alerts found for this machine.
                </td>
              </tr>
            ) : filteredAlerts.length > 0 ? (
              filteredAlerts.map((alert, index) => (
                <tr key={alert._id}>
                  <td>{index + 1}</td>
                  <td>{alert.MachineId}</td>
                  <td>{alert.alertNumber}</td>
                  <td>{new Date(alert.triggeredAt).toLocaleString()}</td>
                  <td>
                    {alert.resolvedAt
                      ? new Date(alert.resolvedAt).toLocaleString()
                      : "Not Resolved"}
                  </td>
                  <td>{alert.shiftNumber}</td>
                  <td className={alert.resolvedAt ? "text-success" : "text-danger"}>
                    {alert.resolvedAt ? "Resolved" : "Active"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center text-muted py-3">
                  No alerts found for this machine.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AlertTable;