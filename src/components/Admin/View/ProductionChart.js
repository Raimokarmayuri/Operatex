import React, { useState, useEffect,useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import { Container, Card, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import API_BASE_URL from "../../config";

Chart.register(...registerables);

const ProductionReportPage = () => {
  const [reportData, setReportData] = useState([]);
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  });
   const chartRef = useRef(null);
  const [view, setView] = useState("monthly"); // 'monthly', 'machine', 'shift'
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [groupedData, setGroupedData] = useState({});
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(null);

  // Fetch data from the new API
  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const response = await axios.get(
            `${API_BASE_URL}/api/oeelog/oee-data`
        );
        if (response.data && Array.isArray(response.data.oeeData)) {
          setReportData(response.data.oeeData);
          processMonthlyData(response.data.oeeData);
        } else {
          // console.error("Invalid API response:", response.data);
        }
      } catch (error) {
        // console.error("Error fetching production report:", error);
      }
    };
    fetchReportData();
  }, []);

 // Reset to Previous View
 const resetChart = () => {
  if (view === "shift") {
    processMachineData(selectedDate);
    setView("machine");
    setSelectedMachine(null);
  } else if (view === "machine") {
    processDateData(selectedMonth);
    setView("date");
    setSelectedDate(null);
  } else if (view === "date") {
    processMonthlyData(reportData);
    setView("monthly");
    setSelectedMonth(null);
  } else {
    processMonthlyData(reportData);
  }
};

// **Step 1: Process Data by Month**
const processMonthlyData = (data) => {
  if (!data || !Array.isArray(data)) return;

  const grouped = {};

  data.forEach((item) => {
    if (!item || !item.updatedAt) return;

    const updatedDate = new Date(item.updatedAt);
    const monthYear = updatedDate.toLocaleString("default", {
      month: "short",
      year: "numeric",
    });

    if (!grouped[monthYear]) {
      grouped[monthYear] = {
        TotalPartsProduced: 0,
        PlannedQty: 0,
        dates: {},
      };
    }

    const dateKey = updatedDate.toISOString().split("T")[0]; // Format YYYY-MM-DD
    if (!grouped[monthYear].dates[dateKey]) {
      grouped[monthYear].dates[dateKey] = {
        TotalPartsProduced: 0,
        PlannedQty: 0,
        machines: {},
      };
    }

    if (!grouped[monthYear].dates[dateKey].machines[item.machineId]) {
      grouped[monthYear].dates[dateKey].machines[item.machineId] = {
        TotalPartsProduced: 0,
        PlannedQty: 0,
        shifts: [],
      };
    }

    grouped[monthYear].TotalPartsProduced += item.TotalPartsProduced || 0;
    grouped[monthYear].PlannedQty += item.plannedQty || 0;
    grouped[monthYear].dates[dateKey].TotalPartsProduced +=
      item.TotalPartsProduced || 0;
    grouped[monthYear].dates[dateKey].PlannedQty += item.plannedQty || 0;
    grouped[monthYear].dates[dateKey].machines[
      item.machineId
    ].TotalPartsProduced += item.TotalPartsProduced || 0;
    grouped[monthYear].dates[dateKey].machines[item.machineId].PlannedQty +=
      item.plannedQty || 0;

    grouped[monthYear].dates[dateKey].machines[item.machineId].shifts.push({
      shiftNumber: item.shiftNumber,
      TotalPartsProduced: item.TotalPartsProduced || 0,
      plannedQty: item.plannedQty || 0,
    });
  });

  setGroupedData(grouped);
  setChartData({
    labels: Object.keys(grouped),
    datasets: [
      {
        label: "Total Parts Produced",
        data: Object.values(grouped).map((month) => month.TotalPartsProduced),
        backgroundColor: "rgba(40, 167, 69, 0.5)",
        borderColor: "rgba(40, 167, 69, 1)",
        borderWidth: 3,
      },
      {
        label: "Planned Quantity",
        data: Object.values(grouped).map((month) => month.PlannedQty),
        backgroundColor: "rgba(0, 123, 255, 0.5)",
        borderColor: "rgba(0, 123, 255, 1)",
        borderWidth: 3,
      },
    ],
  });
};

// **Step 2: Process Data by Date for a Selected Month**
const processDateData = (month) => {
  const monthData = groupedData[month];
  if (!monthData) return;

  setChartData({
    labels: Object.keys(monthData.dates),
    datasets: [
      {
        label: "Total Parts Produced",
        data: Object.values(monthData.dates).map(
          (date) => date.TotalPartsProduced
        ),
        backgroundColor: "rgba(40, 167, 69, 0.5)",
        borderColor: "rgba(40, 167, 69, 1)",
        borderWidth: 3,
      },
      {
        label: "Planned Quantity",
        data: Object.values(monthData.dates).map((date) => date.PlannedQty),
        backgroundColor: "rgba(0, 123, 255, 0.5)",
        borderColor: "rgba(0, 123, 255, 1)",
        borderWidth: 3,
      },
    ],
  });

  setView("date");
  setSelectedMonth(month);
};
// **Step 3: Process Data by Machine for a Selected Date**
const processMachineData = (date) => {
  const monthData = groupedData[selectedMonth];
  if (!monthData) return;

  const dateData = monthData.dates[date];
  if (!dateData) return;

  setChartData({
    labels: Object.keys(dateData.machines),
    datasets: [
      {
        label: "Total Parts Produced",
        data: Object.values(dateData.machines).map(
          (machine) => machine.TotalPartsProduced
        ),
        backgroundColor: "rgba(40, 167, 69, 0.5)",
        borderColor: "rgba(40, 167, 69, 1)",
        borderWidth: 3,
      },
      {
        label: "Planned Quantity",
        data: Object.values(dateData.machines).map(
          (machine) => machine.PlannedQty
        ),
        backgroundColor: "rgba(0, 123, 255, 0.5)",
        borderColor: "rgba(0, 123, 255, 1)",
        borderWidth: 3,
      },
    ],
  });

  setView("machine");
  setSelectedDate(date);
};

// **Step 4: Process Shift Data for a Selected Machine**
const processShiftData = (machine) => {
  const monthData = groupedData[selectedMonth];
  if (!monthData) return;

  const dateData = monthData.dates[selectedDate];
  if (!dateData) return;

  const machineData = dateData.machines[machine];
  if (!machineData) return;

  console.log("Processing shift data for machine:", machine, machineData);

  // Ensure shift-level data exists
  if (!machineData.shifts || machineData.shifts.length === 0) {
    console.error("No shift data found for selected machine:", machine);
    return;
  }

  setChartData({
    labels: machineData.shifts.map((s) => `Shift ${s.shiftNumber}`),
    datasets: [
      {
        label: "Total Parts Produced",
        data: machineData.shifts.map((s) => s.TotalPartsProduced),
        backgroundColor: "rgba(40, 167, 69, 0.5)",
        borderColor: "rgba(40, 167, 69, 1)",
        borderWidth: 3,
      },
      {
        label: "Planned Quantity",
        data: machineData.shifts.map((s) => s.plannedQty), // 🔥 Ensure correct property name
        backgroundColor: "rgba(0, 123, 255, 0.5)",
        borderColor: "rgba(0, 123, 255, 1)",
        borderWidth: 3,
      },
    ],
  });

  setView("shift");
  setSelectedMachine(machine);
};
  
  
  const handleDownloadChart = () => {
    if (chartRef.current) {
      const chartInstance = chartRef.current;
      const link = document.createElement("a");
      link.download = "production_chart.png";
      link.href = chartInstance.toBase64Image(); // Generate the chart image
      link.click();
    } else {
      console.error("Chart instance not found.");
    }
  };
  
  

  return (
    <div
      style={{
        // backgroundColor: "white",
        maxWidth: "100%",
        borderRadius: "8px",
        padding: "2px",
        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
        marginTop: "0rem",
        height: "100%",
        fontFamily: "Montserrat, sans-serif",
      }}
    >
      <h3
        className="text-center text-md-center"
        style={{ color: "red", fontWeight: "bold", fontSize: "26px" }}
      >
        Production Report
      </h3>
      <Container fluid>
        {/* <Button
          className="btn-primary mt-5 mb-3"
          onClick={() => navigate("/prodreport")}
        >
          Back
        </Button> */}
       <Button className="btn-warning mt-5 mb-3 ms-2 fs-3" onClick={resetChart}>
               {view === "shift"
                 ? "Back to Machine View"
                 : view === "machine"
                 ? "Back to Date View"
                 : view === "date"
                 ? "Back to Monthly View"
                 : "Reset Chart"}
             </Button>
        <Button
            className="text-black mt-5 mb-3 ms-2 fs-3"
            onClick={handleDownloadChart}
          >
            Download Chart
          </Button>
        <Card className="shadow p-3 mb-4">
          <Card.Body>
            <h4 className="text-center">
              {selectedMachine
                ? `Production Data for ${selectedMachine}`
                : "Production Data for Machines"}
            </h4>
            <div style={{ height: "400px" }}>
              <Bar
               ref={chartRef}
                data={chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    x: {
                      title: {
                        display: true,
                        text:
                          view === "monthly"
                            ? "Months"
                            : view === "machine"
                            ? "Machines"
                            : "Dates",
                        font: {
                          size: 14,
                          weight: "bold",
                        },
                      },
                      ticks: {
                        maxRotation: 45,
                        minRotation: 0,
                      },
                    },
                    y: {
                      title: {
                        display: true,
                        text: "Production Count",
                        font: {
                          size: 14,
                          weight: "bold",
                        },
                      },
                      ticks: {
                        beginAtZero: true,
                        callback: function (value) {
                          return value.toLocaleString(); // Add formatting to Y-axis values
                        },
                      },
                    },
                  },
                  plugins: {
                    tooltip: {
                      enabled: true,
                    },
                  },
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
                  onClick: (e, chartElement) => {
                    if (!chartElement.length) return;
                    const index = chartElement[0].index;
                    const label = chartData.labels[index];
    
                    if (view === "monthly") processDateData(label);
                    else if (view === "date") processMachineData(label);
                    else if (view === "machine") processShiftData(label);
                  },
                  
                }}
              />
            </div>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default ProductionReportPage;