

// import React, { useState, useEffect } from "react";
// import { Row, Col, Card, Table, Button } from "react-bootstrap";
// import ReactApexChart from "react-apexcharts";
// import axios from "axios";
// import { useParams } from "react-router-dom";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import Files from "../Machine/Files";
// import API_BASE_URL from "../config";
// // const API_BASE_URL = "http://localhost:5003";



// const MachineDetails = () => {
//   const { machine_id: urlMachineId } = useParams();
//   // const storedMachineId = localStorage.getItem("selectedMachineId");
// const machine_id = localStorage.getItem("selectedmachine_id");
// const machine_name_type = localStorage.getItem("selectedMachineName");

//   const [machineId, setMachineId] = useState(urlMachineId);
//   const [selectedMachine, setSelectedMachine] = useState(machine_id);
//   const [alertQueue, setAlertQueue] = useState([]);
//   const [isAlertVisible, setIsAlertVisible] = useState(false);
//   const [chartData, setChartData] = useState({
//     series: [
//       { name: "Actual Life", data: [] },
//       { name: "Set Life", data: [] },
//     ],
//     options: {
//       chart: { type: "bar", height: 330 },
//       plotOptions: {
//         bar: { horizontal: false, columnWidth: "55%", endingShape: "rounded" },
//       },
//       dataLabels: { enabled: false },
//       stroke: { show: true, width: 2, colors: ["transparent"] },
//       xaxis: { categories: [] },
//       yaxis: { title: { text: "Life" } },
//       fill: { opacity: 1 },
//       tooltip: {
//         y: { formatter: (val) => `${val} ` },
//       },
//     },
//   });
//   const [tableData, setTableData] = useState([]);

//   useEffect(() => {
//     if (machine_id) {
//       localStorage.setItem("selectedMachineId", machine_id);
//       fetchMachineData(machine_id);
//     }
//   }, [machine_id]);

//   const fetchMachineData = async (machine_id) => {
//     if (!machine_id) return;
//     try {
//       const response = await axios.get(`${API_BASE_URL}/api/tools/withlog/${machine_id}`);
//       const tools = response.data;

//       if (!Array.isArray(tools) || tools.length === 0) {
//         setTableData([]);
//         setChartData({
//           ...chartData,
//           series: [
//             { name: "Actual Life", data: [] },
//             { name: "Set Life", data: [] },
//           ],
//           options: { ...chartData.options, xaxis: { categories: [] } },
//         });
//         return;
//       }

//       const newAlerts = tools.filter(tool =>
//         Number(tool.tool_usage_counter) >= Number(tool.tool_life_limit) * 0.9
//       );
//       setAlertQueue(newAlerts);

//       const categories = tools.map(tool => `${tool.tool_number} - ${tool.tool_name}`);
//       const usage = tools.map(tool => Number(tool.tool_usage_counter));
//       const limits = tools.map(tool => Number(tool.tool_life_limit));

//       setChartData({
//         series: [
//           { name: "Actual Life", data: usage },
//           { name: "Set Life", data: limits },
//         ],
//         options: { ...chartData.options, xaxis: { categories } },
//       });

//       setTableData(tools);
//     } catch (error) {
//       toast.error("Failed to fetch tool data!");
//     }
//   };

//   const processAlerts = () => {
//     if (alertQueue.length === 0 || isAlertVisible) return;

//     const tool = alertQueue[0];
//     setIsAlertVisible(true);

//     toast.warn(
//       <div style={customAlertStyle}>
//         <h6 style={headerStyle}>
//           Tool Life Warning: <strong>{tool.machine_id}</strong>
//         </h6>
//         <p style={contentStyle}>
//           Tool <strong>{tool.tool_number}</strong> (
//           <strong>{tool.tool_name}</strong>) is approaching its set life (
//           <strong>{tool.tool_life_limit}</strong>). Actual Life:{" "}
//           <strong>{tool.tool_usage_counter}</strong>
//         </p>
//       </div>,
//       {
//         autoClose: 5000,
//         closeOnClick: true,
//         onClose: () => {
//           setIsAlertVisible(false);
//           setAlertQueue((prevQueue) => prevQueue.slice(1)); // Remove the first item
//         },
//       }
//     );
//   };

//   useEffect(() => {
//     if (alertQueue.length > 0 && !isAlertVisible) {
//       processAlerts();
//     }
//   }, [alertQueue, isAlertVisible]);

//   const customAlertStyle = {
//     padding: "10px",
//     backgroundColor: "#FFB921",
//     boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
//     marginBottom: "10px",
//     fontFamily: "Monserat, sans-serif",
//   };

//   const headerStyle = {
//     margin: "0",
//     fontSize: "1rem",
//   };

//   const contentStyle = {
//     margin: "5px 0",
//     fontSize: "0.875rem",
//   };

//   return (
//     <div className="bg-light" style={{ padding: "20px", marginTop: "60px" }}>
//       <Files />
//       <ToastContainer />
//       <Row className="justify-content-center mt-3 mb-3">
//         <Col lg={11}>
//           <Card className="shadow-sm border-1">
//             <Card.Header className="text-center fw-bold fs-6" style={{ color: "#034694" }}>
//               Tool Life Chart for {machine_name_type}
//             </Card.Header>
//             <Card.Body className="text-center">
//               {tableData.length === 0 ? (
//                 <h5 className="text-danger">No tool data available</h5>
//               ) : (
//                 <div style={{ height: "330px" }}>
//                   <ReactApexChart
//                     options={chartData.options}
//                     series={chartData.series}
//                     type="bar"
//                     height={350}
//                   />
//                 </div>
//               )}
//             </Card.Body>
//           </Card>
//         </Col>
//       </Row>

//       <Row>
//         <Col>
//           <Card className="shadow-sm border-1">
//             <Card.Header className="text-center fw-bold fs-6" style={{ color: "#034694" }}>
//               Tool Life Details Table
//             </Card.Header>
//             <Card.Body>
//               <Table striped bordered hover responsive style={{ fontSize: "0.9rem", lineHeight: "1.2" }}>
//                 <thead className="table-light" style={{ position: "sticky", top: 1, zIndex: 1020 }}>
//                   <tr>
//                     <th style={{ color: "#034694" }}>Machine ID</th>
//                     <th style={{ color: "#034694" }}>Tool Number</th>
//                     <th style={{ color: "#034694" }}>Tool Name</th>
//                     <th style={{ color: "#034694" }}>Set Life</th>
//                     <th style={{ color: "#034694" }}>Actual Life</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {tableData.map((tool, index) => (
//                     <tr key={index}>
//                       <td>{tool.machine_id}</td>
//                       <td>{tool.tool_number}</td>
//                       <td>{tool.tool_name}</td>
//                       <td>{tool.tool_life_limit}</td>
//                       <td>{tool.tool_usage_counter}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </Table>
//             </Card.Body>
//           </Card>
//         </Col>
//       </Row>
//     </div>
//   );
// };

// export default MachineDetails;

import React, { useState, useEffect } from "react";
import { Row, Col, Card, Table, Button, Modal, Form } from "react-bootstrap";
import ReactApexChart from "react-apexcharts";
import axios from "axios";
import { useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// import Files from "../";
import Files from "../Machine/Files";

import API_BASE_URL from "../config";

const MachineDetails = () => {
  const { machineId: urlMachineId } = useParams();
  const storedMachineId = localStorage.getItem("selectedMachineId");
  const [machineId, setMachineId] = useState(urlMachineId || storedMachineId || "");
  const [selectedMachine, setSelectedMachine] = useState(machineId);
  const [alertQueue, setAlertQueue] = useState([]);
  const [isAlertVisible, setIsAlertVisible] = useState(false);
  const [tools, setTools] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedTool, setSelectedTool] = useState(null);
  const [formData, setFormData] = useState({
    cycle_count: "",
    remaining_life_pct: "",
    tool_wear_pct: "",
    replacement_date: "",
    reason: "",
  });

  const [chartData, setChartData] = useState({
    series: [
      { name: "Actual Life", data: [] },
      { name: "Set Life", data: [] },
    ],
    options: {
      chart: { type: "bar", height: 330 },
      plotOptions: {
        bar: { horizontal: false, columnWidth: "55%", endingShape: "rounded" },
      },
      dataLabels: { enabled: false },
      stroke: { show: true, width: 2, colors: ["transparent"] },
      xaxis: { categories: [] },
      yaxis: { title: { text: "Life" } },
      fill: { opacity: 1 },
      tooltip: {
        y: { formatter: (val) => `${val} ` },
      },
    },
  });

  useEffect(() => {
    if (machineId) {
      localStorage.setItem("selectedMachineId", machineId);
      fetchMachineData(machineId);
      fetchThresholdTools(machineId);
    }
  }, [machineId]);

  const fetchMachineData = async (machineId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/tools/getToolByMachine/${machineId}`);
      const tools = response.data;

      const newAlerts = tools.filter(tool =>
        Number(tool.tool_usage_counter) >= Number(tool.tool_life_limit) * 0.9
      );
      setAlertQueue(newAlerts);

      const categories = tools.map(tool => `${tool.tool_number} - ${tool.tool_name}`);
      const usage = tools.map(tool => Number(tool.tool_usage_counter));
      const limits = tools.map(tool => Number(tool.tool_life_limit));

      setChartData({
        series: [
          { name: "Actual Life", data: usage },
          { name: "Set Life", data: limits },
        ],
        options: { ...chartData.options, xaxis: { categories } },
      });
    } catch (error) {
      toast.error("Failed to fetch tool data!");
    }
  };

  const fetchThresholdTools = async (machineId) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/tools/above-threshold/${machineId}`);
      setTools(res.data);
    } catch (error) {
      console.error("Error fetching tools:", error);
    }
  };

  const handleToolChangeClick = (tool) => {
    setSelectedTool(tool);
    setFormData({
      cycle_count: "",
      remaining_life_pct: "",
      tool_wear_pct: "",
      replacement_date: "",
      reason: "",
    });
    setShowModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!selectedTool) return;
    const payload = {
      tool_id: selectedTool.tool_id,
      machine_id: selectedTool.machine_id,
      part_id: selectedTool.part_id,
      replaced: true,
      ...formData,
    };

    try {
      await axios.post(`${API_BASE_URL}/api/tool-log`, payload);
      await axios.put(`${API_BASE_URL}/api/tools/reset-usage/${selectedTool.tool_id}`);
      toast.success("Tool log saved and usage counter reset!");
      setShowModal(false);
      fetchThresholdTools(machineId);
    } catch (error) {
      toast.error("Failed to save tool log.");
    }
  };

  const processAlerts = () => {
    if (alertQueue.length === 0 || isAlertVisible) return;

    const tool = alertQueue[0];
    setIsAlertVisible(true);

    toast.warn(
      <div style={customAlertStyle}>
        <h6 style={headerStyle}>
          Tool Life Warning: <strong>{tool.machine_id}</strong>
        </h6>
        <p style={contentStyle}>
          Tool <strong>{tool.tool_number}</strong> (
          <strong>{tool.tool_name}</strong>) is approaching its set life (
          <strong>{tool.tool_life_limit}</strong>). Actual Life:{" "}
          <strong>{tool.tool_usage_counter}</strong>
        </p>
      </div>,
      {
        autoClose: 5000,
        closeOnClick: true,
        onClose: () => {
          setIsAlertVisible(false);
          setAlertQueue((prevQueue) => prevQueue.slice(1));
        },
      }
    );
  };

  useEffect(() => {
    if (alertQueue.length > 0 && !isAlertVisible) {
      processAlerts();
    }
  }, [alertQueue, isAlertVisible]);

  const customAlertStyle = {
    padding: "10px",
    backgroundColor: "#FFB921",
    boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
    marginBottom: "10px",
    fontFamily: "Monserat, sans-serif",
  };

  const headerStyle = { margin: "0", fontSize: "1rem" };
  const contentStyle = { margin: "5px 0", fontSize: "0.875rem" };

  return (
    <div className="bg-light" style={{ padding: "20px", marginTop: "60px" }}>
      <Files />
      <ToastContainer />
      <Row className="justify-content-center mt-3 mb-3">
        <Col lg={11}>
          <Card className="shadow-sm border-1">
            <Card.Header className="text-center fw-bold fs-6" style={{ color: "#034694" }}>
              Tool Life Chart for Machine {selectedMachine}
            </Card.Header>
            <Card.Body className="text-center">
              {chartData.series[0].data.length === 0 ? (
                <h5 className="text-danger">No tool data available</h5>
              ) : (
                <div style={{ height: "330px" }}>
                  <ReactApexChart
                    options={chartData.options}
                    series={chartData.series}
                    type="bar"
                    height={350}
                  />
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card className=" border-1">
            <Card.Header className="text-start fw-bold fs-5" style={{ color: "#034694" }}>
              Tools Near End of Life (Machine ID: {machineId})
            </Card.Header>
            <Card.Body>
              {tools.length === 0 ? (
                <p>No tools found.</p>
              ) : (
                <Table striped bordered hover responsive className="shadow-sm">
                  <thead className="table">
                    <tr>
                      <th style={{ color: "#034694" }}>Tool Name</th>
                      <th style={{ color: "#034694" }}>Tool Type</th>
                      <th style={{ color: "#034694" }}>Tool Life Limit</th>
                      <th style={{ color: "#034694" }}>Tool Usage Counter</th>
                      <th style={{ color: "#034694" }}>Tool Change Threshold</th>
                      <th style={{ color: "#034694" }}>Actions</th>

                    </tr>
                  </thead>
                  <tbody>
                    {tools.map((tool) => (
                      <tr key={tool.tool_id}>
                        <td>{tool.tool_name}</td>
                        <td>{tool.tool_type}</td>
                        <td>{tool.tool_life_limit}</td>
                        <td>{tool.tool_usage_counter}</td>
                        <td>{tool.tool_change_threshold}</td>
                        <td>
                          <Button variant="warning" size="sm" onClick={() => handleToolChangeClick(tool)}>
                            Tool Change
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Tool Change Form</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group><Form.Label>Tool ID</Form.Label>
              <Form.Control value={selectedTool?.tool_id || ""} disabled />
            </Form.Group>
            <Form.Group><Form.Label>Machine ID</Form.Label>
              <Form.Control value={selectedTool?.machine_id || ""} disabled />
            </Form.Group>
            <Form.Group><Form.Label>Part ID</Form.Label>
              <Form.Control value={selectedTool?.part_id || ""} disabled />
            </Form.Group>
            <Form.Group><Form.Label>Cycle Count</Form.Label>
              <Form.Control type="number" name="cycle_count" value={formData.cycle_count} onChange={handleFormChange} />
            </Form.Group>
            <Form.Group><Form.Label>Remaining Life (%)</Form.Label>
              <Form.Control type="number" step="0.01" name="remaining_life_pct" value={formData.remaining_life_pct} onChange={handleFormChange} />
            </Form.Group>
            <Form.Group><Form.Label>Tool Wear (%)</Form.Label>
              <Form.Control type="number" step="0.01" name="tool_wear_pct" value={formData.tool_wear_pct} onChange={handleFormChange} />
            </Form.Group>
            <Form.Group><Form.Label>Replacement Date</Form.Label>
              <Form.Control type="date" name="replacement_date" value={formData.replacement_date} onChange={handleFormChange} />
            </Form.Group>
            <Form.Group><Form.Label>Reason</Form.Label>
              <Form.Control type="text" name="reason" value={formData.reason} onChange={handleFormChange} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit}>Save Tool Log</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default MachineDetails;
