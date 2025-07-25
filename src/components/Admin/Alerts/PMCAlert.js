import React, { useEffect, useState } from "react";
import { Container, Table, Form, Button } from "react-bootstrap";
import axios from "axios";
import * as XLSX from "xlsx";
import { FaFileExcel, FaSyncAlt, FaCalendarDay } from "react-icons/fa";
import API_BASE_URL from "../../config";

const PMCAlerts = () => {
  const [pmcAlerts, setPMCAlerts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [machineFilter, setMachineFilter] = useState("all");
  const [startDateInput, setStartDateInput] = useState("");
  const [endDateInput, setEndDateInput] = useState("");

  // Fetch PMC Alerts
  const fetchPMCAlerts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/pmc-parameters`);
      const alerts = response.data;

      const filteredPMCAlerts = alerts
        .filter((param) => {
          const ok = String(param.ok);
          const value = String(param.parameter_value);
          return (ok === "0" && value === "1") || (ok === "1" && value === "0");
        })
        .map((param) => ({
          MachineId: param.machine_id,
          MachineName: param.machine_name_type,
          parameterValue: param.parameter_value,
          parameterAddress: param.register_address,
          BitPosition: param.bit_position,
          parameterDescription: param.parameter_name,
          createdAt: param.created_at,
          updatedAt: param.updated_at,
          OK: param.ok,
        }));

      setPMCAlerts(filteredPMCAlerts);
    } catch (error) {
      console.error("Error fetching PMC alerts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPMCAlerts();
    const interval = setInterval(fetchPMCAlerts, 90000);
    return () => clearInterval(interval);
  }, []);

  // Unique Machine List
  const uniqueMachineList = Array.from(
    new Map(pmcAlerts.map((item) => [item.MachineId, item.MachineName])).entries()
  ).map(([id, name]) => ({ id, name }));

  const handleTodayFilter = () => {
    const today = new Date().toISOString().split("T")[0];
    setStartDateInput(today);
    setEndDateInput(today);
  };

  const clearFilters = () => {
    setMachineFilter("all");
    setStartDateInput("");
    setEndDateInput("");
  };

  const exportToExcel = () => {
    const exportData = filteredAlerts.map((entry, index) => ({
      "#": index + 1,
      "Machine ID": entry.MachineId,
      "Machine Name": entry.MachineName,
      Parameter: entry.parameterDescription,
      Address: entry.parameterAddress,
      "Bit Position": entry.BitPosition ?? "-",
      Status:
        (entry.OK === "0" && entry.parameterValue === "1") ||
        (entry.OK === "1" && entry.parameterValue === "0")
          ? "Not OK"
          : "OK",
      "Updated At": new Date(entry.updatedAt).toLocaleString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "PMC Alerts");
    XLSX.writeFile(workbook, "PMC_Alerts_Report.xlsx");
  };

  // 🔄 Auto filtering logic
  const filteredAlerts = pmcAlerts.filter((a) => {
    const matchesMachine =
      machineFilter === "all" || String(a.MachineId) === machineFilter;

    const updatedDate = new Date(a.updatedAt);
    const matchesStart = !startDateInput || updatedDate >= new Date(startDateInput);
    const matchesEnd = !endDateInput || updatedDate <= new Date(endDateInput + "T23:59:59");

    return matchesMachine && matchesStart && matchesEnd;
  });

  return (
    <Container fluid className="text-center" style={{ marginTop: "3rem" }}>
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3 p-2 border rounded bg-light">
        {/* Heading */}
        <div className="fs-4 fw-bold me-auto" style={{ color: "#034694" }}>
          PMC Alerts
        </div>

        {/* Filters + Buttons */}
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <Form.Select
            value={machineFilter}
            onChange={(e) => setMachineFilter(e.target.value)}
            className="form-select-sm"
            style={{ width: "160px", height: "32px" }}
          >
            <option value="all">All Machines</option>
            {uniqueMachineList.map((machine) => (
              <option key={machine.id} value={machine.id}>
                {machine.name}
              </option>
            ))}
          </Form.Select>

          <Form.Control
            type="date"
            size="sm"
            value={startDateInput}
            onChange={(e) => setStartDateInput(e.target.value)}
            style={{ width: "130px", height: "32px" }}
          />
          <Form.Control
            type="date"
            size="sm"
            value={endDateInput}
            onChange={(e) => setEndDateInput(e.target.value)}
            style={{ width: "130px", height: "32px" }}
          />

          <Button
            size="sm"
            variant="outline-primary"
            onClick={handleTodayFilter}
            style={{ height: "32px" }}
          >
            <FaCalendarDay className="me-1" />
            Today
          </Button>

          <Button
            size="sm"
            variant="outline-secondary"
            onClick={clearFilters}
            style={{ height: "32px" }}
          >
            <FaSyncAlt className="me-1" />
            Clear
          </Button>

          <Button
            size="sm"
            variant="success"
            onClick={exportToExcel}
            style={{ height: "32px" }}
          >
            <FaFileExcel className="me-1" />
            Export
          </Button>
        </div>
      </div>

      {loading ? (
        <p>Loading PMC alerts...</p>
      ) : filteredAlerts.length > 0 ? (
        <div style={{ maxHeight: "70vh", overflowY: "auto" }}>
          <table
            className="table table-bordered table-hover mt-2"
            style={{ fontSize: "0.9rem", width: "100%" }}
          >
            <thead className="table-light sticky-top">
              <tr>
                <th style={{ color: "#034694" }}>Sr No.</th>
                <th style={{ color: "#034694" }}>Machine Name</th>
                <th style={{ color: "#034694" }}>Parameter</th>
                <th style={{ color: "#034694" }}>Address</th>
                <th style={{ color: "#034694" }}>Bit Position</th>
                <th style={{ color: "#034694" }}>Status</th>
                <th style={{ color: "#034694" }}>Updated At</th>
              </tr>
            </thead>
            <tbody>
              {filteredAlerts.map((alert, index) => {
                const isAlertTriggered =
                  (String(alert.OK) === "0" && String(alert.parameterValue) === "1") ||
                  (String(alert.OK) === "1" && String(alert.parameterValue) === "0");

                return (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{alert.MachineName}</td>
                    <td>{alert.parameterDescription}</td>
                    <td>{alert.parameterAddress}</td>
                    <td>{alert.BitPosition ?? "-"}</td>
                    <td
                      style={{
                        color: isAlertTriggered ? "red" : "green",
                        fontWeight: "bold",
                      }}
                    >
                      {isAlertTriggered ? "Not OK" : "OK"}
                    </td>
                    <td>{new Date(alert.updatedAt).toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No active PMC alerts.</p>
      )}
    </Container>
  );
};

export default PMCAlerts;
