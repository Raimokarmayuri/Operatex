import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import { useNavigate } from "react-router-dom";
// import API_BASE_URL from "../Context/config";
import API_BASE_URL from "../config";

Chart.register(...registerables);

const OEEGraph = () => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  });
    const navigate = useNavigate();
  const [apiData, setApiData] = useState([]); // Raw API data
  const [currentLevel, setCurrentLevel] = useState("machine"); // Current drill-down level
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
 const chartRef = useRef(null);
  // Fetch OEE data from API
  const fetchOEEData = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/oeelog/oee-data`
      );
      const oeeData = response.data.oeeData || [];

      // Group data by machine
      const groupedByMachine = {};
      oeeData.forEach((entry) => {
        if (!groupedByMachine[entry.machineId]) {
          groupedByMachine[entry.machineId] = [];
        }
        groupedByMachine[entry.machineId].push(entry);
      });

      // Prepare initial chart data (machine-wise OEE)
      const machines = Object.keys(groupedByMachine);
      const machineOEE = machines.map((machineId) => {
        const entries = groupedByMachine[machineId];
        return (
          entries.reduce((acc, entry) => acc + entry.OEE, 0) / entries.length
        ).toFixed(2);
      });

      setChartData({
        labels: machines,
        datasets: [
          {
            label: "Average OEE (%) by Machine",
            data: machineOEE,
            backgroundColor: "rgba(0, 123, 255, 0.5)", // Blue
            borderColor: "rgba(0, 123, 255, 1)",
            borderWidth: 3,
          },
        ],
      });

      setApiData(oeeData); // Store raw data
    } catch (error) {
      console.error("Error fetching OEE data:", error);
    }
  };

  useEffect(() => {
    fetchOEEData();
  }, []);

  // Handle bar click to drill down
  const handleBarClick = (e, chartElement) => {
    if (chartElement.length === 0) return;

    const clickedLabel = chartData.labels[chartElement[0].index];

    if (currentLevel === "machine") {
      // Drill down to date-wise data for the selected machine
      setSelectedMachine(clickedLabel);
      const filteredData = apiData.filter(
        (entry) => entry.machineId === clickedLabel
      );

      const dates = [
        ...new Set(
          filteredData.map((entry) =>
            new Date(entry.savedAt).toLocaleDateString("en-GB")
          )
        ),
      ]
      .sort((a, b) => new Date(a.split("/").reverse().join("-")) - new Date(b.split("/").reverse().join("-"))) // Sort dates in ascending order
      .slice(-30); // Take the last 30 dates

      const dateOEE = dates.map((date) => {
        const dateEntries = filteredData.filter(
          (entry) =>
            new Date(entry.savedAt).toLocaleDateString("en-GB") === date
        );
        return (
          dateEntries.reduce((acc, entry) => acc + entry.OEE, 0) /
          dateEntries.length
        ).toFixed(2);
      });

      setChartData({
        labels: dates,
        datasets: [
          {
            label: `OEE (%) for ${clickedLabel}`,
            data: dateOEE,
            backgroundColor: "rgba(40, 167, 69, 0.5)", // Green
            borderColor: "rgba(40, 167, 69, 1)",
            borderWidth: 3,
          },
        ],
      });

      setCurrentLevel("date");
    } else if (currentLevel === "date") {
      // Drill down to shift-wise data for the selected date and machine
      setSelectedDate(clickedLabel);
      const filteredData = apiData.filter(
        (entry) =>
          new Date(entry.savedAt).toLocaleDateString("en-GB") === clickedLabel &&
          entry.machineId === selectedMachine
      );

      const shifts = [
        ...new Set(filteredData.map((entry) => entry.shiftNumber)),
      ];
      const shiftOEE = shifts.map((shift) => {
        const shiftEntries = filteredData.filter(
          (entry) => entry.shiftNumber === shift
        );
        return (
          shiftEntries.reduce((acc, entry) => acc + entry.OEE, 0) /
          shiftEntries.length
        ).toFixed(2);
      });

      setChartData({
        labels: shifts.map((shift) => `Shift ${shift}`),
        datasets: [
          {
            label: `OEE (%) for ${selectedDate} (${selectedMachine})`,
            data: shiftOEE,
            backgroundColor: "rgba(220, 53, 69, 0.5)", // Red
            borderColor: "rgba(220, 53, 69, 1)",
            borderWidth: 3,
          },
        ],
      });

      setCurrentLevel("shift");
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  // Reset chart to machine-wise data
  const handleReset = () => {
    setCurrentLevel("machine");
    setSelectedMachine(null);
    setSelectedDate(null);
    fetchOEEData();
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
    <div className="container-fluid p-4 mt-5">
      <div className="row mb-4">
        <div className="col-12 text-center">
          <h3
            className="text-center"
            style={{ color: "red", fontWeight: "bold", fontSize: "26px" }}
          >
            OEE Report
          </h3>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-12 text-start">
          <button className="btn btn-primary me-2" title="Back" onClick={handleBack}>
          <i className="fas fa-arrow-left"></i>
          </button>
          <button className="btn btn-primary ml-2 me-2" title="Reset Filters" onClick={handleReset}>
          <i className="fas fa-sync-alt"></i>
          </button>
          <button
            className="btn btn-primary ml-2 "
            onClick={handleDownloadChart} title="Download Chart"
          >
            <i className="fas fa-download"></i> 
            
          </button>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-12">
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
                        currentLevel === "machine"
                          ? "Machines"
                          : currentLevel === "date"
                          ? "Dates"
                          : "Shifts",
                    },
                  },
                  y: {
                    title: {
                      display: true,
                      text: "OEE (%)",
                    },
                    min: 0,
                    max: 100,
                  },
                },
                plugins: {
                  legend: {
                    position: "top",
                  },
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
                onClick: handleBarClick,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OEEGraph;


