import React, { useState, useEffect } from "react";
import axios from "axios";
import { Row, Col } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Parameter2.css";
import API_BASE_URL from "../config";

const PmcParameters = ({ machineId }) => {
  const [parameters, setParameters] = useState([]);
  const [selectedMachine, setSelectedMachine] = useState("CN49"); // Default machine
  const [alertMachines, setAlertMachines] = useState([]); // Track machines with alerts
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Toast notifications for alerts
  const showToast = (parameterDescription, machineId) => {
    toast.error(`Alert: ${parameterDescription} on Machine ${machineId} is ON!`, {
      position: "top-right",
      autoClose: false,
      closeOnClick: false,
      pauseOnHover: true,
    });
  };

  // Fetch PMC parameters for a specific machine
  const fetchParametersForMachine = async (machineId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/pmc-parameters/machine/${machineId}`
      );
      setParameters(response.data);
      setLoading(false);

      // Check for active alerts based on custom condition
      let hasAlert = false;
      response.data.forEach((param) => {
        const ok = String(param.OK); // Ensure OK is a string
        const value = String(param.parameterValue); // Ensure parameterValue is a string

        // Trigger alert if OK = "0" and parameterValue = "1", or if OK = "1" and parameterValue = "0"
        if (
          (ok === "0" && value === "1") ||
          (ok === "1" && value === "0")
        ) {
          hasAlert = true;
          // showToast(param.parameterDescription, machineId); // Show toast for the alert
        }
      });

      // Update machines with active alerts
      if (hasAlert && !alertMachines.includes(machineId)) {
        setAlertMachines((prev) => [...prev, machineId]);
      }
    } catch (err) {
      setError("No data Found");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParametersForMachine(machineId);

    // Refresh data for the selected machine every 5 seconds
    const interval = setInterval(() => {
      fetchParametersForMachine(machineId);
    }, 5000); // 5 seconds

    return () => clearInterval(interval);
  }, [machineId]);

  const handleMachineChange = (machineId) => {
    setSelectedMachine(machineId);
    fetchParametersForMachine(machineId);
  };

  const renderOnOffStatus = (ok, value) => {
    // Trigger alert and return "NOT OK" if either condition is met
    if ((ok === "0" && value === "1") || (ok === "1" && value === "0")) {
      return "NOT OK"; // Alert condition
    } else {
      return "OK"; // No alert
    }
  };

  return (
    <div className="container" style={{ marginTop: "rem" }}>
      <Row className="justify-content-center mb- d-flex">
        <Col className="" style={{ marginLeft: "30rem" }}>
          <h1>PMC Parameter</h1>
        </Col>
      </Row>

      {error ? (
        <div className="alert alert-danger text-center">{error}</div>
      ) : (
        <>
          {loading ? (
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
                  const ok = String(param.OK); // Ensure OK is a string
                  const value = String(param.parameterValue); // Ensure parameterValue is a string

                  const status = renderOnOffStatus(ok, value); // Get status based on OK and parameterValue
                  const isAlert = status === "NOT OK"; // Check if the status indicates an alert

                  return (
                    <div className="col-md-3 mb-3" key={param._id}>
                      <div
                        className={`card ${
                          isAlert ? "border-danger" : "border-success"
                        }`} // Red border if alert, green if OK
                      >
                        <div className="card-body">
                          <h5 className="card-title text-center">
                            {param.parameterDescription}
                          </h5>
                          <h2
                            className="card-text text-center fw-bold"
                            style={{
                              color: isAlert ? "red" : "green", // Red text if alert, green if OK
                            }}
                          >
                            {status} {/* Display status */}
                          </h2>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </>
      )}

      {/* Toast Container */}
      {/* <ToastContainer
        position="top-right"
        autoClose={false}
        closeOnClick={false}
        pauseOnHover={true}
        newestOnTop={true}
        limit={3}
        hideProgressBar={true}
      /> */}
    </div>
  );
};

export default PmcParameters;
