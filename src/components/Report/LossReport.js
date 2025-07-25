// OEEReportUpdated.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import * as XLSX from "xlsx";
import { Container, Row, Col, Table, Card } from "react-bootstrap";
import API_BASE_URL from "../config";
// const API_BASE_URL = "http://localhost:5003";


Chart.register(...registerables);

const OEEReport = () => {
  const [machineId, setMachineId] = useState("");
  const [machineIds, setMachineIds] = useState([]);
  const [oeeData, setOEEData] = useState([]);
  const [lossData, setLossData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [summary, setSummary] = useState({
    avgOEE: 0,
    avgPartsProduced: 0,
    avgPlannedQty: 0,
    avgMachineRunningHours: 0,
    avgMachineMaintenanceHours: 0,
    totalPartsProduced: 0,
    totalPlannedQty: 0,
    totalDowntime: 0,
    avgdowntimeDuration: 0,
    avgDefectPart: 0,
    avgAvailability: 0,
    avgQuality: 0,
  });

  const daysOfMonth = [...Array(31)].map((_, i) => i + 1);

  useEffect(() => {
    const fetchMachineIds = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/machines/getallmachine`);
        const filtered = res.data.filter((m) => m.status === "Active" || m.status === "ACTIVE");
        setMachineIds(filtered);
        if (filtered.length > 0) {
          setMachineId(filtered[0].machine_id);
        }
      } catch (err) {
        console.error("Error fetching machine IDs:", err);
      }
    };
    fetchMachineIds();
  }, []);

  useEffect(() => {
    if (!machineId) return;
    const fetchData = async () => {
      try {
        const [oeeRes, downtimeRes, rejectionRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/oee-logs`),
          axios.get(`${API_BASE_URL}/api/downtimes`),
          axios.get(`${API_BASE_URL}/api/partrejections`),
        ]);

        const oeeAll = oeeRes.data.filter((d) => d.machine_id === parseInt(machineId));
        const downtimes = downtimeRes.data.filter((d) => d.machine_id === parseInt(machineId));
        const rejections = rejectionRes.data.filter((r) => r.machine_id === parseInt(machineId));

        const oeeMonth = oeeAll.filter(
          (e) => new Date(e.createdAt).getMonth() === selectedMonth
        );

        const downtimeMonth = downtimes.filter(
          (e) => new Date(e.start_timestamp).getMonth() === selectedMonth
        );

        const rejectionMonth = rejections.filter(
          (e) => new Date(e.date).getMonth() === selectedMonth
        );

        const downtimeReasons = [
          { reason: "Unplanned", category: "Unplanned" },
          {
            reason: "Lunch Time - Operator took extra time",
            category: "Breaktime",
          },
          { reason: "Equipment Failure (Breakdown)", category: "Availability" },
          { reason: "Setup & Adjustment Loss", category: "Availability" },
          {
            reason: "Idling & Minor Stoppages (Small Stops)",
            category: "Availability",
          },
          { reason: "Start-Up Losses", category: "Availability" },
          { reason: "Shutdown Losses", category: "Availability" },
          { reason: "Waiting for Parts or Material", category: "Availability" },
          { reason: "Operator Inefficiency", category: "Availability" },
          { reason: "Tool Changeover Time", category: "Availability" },
          { reason: "Speed Loss", category: "Performance" },
          { reason: "Reduced Yield", category: "Performance" },
          { reason: "Operator's Training", category: "Performance" },
          { reason: "Tool Wear & Breakage", category: "Performance" },
          {
            reason: "Machine Cleaning & Maintenance Loss",
            category: "Performance",
          },
          { reason: "Defects and Rework Loss", category: "Quality" },
          { reason: "Process Defects", category: "Quality" },
          { reason: "Material Quality Loss", category: "Quality" },
        ];

        const losses = downtimeReasons.map((loss) => {
          const dailyData = Array(31).fill(0);

          downtimeMonth.forEach((entry) => {
            const d = new Date(entry.start_timestamp);
            const day = d.getDate() - 1;
            if (entry.downtime_reason === loss.reason) {
              dailyData[day] += entry.duration;
            }
          });

          rejectionMonth.forEach((entry) => {
            const d = new Date(entry.date);
            const day = d.getDate() - 1;
            if (entry.rejectionreason === loss.reason) {
              dailyData[day] += entry.quantity;
            }
          });

          return { ...loss, dailyData };
        });

        const totalOEE = oeeMonth.reduce((sum, e) => sum + parseFloat(e.OEE || 0), 0);
        const totalPartsProduced = oeeMonth.reduce((sum, e) => sum + (e.TotalPartsProduced || 0), 0);
        const totalPlannedQty = oeeMonth.reduce((sum, e) => sum + (e.expectedPartCount || 0), 0);
        const totalDowntime = oeeMonth.reduce((sum, e) => sum + (e.downtimeDuration || 0), 0);
        const defectiveParts = oeeMonth.reduce((sum, e) => sum + (e.defectiveParts || 0), 0);
        const totalAvailability = oeeMonth.reduce((sum, e) => sum + parseFloat(e.availability || 0), 0);
        const totalQuality = oeeMonth.reduce((sum, e) => sum + parseFloat(e.quality || 0), 0);

        const avgOEE = totalOEE / oeeMonth.length;
        const avgPartsProduced = totalPartsProduced / oeeMonth.length;
        const avgPlannedQty = totalPlannedQty / oeeMonth.length;
        const avgAvailability = totalAvailability / oeeMonth.length;
        const avgQuality = totalQuality / oeeMonth.length;

        setSummary({
          avgOEE,
          avgPartsProduced,
          avgPlannedQty,
          avgAvailability,
          avgQuality,
          avgdowntimeDuration: totalDowntime / 60,
          avgDefectPart: defectiveParts,
          totalPartsProduced,
          totalPlannedQty,
          totalDowntime,
          avgMachineRunningHours: 0,
          avgMachineMaintenanceHours: 0,
        });

        setOEEData(oeeMonth);
        setLossData(losses);
      } catch (err) {
        console.error("Error fetching OEE data:", err);
      }
    };
    fetchData();
  }, [machineId, selectedMonth]);

  const handleMachineChange = (event) => {
    setMachineId(event.target.value);
  };

  const handleMonthChange = (event) => {
    setSelectedMonth(Number(event.target.value));
  };

  const exportToExcel = () => {
    const table = document.getElementById("oeeTable");
    if (table) {
      const wb = XLSX.utils.table_to_book(table, { sheet: "Sheet1" });
      XLSX.writeFile(wb, "OEE_Report.xlsx");
    }
  };

  const formatDate = (date) => new Date(date).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });

  const getDayStats = (dayIndex) => {
    let oee = 0, availability = 0, quality = 0, totalPartsProduced = 0, plannedQty = 0, downtimeDuration = 0, defectiveParts = 0;
    const filtered = oeeData.filter((e) => new Date(e.createdAt).getDate() === dayIndex + 1);
    filtered.forEach((e) => {
      oee += parseFloat(e.OEE || 0);
      availability += parseFloat(e.availability || 0);
      quality += parseFloat(e.quality || 0);
      totalPartsProduced += e.TotalPartsProduced || 0;
      plannedQty += e.expectedPartCount || 0;
      downtimeDuration += e.downtimeDuration || 0;
      defectiveParts += e.defectiveParts || 0;
    });
    const count = filtered.length;
    if (count > 0) {
      oee /= count;
      availability /= count;
      quality /= count;
    }
    return { oee, availability, quality, totalPartsProduced, plannedQty, downtimeDuration, defectiveParts };
  };

 return (
    <div className="container3 mt-5">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mt-2 mb-2 p-2 border rounded bg-light">
        <div className="fs-4 fw-bold" style={{ color: "#034694" }}>
          OEE Report {machineId}
        </div>
        <div className="d-flex flex-wrap align-items-center justify-content-end gap-2">
          {/* <label htmlFor="machineSelect">Select Machine</label> */}
          <select
            id="machineSelect"
            className="form-control form-control-sm fs-6"
            style={{ width: "150px" }}
            value={machineId}
            onChange={handleMachineChange}
          >
            {machineIds.map((machine) => (
              <option key={machine.machine_id} value={machine.machine_id}>
                {machine.machine_id}
              </option>
            ))}
          </select>
<div>
          <select
            id="monthSelect"
            className="form-control form-control-sm fs-6"
            value={selectedMonth}
            onChange={handleMonthChange}
          >
            <option value={0}>January</option>
            <option value={1}>February</option>
            <option value={2}>March</option>
            <option value={3}>April</option>
            <option value={4}>May</option>
            <option value={5}>June</option>
            <option value={6}>July</option>
            <option value={7}>August</option>
            <option value={8}>September</option>
            <option value={9}>October</option>
            <option value={10}>November</option>
            <option value={11}>December</option>
          </select>
</div>
          <button
            className="btn btn-lg btn-outline-success"
            onClick={exportToExcel}
            title="Export to Excel"
          >
            <i className="fas fa-file-excel"></i>
          </button>
        </div>
      </div>

      {/* OEE Line Chart */}
      <div className="container mt-2">
        <h6 className="text-center">
          OEE Data for{" "}
          {new Date(2021, selectedMonth).toLocaleString("default", {
            month: "long",
          })}
        </h6>
        <Card className="shadow p-3 mb-4">
          <Card.Body>
            <div style={{ height: "400px", width: "100%" }}>
              <Line
                data={{
                  labels: oeeData.map((entry) => formatDate(entry.savedAt)),
                  datasets: [
                    {
                      label: "OEE (%)",
                      data: oeeData.map((entry) => entry.OEE || 0),
                      borderColor: "blue",
                      backgroundColor: "rgba(0, 0, 255, 0.2)",
                      borderWidth: 2,
                      fill: false,
                    },
                    {
                      label: "Availability",
                      data: oeeData.map((entry) => entry.availability || 0),
                      borderColor: "green",
                      backgroundColor: "rgba(6, 135, 25, 0.2)",
                      borderWidth: 2,
                      fill: false,
                    },
                    {
                      label: "quality",
                      data: oeeData.map((entry) => entry.quality || 0),
                      borderColor: "red",
                      backgroundColor: "rgba(199, 45, 7, 0.2)",
                      borderWidth: 2,
                      fill: false,
                    },
                    {
                      label: "performance",
                      data: oeeData.map((entry) => entry.quality || 0),
                      borderColor: "orange",
                      backgroundColor: "rgba(199, 45, 7, 0.2)",
                      borderWidth: 2,
                      fill: false,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    x: {
                      title: {
                        display: true,
                        text: "Date",
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
                  },
                }}
              />
            </div>
          </Card.Body>
        </Card>
      </div>

      {/* Merged Monthly Summary and Loss Table */}
      <div
        className="table-responsive mt-4"
        style={{
          width: "100%",
          height: "700px",
          padding: "1rem",
          overflowY: "",
        }}
      >
        <Table
          id="oeeTable"
          className="table table-bordered table-striped striped bordered hover"
          style={{ width: "100%" }}
        >
          <thead>
            <tr>
              <th style={{ color: "#034694" }}>Machine Name</th>
              <th style={{ color: "#034694" }}>Component</th>
              {/* <th >Line Supervisor</th> */}
              <th style={{ color: "#034694" }} colSpan="3">
                OEE (%)
              </th>
              <th style={{ color: "#034694" }} colSpan="3">
                Actual Production Data
              </th>{" "}
              {/* Merging OEE, Actual Production Qty, and Standard Production Qty into one group */}
              <th style={{ color: "#034694" }} colSpan="3">
                Standard Production Data
              </th>
              <th style={{ color: "#034694" }} colSpan="3">
                Downtime (hr)
              </th>
              <th style={{ color: "#034694" }} colSpan="3">
                Defect Part
              </th>
              <th style={{ color: "#034694" }} colSpan="3">
                Availability (%)
              </th>
              <th style={{ color: "#034694" }} colSpan="3">
                Quality (%)
              </th>
              {/* <th colSpan="3">Defect Part</th> */}
              {/* <th colSpan="3">Machine Running Hrs</th>
                  <th colSpan="3">Machine Maintenance Hrs</th> */}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{machineId}</td>
              <td>{""}</td>
              {/* <td>{""}</td> */}
              <td colSpan="3">{summary.avgOEE.toFixed(2)}%</td>
              <td colSpan="3">{summary.totalPartsProduced}</td>
              <td colSpan="3">{summary.totalPlannedQty}</td>
              <td colSpan="3">{summary.avgdowntimeDuration.toFixed(2)}</td>
              <td colSpan="3">{summary.avgDefectPart}</td>
              <td colSpan="3">{summary.avgAvailability.toFixed(2)}</td>
              <td colSpan="3">{summary.avgQuality.toFixed(2)}</td>
            </tr>
          </tbody>
          <thead
            style={{
              position: "sticky",
              top: 1,
              zIndex: 1020,
            }}
          >
            <tr>
              <th style={{ color: "#034694" }} rowSpan="2">
                Sr. No
              </th>
              <th style={{ color: "#034694" }} rowSpan="2">
                Category
              </th>
              <th style={{ color: "#034694" }} rowSpan="2">
                Loss Name
              </th>
              <th style={{ color: "#034694" }} rowSpan="2">
                Unit of Measurement (UOM)
              </th>
              <th style={{ color: "#034694" }} colSpan="31">
                Days of{" "}
                {new Date(2021, selectedMonth).toLocaleString("default", {
                  month: "long",
                })}
              </th>
            </tr>
            <tr>
              {daysOfMonth.map((_, index) => (
                <th style={{ color: "#034694" }} key={index}>
                  {index + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lossData.map((loss, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{loss.category}</td>
                <td>{loss.reason}</td>
                <td>Minutes</td>
                {loss.dailyData.map((day, dayIndex) => (
                  <td key={dayIndex}>{day}</td>
                ))}
              </tr>
            ))}
          </tbody>

          <tfoot>
            <tr>
              <td colSpan="4">OEE</td>
              {daysOfMonth.map((_, dayIndex) => {
                const { oee } = getDayStats(dayIndex);
                return (
                  <td key={dayIndex}>
                    {oee !== null ? `${oee.toFixed(2)}%` : "..."}
                  </td>
                );
              })}
            </tr>
            <tr>
              <td colSpan="4">Availability</td>
              {daysOfMonth.map((_, dayIndex) => {
                const { availability } = getDayStats(dayIndex);
                return (
                  <td key={dayIndex}>
                    {availability !== null
                      ? `${availability.toFixed(2)}%`
                      : "..."}
                  </td>
                );
              })}
            </tr>
            <tr>
              <td colSpan="4">Quality</td>
              {daysOfMonth.map((_, dayIndex) => {
                const { quality } = getDayStats(dayIndex);
                return (
                  <td key={dayIndex}>
                    {quality !== null ? `${quality.toFixed(2)}%` : "..."}
                  </td>
                );
              })}
            </tr>
            <tr>
              <td colSpan="4">Actual Production Data </td>
              {daysOfMonth.map((_, dayIndex) => {
                const { totalPartsProduced } = getDayStats(dayIndex);
                return <td key={dayIndex}>{totalPartsProduced}</td>;
              })}
            </tr>
            <tr>
              <td colSpan="4">standard Production Data </td>
              {daysOfMonth.map((_, dayIndex) => {
                const { plannedQty } = getDayStats(dayIndex);
                return <td key={dayIndex}>{plannedQty}</td>;
              })}
            </tr>
            <tr>
              <td colSpan="4">Defect Parts </td>
              {daysOfMonth.map((_, dayIndex) => {
                const { defectiveParts } = getDayStats(dayIndex);
                return <td key={dayIndex}>{defectiveParts}</td>;
              })}
            </tr>
            <tr>
              <td colSpan="4">Downtime (min)</td>
              {daysOfMonth.map((_, dayIndex) => {
                const { downtimeDuration } = getDayStats(dayIndex);
                return <td key={dayIndex}>{downtimeDuration}</td>;
              })}
            </tr>
          </tfoot>
        </Table>
        <h6
          className="text-end text-md-center mt-1"
          style={{ color: "red", fontWeight: "bold", fontSize: "px" }}
        >
          {" "}
          Report Generated on OperateX Powered by ThetaVega
        </h6>
      </div>
    </div>
  );
};

export default OEEReport;
