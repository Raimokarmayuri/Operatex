import React, { useState, useEffect } from "react";
import axios from "axios";
import { Row, Col } from "react-bootstrap";
import "./Parameter2.css";
import API_BASE_URL from "../config";

const PmcParameters = () => {
  const machine_id = localStorage.getItem("selectedmachine_id");
  const machine_name_type = localStorage.getItem("selectedMachineName");

  const [parameters, setParameters] = useState([]);
  const [alertMachines, setAlertMachines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchParametersForMachine = async (machine_id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/pmc-parameters/${machine_id}`
      );

      const data = Array.isArray(response.data)
        ? response.data
        : response.data
        ? [response.data]
        : [];

      setParameters(data);
      setLoading(false);

      // Check for alerts
      let hasAlert = false;
      data.forEach((param) => {
        const expected = String(param.boolean_expected_value);
        const actual = String(param.parameter_value);

        if ((expected === "0" && actual === "1") || (expected === "1" && actual === "0")) {
          hasAlert = true;
        }
      });

      if (hasAlert && !alertMachines.includes(machine_id)) {
        setAlertMachines((prev) => [...prev, machine_id]);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError("No data found");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (machine_id) {
      fetchParametersForMachine(machine_id);

      const interval = setInterval(() => {
        fetchParametersForMachine(machine_id);
      }, 50000);

      return () => clearInterval(interval);
    }
  }, [machine_id]);

  const renderStatus = (expected, actual) => {
    if ((expected === "0" && actual === "1") || (expected === "1" && actual === "0")) {
      return "NOT OK";
    } else {
      return "OK";
    }
  };

  return (
    <div className="container">
      <Row className="justify-content-center mb-4">
        <Col className="text-center">
          {/* <h1>PMC Parameters</h1> */}
          {/* <h5 style={{ color: "#034694" }}>
            Machine: <strong>{machine_name_type || "Unknown"}</strong>
          </h5> */}
        </Col>
      </Row>

      {error ? (
        <div className="alert alert-danger text-center">{error}</div>
      ) : loading ? (
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="row">
          {parameters.length === 0 ? (
            <p className="text-center fw-bold text-muted">
              No parameter data found for the selected machine.
            </p>
          ) : (
            parameters.map((param) => {
              const expected = String(param.boolean_expected_value);
              const actual = String(param.parameter_value);
              const status = renderStatus(expected, actual);
              const isAlert = status === "NOT OK";

              return (
                <div className="col-md-3 mb-3" key={param.pmc_parameter_id || param.id}>
                  <div
                    className={`card ${
                      isAlert ? "border-danger" : "border-success"
                    }`}
                  >
                    <div className="card-body">
                      <h5 className="card-title text-center">
                        {param.parameter_name}
                      </h5>
                      <h2
                        className="card-text text-center fw-bold"
                        style={{ color: isAlert ? "red" : "green" }}
                      >
                        {status}
                      </h2>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default PmcParameters;
