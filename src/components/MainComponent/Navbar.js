import React, { useState, useEffect, useRef } from "react";
import {
  Navbar,
  Container,
  Nav,
  Row,
  Col,
  Modal,
  Button,
  Card,
  Toast,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify"; // Add toast for popups
import logo2 from "../Admin/Images/Theta.png";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import API_BASE_URL from "../config";
// const API_BASE_URL = "http://localhost:5003";

const NavigationBar = ({ collapsed, toggleSidebar }) => {
  const navigate = useNavigate(); // Initialize useNavigate hook
  const [isMobileView, setIsMobileView] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [toolAlerts, setToolAlerts] = useState([]);
  const [showToolAlertBox, setShowToolAlertBox] = useState(false);

  const [machines, setMachines] = useState([]);
  const organizationId = "ORG001";
  const [alertMachines, setAlertMachines] = useState([]);

  const [halfYearlySchedules, setHalfYearlySchedules] = useState([]);
  const [showHalfYearlyAlert, setShowHalfYearlyAlert] = useState(false);

  const ALERT_INTERVAL = 1 * 60 * 1000; // 5 minutes (in milliseconds)

  // ✅ Fetch All Alerts Every 5 Minutes
  useEffect(() => {
    const fetchAllAlerts = async () => {
      // console.log(`Fetching all alerts at: ${new Date().toLocaleTimeString()}`);

      await fetchToolAlerts();
      await fetchPmcAlerts();
      await fetchUpcomingSchedules();
    };

    fetchAllAlerts(); // Call immediately on mount
    const interval = setInterval(fetchAllAlerts, ALERT_INTERVAL);

    return () => {
      // console.log("Clearing alert interval");
      clearInterval(interval);
    };
  }, []);

  const fetchToolAlerts = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/tools`);
      const tools = response.data;

      // ✅ Group by toolNumber
      const latestToolsMap = {};
      tools.forEach((tool) => {
        const key = tool.toolNumber;
        if (
          !latestToolsMap[key] ||
          new Date(tool.toolChangeDate) >
            new Date(latestToolsMap[key].toolChangeDate)
        ) {
          latestToolsMap[key] = tool;
        }
      });

      const latestTools = Object.values(latestToolsMap);

      // ✅ Log tool life comparison
      latestTools.forEach((tool) => {
        const actual = Number(tool.actualLife);
        const set = Number(tool.setLife);
        const ratio = ((actual / set) * 100).toFixed(2);
        // console.log(`Tool ${tool.toolNumber}: ${ratio}% used`);
      });

      // ✅ Filter by 90% threshold
      const filteredToolAlerts = latestTools
        .filter((tool) => Number(tool.actualLife) >= Number(tool.setLife) * 0.9)
        .map((tool) => ({
          alertType: "tool-life",
          alertName: `Tool ${tool.toolNumber} - ${tool.toolName} approaching set life`,
          machine_id: tool.machine_id,
          toolId: tool.toolId || tool._id,
          triggeredAt: new Date().toISOString(),
        }));

      setToolAlerts(filteredToolAlerts);

      filteredToolAlerts.forEach((alert) => {
        toast.warning(
          <div>
            <strong>{alert.alertName}</strong>
            <p>Machine ID: {alert.machine_id}</p>
            <button
              className="btn btn-sm btn-primary"
              onClick={() => handleViewToolDetails(alert.machine_id)}
            >
              View Details
            </button>
          </div>,
          {
            position: "top-right",
            autoClose: 5000,
            closeOnClick: false,
            pauseOnHover: true,
          }
        );
      });
    } catch (error) {
      console.error("Error fetching tool alerts:", error);
    }
  };

  const fetchAlerts = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/alerts`);
      const alertData = response.data;

      const today = new Date().toISOString().split("T")[0];
      const todaysAlerts = alertData.filter((alert) => {
        const alertDate = new Date(alert.createdAt).toISOString().split("T")[0];

        // Check if alert is for today and 'resolvedAt' is not set
        return (
          alertDate === today &&
          (!alert.resolvedAt || alert.resolvedAt === null)
        );
      });

      setAlerts(todaysAlerts);
    } catch (error) {
      console.error("Error fetching alerts:", error);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleCloseAlerts = () => setShowAlerts(false);
  const handleCloseToolAlertBox = () => setShowToolAlertBox(false);

  const handleViewToolDetails = (machine_id) => {
    if (!machine_id) {
      // console.error("Error: Machine ID is undefined");
      return;
    }

    localStorage.setItem("selectedmachine_id", machine_id); // Store machine ID
    navigate(`/machinedetails`); // Navigate without passing machine_id in the URL
  };

  const [pmcAlerts, setPmcAlerts] = useState([]); // PMC alerts state
  const [showPmcAlertBox, setShowPmcAlertBox] = useState(false);

  const POLLING_INTERVAL = 1 * 60 * 1000; // 5 minutes

  // ✅ Fetch PMC Alerts
  const fetchPmcAlerts = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/pmc-parameters`);
      const parameters = response.data;
      // console.log("pmc", parameters);
      // Filter for parameters where the alert condition is met
      const activeAlerts = parameters.filter((param) => {
        const ok = String(param.ok);
        const value = String(param.parameter_value);
        const address = String(param.register_address);
        // const description = String(param.parameterDescription);

        return (
          address.startsWith("K") &&
          ((ok === "0" && value === "1") || (ok === "1" && value === "0"))
        );
      });

      setPmcAlerts(activeAlerts);

      // Trigger toast notifications for each active alert
      activeAlerts.forEach((alert) => {
        toast.error(
          <div>
            <strong>PMC Alarm: {alert.parameter_address}</strong>
            <h6>Machine ID: {alert.machine_id}</h6>
            <h6>Description: {alert.register_address}</h6>
            <h6>BitPosition: {alert.bit_position}</h6>
          </div>,
          {
            position: "top-right",
            autoClose: 5000,
            closeOnClick: true,
            pauseOnHover: true,
          }
        );
      });
    } catch (error) {
      console.error("Error fetching PMC parameters:", error);
    }
  };

  // ✅ Show PMC Alerts in Toast
  useEffect(() => {
    if (showPmcAlertBox) {
      pmcAlerts.forEach((alert) => {
        toast.error(
          `PMC Alarm: ${alert.machine_id} - ${alert.register_address}`,
          {
            position: "top-right",
            autoClose: 5000,
            closeOnClick: true,
            pauseOnHover: true,
          }
        );
      });
    }
  }, [showPmcAlertBox]);

  // ✅ Poll PMC Alerts every 5 minutes
  // useEffect(() => {
  //   fetchPmcAlerts();
  //   const interval = setInterval(fetchPmcAlerts, POLLING_INTERVAL);
  //   return () => clearInterval(interval);
  // }, []);

  const handleClosePmcAlertBox = () => setShowPmcAlertBox(false);

  useEffect(() => {
    const updateView = () => setIsMobileView(window.innerWidth < 768);
    window.addEventListener("resize", updateView);
    updateView();
    return () => {
      window.removeEventListener("resize", updateView);
    };
  }, []);

  const POLLING_INTERVALs = 1 * 60 * 1000;
  const shownAlerts = useRef(new Set()); // Store shown alert IDs

  // Fetch Half-Yearly Maintenance Data
  const fetchUpcomingSchedules = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/maintenance/frequency/daily`
      );
      const schedules = response.data;
      if (schedules.length > 0) {
        // Get today's date
        const today = new Date();
        today.setHours(0, 0, 0, 0); // normalize today to midnight

        // Filter schedules where the next schedule date is within the next 3 days
        const upcomingSchedules = schedules.filter((schedule) => {
          const nextScheduleDate = new Date(schedule.next_schedule_date);
          nextScheduleDate.setHours(0, 0, 0, 0); // normalize next_schedule_date
          const differenceInDays =
            (nextScheduleDate - today) / (1000 * 60 * 60 * 24); // Convert difference to days
          return differenceInDays >= 0 && differenceInDays <= 1;
          // return differenceInDays === 0;  //for shows today data only
        });

        // Show toast alerts for upcoming schedules
        upcomingSchedules.forEach((schedule) => {
          // Only show alert if it hasn't been shown before
          if (!shownAlerts.current.has(schedule.maintenance_id)) {
            shownAlerts.current.add(schedule.maintenance_id); // Mark as shown

            toast.success(
              `Upcoming Maintenance Alert! Machine ID: ${schedule.machine_id}, Element: ${schedule.maintenance_name}, Frequency: ${schedule.frequency}, Next Schedule: ${schedule.nextScheduleDate}`,
              {
                position: "top-right",
                autoClose: 5000,
                closeOnClick: true,
                pauseOnHover: true,
              }
            );
          }
        });
      }
      // console.log('data',schedules)
    } catch (error) {
      console.error("Error fetching upcoming schedules:", error);
    }
  };

  useEffect(() => {
    const updateView = () => setIsMobileView(window.innerWidth < 768);
    window.addEventListener("resize", updateView);
    updateView();
    return () => {
      window.removeEventListener("resize", updateView);
    };
  }, []);

  const handleCloseHalfYearlyAlert = () => setShowHalfYearlyAlert(false);

  return (
    <>
      <Navbar
        expand="lg"
        className="shadow-sm position-fixed w-100"
        style={{
          fontFamily: "Montserrat, sans-serif",
          height: "50px",
          borderBottom: "4px solid #444",
          background:
            "linear-gradient(145deg, #101f33, #1c2e4a,rgb(24, 46, 83))",
          color: "white",
          zIndex: 1100,
          top: 0,
          left: 0,
          right: 0,
        }}
        // variant="dark" // Ensures inner text (brand, links) uses light theme
      >
        <Container fluid>
          <Row className="w-100 align-items-start justify-content-start">
            <Col className="d-flex align-items-start">
              <>
                <img
                  src={logo2}
                  alt="Profile"
                  className="me-0 p-0 m-0"
                  style={{
                    width: window.innerWidth < 768 ? "30px" : "60px",
                    height: window.innerWidth < 768 ? "30px" : "38px",
                  }}
                />
                {/* <h3
                    className="text-white mb-0 mt-1 ms-3"
                    style={{ fontFamily: "Montserrat, sans-serif" }}
                  >
                    OperateX
                  </h3> */}
                <Navbar.Brand
                  className=" ms-2"
                  style={{
                    fontFamily: "Montserrat, sans-serif",
                    color: "#dcdcdc",
                    fontWeight: "bold",
                    fontSize: window.innerWidth < 768 ? "1rem" : "1.4rem",
                    textShadow: "#00ff99",
                  }}
                >
                  OperateX
                </Navbar.Brand>
              </>
            </Col>
            <Col className="d-flex">
              <h3
                className="ms-2 mt-1 text-white"
                style={{ fontFamily: "Montserrat, sans-serif" }}
              >
                P10-H CNC Monitoring
              </h3>
            </Col>

            <Col xs={2} className="d-flex justify-content-end">
              <Nav>
                <Nav.Link
                  onClick={() => setShowAlerts(true)}
                  className="text-white"
                >
                  <i className="bi bi-bell-fill text-white"></i>
                  {!collapsed && <span className="text-white"></span>}
                </Nav.Link>
              </Nav>
            </Col>
          </Row>

          <ToastContainer
            position="top-right"
            autoClose={5000}
            closeOnClick
            // onClick={handleViewMaintenanceDetails}
            pauseOnHover
            draggable
          />
        </Container>
      </Navbar>

      {/* General Alerts Modal */}
      <Modal show={showAlerts} onHide={handleCloseAlerts} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Active Alerts</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {alerts.length > 0 ? (
            <Row>
              {alerts.map((alert, index) => (
                <Col md={6} key={index} className="mb-3">
                  <Card
                    className={`alert-card ${
                      alert.alertType === "critical"
                        ? "alert-critical"
                        : "alert-info"
                    }`}
                  >
                    <Card.Body>
                      <Card.Title className="d-flex align-items-center">
                        <i
                          className={`bi bi-exclamation-triangle-fill card-icon ${
                            alert.alertType === "critical"
                              ? "text-danger"
                              : "text-info"
                          }`}
                        ></i>
                        <span className="ms-2">
                          Machine ID: {alert.machine_id}
                        </span>
                      </Card.Title>
                      <Card.Text>
                        <strong>Alert Name:</strong> {alert.alertName} <br />
                        <strong>Triggered At:</strong>{" "}
                        {new Date(alert.triggeredAt).toLocaleString()} <br />
                      </Card.Text>
                    </Card.Body>
                    <div className="card-footer">
                      <strong>Shift:</strong> {alert.shiftNumber} <br />
                      <strong>Last Updated:</strong>{" "}
                      {new Date(alert.updatedAt).toLocaleString()}
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <p>No active alerts for today.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseAlerts}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default NavigationBar;
