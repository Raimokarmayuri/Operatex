import React, { useEffect, useState } from "react";
import { Container, Row, Col, Dropdown, Form, Card, Button } from "react-bootstrap";
import axios from "axios";
import "./Parameter2.css";
import API_BASE_URL from "../config";

const Dashboard = ({machineId}) => {
  const [parameters, setParameters] = useState([]);
  const [machines, setMachines] = useState([]);
  const [buttonColors, setButtonColors] = useState({});
  const [selectedMachine, setSelectedMachine] = useState("CN49"); // Default machine

  const fetchParameters = async (machineId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/machine-data/monitoring/ORG001/${machineId}`
      );
      setParameters(response.data);
    } catch (error) {
      // console.error("Error fetching parameters:", error);
    }
  };


  useEffect(() => {
    // fetchMachines();
    // Fetch parameters when the selected machine changes
    fetchParameters(machineId);

    // Set up interval to fetch parameters every minute
    const interval = setInterval(() => {
      fetchParameters(machineId);
    }, 10000); // 60000 milliseconds = 1 minute

    // Clean up the interval on component unmount
    return () => clearInterval(interval);
  }, [machineId]);

  // Function to generate a random Bootstrap button color
  const getRandomColor = () => {
    const colorClasses = [
      "btn-danger", // Red
      "btn-primary", // Green
      "btn-warning", // Yellow
      "btn-info", // Light blue
      "btn-primary", // Blue
      "btn-dark", // Dark
    ];
    const randomIndex = Math.floor(Math.random() * colorClasses.length);
    return colorClasses[randomIndex];
  };

  return (



<div className="container" style={{ marginTop: "rem" }}>
      {/* Machine Selection Section */}
      <Row className="justify-content-center mb-4 d-flex">
        {/* <Col md={3}>
          <Form.Group>
            <Form.Label className="bold" style={{ fontWeight: "bold" }}>
              Select a Machine
            </Form.Label>
            <select
              style={{ backgroundColor: "gray", color: "white" }}
              className="form-select p-2 w-100"
              value={selectedMachine}
              onChange={(e) => setSelectedMachine(e.target.value)}
            >
              {machines.length > 0 ? (
                machines.map((machine) => (
                  <option key={machine.machineId} value={machine.machineId}>
                    {machine.machineId}
                  </option>
                ))
              ) : (
                <option disabled>Loading...</option>
              )}
            </select>
          </Form.Group>
        </Col> */}
        <Col className="text-center">
          <h3>Diagnostic Parameters</h3>
        </Col>
      </Row>

      {/* Parameters Display Section */}
      <div className="row mt-4">
        {parameters.map((param) => (
          <div className="col-md-3 mb-3" key={param._id}>
            <div
              className={`card shadow-sm ${
                param.ParameterValue === "1" ? "border-danger" : "border-success"
              }`}
            >
              <div className="card-body">
                <h5 className="card-title text-center">{param.ParameterName}</h5>
                <h2
                  className="card-text text-center fw-bold"
                  style={{
                    color: param.ParameterValue === "1" ? "red" : "green",
                  }}
                >
                  {(param.ParameterValue)}
                </h2>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>


  );
};

export default Dashboard;
