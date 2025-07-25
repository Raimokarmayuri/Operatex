import React, { useEffect, useState } from "react";
import { Container, Button } from "react-bootstrap";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../../config";

const ToolAlerts = () => {
  const [machines, setMachines] = useState([]); // Store available machines
  const [selectedMachineId, setSelectedMachineId] = useState("all"); // Default to "all"
  const [toolAlerts, setToolAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch Machine List
  const fetchMachines = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/machines/getallmachine`);
      setMachines(response.data);
    } catch (error) {
      console.error("Error fetching machines:", error);
    }
  };

  // Fetch Tool Alerts
  const fetchToolAlerts = async () => {
    setLoading(true);
    try {
      let response;
      if (selectedMachineId === "all") {
        response = await axios.get(`${API_BASE_URL}/api/tools`);
      } else {
        response = await axios.get(
          `${API_BASE_URL}/api/tools/machine/${selectedMachineId}`
        );
      }

      const tools = response.data;

      // Group tools by toolName and get the latest one per group
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

      // Convert the map back to an array
      const latestTools = Object.values(latestToolsMap);

      // Filter for tool life alerts
      const filteredToolAlerts = latestTools
        .filter((tool) => Number(tool.actualLife) >= Number(tool.setLife) * 0.9)
        .map((tool) => ({
          alertType: "tool-life",
          toolNumber: tool.toolNumber,
          toolName: tool.toolName,
          MachineId: tool.machineId,
          // triggeredAt: new Date().toISOString(),
          toolChangeDate: tool.toolChangeDate,
        }));

      setToolAlerts(filteredToolAlerts);
    } catch (error) {
      console.error("Error fetching tool alerts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMachines();
    fetchToolAlerts();
    const interval = setInterval(fetchToolAlerts, 90000); // Refresh every 90 seconds
    return () => clearInterval(interval);
  }, [selectedMachineId]); // Fetch alerts when machine selection changes

  const handleViewTool = (machineId) => {
    navigate(`/machine/${machineId}/machinedetails`);
  };

  return (
    <Container fluid className="" style={{ marginTop: "3rem" }}>
      {/* <h4 className="text-center mb-3">Tool Life Alerts</h4> */}

      <div className="d-flex justify-content-center align-items-center flex-wrap gap-2 mt-2 mb-2 p-2 border rounded bg-light">
        <div className="fs-4 fw-bold" style={{ color: "#034694" }}>
          Tool Life Alerts
        </div>
      </div>

      {/* Tool Alerts Table */}
      {loading ? (
        <p>Loading tool alerts...</p>
      ) : toolAlerts.length > 0 ? (
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
              <th style={{ color: "#034694" }}>#</th>
              <th style={{ color: "#034694" }}>Machine ID</th>
              <th style={{ color: "#034694" }}>Tool Number</th>
              <th style={{ color: "#034694" }}>Tool Name</th>
              <th style={{ color: "#034694" }}>Triggered At</th>
              <th style={{ color: "#034694" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {toolAlerts.map((alert, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{alert.MachineId}</td>
                <td>{alert.toolNumber}</td>
                <td>{alert.toolName}</td>
                <td>{new Date(alert.toolChangeDate).toLocaleString()}</td>
                {/* <td>{new Date(alert.triggeredAt).toLocaleString()}</td> */}
                <td>
                  <Button
                    variant="info"
                    size="sm"
                    onClick={() => handleViewTool(alert.MachineId)}
                  >
                    View Details
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No active tool alerts.</p>
      )}
    </Container>
  );
};

export default ToolAlerts;
