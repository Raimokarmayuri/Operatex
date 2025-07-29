import React, { useState, useEffect, useRef } from "react";
import { Card, Row, Col, Button, Container } from "react-bootstrap";
import { Bar } from "react-chartjs-2";
import axios from "axios";
import moment from "moment";
import annotationPlugin from "chartjs-plugin-annotation";
import { Chart as ChartJS } from "chart.js";
import { useNavigate } from "react-router-dom";
// import { API_BASE_URL } from "../config"; 
// const API_BASE_URL = "http://localhost:5003";
import API_BASE_URL from "../config";


ChartJS.register(annotationPlugin);

const AvailabilityChart = () => {
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [view, setView] = useState("monthly"); // 'monthly', 'date-wise', 'shift-wise'
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const navigate = useNavigate();
  const chartRef = useRef(null);
  // const machine_ids = ["CN52", "CN39", "CN14", "CN15"]; // Machines to track
  const [machine_ids, setmachine_ids] = useState([]); // Dynamically fetched machine IDs


useEffect(() => {
  fetchmachine_idsAndData(); // ✅ correct one
}, []);

   // Fetch bottleneck machine IDs and then fetch monthly data
   const fetchmachine_idsAndData = async () => {
    try {
      const machine_idResponse = await axios.get(
        `${API_BASE_URL}/api/machines/machines/bottleneck-ids`
      );
      const machines = machine_idResponse.data;
console.log("bottleneck",machines)
      if (!machines || machines.length === 0) {
        console.error("No bottleneck machine IDs found.");
        return;
      }

      // console.log("✅ Bottleneck Machine IDs:", machines);
      setmachine_ids(machines); // Store dynamic machine IDs
      fetchMonthlyData(machines); // Fetch monthly data using the dynamic machine IDs
    } catch (error) {
      console.error("Error fetching machine IDs:", error);
    }
  };


useEffect(() => {
  fetchmachine_idsAndData(); // ✅ correct one
}, []);

  // Fetch Monthly Data
  // Fetch Monthly Data
const fetchMonthlyData = async (machines = machine_ids) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/oee-logs`);
    
    // ✅ Check if response data is valid
   if (!response.data || !Array.isArray(response.data)) {
  console.error("❌ Invalid or missing OEE data in API response.");
  return;
}

const oeeData = response.data.filter((entry) =>
  machines.includes(entry.machine_id)
);

    if (!oeeData.length) {
      console.warn("⚠️ No matching OEE data found for selected machines.");
      return;
    }

    const groupedByMonth = {};
    oeeData.forEach((entry) => {
      const oee = parseFloat(entry.OEE);
      if (isNaN(oee)) return;

      const month = moment(entry.createdAt).format("YYYY-MM");
      if (!groupedByMonth[month]) groupedByMonth[month] = { OEE: [] };
      groupedByMonth[month].OEE.push(oee);
    });

    const monthlyData = Object.keys(groupedByMonth).map((month) => {
      const values = groupedByMonth[month].OEE;
      const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
      return {
        month,
        OEEAvg: parseFloat(avg.toFixed(2)),
      };
    });

    setChartData({
      labels: monthlyData.map((entry) =>
        moment(entry.month).format("MMM YYYY")
      ),
      datasets: [
        {
          label: "Average OLE (%)",
          data: monthlyData.map((entry) => entry.OEEAvg),
          backgroundColor: "rgba(0, 123, 255, 0.5)",
          borderColor: "rgba(0, 123, 255, 1)",
          borderWidth: 3,
          barPercentage: 0.6,
        },
      ],
    });

    setView("monthly");
  } catch (error) {
    console.error("❌ Error fetching availability data:", error);
  }
};


  // Fetch Date-wise Data
  const fetchDateWiseData = async (selectedMonth) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/oee-logs`
      );
      const oeeData = response.data.filter((entry) =>
        machine_ids.includes(entry.machine_id)
      );

      const groupedByDate = {};
      oeeData.forEach((entry) => {
        const date = moment(entry.createdAt).format("YYYY-MM-DD");
        const entryMonth = moment(entry.createdAt).format("YYYY-MM");

        if (entryMonth === selectedMonth) {
          if (!groupedByDate[date]) groupedByDate[date] = { OEE: [] };
          groupedByDate[date].OEE.push(entry.OEE);
        }
      });

      const dateWiseData = Object.keys(groupedByDate).map((date) => ({
        date,
        OEEAvg:
          groupedByDate[date].OEE.reduce((sum, val) => sum + val, 0) /
          groupedByDate[date].OEE.length,
      }));

      setChartData({
        labels: dateWiseData.map((entry) =>
          moment(entry.date).format("DD MMM")
        ),
        datasets: [
          {
            label: "Date-wise OLE (%)",
            data: dateWiseData.map((entry) => entry.OEEAvg),
            backgroundColor: "rgba(40, 167, 69, 0.5)", // Green
            borderColor: "rgba(40, 167, 69, 1)",
            borderWidth: 3,
            barPercentage: 0.6,
          },
        ],
      });

      setView("date-wise");
    } catch (error) {
      console.error("Error fetching date-wise data:", error);
    }
  };

  // Fetch Shift-wise Data (Dynamically)
  const fetchShiftWiseData = async (selectedDate) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/oee-logs`
      );
      const oeeData = response.data.oeeData.filter((entry) =>
        machine_ids.includes(entry.machine_id)
      );

      const groupedByShift = {};
      oeeData.forEach((entry) => {
        const entryDate = moment(entry.createdAt).format("YYYY-MM-DD");
        if (entryDate === selectedDate) {
          const shiftKey = `Shift ${entry.shift_no}`;
          if (!groupedByShift[shiftKey]) groupedByShift[shiftKey] = [];
          groupedByShift[shiftKey].push(entry.OEE);
        }
      });

      const shiftWiseData = Object.keys(groupedByShift).map((shift) => ({
        shift,
        OEEAvg:
          groupedByShift[shift].reduce((sum, val) => sum + val, 0) /
          groupedByShift[shift].length,
      }));

      setChartData({
        labels: shiftWiseData.map((entry) => entry.shift),
        datasets: [
          {
            label: `Shift-wise OLE for ${moment(selectedDate).format(
              "DD MMM YYYY"
            )}`,
            data: shiftWiseData.map((entry) => entry.OEEAvg),
            backgroundColor: "rgba(220, 53, 69, 0.5)", // Red
            borderColor: "rgba(220, 53, 69, 1)",
            borderWidth: 3,
            barPercentage: 0.6,
          },
        ],
      });

      setView("shift-wise");
    } catch (error) {
      console.error("Error fetching shift-wise data:", error);
    }
  };

  // Handle Chart Clicks
  const handleBarClick = async (e, elements) => {
    if (!elements.length) return;

    const index = elements[0].index;
    if (view === "monthly") {
      const selectedMonthLabel = chartData.labels[index];
      const selectedMonth = moment(selectedMonthLabel, "MMM YYYY").format(
        "YYYY-MM"
      );
      setSelectedMonth(selectedMonth);
      fetchDateWiseData(selectedMonth);
    } else if (view === "date-wise") {
      const selectedDateLabel = chartData.labels[index];
      const selectedDate = moment(selectedDateLabel, "DD MMM").format(
        "YYYY-MM-DD"
      );
      setSelectedDate(selectedDate);
      fetchShiftWiseData(selectedDate);
    }
  };

  // Go Back to Previous View
  const goBack = () => {
    if (view === "shift-wise") {
      fetchDateWiseData(selectedMonth);
    } else if (view === "date-wise") {
      fetchMonthlyData();
    }
  };

  const handleDownloadChart = () => {
    if (chartRef.current) {
      const chartInstance = chartRef.current;
      const link = document.createElement("a");
      link.download = "oee_chart.png";
      link.href = chartInstance.toBase64Image(); // Generate the chart image
      link.click();
    } else {
      console.error("Chart instance not found.");
    }
  };

  return (
    <Container>
    <Row
      className="justify-content-center align-items-center"
      style={{ height: "100vh" }}
    >
      <Col xs={12} md={12} lg={12}>
        <Button
          className="btn btn-primary ml-2 me-2 mb-2"
          onClick={() => navigate("/admin/dashboard")}
        >
          Back To Dashboard
        </Button>
        {view !== "monthly" && (
          <Button className="btn btn-primary ml-2 me-2 mb-2" onClick={goBack}>
            Back
          </Button>
        )}
        <Button
          className="btn btn-primary ml-2 me-2 mb-2"
          onClick={handleDownloadChart}
        >
          Download Chart
        </Button>
        <Card>
          <Card.Header className="font-weight-bold text-center">
            {view === "monthly"
              ? "Monthly Average OLE"
              : view === "date-wise"
              ? `Date-wise OLE for ${moment(selectedMonth).format("MMM YYYY")}`
              : `Shift-wise OLE for ${moment(selectedDate).format(
                  "DD MMM YYYY"
                )}`}
          </Card.Header>
          <Card.Body>
            <div style={{ height: "550px", width: '500px' }}>
              <Bar
                ref={chartRef}
                data={chartData}
                options={{
                  maintainAspectRatio: false,
                  responsive: true,
                  animation: {
                    onComplete: (chart) => {
                      const ctx = chart.chart.ctx; // Correct reference to canvas context
                      const datasets = chart.chart.data.datasets;
  
                      // Style for the labels
                      ctx.font = "bold 12px Arial";
                      ctx.textAlign = "center";
                      ctx.fillStyle = "#000"; // Change this for dark mode if necessary
  
                      datasets.forEach((dataset, datasetIndex) => {
                        const meta = chart.chart.getDatasetMeta(datasetIndex);
                        meta.data.forEach((bar, index) => {
                          const value = dataset.data[index];
                          if (value !== null && value !== undefined) {
                            const position = bar.tooltipPosition();
                            ctx.fillText(
                              value.toLocaleString(), // Format value with commas
                              position.x,
                              position.y - 10 // Adjust label position above the bar
                            );
                          }
                        });
                      });
                    },
                  },
                  onClick: handleBarClick,
                }}
              />
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
    </Container>
  );
};

export default AvailabilityChart;
