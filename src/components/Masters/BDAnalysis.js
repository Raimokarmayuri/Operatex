// BreakdownForm.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import * as XLSX from "xlsx";
import { BsPencil, BsTrash } from "react-icons/bs";
import API_BASE_URL from "../config";
// const API_BASE_URL = "http://localhost:5003";


const BreakdownForm = () => {
  const [breakdowns, setBreakdowns] = useState([]);
  const [filteredBreakdowns, setFilteredBreakdowns] = useState([]);
  const [machineIds, setMachineIds] = useState([]);
  const [selectedMachineId, setSelectedMachineId] = useState(null);
  const [mttr, setMTTR] = useState({});
  const [mtbf, setMTBF] = useState({});
  const [breakdownDurations, setBreakdownDurations] = useState({});

  useEffect(() => {
    fetchBreakdowns();
    fetchMachineData();
  }, []);

  const fetchBreakdowns = async () => {
    try {
      const [breakdownRes, shiftRes, userRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/breakdown`),
        axios.get(`${API_BASE_URL}/api/shifts`),
        axios.get(`${API_BASE_URL}/api/users`),
      ]);

      const breakdownData = breakdownRes.data;
      const shiftData = shiftRes.data;
      const users = userRes.data;

      const processed = breakdownData.map((bd) => {
        const startTime = new Date(bd.breakdown_start);
        const endTime = new Date(bd.breakdown_end);

        const durationMs = endTime - startTime;
        const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
        const durationMinutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
        const formattedDuration = `${durationHours}h ${durationMinutes}m`;

        const shift = shiftData.find((s) => s.shift_no === bd.shift_no);
        const shiftName = shift ? shift.shift_name : "N/A";

        const technician = users.find((u) => u.full_name === bd.assigned_technician);
        const technicianName = technician ? technician.full_name : bd.assigned_technician;

        return {
          ...bd,
          startTime: startTime.toLocaleString(),
          endTime: endTime.toLocaleString(),
          duration: formattedDuration,
          shiftName,
          technicianName,
        };
      });

      const sorted = processed.sort(
        (a, b) => new Date(a.breakdown_start) - new Date(b.breakdown_start)
      );

      setBreakdowns(sorted);
      setFilteredBreakdowns(sorted);
      calculateMTTR_MTBF(sorted);
    } catch (err) {
      console.error("Error loading breakdown data:", err);
    }
  };

  const calculateMTTR_MTBF = (data) => {
    let machineData = {};

    data.forEach((bd) => {
      const { machine_id, breakdown_start, breakdown_end } = bd;
      if (!machineData[machine_id]) {
        machineData[machine_id] = {
          totalRepairTime: 0,
          failureCount: 0,
          totalUptime: 0,
          previousEnd: null,
          totalBreakdownDuration: 0,
        };
      }

      const start = new Date(breakdown_start);
      const end = new Date(breakdown_end);
      const durationHrs = (end - start) / (1000 * 60 * 60);

      machineData[machine_id].totalRepairTime += durationHrs;
      machineData[machine_id].totalBreakdownDuration += durationHrs;
      machineData[machine_id].failureCount++;

      if (machineData[machine_id].previousEnd) {
        const uptime = (start - machineData[machine_id].previousEnd) / (1000 * 60 * 60);
        if (uptime > 0) {
          machineData[machine_id].totalUptime += uptime;
        }
      }

      machineData[machine_id].previousEnd = end;
    });

    let mttrVals = {}, mtbfVals = {}, bdDurationVals = {};

    Object.keys(machineData).forEach((mid) => {
      const d = machineData[mid];
      mttrVals[mid] = d.failureCount > 0 ? (d.totalRepairTime / d.failureCount).toFixed(2) : "N/A";
      mtbfVals[mid] = d.failureCount > 1 ? (d.totalUptime / (d.failureCount - 1)).toFixed(2) : "N/A";
      bdDurationVals[mid] = d.totalBreakdownDuration.toFixed(2);
    });

    setMTTR(mttrVals);
    setMTBF(mtbfVals);
    setBreakdownDurations(bdDurationVals);
  };

  const fetchMachineData = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/machines/getallmachine`);
      const options = res.data.map((m) => ({ value: m.machineId, label: m.machineId }));
      setMachineIds(options);
    } catch (err) {
      console.error("Machine fetch error", err);
    }
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredBreakdowns);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Breakdowns");
    XLSX.writeFile(wb, "Breakdown_Report.xlsx");
  };

  return (
    <div className="p-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5>Breakdown Report</h5>
        <div className="d-flex gap-2">
          <Select options={machineIds} value={selectedMachineId} onChange={setSelectedMachineId} placeholder="Select Machine ID" isClearable />
          <button className="btn btn-sm btn-outline-primary" onClick={exportToExcel}>Export Excel</button>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-bordered table-hover">
          <thead className="table-light">
            <tr>
              <th>Machine ID</th>
              <th>Breakdown Reason</th>
              <th>Failure Count</th>
              <th>Total Duration (hrs)</th>
              <th>MTTR (hrs)</th>
              <th>MTBF (hrs)</th>
              <th>Technician</th>
              <th>Shift</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(mttr).length > 0 ? (
              Object.keys(mttr)
                .filter((mid) => !selectedMachineId || parseInt(mid) === selectedMachineId.value)
                .map((mid) => {
                  const b = filteredBreakdowns.find((d) => d.machine_id === parseInt(mid));
                  return (
                    <tr key={mid}>
                      <td>{mid}</td>
                      <td>{b?.breakdown_reason || "-"}</td>
                      <td>{filteredBreakdowns.filter((x) => x.machine_id === parseInt(mid)).length}</td>
                      <td>{breakdownDurations[mid]}</td>
                      <td>{mttr[mid]}</td>
                      <td>{mtbf[mid]}</td>
                      <td>{b?.technicianName || "-"}</td>
                      <td>{b?.shiftName || "-"}</td>
                      <td>{b?.status || "-"}</td>
                    </tr>
                  );
                })
            ) : (
              <tr>
                <td colSpan="9" className="text-center">No data</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BreakdownForm;