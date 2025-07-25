
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import ReactECharts from 'echarts-for-react';
import { Container, Row, Col, Table, Form, Button } from "react-bootstrap";
import { FaEdit } from "react-icons/fa";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import API_BASE_URL from "../config";
import Select from "react-select";

// import ReactECharts from 'echarts-for-react';
import dayjs from 'dayjs';
import * as echarts from 'echarts';
const API_URL = `${API_BASE_URL}/api/downtimes`;


const DrillDownDowntimeChart = () => {
  const [view, setView] = useState('month');
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState('');
   const [showForm, setShowForm] = useState(false);
     const [machines, setMachines] = useState([]);
   
  
  const [data, setData] = useState([]);
  const [machineIdFilter, setMachineIdFilter] = useState("");
  const [shiftFilter, setShiftFilter] = useState("");
  const [filterDate, setFilterDate] = useState("");

  const [formData, setFormData] = useState({
    machine_id: localStorage.getItem("selectedMachineId"),
    shift_no: "",
    start_timestamp: "",
    end_timestamp: "",
    downtime_reason: "",
    duration: "",
    status: "",
    category: "",
    linked: false,
    remark: "",
    date: new Date().toISOString().split("T")[0],
    plan_id: null,
    // operator_id: null,
  });

  useEffect(() => {
    fetchDowntimeData();
  }, []);

  const fetchDowntimeData = async () => {
    try {
      const response = await axios.get(API_URL);
      setData(response.data);
    } catch (error) {
      console.error("Error fetching downtime data:", error);
    }
  };

  const exportToExcel = () => {
  const hasFilter = machineIdFilter || shiftFilter || filterDate;
  const dataToExport = hasFilter ? filteredData : data;

  const formattedData = dataToExport.map((entry) => ({
    Date: new Date(entry.start_timestamp).toLocaleDateString(),
    "Machine ID": entry.machine_id,
    "Machine Name": entry.machine_name_type,
    "Shift No": entry.shift_no,
    Reason: entry.downtime_reason,
    Duration: entry.duration + " min",
    "Start Time": new Date(entry.start_timestamp).toLocaleTimeString(),
    "End Time": new Date(entry.end_timestamp).toLocaleTimeString(),
  }));

  const worksheet = XLSX.utils.json_to_sheet(formattedData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Downtime Report");

  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });

  const blob = new Blob([excelBuffer], {
    type: "application/octet-stream",
  });

  const filename = hasFilter ? "Filtered_Downtime_Report" : "All_Downtime_Report";
  saveAs(blob, `${filename}.xlsx`);
};



  const filteredData = data.filter((entry) => {
    const entryDate = new Date(entry.start_timestamp).toISOString().split("T")[0];
    return (
      (!machineIdFilter || entry.machine_id.toString() === machineIdFilter) &&
      (!shiftFilter || entry.shift_no.toString() === shiftFilter) &&
      (!filterDate || entryDate === filterDate)
    );
  });

  const { down_data = [], isLoading } = useQuery({
    queryKey: ['downtime-all'],
    queryFn: async () => {
      const res = await axios.get(`${API_BASE_URL}/api/downtimes`);
      return res.down_data;
    },
  });

  const groupBy = (arr, keyFn) =>
    arr.reduce((acc, item) => {
      const key = keyFn(item);
      acc[key] = acc[key] || [];
      acc[key].push(item);
      return acc;
    }, {});

  const monthlyData = () => {
    const grouped = groupBy(data, (d) => dayjs(d.start_timestamp).format('MMMM'));
    const monthOrder = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return Object.entries(grouped)
      .map(([month, entries]) => ({
        label: month,
        value: entries.reduce((sum, d) => sum + d.duration, 0),
      }))
      .sort((a, b) => monthOrder.indexOf(a.label) - monthOrder.indexOf(b.label));
  };

  const machineDataForMonth = (month) => {
    const filtered = data.filter(d => dayjs(d.start_timestamp).format('MMMM') === month);
    const grouped = groupBy(filtered, (d) => d.machine_id);
    return Object.entries(grouped)
      .map(([mid, entries]) => ({
        label: `Machine ${mid}`,
        machine_id: mid,
        value: entries.reduce((sum, d) => sum + d.duration, 0),
      }))
      .sort((a, b) => parseInt(a.machine_id) - parseInt(b.machine_id));
  };

  const dailyDataForMachine = (month, machine_id) => {
    const filtered = data.filter(d =>
      dayjs(d.start_timestamp).format('MMMM') === month && d.machine_id == machine_id
    );
    const grouped = groupBy(filtered, (d) => dayjs(d.start_timestamp).format('YYYY-MM-DD'));
    return Object.entries(grouped)
      .map(([date, entries]) => ({
        label: dayjs(date).format('DD MMM'),
        rawDate: date,
        value: entries.reduce((sum, d) => sum + d.duration, 0),
      }))
      .sort((a, b) => dayjs(a.rawDate).unix() - dayjs(b.rawDate).unix());
  };

  const shiftData = (date, machine_id) => {
    const filtered = data.filter(d =>
      dayjs(d.start_timestamp).format('YYYY-MM-DD') === date && d.machine_id == machine_id
    );
    const grouped = groupBy(filtered, d => d.shift_no);
    return Object.entries(grouped).map(([shift, entries]) => ({
      label: `Shift ${shift}`,
      value: entries.reduce((sum, d) => sum + d.duration, 0),
    }));
  };

  const chartData = () => {
    if (view === 'month') return monthlyData();
    if (view === 'machine') return machineDataForMonth(selectedMonth);
    if (view === 'daily') return dailyDataForMachine(selectedMonth, selectedMachine);
    if (view === 'shift') return shiftData(selectedDate, selectedMachine);
    return [];
  };

  const handleClick = (params) => {
    const label = params.name;
    if (view === 'month') {
      setSelectedMonth(label);
      setView('machine');
    } else if (view === 'machine') {
      const machineId = label.split(' ')[1];
      setSelectedMachine(machineId);
      setView('daily');
    } else if (view === 'daily') {
      const dateObj = data.find(d =>
        dayjs(d.start_timestamp).format('DD MMM') === label && d.machine_id == selectedMachine
      );
      if (dateObj) {
        const exactDate = dayjs(dateObj.start_timestamp).format('YYYY-MM-DD');
        setSelectedDate(exactDate);
        setView('shift');
      }
    }
  };

    const handleTodayFilter = () => {
    const today = new Date().toISOString().split("T")[0];
    setFilterDate(today);
  };
  
  const goBack = () => {
    if (view === 'shift') {
      setView('daily');
    } else if (view === 'daily') {
      setView('machine');
    } else if (view === 'machine') {
      setView('month');
    }
  };

  const chartOption = {
    title: {
      text:
        view === 'month'
          ? 'Monthly Downtime (Minutes)'
          : view === 'machine'
          ? `Machine-wise Downtime in ${selectedMonth}`
          : view === 'daily'
          ? `Daily Downtime for ${selectedMachine} in ${selectedMonth}`
          : `Shift-wise Downtime in ${selectedMonth} for ${selectedMachine} on ${selectedDate}`,
      left: 'center',
      textStyle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#003870',
      },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: '#f0f9ff',
      borderColor: '#ccc',
      borderWidth: 1,
      textStyle: { color: '#000' },
      transitionDuration: 1,
    },
    xAxis: {
      type: 'category',
      name:
        view === 'month'
          ? 'Months (2025)'
          : view === 'daily'
          ? 'Days'
          : view === 'shift'
          ? 'Shift No'
          : 'Machine ID',
      nameLocation: 'middle',
      nameGap: 55,
      data: chartData().map(d => d.label),
      axisLabel: {
        fontSize: 13,
        rotate: 0,
        margin: 12,
        color: '#333',
      },
      axisLine: {
        lineStyle: { color: '#003870' },
      },
    },
    yAxis: {
      type: 'value',
      name: 'Downtime (Min)',
      nameLocation: 'middle',
      nameGap: 55,
      nameTextStyle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#003870',
      },
      axisLabel: {
        fontSize: 13,
        color: '#333',
      },
      splitLine: {
        lineStyle: { type: 'dashed', color: '#ccc' },
      },
    },
    series: [
      {
        type: 'bar',
        data: chartData().map(d => d.value),
        universalTransition: true, // 👈 enable smooth drill-down transition
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#0f5f75' },
            { offset: 1, color: '#0072ff' },
          ]),
          borderRadius: [6, 6, 0, 0],
        },
        label: {
          show: true,
          position: 'top',
          fontWeight: 'bold',
          color: '#000',
        },
        barWidth: '55%',
        animationDurationUpdate: 1200,
        animationEasingUpdate: 'cubicInOut',
      },
    ],
    animation: true,
    animationDuration: 1000,
    animationEasing: 'cubicOut',
  };
  const downtimeReasons = [
    {
      id: 1,
      reason: "Equipment Failure (Breakdown)",
      category: "Availability",
      linked:
        "Maintenance (Corrective Maintenance) - Machine breakdown requiring unplanned maintenance.",
    },
    {
      id: 2,
      reason: "Setup & Adjustment Loss",
      category: "Availability",
      linked:
        "Process-Related - Time spent setting up machines and making adjustments for new production runs.",
    },
    {
      id: 3,
      reason: "Idling & Minor Stoppages (Small Stops)",
      category: "Availability",
      linked:
        "Physical Phenomenon (Sensors, Material Flow) - Short stops due to sensor issues, material jams, or minor operator actions.",
    },
    {
      id: 4,
      reason: "Start-Up Losses",
      category: "Availability",
      linked:
        "Maintenance (Preventive Maintenance) - Time lost when machines are warming up or after maintenance.",
    },
    {
      id: 5,
      reason: "Shutdown Losses",
      category: "Availability",
      linked:
        "Process-Related - Time lost when the machine is powered down due to non-production activities.",
    },
    {
      id: 6,
      reason: "Waiting for Parts or Material",
      category: "Availability",
      linked:
        "Supply Chain Issues - Lack of raw materials or parts, which causes machine downtime.",
    },
    {
      id: 7,
      reason: "Operator Inefficiency",
      category: "Availability",
      linked:
        "Human-Related - Time lost due to delays or inefficient operator actions after stoppages.",
    },
    {
      id: 8,
      reason: "Tool Changeover Time",
      category: "Availability",
      linked:
        "Maintenance (Tooling) - Time taken to change or replace tools due to wear or breakage.",
    },
    {
      id: 9,
      reason: "Speed Loss",
      category: "Performance",
      linked:
        "Physical Phenomenon (Machine Speed, Cycle Time) - The machine operates slower than its ideal cycle time.",
    },
    {
      id: 10,
      reason: "Reduced Yield",
      category: "Performance",
      linked:
        "Process-Related - Decreased output speed due to inefficiencies in the process.",
    },
    {
      id: 11,
      reason: "Operator's Manual Entries (Training and Mistakes)",
      category: "Performance",
      linked:
        "Human-Related (Training & Experience) - Losses due to mistakes or inexperience in operating the machine, slowing production.",
    },
    {
      id: 12,
      reason: "Tool Wear & Breakage",
      category: "Performance",
      linked:
        "Maintenance (Predictive Maintenance) - Loss of speed and performance due to worn or broken tools. Pre-warning notifications for tool change should be adjusted.",
    },
    {
      id: 13,
      reason: "Machine Cleaning & Maintenance Loss",
      category: "Performance",
      linked:
        "Maintenance (Scheduled Maintenance) - Regular cleaning or maintenance activities that reduce the operational speed of the machine.",
    },
    {
      id: 14,
      reason: "Defects and Rework Loss",
      category: "Quality",
      linked:
        "Physical Phenomenon (Tool Wear, Process Parameters) - Products that do not meet quality standards and need rework or scrapping.",
    },
    {
      id: 15,
      reason: "Process Defects",
      category: "Quality",
      linked:
        "Process-Related - Inconsistent process parameters or tool failure leading to defective parts.",
    },
    {
      id: 16,
      reason: "Tea Break ",
      category: "Breaktime",
      linked: "Tea Break",
    },
    {
      id: 16,
      reason: "Lunch Break",
      category: "Breaktime",
      linked: "Lunch Break",
    },
    {
      id: 17,
      reason: "Other",
      category: "Other",
      linked: "Other",
    },
  ];

   const handleEdit = (downtime) => {
    setFormData({
      ...downtime,
      start_timestamp: downtime.start_timestamp
        ? new Date(downtime.start_timestamp).toISOString().slice(0, 16)
        : "",
      end_timestamp: downtime.end_timestamp
        ? new Date(downtime.end_timestamp).toISOString().slice(0, 16)
        : "",
      date: downtime.date
        ? new Date(downtime.date).toISOString().split("T")[0]
        : "",
    });
    setEditId(downtime.id);
    setIsEditMode(true);
    setShowForm(true);
  };

    const handleFormSubmit = async (e) => {
      e.preventDefault();
      const payload = {
        ...formData,
        status: formData.status === "true",
          operator_id: formData.operator_id ? parseInt(formData.operator_id) : 0,
        // shift_no: parseInt(formData.shift_no),
        // duration: parseInt(formData.duration, 10),
      };
  console.log("Submitting update payload:", payload);
      try {
        if (isEditMode) {
          await axios.put(`${API_BASE_URL}/api/downtimes/${editId}`, payload);
        } else {
          await axios.post(`${API_BASE_URL}/api/downtimes`, payload);
        }
        fetchDowntimeData();
        setShowForm(false);
        setIsEditMode(false);
      } catch (err) {
        alert("Error saving downtime entry");
      }
    };

  return (
    <>
    <div
      style={{
        // background: 'linear-gradient(to bottom, #f7faff, #e3f2fd)',
        padding: '30px',
        borderRadius: 12,
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        marginTop: '30px',
      }}
    >
      {view !== 'month' && (
        <button
          onClick={goBack}
          style={{
            marginBottom: '16px',
            padding: '6px 12px',
            backgroundColor: '#0072ff',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          Back
        </button>
      )}
      {isLoading ? (
        <p className="text-center text-gray-600 text-lg">Loading downtime data...</p>
      ) : (
        <ReactECharts
          option={chartOption}
          style={{ height: 520, width: '100%' }}
          notMerge={false}           // ✅ enable smooth update
          lazyUpdate={false}         // ✅ apply immediately
          onEvents={{ click: handleClick }}
        />
      )}
    </div>
     <Container fluid className="p-4">
           {/* Heading + Filter Row */}
           
           <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3 p-2 border rounded bg-light">
             <div className="fs-4 fw-bold" style={{ color: "#034694" }}>
               Downtime Report
             </div>
     
             <div className="d-flex align-items-center gap-2 flex-wrap">
               <Form.Select
                 value={machineIdFilter}
                 onChange={(e) => setMachineIdFilter(e.target.value)}
                 className="form-select-sm"
                 style={{ width: "160px", height: "32px" }}
               >
                 <option value="">All Machines</option>
                 {[...new Map(data.map((d) => [d.machine_id, d.machine_name_type])).entries()]
                   .map(([id, name]) => (
                     <option key={id} value={id}>
                       Machine {id} ({name})
                     </option>
                   ))}
               </Form.Select>
     
               <Form.Select
                 value={shiftFilter}
                 onChange={(e) => setShiftFilter(e.target.value)}
                 className="form-select-sm"
                 style={{ width: "130px", height: "32px" }}
               >
                 <option value="">All Shifts</option>
                 {[...new Set(data.map((d) => d.shift_no))].map((shift) => (
                   <option key={shift} value={shift}>
                     Shift {shift}
                   </option>
                 ))}
               </Form.Select>
     
               <Form.Control
                 type="date"
                 size="sm"
                 value={filterDate}
                 onChange={(e) => setFilterDate(e.target.value)}
                 style={{ width: "130px", height: "32px" }}
               />
     
               <Button
                 size="sm"
                 variant="outline-primary"
                 onClick={handleTodayFilter}
                 style={{ height: "32px" }}
               >
                 Today
               </Button>
     
               <Button
                 size="sm"
                 variant="outline-secondary"
                 onClick={() => {
                   setMachineIdFilter("");
                   setShiftFilter("");
                   setFilterDate("");
                 }}
                 style={{ height: "32px" }}
               >
                 Clear
               </Button>
     
               <Button
                 size="sm"
                 variant="success"
                 onClick={exportToExcel}
                 style={{ height: "32px" }}
               >
                 Export
               </Button>
             </div>
           </div>
     
           {/* Data Table */}
           {!showForm && (
           <div style={{ maxHeight: "70vh", overflowY: "auto" }}>
             <table
               className="table table-bordered table-hover mt-2"
               style={{ fontSize: "0.9rem", width: "100%" }}
             >
               <thead className="table-light sticky-top">
                 <tr>
                   <th style={{ color: "#034694" }}>Sr No.</th>
                   <th style={{ color: "#034694" }}>Date</th>
                   <th style={{ color: "#034694" }}>Machine ID</th>
                   <th style={{ color: "#034694" }}>Machine Name</th>
                   <th style={{ color: "#034694" }}>Shift No.</th>
                   <th style={{ color: "#034694" }}>Reason</th>
                   <th style={{ color: "#034694" }}>Duration</th>
                   <th style={{ color: "#034694" }}>Start Time</th>
                   <th style={{ color: "#034694" }}>End Time</th>
                   <th style={{ color: "#034694" }}>Action</th>
                 </tr>
               </thead>
               <tbody>
                 {filteredData.length === 0 ? (
                   <tr>
                     <td colSpan={10} className="text-center">No data found.</td>
                   </tr>
                 ) : (
                   filteredData.map((entry, idx) => (
                     <tr key={idx}>
                       <td>{idx + 1}</td>
                       <td>{new Date(entry.start_timestamp).toLocaleDateString()}</td>
                       <td>{entry.machine_id}</td>
                       <td>{entry.machine_name_type}</td>
                       <td>{entry.shift_no}</td>
                       <td>{entry.downtime_reason}</td>
                       <td>{entry.duration} min</td>
                       <td>{new Date(entry.start_timestamp).toLocaleTimeString()}</td>
                       <td>{new Date(entry.end_timestamp).toLocaleTimeString()}</td>
                       <td className="text-center align-middle">
                         <Button
                           variant="outline-primary"
                           size="sm"
                           className="p-1 d-flex align-items-center justify-content-center mx-auto"
                           style={{ width: "30px", height: "30px" }} onClick={() => handleEdit(entry)}
                         >
                           <FaEdit size={13} />
                         </Button>
                       </td>
                     </tr>
                   ))
                 )}
               </tbody>
             </table>
           </div>
           )}
           {showForm && (
                   <form onSubmit={handleFormSubmit} className="bg-light p-4 rounded mt-4">
                     <div className="row g-3">
                       <div className="col-md-3">

                         <label>Machine</label>
                          <input
                           type="number"
                           className="form-control"
                           value={formData.machine_id}
                           onChange={(e) =>
                             setFormData({ ...formData, machine_id: e.target.value })
                           }
                        
                         />
                       </div>
                       <div className="col-md-3">
                         <label>Shift No</label>
                         <input
                           type="number"
                           className="form-control"
                           value={formData.shift_no}
                           onChange={(e) =>
                             setFormData({ ...formData, shift_no: e.target.value })
                           }
                           required
                         />
                       </div>
                       <div className="col-md-3">
                         <label>Start Timestamp</label>
                         <input
                           type="datetime-local"
                           className="form-control"
                           value={formData.start_timestamp}
                           onChange={(e) =>
                             setFormData({ ...formData, start_timestamp: e.target.value })
                           }
                           required
                         />
                       </div>
                       <div className="col-md-3">
                         <label>End Timestamp</label>
                         <input
                           type="datetime-local"
                           className="form-control"
                           value={formData.end_timestamp}
                           onChange={(e) =>
                             setFormData({ ...formData, end_timestamp: e.target.value })
                           }
                           required
                         />
                       </div>
                       <div className="col-md-3">
                         <label>Date</label>
                         <input
                           type="date"
                           className="form-control"
                           value={formData.date}
                           onChange={(e) =>
                             setFormData({ ...formData, date: e.target.value })
                           }
                           required
                         />
                       </div>
                       <div className="col-md-4">
                         <label>Downtime Reason</label>
                         <Select
                           options={downtimeReasons.map((d) => ({
                             label: d.reason,
                             value: d.reason,
                             category: d.category,
                             linked: d.linked,
                           }))}
                           value={
                             formData.downtime_reason
                               ? {
                                   label: formData.downtime_reason,
                                   value: formData.downtime_reason,
                                 }
                               : null
                           }
                           onChange={(selected) => {
                             setFormData({
                               ...formData,
                               downtime_reason: selected.value,
                               category: selected.category,
                               linked: selected.linked,
                             });
                           }}
                           required
                         />
                       </div>
           
                       
                       <div className="col-md-2">
                         <label>Category</label>
                         <input
                           type="text"
                           className="form-control"
                           value={formData.category}
                           readOnly
                         />
                       </div>
                       <div className="col-md-2">
                         <label>Status</label>
                         <select
                           className="form-select"
                           value={formData.status}
                           onChange={(e) =>
                             setFormData({
                               ...formData,
                               status: e.target.value === "true",
                             })
                           }
                         >
                           <option value="false">Inactive</option>
                           <option value="true">Active</option>
                         </select>
                       </div>
           
                       <div className="col-md-6">
                         <label>Linked</label>
                         <textarea
                           className="form-control"
                           value={formData.linked}
                           readOnly
                         />
                       </div>
                       <div className="col-md-6">
                         <label>Remark</label>
                         <textarea
                           className="form-control"
                           value={formData.remark}
                           onChange={(e) =>
                             setFormData({ ...formData, remark: e.target.value })
                           }
                         ></textarea>
                       </div>
                       <div className="col-md-2">
                         <label>Duration (min)</label>
                         <input
                           type="number"
                           className="form-control"
                           value={formData.duration}
                           onChange={(e) =>
                             setFormData({ ...formData, duration: e.target.value })
                           }
                           required
                         />
                       </div>
                       {/* <div className="col-md-3">
                         <label>Plan ID</label>
                         <Select options={planIds} value={planIds.find(p => p.value === formData.plan_id)} onChange={(opt) => setFormData({ ...formData, plan_id: opt.value })} />
                       </div>
                       <div className="col-md-3">
                         <label>Operator</label>
                         <Select options={operatorIds} value={operatorIds.find(o => o.value === formData.user_id)} onChange={(opt) => setFormData({ ...formData, user_id: opt.value })} />
                       </div> */}
                     </div>
                     <div className="mt-3">
                       <button type="submit" className="btn btn-primary me-2">
                         {isEditMode ? "Update" : "Submit"}
                       </button>
                       <button
                         type="button"
                         className="btn btn-secondary"
                         onClick={() => setShowForm(false)}
                       >
                         Cancel
                       </button>
                     </div>
                   </form>
                 )}
         </Container>
    </>
  );
};

export default DrillDownDowntimeChart;
