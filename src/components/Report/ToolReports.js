import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import ToolOffsetChart from "./ToolOffset";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
} from "chart.js";
import {
  Row,
  Col,
  Card,
  Container,
  Table,
  Button,
  Form,
} from "react-bootstrap";
// import API_BASE_URL from "../config";
const API_BASE_URL = "http://localhost:5003";


// Register chart components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement
);

const ToolReport = () => {
  const [machines, setMachines] = useState([]); // Store available machine IDs
  const [selectedMachine, setSelectedMachine] = useState(""); // Selected machine ID
  const [toolData, setToolData] = useState([]);
  const [barChartData, setBarChartData] = useState(null);
  const [paretoChartData, setParetoChartData] = useState(null);
  const [noData, setNoData] = useState(false); // Track if no data is available

  // Fetch available machine IDs
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/machines/getallmachine`)
      .then((res) => res.json())
      .then((data) => {
        setMachines(data);
        if (data.length > 0) {
          setSelectedMachine(data[0].machineId); // Set default machine
          localStorage.setItem("selectedMachineId", data[0].machineId); // Store for child components
        }
      })
      .catch((error) => console.error("Error fetching machine IDs:", error));
  }, []);

  // Fetch tool data when selectedMachine changes
  useEffect(() => {
    if (!selectedMachine) return;
    fetch(`${API_BASE_URL}/api/tools/machine/${selectedMachine}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.length === 0) {
          setNoData(true);
          setToolData([]);
          setBarChartData(null);
          setParetoChartData(null);
        } else {
          setNoData(false);
          setToolData(data);
          processData(data);
        }
      })
      .catch((error) => {
        console.error("Error fetching tool data:", error);
        setNoData(true);
      });
  }, [selectedMachine]);

  // Process tool data
  const processData = (data) => {
    const toolCount = {};
    const actualLifeValues = {};
    const setLifeValues = {};

    // Count occurrences of each tool and store life values
    data.forEach((tool) => {
      const key = `${tool.toolNumber} - ${tool.toolName}`;
      toolCount[key] = (toolCount[key] || 0) + 1;
      actualLifeValues[key] = tool.actualLife || 0;
      setLifeValues[key] = tool.setLife || 0;
    });

    // Prepare data for charts
    const labels = Object.keys(toolCount);
    const values = Object.values(toolCount);

    // Sort tools by frequency (Descending Order)
    const sortedTools = labels
      .map((label, index) => ({
        label,
        value: values[index],
        actualLife: actualLifeValues[label],
        setLife: setLifeValues[label],
      }))
      .sort((a, b) => b.value - a.value);

    // Calculate cumulative percentage
    const totalChanges = sortedTools.reduce((sum, tool) => sum + tool.value, 0);
    let cumulativeSum = 0;
    const cumulativePercentage = sortedTools.map((tool) => {
      cumulativeSum += tool.value;
      return (cumulativeSum / totalChanges) * 100;
    });

    // Update Pareto Chart Data
    setParetoChartData({
      labels: sortedTools.map((tool) => tool.label),
      datasets: [
        {
          label: "Tool Change Count",
          data: sortedTools.map((tool) => tool.value),
          backgroundColor: "#3498db",
          type: "line",
          yAxisID: "y",
        },
        // {
        //   label: "Cumulative %",
        //   data: cumulativePercentage,
        //   borderColor: "#e74c3c",
        //   backgroundColor: "#e74c3c",
        //   type: "line",
        //   fill: false,
        //   yAxisID: "y1",
        // },
        {
          label: "Actual Life",
          data: sortedTools.map((tool) => tool.actualLife),
          borderColor: "#2ecc71",
          backgroundColor: "#2ecc71",
          type: "bar",
          fill: false,
          yAxisID: "y1",
        },
        {
          label: "Set Life",
          data: sortedTools.map((tool) => tool.setLife),
          borderColor: "red",
          // borderDash: [5, 5], // Dotted line for Set Life
          type: "line",
          fill: false,
          yAxisID: "y1",
        },
      ],
    });

    // Update Stacked Bar Chart Data
    setBarChartData({
      labels,
      datasets: [
        {
          label: "Tool Change Count",
          data: values,
          backgroundColor: [
            "#3498db",
            "#e74c3c",
            "#2ecc71",
            "#f39c12",
            "#9b59b6",
          ],
        },
      ],
    });
  };

  return (
    <div className="container-fluid  " style={{ marginTop: "3rem" }}>
       <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mt-2 mb-2 p-2 border rounded bg-light">
         <div className="fs-4 fw-bold" style={{ color: "#034694" }}>
         Tool Report
        </div>
        <div className="d-flex flex-wrap align-items-center justify-content-end gap-2">
        <select
              className="form-control"
              style={{ width: "200px" }}
              value={selectedMachine}
              onChange={(e) => {
                setSelectedMachine(e.target.value);
                localStorage.setItem("selectedMachineId", e.target.value); // Update selected machine for child components
              }}
            >
              {machines.map((machine) => (
                 <option key={machine.machine_id} value={machine.machine_name_type}>
                {machine.machine_name_type}
              </option>
              ))}
            </select>


</div>



        
      </div>

      {/* No Data Message */}
      {noData ? (
        <div className="alert alert-warning text-center">
          No tool data for this machine.
        </div>
      ) : (
        <>
         <Container fluid>
  <Row className="mt-4">
    <Col xs={12} md={6}>
      <Card className="shadow p-3 mb-2">
        <Card.Body>
          <h5 className="text-center">Tool Change Analysis</h5>
          {barChartData && (
            <Bar
              data={barChartData}
              height={200}
              options={{
                responsive: true,
                // maintainAspectRatio: false, // Important for height control
                plugins: { legend: { position: 'top' } },
              }}
            />
          )}
        </Card.Body>
      </Card>
    </Col>

    {/* Tool Change Frequency */}
    <Col xs={12} md={6}>
      <Card className="shadow p-3 mb-2" >
        <Card.Body>
          <h5 className="text-center">Tool Change Frequency</h5>
          {paretoChartData && (
            <Bar
              data={paretoChartData}
              height={200}
              options={{
                responsive: true,
                // maintainAspectRatio: false,
                plugins: { legend: { position: 'top' } },
                scales: {
                  y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Tool Change Count' },
                  },
                  y1: {
                    beginAtZero: true,
                    position: 'right',
                    title: {
                      display: true,
                      text: 'Cumulative %, Actual Life & Set Life',
                    },
                    grid: { drawOnChartArea: false },
                  },
                },
              }}
            />
          )}
        </Card.Body>
      </Card>
    </Col>
  </Row>
</Container>


          {/* Tool Offset Charts Section */}
          <div className="mt-2">
            {/* <h5 className="text-center">Tool Offset Data</h5> */}
            <div className="row">
              {toolData.map((tool) => (
                <div className="col-md-6 mb-4" key={tool.toolNumber}>
                  <ToolOffsetChart toolNumber={tool.toolNumber} />
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ToolReport;
