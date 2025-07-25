import React, { useState, useEffect, useMemo } from "react";
import { Container, Row, Col, Table, Button, Card, Navbar, Nav } from "react-bootstrap";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { FaCalendarDay, FaCalendarAlt, FaCalendarWeek, FaChartBar } from "react-icons/fa";
import axios from "axios";
import Files from "../Machine/Files";
import API_BASE_URL from "../config";
// const API_BASE_URL = "http://localhost:5003";


ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const getDateRange = (filter) => {
  const now = new Date();
  let start, end;

  switch (filter) {
    case "Today":
      start = new Date();
      start.setHours(0, 0, 0, 0);
      end = new Date();
      end.setHours(23, 59, 59, 999);
      break;
    case "LastDay":
      start = new Date(now.setDate(now.getDate() - 1));
      start.setHours(0, 0, 0, 0);
      end = new Date(start);
      end.setHours(23, 59, 59, 999);
      break;
    case "Month":
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      break;
    case "Quarter":
      const qStart = now.getMonth() - (now.getMonth() % 3);
      start = new Date(now.getFullYear(), qStart, 1);
      end = new Date(now.getFullYear(), qStart + 3, 0, 23, 59, 59);
      break;
    default:
      start = end = new Date();
  }

  return { start, end };
};

const ReportPage = () => {
  const [filter, setFilter] = useState("Today");
  const [oeeData, setOeeData] = useState([]);
  const [aggregatedData, setAggregatedData] = useState([]);
  const [filterRange, setFilterRange] = useState({ start: null, end: null });
  const [loading, setLoading] = useState(false);
const machine_id = localStorage.getItem("selectedmachine_id");
const machine_name_type = localStorage.getItem("selectedMachineName");

  const fetchOEEData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/oee-logs/bymachineid/${machine_id}`);
      setOeeData(res.data || []);
    } catch (err) {
      console.error("Failed to fetch OEE data", err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = () => {
    const { start, end } = getDateRange(filter);
    setFilterRange({ start: start.toLocaleDateString(), end: end.toLocaleDateString() });

    const filtered = oeeData.filter((item) => {
      const date = new Date(item.createdAt);
      return date >= start && date <= end;
    });

    const grouped = filtered.reduce((acc, item) => {
      const shift = item.shift_no;
      if (!acc[shift]) {
        acc[shift] = {
          shiftNumber: shift,
          totalPartsProduced: 0,
          totalPlannedQty: 0,
          totalDefectiveParts: 0,
          dateRange: { start: item.createdAt, end: item.createdAt },
        };
      }
      acc[shift].totalPartsProduced += parseInt(item.TotalPartsProduced || 0);
      acc[shift].totalPlannedQty += parseInt(item.expectedPartCount || 0);
      acc[shift].totalDefectiveParts += parseInt(item.defectiveParts || 0);
      acc[shift].dateRange.start = new Date(Math.min(new Date(acc[shift].dateRange.start), new Date(item.createdAt)));
      acc[shift].dateRange.end = new Date(Math.max(new Date(acc[shift].dateRange.end), new Date(item.createdAt)));

      return acc;
    }, {});

    setAggregatedData(Object.values(grouped).sort((a, b) => a.shiftNumber - b.shiftNumber));
  };

  useEffect(() => {
    fetchOEEData();
  }, [machine_id]);

  useEffect(() => {
    applyFilter();
  }, [filter, oeeData]);

  const chartData = useMemo(() => ({
    labels: aggregatedData.map((d) => `Shift ${d.shiftNumber}`),
    datasets: [
      {
        label: "Total Parts Produced",
        data: aggregatedData.map((d) => d.totalPartsProduced),
        backgroundColor: "rgba(40, 167, 69, 0.5)",
        borderColor: "rgba(40, 167, 69, 1)",
        borderWidth: 3,
      },
      {
        label: "Planned Quantity",
        data: aggregatedData.map((d) => d.totalPlannedQty),
        backgroundColor: "#009fff",
        borderColor: "#0000b3",
        borderWidth: 3,
      },
      {
        label: "Defective Parts",
        data: aggregatedData.map((d) => d.totalDefectiveParts),
        backgroundColor: "rgba(252, 61, 61, 0.5)",
        borderColor: "rgb(246, 122, 122)",
        borderWidth: 3,
      },
    ],
  }), [aggregatedData]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: { enabled: true },
    },
    scales: {
      x: { title: { display: true, text: "Shifts" } },
      y: { title: { display: true, text: "Count" } },
    },
  };

  const filterButtons = [
    { type: "Today", icon: <FaCalendarDay /> },
    { type: "LastDay", icon: <FaCalendarAlt /> },
    { type: "Month", icon: <FaCalendarWeek /> },
    { type: "Quarter", icon: <FaChartBar /> },
  ];

  return (
    <div className="bg-light p-3 mt-5 shadow-sm rounded">
      <Files />
      <Navbar bg="white" className="shadow-sm rounded mb-3 px-3 py-2">
        <Navbar.Brand className="fw-bold">Production Report {machine_name_type} </Navbar.Brand>
        <Nav className="ms-auto d-flex gap-2">
          {filterButtons.map(({ type, icon }) => (
            <Button
              key={type}
              variant={filter === type ? "outline-primary" : "outline-secondary"}
              className="fw-semibold d-flex align-items-center gap-2"
              onClick={() => setFilter(type)}
            >
              {icon} {type}
            </Button>
          ))}
        </Nav>
      </Navbar>

      <Row className="justify-content-center">
        <Col lg={11}>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <div style={{ height: "350px" }}>
                {loading ? (
                  <div className="d-flex justify-content-center align-items-center" style={{ height: "100%" }}>
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : (
                  <Bar data={chartData} options={chartOptions} />
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Container fluid className="mt-4">
        <p>
          <strong>Filtered Date Range:</strong> {filterRange.start} to {filterRange.end}
        </p>
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-secondary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Shift Number</th>
                <th>Date Range</th>
                <th>Total Parts Produced</th>
                <th>Total Planned Quantity</th>
                <th>Total Defective Parts</th>
              </tr>
            </thead>
            <tbody>
              {aggregatedData.map((d) => (
                <tr key={d.shiftNumber}>
                  <td>{d.shiftNumber}</td>
                  <td>
                    {new Date(d.dateRange.start).toLocaleDateString()} -{" "}
                    {new Date(d.dateRange.end).toLocaleDateString()}
                  </td>
                  <td>{d.totalPartsProduced}</td>
                  <td>{d.totalPlannedQty}</td>
                  <td>{d.totalDefectiveParts}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Container>
    </div>
  );
};

export default ReportPage;
