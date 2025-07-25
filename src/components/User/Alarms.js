import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Spinner, Alert } from "react-bootstrap";
import BackButton from '../BackButton';
import { useAuth } from "../../context/AuthContext";
import API_BASE_URL from "../config";

const MachineAlerts = () => {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
const { user } = useAuth();
  const machineId = user?.machineId || "";

    useEffect(() => {
        const fetchAlerts = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/api/alerts/machine/${machineId}`);
                setAlerts(response.data);
            } catch (error) {
                setError("Error fetching alerts. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchAlerts();
    }, []);

    return (
        <>
         <BackButton />
         
        <div className=" mt-4 ms-3">
           
            <h3 className="mb-3">Machine Alerts - {machineId} </h3>

            {loading && (
                <div className="text-center">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                </div>
            )}

            {error && <Alert variant="danger">{error}</Alert>}

            {!loading && !error && alerts.length === 0 && (
                <Alert variant="info">No alerts found for this machine.</Alert>
            )}

            {!loading && !error && alerts.length > 0 && (
                 <table
              className="table table-bordered table-hover mt-4"
              style={{
                fontSize: "0.9rem", // Reduce font size
                lineHeight: "1.2", // Adjust line height
              }}
            >
              <thead
                className="table-light"
                style={{
                  position: "sticky",
                  top: 1,
                  zIndex: 1020,
                }}
              >
                        <tr>
                            <th style={{ padding: "10px", color: "#034694" }}>#</th>
                            <th style={{ padding: "10px", color: "#034694" }}>Alert Name</th>
                            <th style={{ padding: "10px", color: "#034694" }}>Alert Type</th>
                            <th style={{ padding: "10px", color: "#034694" }}>Alert Number</th>
                            <th style={{ padding: "10px", color: "#034694" }}>Triggered At</th>
                            <th style={{ padding: "10px", color: "#034694" }}>Resolved At</th>
                            <th style={{ padding: "10px", color: "#034694" }}>Shift Number</th>
                        </tr>
                    </thead>
                    <tbody>
                        {alerts.map((alert, index) => (
                            <tr key={alert._id}>
                                <td style={{ padding: "10px" }}>{index + 1}</td>
                                <td style={{ padding: "10px" }}>{alert.alertName}</td>
                                <td style={{ padding: "10px" }}>{alert.alertType}</td>
                                <td style={{ padding: "10px" }}>{alert.alertNumber}</td>
                                <td style={{ padding: "10px" }}>{new Date(alert.triggeredAt).toLocaleString()}</td>
                                <td style={{ padding: "10px" }}>{alert.resolvedAt ? new Date(alert.resolvedAt).toLocaleString() : "Pending"}</td>
                                <td style={{ padding: "10px" }}>{alert.shiftNumber}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
        </>
    );
};

export default MachineAlerts;
