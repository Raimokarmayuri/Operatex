import React, { useState, useEffect } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import * as XLSX from "xlsx"; // Import xlsx library
import API_BASE_URL from "../../config"; 
Chart.register(...registerables);

const OEEReport = () => {
  const [machineId, setMachineId] = useState(""); // Initially empty, as we'll fetch machine IDs
  const [machineIds, setMachineIds] = useState([]); // List of machine IDs
  const [oeeData, setOEEData] = useState([]); // OEE data for selected machine
  const [lossData, setLossData] = useState([]); // Loss data for selected machine
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth()); // Default to current month (January is 0)

  // Summary state to hold monthly values like avgOEE, avgPartsProduced, etc.
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

  // Days array for displaying 31 days of the month (1 to 31)
  const daysOfMonth = [...Array(31)].map((_, i) => i + 1);

  // Fetch machine IDs to populate the dropdown
  useEffect(() => {
    const fetchMachineIds = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/machines/ORG001`
        ); // API to fetch machine IDs
        setMachineIds(response.data || []);
        if (response.data.length > 0) {
          setMachineId(response.data[0].machineId); // Set the first machine ID as default
        }
      } catch (error) {
        console.error("Error fetching machine IDs:", error);
      }
    };

    fetchMachineIds();
  }, []);

  // Fetch OEE data and downtime data when machineId or selectedMonth changes
  useEffect(() => {
    if (!machineId) return; // Don't fetch if no machineId is selected

    const fetchData = async () => {
      try {
        // Fetch OEE data for the selected machine and filter by month
        const oeeResponse = await axios.get(
          `${API_BASE_URL}/api/oeelog/oee-data?machineId=${machineId}`
        );
        const downtimeResponse = await axios.get(
          `${API_BASE_URL}/api/downtime/machine/${machineId}`
        );

        const rejectionResponse = await axios.get(
          `${API_BASE_URL}/api/getAllPartRejections`
        ); // Fetch part rejection data


        // Filter OEE data based on the selected month and machineId
        const filteredOEEData = oeeResponse.data.oeeData.filter((entry) => {
          const entryDate = new Date(entry.savedAt);
          const entryMonth = entryDate.getMonth(); // 0-based (0 = January, 1 = February, etc.)
          return entryMonth === selectedMonth && entry.machineId === machineId; // Filter for the selected month and machineId
        });

        // Filter downtime data based on the selected month and machineId
        const filteredLossData = downtimeResponse.data.filter((entry) => {
          const entryDate = new Date(entry.startTimestamp);
          const entryMonth = entryDate.getMonth(); // 0-based (0 = January, 1 = February, etc.)
          return entryMonth === selectedMonth && entry.machineId === machineId; // Filter for the selected month and machineId
        });

         // Filter rejection data based on the selected month and machineId
      const filteredRejectionData = rejectionResponse.data.filter((entry) => {
        const entryDate = new Date(entry.date);
        const entryMonth = entryDate.getMonth();
        return entryMonth === selectedMonth && entry.machineId === machineId;
      });


        // Process downtime data for losses by day
        const downtimeReasons = [
          { reason: "Unplanned", category: "Unplanned" },
          { reason: "Lunch Time - Operator took extra time", category: "Breaktime" },
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
          const dailyData = Array(31).fill(0); // Create an array for 31 days (for the month)
          filteredLossData.forEach((entry) => {
            const entryDate = new Date(entry.startTimestamp);
            const day = entryDate.getDate() - 1; // Get the day of the month (0-based index)
            if (
              entry.DownTimeReason === loss.reason &&
              entryDate.getMonth() === selectedMonth
            ) {
              dailyData[day] += entry.duration; // Sum downtime for each day
            }
          });
  
          // Add rejection data for the corresponding reason
          filteredRejectionData.forEach((entry) => {
            const entryDate = new Date(entry.date);
            const day = entryDate.getDate() - 1;
            if (entry.rejectionReason === loss.reason && entryDate.getMonth() === selectedMonth) {
              dailyData[day] += entry.quantity; // Sum rejected parts for each day
            }
          });
  
          return { ...loss, dailyData };
        });
        

        // Calculate averages for the month
        const totalOEE = filteredOEEData.reduce(
          (sum, entry) => sum + (entry.OEE || 0),
          0
        );
        const totalAvailability = filteredOEEData.reduce(
          (sum, entry) => sum + (entry.OEE || 0),
          0
        );
        const totalQuality = filteredOEEData.reduce(
          (sum, entry) => sum + (entry.OEE || 0),
          0
        );
        const totalPartsProduced = filteredOEEData.reduce(
          (sum, entry) => sum + (entry.TotalPartsProduced || 0),
          0
        );
        const totalPlannedQty = filteredOEEData.reduce(
          (sum, entry) => sum + (entry.plannedQty || 0),
          0
        );
        const downtimeDuration = filteredOEEData.reduce(
          (sum, entry) => sum + (entry.downtimeDuration || 0),
          0
        );
        const defectiveParts = filteredOEEData.reduce(
          (sum, entry) => sum + (entry.defectiveParts || 0),
          0
        );
        const totalMachineRunningHours = filteredOEEData.reduce(
          (sum, entry) => sum + (entry.machineRunningHours || 0),
          0
        );
        const totalMachineMaintenanceHours = filteredOEEData.reduce(
          (sum, entry) => sum + (entry.machineMaintenanceHours || 0),
          0
        );

        // Convert to hours (divide by 3600 to convert seconds to hours)
        const downtimeDurationInHours = downtimeDuration / 60;

        // Calculate total downtime for the month (in hours)
        const totalDowntime = losses.reduce((sum, loss) => {
          const monthlyDowntime = loss.dailyData.reduce(
            (dailySum, day) => dailySum + day,
            0
          );
          return sum + monthlyDowntime;
        }, 0);

        

        // Convert total downtime to hours
        const totalDowntimeInHours = totalDowntime / 60;

        // Set the summary values for the month
        const avgOEE = totalOEE / filteredOEEData.length;
        const avgAvailability = totalAvailability / filteredOEEData.length;
        const avgQuality = totalQuality / filteredOEEData.length;
        const avgPartsProduced = totalPartsProduced / filteredOEEData.length;
        const avgPlannedQty = totalPlannedQty / filteredOEEData.length;
        const avgMachineRunningHours =
          totalMachineRunningHours / filteredOEEData.length;
        const avgdowntimeDuration =
        totalDowntimeInHours; // Calculate average downtime duration
        const avgDefectPart = defectiveParts; // Calculate average defect parts
        const avgMachineMaintenanceHours =
          totalMachineMaintenanceHours / filteredOEEData.length;

        // Update the state with OEE data and losses
        setOEEData(filteredOEEData);
        setLossData(losses);
        setSummary({
          avgOEE,
          avgPartsProduced,
          avgPlannedQty,
          avgAvailability,
          avgQuality,
          avgdowntimeDuration,
          avgDefectPart,
          avgMachineRunningHours,
          avgMachineMaintenanceHours,
          totalPartsProduced,
          totalPlannedQty,
          totalDowntime,
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [machineId, selectedMonth]); // Re-fetch data when machineId or selectedMonth changes


  // Handle machine selection
  const handleMachineChange = (event) => {
    setMachineId(event.target.value);
  };

  // Handle month selection
  const handleMonthChange = (event) => {
    setSelectedMonth(Number(event.target.value)); // Update to the selected month (0-based)
  };

  // Format date for the current month
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
    });
  };

  // Get stats for each day of the month
  const getDayStats = (dayIndex) => {
    let oee = 0;
    let availability = 0;
    let quality = 0;
    let totalPartsProduced = 0;
    let plannedQty = 0;
    let downtimeDuration = 0;
    let defectiveParts = 0;
  
    // Filter the OEE data for the specific day
    const oeeForDay = oeeData.filter((entry) => {
      const entryDate = new Date(entry.savedAt);
      return entryDate.getDate() === dayIndex + 1; // Match the day of the month
    });
  
    // If we have multiple shifts for this day, sum up the values
    oeeForDay.forEach((entry) => {
      oee += entry.OEE || 0;
      availability += entry.availability || 0;
      quality += entry.quality || 0;
      totalPartsProduced += entry.TotalPartsProduced || 0;
      plannedQty += entry.plannedQty || 0;
      downtimeDuration += entry.downtimeDuration || 0;
      defectiveParts += entry.defectiveParts || 0;
    });
  
    // Calculate averages if there are multiple shifts
    const numShifts = oeeForDay.length;
    if (numShifts > 0) {
      oee /= numShifts;
      availability /= numShifts;
      quality /= numShifts;
    }
  
    return {
      oee,
      availability,
      quality,
      totalPartsProduced,
      plannedQty,
      downtimeDuration,
      defectiveParts,
    };
  };
  

// Export table to Excel
const exportToExcel = () => {
  const table = document.getElementById("oeeTable"); // Get the table by ID

  if (table) {
    const wb = XLSX.utils.table_to_book(table, { sheet: "Sheet1" });
    XLSX.writeFile(wb, "OEE_Report.xlsx"); // Download as Excel file
  } else {
    alert("Table not found");
  }
};
  


  return (
    <div className="container3 mt-2 fs-5 overflow-auto">
  <div className="row">
    <div className="col-12">
      <h3
        className="text-center text-md-center mt-3 fs-3"
        style={{ color: "red", fontWeight: "bold", fontSize: "26px" }}
      >
        OEE Report for Machine {machineId}
      </h3>

      {/* Machine ID Dropdown and Month Filter in one line */}
      <div className="row mb-4 me-2 ms-2">
        {/* Machine ID Dropdown */}
        <div className="col-md-2">
          <label htmlFor="machineSelect" className="fs-4">
            Select Machine
          </label>
          <select
            id="machineSelect"
            className="form-control fs-4"
            value={machineId}
            onChange={handleMachineChange}
          >
            {machineIds.map((machine) => (
              <option key={machine.machineId} value={machine.machineId}>
                {machine.machineId}
              </option>
            ))}
          </select>
        </div>

        {/* Month Filter */}
        <div className="col-md-2">
          <label htmlFor="monthSelect" className="fs-5">
            Select Month
          </label>
          <select
            id="monthSelect"
            className="form-control fs-5"
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
        {/* Export to Excel Button */}
        <div className="col-md-2 mt-2">
          <button className="btn btn-success mt-4 fs-4" onClick={exportToExcel}>
            Export to Excel
          </button>
        </div>
      </div>

      {/* OEE Line Chart */}
      <div className="container mt-4 fs-5">
        <h4 className="text-center fs-5">
          OEE Data for{" "}
          {new Date(2021, selectedMonth).toLocaleString("default", {
            month: "long",
          })}
        </h4>
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
      </div>

      {/* Merged Monthly Summary and Loss Table */}
      <div
        className="table-responsive mt-4 fs-5 overflowY-auto h-75"
        style={{ width: "100%", padding: "1rem" }}
      >
        <table
          id="oeeTable"
          className="table table-bordered table-striped fs-5 overflow-y-auto"
          style={{ width: "100%"}}
        >
          <thead>
            <tr>
              <th>Machine Name</th>
              <th>Component</th>
              {/* <th >Line Supervisor</th> */}
              <th colSpan="3">OEE (%)</th>
              <th colSpan="3">Actual Production Data</th>{" "}
              {/* Merging OEE, Actual Production Qty, and Standard Production Qty into one group */}
              <th colSpan="3">Standard Production Data</th>
              <th colSpan="3">Downtime (hr)</th>
              <th colSpan="3">Defect Part</th>
              <th colSpan="3">Availability (%)</th>
              <th colSpan="3">Quality (%)</th>
              <th colSpan="3">Defect Part</th>
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
              <td colSpan="3">{summary.avgDefectPart.toFixed(2)}</td>
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
              <th rowSpan="2">Sr. No</th>
              <th rowSpan="2">Category</th>
              <th rowSpan="2">Loss Name</th>
              <th rowSpan="2">Unit of Measurement (UOM)</th>
              <th colSpan="31">
                Days of{" "}
                {new Date(2021, selectedMonth).toLocaleString("default", {
                  month: "long",
                })}
              </th>
            </tr>
            <tr>
              {daysOfMonth.map((_, index) => (
                <th key={index}>{index + 1}</th>
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
              <td colSpan="4">Downtime </td>
              {daysOfMonth.map((_, dayIndex) => {
                const { downtimeDuration } = getDayStats(dayIndex);
                return <td key={dayIndex}>{downtimeDuration}</td>;
              })}
            </tr>
          </tfoot>
        </table>
        <h6
          className="text-end text-md-center mt-1 fs-5"
          style={{ color: "red", fontWeight: "bold", fontSize: "px" }}
        >
          Report Generated on OperateX Powered by ThetaVega
        </h6>
      </div>
    </div>
  </div>
</div>

  );
};

export default OEEReport;
