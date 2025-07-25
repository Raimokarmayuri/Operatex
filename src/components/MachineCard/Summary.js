

import React, { useState,useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import Files from "../Machine/Files";
import BackButton from "../BackButton";
import AddDowntime from "./Downtime";
import AddRejectPart from "./Rejectedpart";
import HourlyProductionChart from "./HourlyProdCount";
import {
  Container,
  Row,
  Col,
  Card,
  Modal,
  Button,
  Badge,
} from "react-bootstrap";
import {
  BsExclamationCircle,
  BsClockHistory,
  BsBarChartLine,
} from "react-icons/bs";
import API_BASE_URL from "../config";
import { useQuery } from "@tanstack/react-query";
import { fetchMachineOEEData, fetchReworkData } from "../Hooks/summaryApi";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
ChartJS.register(ArcElement, Tooltip, Legend);

const Summary = () => {

  // Call once in a top-level component
useEffect(() => {
  axios.get(`${API_BASE_URL}/api/machines/getallmachine`).then((res) => {
    localStorage.setItem("allMachines", JSON.stringify(res.data));
  });
}, []);


  const machine_id = localStorage.getItem("selectedmachine_id");
const machine_name_type = localStorage.getItem("selectedMachineName");
useEffect(() => {
  console.log("Selected Machine ID:", machine_id);
  console.log("Selected Machine Name:", machine_name_type);
}, []);
  // const machine_id = localStorage.getItem("selectedmachine_id");
    // const machine_name_type = localStorage.getItem("selectedMachineName");
  const [activeComponent, setActiveComponent] = useState("summary");
  const [showAlerts, setShowAlerts] = useState(false);
  const [pollingInterval, setPollingInterval] = useState(1000); // start with 1 second
  const { user } = useAuth();
  console.log(user);
  // const machine_id = user?.machine_id || "";

  const {
    data: oeeData,
    isLoading: isOeeLoading,
    refetch: refetchOEE,
  } = useQuery({
    queryKey: ["oeeData", machine_id],
    queryFn: () => fetchMachineOEEData(machine_id),
    refetchInterval: pollingInterval,
    onSuccess: () => {
      if (pollingInterval === 1000) setPollingInterval(5000);
    },
  });

  const { data: reworkQuantity = 0, isLoading: isReworkLoading } = useQuery({
    queryKey: ["reworkData", machine_id],
    queryFn: () => fetchReworkData(machine_id),
    refetchOnWindowFocus: false,
  });

  const handleCloseAlerts = () => setShowAlerts(false);
  const handleCardClick = () => setShowAlerts(true);

  const data = {
    labels: [
      "Good Parts",
      oeeData?.partAhead > 0 ? "Parts Ahead" : "Parts Behind",
    ],
    datasets: [
      {
        label: "Parts Count",
        data: [
          oeeData?.goodParts || 0,
          oeeData?.partAhead > 0 ? oeeData.partAhead : oeeData?.partBehind || 0,
        ],
        backgroundColor: [
          "green",
          oeeData?.partAhead > 0
            ? "blue"
            : oeeData?.partBehind <= oeeData?.expectedPartCount * 0.1
            ? "green"
            : oeeData?.partBehind > oeeData?.expectedPartCount * 0.3
            ? "red"
            : "orange",
        ],
        borderColor: [
          "darkgreen",
          oeeData?.partAhead > 0
            ? "darkblue"
            : oeeData?.partBehind <= oeeData?.expectedPartCount * 0.1
            ? "darkgreen"
            : oeeData?.partBehind > oeeData?.expectedPartCount * 0.3
            ? "darkred"
            : "darkorange",
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        position: "nearest",
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
        borderColor: "#ffffff",
        borderWidth: 1,
      },
    },
    cutout: "70%",
  };

  return (
    <div className="bg-light min-vh-100" style={{ marginTop: "50px" }}>
      {/* <BackButton /> */}
      <Files />
      {activeComponent === "downtime" && (
        <div style={{ padding: "15px", borderRadius: "5px" }}>
          <button
            className="btn btn-primary"
            onClick={() => setActiveComponent("summary")}
          >
            Back
          </button>
          <AddDowntime />
        </div>
      )}

      {activeComponent === "rejectpart" && (
        <div style={{ padding: "15px", borderRadius: "5px" }}>
          <button
            className="btn btn-lg btn-outline-primary"
            onClick={() => setActiveComponent("summary")}
          >
            <i className="fas fa-arrow-left"></i>
          </button>
          <AddRejectPart />
        </div>
      )}

      {activeComponent === "hourlycountproduction" && (
        <div style={{ padding: "15px", borderRadius: "5px" }}>
          <button
            className="btn btn-lg btn-outline-primary"
            onClick={() => setActiveComponent("summary")}
          >
            <i className="fas fa-arrow-left"></i>
          </button>
          <HourlyProductionChart />
        </div>
      )}

      {activeComponent === "summary" && (
        <div className="container py-3">
          <div className="row g-4">
            {[
              { label: "Performance", value: oeeData?.performance },
              { label: "Quality", value: oeeData?.quality },
              {
                label: "All Downtime",
                value: oeeData ? `${oeeData.downtimeDuration} m` : "--",
              },
              { label: "Active Alerts", value: "0", clickable: true },
              { label: "Availability", value: oeeData?.availability },
              { label: "OEE", value: oeeData?.OEE },
            ].map((item, idx) => (
              <div className="col-md-2 col-sm-6" key={idx}>
                <div
                  className="card text-center shadow-sm rounded-4"
                  onClick={item.clickable ? handleCardClick : null}
                  style={{ cursor: item.clickable ? "pointer" : "default" }}
                >
                  <div className="card-body bg-light-subtle rounded-4">
                    <h6 style={{ color: "#012169" }}>{item.label}</h6>
                    <h4 className="fw-bold" style={{ color: "#012169" }}>
                      {typeof item.value === "number"
                        ? `${item.value.toFixed(2)}%`
                        : item.value || "--"}
                    </h4>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="row mt-4">
            <div className="col-md-7">
              <h4
                className="fw-bold text-center mb-3"
                style={{ color: "#012169" }}
              >
                {machine_name_type || "--"}
              
              </h4>
              <div className="d-flex flex-wrap gap-3 justify-content-between">
                {[
                  {
                    label: "Good / Rejected Parts",
                    value: oeeData
                      ? `${oeeData.goodParts} / ${oeeData.defectiveParts}`
                      : "-- / --",
                    color: "text-success",
                  },
                  {
                    label: "Expected Part Count",
                    value: oeeData?.expectedPartCount ?? "--",
                    color: "text-info",
                  },
                  {
                    label: "Order Progress",
                    value: oeeData
                      ? `${oeeData.TotalPartsProduced} / ${oeeData.expectedPartCount}`
                      : "-- / --",
                    color: "text-success",
                  },
                  {
                    label: "Estimated Running Time",
                    value: oeeData
                      ? `${oeeData.remainingTime?.hours ?? 0}h ${
                          oeeData.remainingTime?.minutes ?? 0
                        }m`
                      : "--",
                    color: "text-warning",
                  },
                ].map((item, idx) => (
                  <div
                    className="card shadow-sm rounded-4 border-0 text-center p-4 flex-fill"
                    style={{ minWidth: "48%" }}
                    key={idx}
                  >
                    <h5
                      className="fw-semibold mb-2"
                      style={{ color: "#012169" }}
                    >
                      {item.label}
                    </h5>
                    <h3 className={`fw-bold ${item.color}`}>{item.value}</h3>
                  </div>
                ))}
              </div>
            </div>

            <div className="col-md-5 d-flex flex-column align-items-center">
              <div
                className="card shadow-sm border-0 rounded-4 w-100"
                style={{ height: "330px" }}
              >
                <div className="card-body d-flex flex-column align-items-center justify-content-start">
                  <h6
                    className="fw-semibold mt-2 mb-3"
                    style={{ color: "#012169" }}
                  >
                    Status
                  </h6>
                  <div
                    className="position-relative d-flex justify-content-center align-items-center"
                    style={{ width: "250px", height: "250px" }}
                  >
                    {oeeData ? (
                      <>
                        <div
                          style={{ width: "250px", height: "250px", zIndex: 3 }}
                        >
                          <Doughnut data={data} options={options} />
                        </div>
                        <div
                          className="position-absolute bg-white rounded-circle d-flex flex-column justify-content-center align-items-center shadow"
                          style={{ width: "120px", height: "120px", zIndex: 2 }}
                        >
                          <h4
                            className="mb-0 fw-bold"
                            style={{
                              color:
                                oeeData.partAhead > 0
                                  ? "#0d6efd"
                                  : oeeData.partBehind <=
                                    oeeData.expectedPartCount * 0.1
                                  ? "#198754"
                                  : oeeData.partBehind >
                                    oeeData.expectedPartCount * 0.3
                                  ? "#dc3545"
                                  : "#fd7e14",
                            }}
                          >
                            {oeeData.partAhead > 0
                              ? oeeData.partAhead
                              : oeeData.partBehind}
                          </h4>
                          <p
                            className="mb-0 fw-semibold text-muted"
                            style={{ fontSize: "13px" }}
                          >
                            {oeeData.partAhead > 0
                              ? "Parts Ahead"
                              : "Parts Behind"}
                          </p>
                        </div>
                      </>
                    ) : (
                      <div className="text-center text-muted">
                        No data to display
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="d-flex justify-content-between align-items-center flex-wrap mt-4">
            <button
              className="btn text-white px-4 mb-2 shadow-sm"
              style={{ background: "#012169" }}
            >
              👤 {oeeData?.selectedUser ?? "N/A"}
            </button>
            <div className="d-flex flex-wrap gap-5">
              {[
                {
                  label: "Rejection",
                  icon: <BsExclamationCircle size={18} />,
                  onClick: () => setActiveComponent("rejectpart"),
                  badge: oeeData?.defectiveParts ?? "--",
                },
                {
                  label: "Downtime",
                  icon: <BsClockHistory size={18} />,
                  onClick: () => setActiveComponent("downtime"),
                  badge: oeeData ? `${oeeData.downtimeDuration} min` : "--",
                },
                {
                  label: "Hourly Count",
                  icon: <BsBarChartLine size={18} />,
                  onClick: () => setActiveComponent("hourlycountproduction"),
                  badge: "",
                },
              ].map((item, idx) => (
                <div className="position-relative" key={idx}>
                  <button
                    className="btn text-white px-5 shadow-sm rounded-2 d-flex align-items-center gap-2"
                    onClick={item.onClick}
                    style={{ background: "#012169" }}
                  >
                    {item.icon} {item.label}
                  </button>
                  <Badge
                    bg="light"
                    text="dark"
                    pill
                    className="position-absolute top-0 start-100 translate-middle shadow-sm"
                  >
                    {item.badge}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <Modal show={showAlerts} onHide={handleCloseAlerts} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Active Alerts</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>No active alerts for today.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseAlerts}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Summary;
