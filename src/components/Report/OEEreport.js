import React, { useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
// import XLSX from 'xlsx-style';
import "@fortawesome/fontawesome-free/css/all.min.css";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { useNavigate } from "react-router-dom"; // Import for navigation
import { BsPencil, BsTrash } from "react-icons/bs";
import {
  FaFilter,
  FaTimesCircle,
  FaCalendarDay,
  FaFileExcel,
} from "react-icons/fa";
import { Container, Row, Col, Button } from "react-bootstrap";
import API_BASE_URL from "../config";
// const API_BASE_URL = "http://localhost:5003";

const OEEDataTable = () => {
  const [oeeData, setOeeData] = useState([]);
  const navigate = useNavigate();
  const [originalData, setOriginalData] = useState([]); // Store original data for resetting
  const [filters, setFilters] = useState({
    machine_id: "",
    shift_no: "",
    startDate: "",
    endDate: "",
  });
  const [machine_ids, setmachine_ids] = useState([]);

  // Fetch machine IDs from the backend
  useEffect(() => {
    const fetchMachineData = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/machines/getallmachine`
        );
        // Extract machine_id from each object
        const ids = response.data.map((machine) => machine.machine_id);
        setmachine_ids(ids);
        console.log("Machine IDs:", ids);
      } catch (error) {
        // console.error("Error fetching machine data:", error);
      }
    };

    fetchMachineData();
  }, []);

  useEffect(() => {
    // Fetch OEE data from API
    axios
      .get(`${API_BASE_URL}/api/oee-logs`)
      .then((response) => {
        const sortedData = sortData(response.data); // Sort data descending initially
        setOeeData(sortedData);
        console.log(response.data.oeeData);
        console.log("Sorted OEE Data:", sortedData);
        setOriginalData(sortedData); // Keep original data
      })
      .catch((error) => {
        // console.error("Error fetching OEE data:", error);
      });
  }, []);

  // Function to sort data in descending order by date
  const sortData = (data) => {
    return data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  };

  // Filter and prioritize today's data
  const prioritizeTodayData = () => {
    const today = new Date().toISOString().split("T")[0];

    const todaysData = originalData.filter((item) => {
      const itemDate = new Date(item.createdAt).toISOString().split("T")[0];
      return itemDate === today;
    });

    const otherData = originalData.filter((item) => {
      const itemDate = new Date(item.createdAt).toISOString().split("T")[0];
      return itemDate !== today;
    });

    // Merge today's data at the top with other data
    setOeeData([...todaysData, ...sortData(otherData)]);
  };

  // Handle input change for filters
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  // Apply filters
  const applyFilters = () => {
    const filteredData = originalData.filter((data) => {
      const { machine_id, shift_no, startDate, endDate } = filters;

      const matchMachine = machine_id
        ? data.machine_id.toLowerCase().includes(machine_id.toLowerCase())
        : true;

      const matchShift = shift_no ? data.shift_no === Number(shift_no) : true;

      const matchDate =
        startDate && endDate
          ? new Date(data.createdAt) >= new Date(startDate) &&
            new Date(data.createdAt) <= new Date(endDate)
          : true;

      return matchMachine && matchShift && matchDate;
    });

    setOeeData(sortData(filteredData)); // Always keep data sorted
  };

  // Clear filters and reset table
  // Function to reset table to original state
  const resetTable = () => {
    setFilters({
      machine_id: "",
      shift_no: "",
      startDate: "",
      endDate: "",
    });
    setOeeData(sortData(originalData)); // Reset data to original sorted state
  };

  // Filter today's data
  const filterTodayData = () => {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const todayData = originalData.filter((data) => {
      const createdAtDate = new Date(data.createdAt);
      return createdAtDate >= startOfDay && createdAtDate <= endOfDay;
    });

    setOeeData(todayData);
  };

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("OEE Data");

    // Define header row with styles
    worksheet.columns = [
      { header: "Machine ID", key: "machine_id", width: 15 },
      { header: "Shift Number", key: "shift_no", width: 12 },
      { header: "Part Name", key: "part_name", width: 15 },
      { header: "OEE (%)", key: "OEE", width: 10 },
      { header: "Availability (%)", key: "availability", width: 15 },
      { header: "Quality (%)", key: "quality", width: 10 },
      { header: "Performance (%)", key: "performance", width: 15 },
      { header: "Good Parts", key: "goodPart", width: 15 },
      { header: "Defective Parts", key: "defectiveParts", width: 15 },
      { header: "Total Parts", key: "TotalPartsProduced", width: 15 },
      { header: "Downtime (min)", key: "downtimeDuration", width: 15 },
      { header: "Ideal Cycle Time", key: "idealCycleTime", width: 15 },
      { header: "Created At", key: "createdAt", width: 25 },
      { header: "Current Time", key: "currentTime", width: 25 },
    ];

    // Add header row styles
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } }; // White text
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF0070C0" }, // Blue background
      };
      cell.alignment = { horizontal: "center", vertical: "middle" }; // Center align
    });

    // Add data rows with centered alignment
    oeeData.forEach((data) => {
      const row = worksheet.addRow({
        machine_id: data.machine_id,
        shift_no: data.shift_no,
        part_name: data.part_name,
        expectedPartCount: data.expectedPartCount,
        OEE: Number(data.OEE).toFixed(2),
        availability: Number(data.availability).toFixed(2),
        quality: Number(data.quality).toFixed(2),
        performance: Number(data.performance).toFixed(2),
        TotalPartsProduced: data.TotalPartsProduced,
        defectiveParts: data.defectiveParts,
        downtimeDuration: data.downtimeDuration,
        createdAt: new Date(data.createdAt).toLocaleString(),
        updatedAt: new Date(data.updatedAt).toLocaleString(),
      });

      // Set alignment for each cell in the row
      row.eachCell((cell) => {
        cell.alignment = { horizontal: "center", vertical: "middle" };
      });
    });

    // Save the workbook
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "OEE_Data.xlsx");
  };

  return (
    <div className="container3 mt-5 mb-0">
      {/* <h3
        className="text-center text-md-center mt-1"
        style={{ color: "red", fontWeight: "bold", fontSize: "26px" }}
      >
        {" "}
        OEE Report
      </h3> */}

      {/* <button 
        className="btn btn-primary mb-3" 
        onClick={() => navigate('/oeesheet')}
      >
        View Report
      </button> */}

      <div
        className="d-flex justify-content-between align-items-center flex-wrap gap-2 mt-2 mb-3 p-3 border rounded bg-light"
        style={{ boxShadow: "0 2px 6px rgba(0,0,0,0.05)" }}
      >
        {/* Left - Title */}
        <div className="fs-5 fw-bold mb-2 mb-md-0" style={{ color: "#034694" }}>
          OEE Report
        </div>

        {/* Right - Filters & Buttons */}
        <div className="d-flex flex-wrap align-items-center justify-content-end gap-2">
          {/* Machine ID */}
          <select
            className="form-select form-select-sm"
            name="machine_id"
            value={filters.machine_id}
            onChange={handleInputChange}
            title="Machine ID"
            style={{ width: "150px" }}
          >
            <option value="">Machine ID</option>
            {machine_ids.map((id) => (
              <option key={id} value={id}>
                {id}
              </option>
            ))}
          </select>

          {/* Shift Number */}
          <input
            type="number"
            className="form-control form-control-sm"
            name="shift_no"
            value={filters.shift_no}
            onChange={handleInputChange}
            placeholder="Shift No."
            title="Shift Number"
            style={{ width: "120px" }}
          />

          {/* Start Date */}
          <input
            type="text"
            className="form-control form-control-sm"
            name="startDate"
            value={filters.startDate}
            onChange={handleInputChange}
            placeholder="Start Date (dd-mm-yyyy)"
            onFocus={(e) => (e.target.type = "date")}
            onBlur={(e) => (e.target.type = "text")}
            title="Start Date"
            style={{ width: "160px" }}
          />

          {/* End Date */}
          <input
            type="text"
            className="form-control form-control-sm"
            name="endDate"
            value={filters.endDate}
            onChange={handleInputChange}
            placeholder="End Date (dd-mm-yyyy)"
            onFocus={(e) => (e.target.type = "date")}
            onBlur={(e) => (e.target.type = "text")}
            title="End Date"
            style={{ width: "160px" }}
          />

          {/* Apply Filters */}
          <button
            className="btn btn-sm btn-outline-primary d-flex align-items-center"
            onClick={applyFilters}
            title="Apply Filters"
          >
            <FaFilter className="me-1" />
            Apply
          </button>
          {/* FaFilter,FaTimesCircle,FaCalendarDay,FaFileExcel */}
          {/* Clear Filters */}
          <button
            className="btn btn-sm btn-outline-danger d-flex align-items-center"
            onClick={resetTable}
            title="Clear Filters"
          >
            <FaTimesCircle className="me-1" />
            Clear
          </button>

          {/* Filter Today */}
          <button
            className="btn btn-sm btn-outline-secondary d-flex align-items-center"
            onClick={filterTodayData}
            title="Filter Today's Data"
          >
            <FaCalendarDay className="me-1" />
            Today
          </button>

          {/* Export to Excel */}
          <button
            className="btn btn-sm btn-outline-success d-flex align-items-center"
            onClick={exportToExcel}
            title="Export to Excel"
          >
            <FaFileExcel className="me-1" />
            Export
          </button>
        </div>
      </div>

      {/* Table */}
      <div
        className="table-responsive ms-2"
        style={{ maxHeight: "72vh", overflowY: "auto" }}
      >
        <table
          className="table table-bordered table-hover mt-3"
          style={{
            fontSize: "0.9rem",
            lineHeight: "1.4",
          }}
        >
          <thead
            className="table-light"
            style={{
              position: "sticky",
              top: 0,
              zIndex: 1020,
              boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
            }}
          >
            <tr>
              <th scope="col" style={{ color: "#034694" }}>
                Date
              </th>
              <th scope="col" style={{ color: "#034694" }}>
                Machine ID
              </th>
              <th scope="col" style={{ color: "#034694" }}>
                Shift No.
              </th>
              <th scope="col" style={{ color: "#034694" }}>
                OEE (%)
              </th>
              <th scope="col" style={{ color: "#034694" }}>
                Availability (%)
              </th>
              <th scope="col" style={{ color: "#034694" }}>
                Quality (%)
              </th>
              <th scope="col" style={{ color: "#034694" }}>
                Performance (%)
              </th>
              <th scope="col" style={{ color: "#034694" }}>
                Updated At
              </th>
              <th scope="col" style={{ color: "#034694" }}>
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {oeeData.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center text-muted">
                  No data available
                </td>
              </tr>
            ) : (
              oeeData.map((data) => (
                <tr key={data._id}>
                  <td>{new Date(data.createdAt).toLocaleString()}</td>
                  <td>{data.machine_id}</td>
                  <td>{data.shift_no}</td>
                  <td>{Number(data.OEE).toFixed(2)}</td>
                  <td>{Number(data.availability).toFixed(2)}</td>
                  <td>{Number(data.quality).toFixed(2)}</td>
                  <td>{Number(data.performance).toFixed(2)}</td>
                  <td>{new Date(data.currentTime).toLocaleString()}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => navigate(`/OEEReport/edit-oee/${data.id}`)}
                      title="Edit"
                    >
                      <BsPencil />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OEEDataTable;
