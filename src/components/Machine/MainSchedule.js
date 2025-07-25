import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import axios from "axios";
import ReactApexChart from "react-apexcharts";
import MaintenanceOverview from "./MaintenanceNavbar";
import MaintenanceScheduleForm from "./ScheduleForm";
import Files from "./Files";
import API_BASE_URL from "../config";
// const API_BASE_URL = "http://localhost:5003";

const Schedules = () => {
  const machineId = localStorage.getItem("selectedMachineId");
  const machine_name_type = localStorage.getItem("selectedMachineName");

  const [groupedData, setGroupedData] = useState({});

  // Fetch and group schedule data
  const fetchScheduleData = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/maintenance/machine/${machineId}`
      );
      const data = response.data;

      // Ensure data is an array
      if (!Array.isArray(data)) throw new Error("Invalid data format");

      // Group data by type and frequency
      const grouped = data.reduce((acc, curr) => {
        // Safely access type and frequency values
        const type = curr?.type?.trim() || "Unknown";
        const frequency = curr?.frequency?.trim().toLowerCase() || "unknown";

        // Warn about missing values
        if (!curr?.frequency) {
          console.warn("Missing frequency for item:", curr);
        }

        // Initialize groupings if not already present
        if (!acc[type]) acc[type] = {};
        if (!acc[type][frequency]) acc[type][frequency] = 0;

        // Increment count
        acc[type][frequency] += 1;

        return acc;
      }, {});

      // console.log("Grouped Data:", grouped);
      setGroupedData(grouped);
    } catch (error) {
      // console.error("Error fetching schedule data:", error.message);
    }
  };

  useEffect(() => {
    fetchScheduleData();
  }, []);

  // Prepare options for each doughnut chart
  const generateChartOptions = (frequencies) => {
    const labels = Object.keys(frequencies || {});
    const series = Object.values(frequencies || {});

    return {
      series,
      options: {
        chart: {
          type: "donut",
          height: 300,
        },
        labels, // Frequency labels
        legend: {
          position: "bottom",
        },
        dataLabels: {
          enabled: false, // Disable data labels
        },
      },
    };
  };

  const desiredOrder = ["JH", "PM", "TBM", "CBM"]; // Define the desired order

  const renderCards = () => {
    const orderedKeys = desiredOrder.filter((key) => groupedData[key]); // Ensure only keys in groupedData are included

    return orderedKeys.map((type, index) => {
      const chartData = generateChartOptions(groupedData[type]);
      return (
        <Col xs={12} md={3} key={index} className="d-flex">
          <Card
            className="shadow-sm w-100"
            style={{
              cursor: "pointer",
              fontFamily: "Montserrat, sans-serif",
              // backgroundColor: "#ffeceb",
            }}
          >
            <Card.Body>
              <Card.Title className="text-center">{type}</Card.Title>
              <ReactApexChart
                options={chartData.options}
                series={chartData.series}
                type="donut"
                height={200}
              />
            </Card.Body>
          </Card>
        </Col>
      );
    });
  };

  return (
    <div className="bg-light"
      style={{
        // backgroundColor: "white",
        maxWidth: "100%",
        borderRadius: "8px",
        padding: "0px",
        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
        marginTop: "3.7rem",
        fontFamily: "Montserrat, sans-serif",
      }}
    >
      <Files className="mt-4" />
      <MaintenanceOverview className="mt" />
      <div
        className="d-flex justify-content-around align-items-center mt-2 mb-2"
        style={{ color: "#034694", fontWeight: "bold", fontSize: "22px" }}
      >
        {machineId || "Machine ID Not Available"}
      </div>
      <Container fluid className="my-2 rounded me-0 p-1 mt-0">
        {/* <Row>{renderCards()}</Row> */}
        <Row className="mt-4" style={{ marginRight: "1rem" }}>
          <Col>
            <MaintenanceScheduleForm />
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Schedules;
