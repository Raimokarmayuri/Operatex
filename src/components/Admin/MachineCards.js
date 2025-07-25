

import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Nav,
  Carousel,
  Modal,
  Button,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import {
  useMachineData,
  useCurrentStatus,
  useMachineStatus,
  // useAlerts,
  useShifts,
} from "../Hooks/useMachineData";

const MachineCard = ({ id, title, statusColor, status }) => {
  const navigate = useNavigate();
  const [showAlerts, setShowAlerts] = useState(false);
  const [shiftNumber, setShiftNumber] = useState(null);

  const { data: machineData } = useMachineData(id);
  const { data: currentStatusData } = useCurrentStatus(title);
  const { data: machineStatusData } = useMachineStatus(id);
  // const { data: alerts = [] } = useAlerts(title);
  const { data: shifts = [] } = useShifts();

  const PartName = machineData?.PartName || "No Prod Plan";
  const plannedQty = machineData?.plannedQty || 0;
  const OEE = machineData?.OEE || 0;
  const machineEfficiency = machineData?.machineUtilization || 0;
  const quality = machineData?.quality || 0;
  const totalPartsProduced = machineData?.TotalPartsProduced || 0;

  // console.log(machineData)

  const machineStatus = machineStatusData?.status || status || "Unknown";
  const lastUpdatedTime = machineData?.currentTime
  ? new Date(machineData.currentTime).toLocaleString("en-IN", {
      hour12: true,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      day: "2-digit",
      month: "short",
      year: "numeric"
    })
  : "N/A";

    
  const currentStatus = currentStatusData?.IsAvailable ? "Running" : "Idle";
  // const hasAlerts = alerts.length > 0;

  const getCurrentShift = () => {
    const now = new Date();
    for (const shift of shifts) {
      const [startH, startM] = shift.shift_start_time.split(":").map(Number);
      const [endH, endM] = shift.shift_end_time.split(":").map(Number);

      const start = new Date(now).setHours(startH, startM, 0);
      let end = new Date(now).setHours(endH, endM, 0);
      if (end < start) end = new Date(end).setDate(new Date(end).getDate() + 1);

      if (now >= start && now <= end) {
        setShiftNumber(shift.shift_no);
        break;
      }
    }
  };

  useEffect(() => {
    if (shifts.length) getCurrentShift();
  }, [shifts]);

  // const handleCardClick = () => {
  //   localStorage.setItem("selectedmachine_id", id);
  //   navigate(`/machine/${id}`);
  // };

const handleCardClick = () => {
  localStorage.setItem("selectedmachine_id", id); // ✅ Always store machine ID

  // Try getting name from query
  let nameType = machineStatusData?.machine_name_type;

  // ✅ Fallback: get from allMachines in localStorage
  if (!nameType) {
    const allMachines = JSON.parse(localStorage.getItem("allMachines") || "[]");
    const matched = allMachines.find((m) => m.machine_id === id);
    nameType = matched?.machine_name_type || title || "UNKNOWN";
  }

  // ✅ Store the correct machine_name_type
  localStorage.setItem("selectedMachineName", nameType);

  console.log("Saved Machine ID:", id);
  console.log("Saved Machine Name:", nameType);

  navigate(`/machine/${id}`);
};



  return (
    <>
      <Card
        className="h-80 border-0"
        style={{
          borderRadius: "15px",
          boxShadow:
            machineStatus === "ACTIVE"
              ? "0px 5px 10px rgba(0, 128, 0, 0.7)"
              : machineStatus === "NA"
              ? "0px 5px 10px rgba(255, 127, 80, 0.7)"
              : "0px 5px 10px rgba(128, 128, 128, 0.7)",
          overflow: "hidden",
          cursor: "pointer",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        onClick={handleCardClick}
      >
        <Card.Header
          className="p-2 d-flex justify-content-between align-items-center"
          style={{
            backgroundColor:
              machineStatus === "ACTIVE"
                ? "white"
                : machineStatus === "NA"
                ? "rgb(255, 127, 80)"
                : "white",
            color: "#034694",
            fontWeight: "bold",
            fontSize: "1.5rem",
          }}
        >
          <div className="flex-grow-1 text-center">{title}</div>
          {/* {hasAlerts && (
            <Nav className="ms-auto" onClick={(e) => e.stopPropagation()}>
              <Nav.Link onClick={() => setShowAlerts(true)}>
                <i className="bi bi-bell-fill" style={{ color: "#dc3545" }}></i>
              </Nav.Link>
            </Nav>
          )} */}
        </Card.Header>

        <Card.Body>
          <Row className="mb-2">
            <Col xs={6}><strong>Part Name:</strong> {PartName}</Col>
            <Col xs={6}><small>Last Updated: {lastUpdatedTime}</small></Col>
           
          </Row>
          <Row className="mb-2">
          <Col xs={6}><strong>Connect:</strong> <span style={{ color: statusColor }}>{machineStatus}</span></Col>
           
            <Col xs={6}><strong>Status:</strong> <span style={{ color: currentStatus === "Running" ? "green" : "red" }}>{currentStatus}</span></Col>
          </Row>

          <Carousel interval={4000} indicators={false} controls={false}>
            {[{
              label: "Machine Efficiency", value: machineEfficiency
            }, {
              label: "Quality", value: quality
            }, {
              label: "OEE", value: OEE
            }, {
              label: "Production Count", value: `${totalPartsProduced || 0} / ${plannedQty}`
            }].map((item, i) => (
              <Carousel.Item key={i}>
                <div
                  className="d-flex flex-column justify-content-center align-items-center"
                  style={{
                    height: "140px",
                    backgroundColor:
                      machineStatus === "ACTIVE"
                        ? "#28B24A"
                        : machineStatus === "NA"
                        ? "rgb(255, 127, 80)"
                        : "#6c757d",
                    color: "#fff",
                    padding: "1rem",
                    borderRadius: "10px",
                  }}
                >
                  <h5 style={{ marginBottom: "0.5rem" }}>{item.label}</h5>
                  <h1 className="fw-bold">
                    {typeof item.value === "number" ? item.value.toFixed(2) + "%" : item.value}
                  </h1>
                </div>
              </Carousel.Item>
            ))}
          </Carousel>
        </Card.Body>
      </Card>

      <Modal show={showAlerts} onHide={() => setShowAlerts(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Active Alerts</Modal.Title>
        </Modal.Header>
        {/* <Modal.Body>
          {alerts.length > 0 ? (
            <Row>
              {alerts.map((alert, index) => (
                <Col md={6} key={index} className="mb-3">
                  <Card className={`alert-card ${alert.alertType === "critical" ? "alert-critical" : "alert-info"}`}>
                    <Card.Body>
                      <Card.Title>
                        <i className={`bi bi-exclamation-triangle-fill ${alert.alertType === "critical" ? "text-danger" : "text-info"}`}></i> {alert.machine_id}
                      </Card.Title>
                      <Card.Text>
                        <strong>Alert Name:</strong> {alert.alertName}<br />
                        <strong>Triggered At:</strong> {new Date(alert.triggeredAt).toLocaleString()}
                      </Card.Text>
                    </Card.Body>
                    <div className="card-footer">
                      <strong>Shift:</strong> {alert.shiftNo}<br />
                      <strong>Last Updated:</strong> {new Date(alert.updatedAt).toLocaleString()}
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : <p>No active alerts for today.</p>}
        </Modal.Body> */}
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAlerts(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default MachineCard;