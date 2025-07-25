import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import { Doughnut } from "react-chartjs-2";
import { Bar } from "react-chartjs-2";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import MaintenanceOverview from "./MaintenanceNavbar";
import Files from "./Files";
import API_BASE_URL from "../config";
// const API_BASE_URL = "http://localhost:5003";

const Dashboard = () => {
  const machine_id = localStorage.getItem("selectedmachine_id");
  const navigate = useNavigate();
const machine_name_type = localStorage.getItem("selectedMachineName");

  const [statusCounts, setStatusCounts] = useState({
    JH: { complete: 0, pending: 0 },
    PM: { complete: 0, pending: 0 },
    TBM: { complete: 0, pending: 0 },
    CBM: { complete: 0, pending: 0 },
  });

  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    fetchMaintenanceData();
  }, []);

  const fetchMaintenanceData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/maintenance/machine/${machine_id}`);
      const data = response.data;

      // Count by maintenance_type and status
      const counts = {
        JH: { complete: 0, pending: 0 },
        PM: { complete: 0, pending: 0 },
        TBM: { complete: 0, pending: 0 },
        CBM: { complete: 0, pending: 0 },
      };

      const groupedByDate = {};

      data.forEach((item) => {
        const type = item.maintenance_type || "Unknown";
        const status = item.status || "pending";

        // Count per type/status
        if (counts[type]) {
          counts[type][status] += 1;
        }

        // Group by date
        const date = item.pm_schedule_date
          ? new Date(item.pm_schedule_date).toLocaleDateString()
          : "Unknown";

        if (!groupedByDate[date]) {
          groupedByDate[date] = { pending: 0, complete: 0 };
        }
        groupedByDate[date][status] += 1;
      });

      setStatusCounts(counts);

      // Prepare bar chart
      const dates = Object.keys(groupedByDate);
      const pendingCounts = dates.map((d) => groupedByDate[d].pending);
      const completeCounts = dates.map((d) => groupedByDate[d].complete);

      setChartData({
        labels: dates,
        datasets: [
          {
            label: "Pending",
            data: pendingCounts,
            backgroundColor: "red",
          },
          {
            label: "Complete",
            data: completeCounts,
            backgroundColor: "green",
          },
        ],
      });
    } catch (error) {
      console.error("Error fetching maintenance data:", error);
    }
  };

  const chartOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
  };

  const renderDoughnutCards = () => {
    return Object.entries(statusCounts).map(([type, counts], index) => {
      const data = {
        labels: ["Complete", "Pending"],
        datasets: [
          {
            data: [counts.complete, counts.pending],
            backgroundColor: ["#36A2EB", "#FF6384"],
          },
        ],
      };

      return (
        <Col key={index} md={3} xs={12} className="d-flex">
          <Card className="shadow-sm w-100" style={{ backgroundColor: "#e3fcef" }}>
            <Card.Body>
              <Row>
                <Col className="text-start">
                  <h5 className="fw-bold">{type}</h5>
                </Col>
                <Col className="text-end">
                  <h6>
                    {counts.complete}/{counts.complete + counts.pending}
                  </h6>
                </Col>
              </Row>
              <Row className="mt-2 justify-content-center">
                <Col xs={10}>
                  <Doughnut data={data} options={chartOptions} />
                </Col>
              </Row>
              <Row className="mt-3 text-center">
                <Col>
                  <span style={{ fontSize: "0.9rem", fontWeight: "bold", color: "#36A2EB" }}>
                    ● Complete
                  </span>{" "}
                  <span style={{ fontSize: "0.9rem", fontWeight: "bold", color: "#FF6384" }}>
                    ● Pending
                  </span>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      );
    });
  };

  return (
    <div
      className="bg-light"
      style={{
        maxWidth: "100%",
        borderRadius: "8px",
        padding: "0px",
        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
        marginTop: "3.8rem",
        height: "auto",
        fontFamily: "Montserrat, sans-serif",
      }}
    >
      <Files />
      <MaintenanceOverview />
      <Container fluid className="mt-3">
        <h5 className="text-center fw-bold mb-3" style={{ color: "#034694" }}>
          Machine : {machine_name_type || "N/A"}
        </h5>

        <Row className="mb-4">{renderDoughnutCards()}</Row>

        <Row className="justify-content-center">
          <Col md={10}>
            <Card className="shadow mb-5">
              <Card.Body>
                <h5 className="fw-bold text-center mb-4" style={{ color: "#034694" }}>
                  Maintenance Schedules by Date
                </h5>
                <div style={{ height: "400px" }}>
                  {chartData ? (
                    <Bar
                      data={chartData}
                      options={{
                        responsive: true,
                        plugins: {
                          legend: {
                            display: true,
                            position: "top",
                          },
                          title: {
                            display: true,
                            text: "Pending vs Complete Tasks",
                          },
                        },
                        scales: {
                          x: {
                            title: {
                              display: true,
                              text: "Schedule Date",
                            },
                            stacked: true,
                          },
                          y: {
                            title: {
                              display: true,
                              text: "Count",
                            },
                            stacked: true,
                            beginAtZero: true,
                          },
                        },
                      }}
                    />
                  ) : (
                    <p>Loading chart...</p>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Dashboard;
