import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import { Bar, Pie } from "react-chartjs-2";
import axios from "axios";
import BreakdownTable from "../View/BreakdowntimeRaise";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import API_BASE_URL from "../../config";

// Register Chart.js components
ChartJS.register(BarElement, CategoryScale, LinearScale, ArcElement, Tooltip, Legend);

const Breakdown = () => {
  const [breakdownData, setBreakdownData] = useState([]);
  const [originalBreakdownData, setOriginalBreakdownData] = useState([]);
  const [filteredBreakdowns, setFilteredBreakdowns] = useState([]);
  const [chartLabels, setChartLabels] = useState([]);
  const [chartDataSets, setChartDataSets] = useState([]);
  const [reasonBreakdownCounts, setReasonBreakdownCounts] = useState({});
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedMachine, setSelectedMachine] = useState(null);

  useEffect(() => {
    fetchBreakdownData();
  }, []);

  const fetchBreakdownData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/breakdowns`);
      const data = response.data;

      const monthlyHours = Array(12).fill(0);
      const reasonCounts = {};

      data.forEach((breakdown) => {
        const startTime = new Date(breakdown.breakdownStartDateTime);
        const endTime = new Date(breakdown.breakdownEndDateTime);
        const durationHours = (endTime - startTime) / (1000 * 60 * 60);

        if (!isNaN(durationHours) && durationHours > 0) {
          monthlyHours[startTime.getMonth()] += durationHours;
        }

        const reason = breakdown.breakdownType || "Other";
        reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
      });

      setChartLabels([
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ]);
      setChartDataSets([
        {
          label: "Breakdown Hours",
          data: monthlyHours,
          backgroundColor: "#009fff", // Green
          borderColor: "#0000b3", // Green
          borderWidth: 3,
        },
      ]);
      setReasonBreakdownCounts(reasonCounts);
      setBreakdownData(data);
      setOriginalBreakdownData(data);
      setFilteredBreakdowns(data);
    } catch (error) {
      console.error("Error fetching breakdown data:", error);
    }
  };

  const handleBarClick = (event, elements) => {
    if (elements.length > 0) {
      const clickedIndex = elements[0].index;

      if (selectedMonth === null) {
        setSelectedMonth(clickedIndex);
        filterBreakdownsByMonth(clickedIndex);
      } else if (selectedMachine === null) {
        const machineIds = Object.keys(chartDataSets[0].data);
        const clickedMachineId = chartLabels[clickedIndex];
        setSelectedMachine(clickedMachineId);
        filterBreakdownsByMachine(clickedMachineId);
      }
      else {
        const clickedDate = chartLabels[clickedIndex];
        filterBreakdownsByDate(clickedDate);
      }
    }
  };

  const filterBreakdownsByDate = (date) => {
    // Filter data for the selected machine and date
    const filteredData = originalBreakdownData.filter(
      (breakdown) =>
        breakdown.machineId === selectedMachine &&
        new Date(breakdown.breakdownStartDateTime).toISOString().split("T")[0] === date
    );
  
    console.log("Filtered Data for Date:", date, filteredData);
  
    if (filteredData.length === 0) {
      console.log("No breakdown data found for the selected date:", date);
      return;
    }
  
    const shiftWiseData = {};
    const reasonCounts = {};
  
    filteredData.forEach((breakdown) => {
      const shift = breakdown.shift || "Unknown Shift";
  
      // Group by shifts
      if (!shiftWiseData[shift]) {
        shiftWiseData[shift] = 0;
      }
      shiftWiseData[shift] +=
        (new Date(breakdown.breakdownEndDateTime) - new Date(breakdown.breakdownStartDateTime)) /
        (1000 * 60 * 60); // Convert milliseconds to hours
  
      // Count reasons
      const reason = breakdown.breakdownType || "Other";
      reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
    });
  
    console.log("Shift-Wise Data:", shiftWiseData);
  
    // Update bar chart data for shift-wise view
    setChartLabels(Object.keys(shiftWiseData).map((shift) => `Shift ${shift}`));
    setChartDataSets([
      {
        label: `Breakdown Hours - ${date}`,
        data: Object.values(shiftWiseData).map((val) => val.toFixed(2)),
        backgroundColor: "#009fff", // Bar color
        borderColor: "#0000b3", // Border color
        borderWidth: 3,
      },
    ]);
  };
  
  

  const filterBreakdownsByMonth = (monthIndex) => {
    const filteredData = originalBreakdownData.filter((breakdown) => {
      const breakdownDate = new Date(breakdown.breakdownStartDateTime);
      return breakdownDate.getMonth() === monthIndex;
    });

    const reasonCounts = {};
    const machineWiseData = {};

    filteredData.forEach((breakdown) => {
      const reason = breakdown.breakdownType || "Other";
      reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;

      const machineId = breakdown.machineId;
      if (!machineWiseData[machineId]) {
        machineWiseData[machineId] = 0;
      }
      machineWiseData[machineId] +=
        (new Date(breakdown.breakdownEndDateTime) - new Date(breakdown.breakdownStartDateTime)) /
        (1000 * 60 * 60);
    });

    setFilteredBreakdowns(filteredData);
    setReasonBreakdownCounts(reasonCounts);
    setChartLabels(Object.keys(machineWiseData));
    setChartDataSets([
      {
        label: `Breakdown Hours - ${chartLabels[monthIndex]}`,
        data: Object.values(machineWiseData),
        backgroundColor: Object.keys(machineWiseData).map(
          (_, index) => `hsl(${index * 50}, 70%, 60%)`  // Lighter shade for the background
        ),
        borderColor: Object.keys(machineWiseData).map(
          (_, index) => `hsl(${index * 50}, 60%, 40%)`  // Darker shade for the border
        ),
        borderWidth: 2, // Set the border width to make the borders visible
      },
    ]);
  };

  const filterBreakdownsByMachine = (machineId) => {
    const filteredData = originalBreakdownData.filter(
      (breakdown) => breakdown.machineId === machineId && 
      new Date(breakdown.breakdownStartDateTime).getMonth() === selectedMonth
    );

    const dateWiseData = {};

    filteredData.forEach((breakdown) => {
      const breakdownDate = new Date(breakdown.breakdownStartDateTime)
        .toISOString()
        .split("T")[0];

      if (!dateWiseData[breakdownDate]) {
        dateWiseData[breakdownDate] = 0;
      }
      dateWiseData[breakdownDate] +=
        (new Date(breakdown.breakdownEndDateTime) - new Date(breakdown.breakdownStartDateTime)) /
        (1000 * 60 * 60);
    });

    setChartLabels(Object.keys(dateWiseData));
    setChartDataSets([
      {
        label: `Breakdown Hours - ${machineId} in ${chartLabels[selectedMonth]}`,
        data: Object.values(dateWiseData),
        backgroundColor: "#009fff", // Green
        borderColor: "#0000b3", // Green
        borderWidth: 3,
      },
    ]);
  };

  const resetChart = () => {
    if (selectedMachine !== null) {
      // If a machine is selected, go back to month-level view
      setSelectedMachine(null);
      filterBreakdownsByMonth(selectedMonth);
    } else if (selectedMonth !== null) {
      // If a month is selected, go back to full year view
      setSelectedMonth(null);
      fetchBreakdownData(); // Reset to original monthly breakdown data
    } else {
      // If already at full year view, reset everything
      fetchBreakdownData();
    }
  };
  

  const barChartData = {
    labels: chartLabels,
    datasets: chartDataSets,
  };

  const pieChartData = {
    labels: Object.keys(reasonBreakdownCounts),
    datasets: [
      {
        data: Object.values(reasonBreakdownCounts),
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"],
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom" },
    },
    animation: {
      onComplete: ({ chart }) => {
        const ctx = chart.ctx;
        ctx.font = "bold 12px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#000"; // Set text color to black
  
        chart.data.datasets.forEach((dataset, datasetIndex) => {
          const meta = chart.getDatasetMeta(datasetIndex); // Get metadata for dataset
          meta.data.forEach((arc, index) => {
            const value = dataset.data[index];
            if (value !== null && value !== undefined) {
              const position = arc.tooltipPosition(); // Get the tooltip position
              ctx.fillText(
                value.toLocaleString(), // Format value with commas
                position.x,
                position.y // Adjust label position inside the slice
              );
            }
          });
        });
      },
    },
  };


  return (
    <div
      className="mb-5"
      style={{
        backgroundColor: "white",
        maxWidth: "100%",
        borderRadius: "8px",
        padding: "0px",
        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
        // marginTop: "3.7rem",
        height: "auto",
        fontFamily: "Montserrat, sans-serif",
      }}
    >
      <h3
        className="text-center text-md-center"
        style={{ color: "red", fontWeight: "bold", fontSize: "26px" }}
      >
        Breakdown Report
      </h3>
      <Container fluid>
        <Row>
          <Col xs={12} md={7}>
            <Card className="shadow mt-3 ms-2">
              <Card.Body>
                <h5 className="text-center text-success">
                  {selectedMachine !== null
                    ? `Breakdown Hours by Date - Machine ${selectedMachine}`
                    : selectedMonth !== null
                    ? "Breakdown Hours by Machine"
                    : "Breakdown Hours by Month"}
                </h5>
                <div style={{ height: "300px", width: "100%" }}>
                  <Bar data={barChartData} 
                  options={{
                     onClick: handleBarClick,
                     responsive: true,
                     maintainAspectRatio: false,
                     scales: {
                       x: {
                         title: {
                           display: true,
                          //  text: "Shifts",
                           font: {
                             size: 14,
                             weight: "bold",
                           },
                         },
                       },
                       y: {
                         title: {
                           display: true,
                           text: "Count",
                           font: {
                             size: 14,
                             weight: "bold",
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
                       onComplete: ({ chart }) => {
                         const ctx = chart.ctx; // Correctly access the canvas context
                         ctx.font = "bold 12px Arial";
                         ctx.textAlign = "center";
                         ctx.textBaseline = "bottom";
                         ctx.fillStyle = "#000"; // Black text color
                         chart.data.datasets.forEach((dataset, datasetIndex) => {
                           const meta = chart.getDatasetMeta(datasetIndex); // Get metadata for the dataset
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
                      }} />
                </div>
                {(selectedMonth !== null || selectedMachine !== null) && (
                 <button className="btn btn-secondary mt-3 w-100" onClick={resetChart}>
                 {selectedMachine !== null
                   ? "Back to Machine View"
                   : selectedMonth !== null
                   ? "Back to Monthly View"
                   : "Reset Chart"}
               </button>
                )}
              </Card.Body>
            </Card>
          </Col>

          <Col xs={12} md={5}>
            <Card className="shadow mt-3">
              <Card.Body>
                <h5 className="text-center text-danger">Breakdown Type</h5>
                <div style={{ height: "300px", width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ height: "300px", width: "100%" }}>
                    <Pie
                      data={pieChartData}
                      options={options}
                    />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row>
          <Col>
            <BreakdownTable data={filteredBreakdowns} />
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Breakdown;
