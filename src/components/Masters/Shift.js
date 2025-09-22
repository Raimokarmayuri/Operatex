
// import React, { useEffect, useState } from "react";
// import { Container, Table, Form, Button } from "react-bootstrap";
// import axios from "axios";
// import { FaPlus } from "react-icons/fa";
// import { BsPencil } from "react-icons/bs";
// import { RiDeleteBin6Line } from "react-icons/ri";
// import API_BASE_URL from "../config";

// const initialForm = {
//   shift_no: "",
//   shift_name: "",
//   shift_start_time: "",
//   shift_end_time: "",
//   plant_id: "",
//   line_id: "",
//   status: "Active",
//   created_by: "",
// };

// const ShiftMasterTable = () => {
//   const [shifts, setShifts] = useState([]);
//   const [showForm, setShowForm] = useState(false);
//   const [formData, setFormData] = useState(initialForm);
//   const [editingId, setEditingId] = useState(null);

//   const fetchShifts = async () => {
//   try {
//     const res = await axios.get(`${API_BASE_URL}/api/shifts`);
//     setShifts(res.data);
//   } catch (err) {
//     console.error("Error fetching shifts:", err);
//   }
// };

//   useEffect(() => {
//     fetchShifts();
//   }, []);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const payload = {
//       ...formData,
//       shift_start_time: formData.shift_start_time + ":00",
//       shift_end_time: formData.shift_end_time + ":00",
//     };

//     try {
//   if (editingId) {
//     await axios.put(`${API_BASE_URL}/api/shifts/${editingId}`, payload);
//   } else {
//     await axios.post(`${API_BASE_URL}/api/shifts`, payload);
//   }
//       setFormData(initialForm);
//       setEditingId(null);
//       setShowForm(false);
//       fetchShifts();
//     } catch (err) {
//       console.error("Submit error:", err);
//     }
//   };

//   const handleEdit = (shift) => {
//     setFormData({
//       shift_no: shift.shift_no,
//       shift_name: shift.shift_name,
//       shift_start_time: shift.shift_start_time?.slice(0, 5),
//       shift_end_time: shift.shift_end_time?.slice(0, 5),
//       plant_id: shift.plant_id || "",
//       line_id: shift.line_id || "",
//       status: shift.status,
//       created_by: shift.created_by || "",
//     });
//     setEditingId(shift.shift_id);
//     setShowForm(true);
//   };

//   const handleDelete = async (id) => {
//   if (!window.confirm("Are you sure you want to delete this shift?")) return;

//   try {
//     await axios.delete(`${API_BASE_URL}/api/shifts/${id}`);
//     fetchShifts(); // refresh the list
//   } catch (err) {
//     console.error("Delete error:", err);
//   }
// };

// const [lines, setLines] = useState([]);

// useEffect(() => {
//   fetchShifts();
//   fetchLines(); // Fetch lines on component mount
// }, []);

// const fetchLines = async () => {
//   try {
//     const res = await axios.get(`${API_BASE_URL}/api/lines`);
//     setLines(res.data);
//   } catch (err) {
//     console.error("Error fetching lines:", err);
//   }
// };

//   return (
//     <Container fluid className="text-center" style={{ marginTop: "3rem" }}>
//       <div className="d-flex justify-content-between align-items-center mb-3 p-2 border rounded bg-light">
//         <h4 className="fw-bold m-0" style={{ color: "#034694" }}>Shift Master</h4>
//         <Button
//           variant="primary"
//           size="sm"
//           onClick={() => {
//             setFormData(initialForm);
//             setEditingId(null);
//             setShowForm(true);
//           }}
//         >
//           <FaPlus className="me-1" />
//           Add Shift
//         </Button>
//       </div>

//       {showForm && (
//         <Form
//           onSubmit={handleSubmit}
//           className="row g-3 shadow p-4 mb-4 bg-light rounded border border-secondary text-start"
//         >
//           <Form.Group className="col-md-2" controlId="shiftNo">
//             <Form.Label style={{ color: "#034694", fontWeight: "500" }}>Shift No</Form.Label>
//             <Form.Control
//               name="shift_no"
//               type="number"
//               min="0"
//               value={formData.shift_no}
//               onChange={handleChange}
//               required
//             />
//           </Form.Group>

//           <Form.Group className="col-md-3" controlId="shiftName">
//             <Form.Label style={{ color: "#034694", fontWeight: "500" }}>Shift Name</Form.Label>
//             <Form.Control
//               name="shift_name"
//               value={formData.shift_name}
//               onChange={handleChange}
//               required
//             />
//           </Form.Group>

//           <Form.Group className="col-md-2" controlId="startTime">
//             <Form.Label style={{ color: "#034694", fontWeight: "500" }}>Start Time</Form.Label>
//             <Form.Control
//               type="time"
//               name="shift_start_time"
//               value={formData.shift_start_time}
//               onChange={handleChange}
//               required
//             />
//           </Form.Group>

//           <Form.Group className="col-md-2" controlId="endTime">
//             <Form.Label style={{ color: "#034694", fontWeight: "500" }}>End Time</Form.Label>
//             <Form.Control
//               type="time"
//               name="shift_end_time"
//               value={formData.shift_end_time}
//               onChange={handleChange}
//               required
//             />
//           </Form.Group>

//           <Form.Group className="col-md-3" controlId="plantId">
//             <Form.Label style={{ color: "#034694", fontWeight: "500" }}>Plant ID</Form.Label>
//             <Form.Control
//               name="plant_id"
//               value={formData.plant_id}
//               onChange={handleChange}
//             />
//           </Form.Group>

//           <Form.Group className="col-md-3" controlId="lineId">
//             <Form.Label style={{ color: "#034694", fontWeight: "500" }}>Line ID</Form.Label>
//            <Form.Select name="line_id" value={formData.line_id} onChange={handleChange} required>
//   <option value="">Select Line</option>
//   {lines.map((line) => (
//     <option key={line.line_id} value={line.line_id}>
//       {line.line_name} ({line.line_id})
//     </option>
//   ))}
// </Form.Select>

//           </Form.Group>

//           <Form.Group className="col-md-3" controlId="status">
//             <Form.Label style={{ color: "#034694", fontWeight: "500" }}>Status</Form.Label>
//             <Form.Select name="status" value={formData.status} onChange={handleChange}>
//               <option value="Active">Active</option>
//               <option value="Inactive">Inactive</option>
//             </Form.Select>
//           </Form.Group>
// {/* 
//           <Form.Group className="col-md-3" controlId="createdBy">
//             <Form.Label style={{ color: "#034694", fontWeight: "500" }}>Created By</Form.Label>
//             <Form.Control
//               name="created_by"
//               value={formData.created_by}
//               onChange={handleChange}
//             />
//           </Form.Group> */}

//           <div className="col-md-3 d-flex gap-2">
//             <Button type="submit" variant="primary" size="sm" className="w-100">
//               {editingId ? "Update" : "Create"}
//             </Button>
//             <Button
//               type="button"
//               variant="outline-secondary"
//               size="sm"
//               className="w-100"
//               onClick={() => {
//                 setFormData(initialForm);
//                 setEditingId(null);
//                 setShowForm(false);
//               }}
//             >
//               Cancel
//             </Button>
//           </div>

//         </Form>
//       )}

//       <div style={{ maxHeight: "70vh", overflowY: "auto" }}>
//         <Table bordered hover className="mt-2" style={{ fontSize: "1rem", width: "100%" }}>
//           <thead className="table-light sticky-top">
//             <tr>
//               <th style={{ color: "#034694" }}>SR No.</th>
//               <th style={{ color: "#034694" }}>Shift No</th>
//               <th style={{ color: "#034694" }}>Shift Name</th>
//               <th style={{ color: "#034694" }}>Start</th>
//               <th style={{ color: "#034694" }}>End</th>
//               <th style={{ color: "#034694" }}>Duration</th>

//               <th style={{ color: "#034694" }}>Status</th>
//               <th style={{ color: "#034694" }}>Action</th>
//             </tr>
//           </thead>
//           <tbody>
//             {shifts.map((s, index) => (
//               <tr key={s.shift_id}>
//                 <td>{index + 1}</td>
//                 <td>{s.shift_no}</td>
//                 <td>{s.shift_name}</td>
//                 <td>{s.shift_start_time}</td>
//                 <td>{s.shift_end_time}</td>
//                 <td>{s.shift_duration_mins} min</td>

//                 <td className={s.status === "Active" ? "text-success fw-bold" : "text-danger fw-bold"}>
//                   {s.status}
//                 </td>
//                 <td>
//                   <Button
//                     size="sm"
//                     variant="outline-warning"
//                     className="me-2"
//                     onClick={() => handleEdit(s)}
//                   >
//                     <BsPencil />
//                   </Button>
//                   <Button
//                     size="sm"
//                     variant="outline-danger"
//                     onClick={() => handleDelete(s.shift_id)}
//                   >
//                     <RiDeleteBin6Line />
//                   </Button>
//                 </td>
//               </tr>
//             ))}
//             {shifts.length === 0 && (
//               <tr>
//                 <td colSpan="9">No shifts available</td>
//               </tr>
//             )}
//           </tbody>
//         </Table>
//       </div>
//     </Container>
//   );
// };

// export default ShiftMasterTable;
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { BsPencil, BsTrash } from "react-icons/bs";
import API_BASE_URL from "../config";

const Shiftform = () => {
  const [shifts, setShifts] = useState([]);
  const [currentShiftNo, setCurrentShiftNo] = useState(null);
  const [editingShiftId, setEditingShiftId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [shiftForm, setShiftForm] = useState({
    shift_no: "",
    shift_name: "",
    shift_start_time: "",
    shift_end_time: "",
    shift_duration_mins: "",
    is_night_shift: false,
    plant_id: "",
    line_id: "",
    status: "Active", // UI-only; display is auto-driven
    created_by: "",
  });

  const fetchShifts = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/shifts`);
      setShifts(response.data || []);
    } catch (error) {
      console.error("Error fetching shifts", error);
    }
  };

  useEffect(() => {
    fetchShifts();
  }, []);

  // ---- Time helpers (handles midnight wrap) -------------------------
  const parseHM = (hhmm) => {
    // returns {h, m} as numbers; expects "HH:mm"
    if (!hhmm || typeof hhmm !== "string") return { h: 0, m: 0 };
    const [h, m] = hhmm.split(":").map(Number);
    return { h: isNaN(h) ? 0 : h, m: isNaN(m) ? 0 : m };
  };

  const isNowInRange = (now, startHM, endHM) => {
    // Builds Date objects anchored to 'now' date to compare ranges.
    const { h: sh, m: sm } = parseHM(startHM);
    const { h: eh, m: em } = parseHM(endHM);

    const start = new Date(now);
    start.setHours(sh, sm, 0, 0);

    const end = new Date(now);
    end.setHours(eh, em, 0, 0);

    // If end <= start, it wraps to next day (night shift)
    if (end <= start) {
      // e.g., 20:00 → 05:00
      const endNext = new Date(end.getTime() + 24 * 60 * 60 * 1000);
      return now >= start || now < endNext; // in [start, 24:00) U [00:00, endNext)
    }
    // Normal same-day shift
    return now >= start && now < end;
  };

  const computeCurrentShiftNo = (list) => {
    if (!Array.isArray(list) || list.length === 0) return null;
    const now = new Date();
    // If you want to ensure IST irrespective of system TZ, you can adjust here.
    for (const s of list) {
      const start = s.shift_start_time;
      const end = s.shift_end_time;
      if (start && end && isNowInRange(now, start, end)) {
        return Number(s.shift_no);
      }
    }
    return null;
  };

  // Calculate current shift initially & every 60 seconds
  useEffect(() => {
    const update = () => setCurrentShiftNo(computeCurrentShiftNo(shifts));
    update();
    const t = setInterval(update, 60_000);
    return () => clearInterval(t);
  }, [shifts]);

  // ---- Form handlers -----------------------------------------------
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setShiftForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...shiftForm,
      shift_no: parseInt(shiftForm.shift_no),
      shift_duration_mins: shiftForm.shift_duration_mins
        ? parseInt(shiftForm.shift_duration_mins)
        : null,
      plant_id: shiftForm.plant_id ? parseInt(shiftForm.plant_id) : null,
      line_id: shiftForm.line_id ? parseInt(shiftForm.line_id) : null,
      created_by: shiftForm.created_by ? parseInt(shiftForm.created_by) : null,
    };

    try {
      if (editingShiftId) {
        await axios.put(`${API_BASE_URL}/api/shifts/${editingShiftId}`, payload);
        alert("Shift updated");
      } else {
        await axios.post(`${API_BASE_URL}/api/shifts`, payload);
        alert("Shift created");
      }
      resetForm();
      await fetchShifts();
      setCurrentShiftNo(computeCurrentShiftNo(shifts));
    } catch (error) {
      console.error("Error saving shift:", error);
      alert("❌ Error while saving shift. Check required fields.");
    }
  };

  const resetForm = () => {
    setShiftForm({
      shift_no: "",
      shift_name: "",
      shift_start_time: "",
      shift_end_time: "",
      shift_duration_mins: "",
      is_night_shift: false,
      plant_id: "",
      line_id: "",
      status: "Active",
      created_by: "",
    });
    setEditingShiftId(null);
    setShowForm(false);
  };

  const handleEdit = (shift) => {
    setShiftForm({
      shift_no: shift.shift_no ?? "",
      shift_name: shift.shift_name ?? "",
      shift_start_time: shift.shift_start_time ?? "",
      shift_end_time: shift.shift_end_time ?? "",
      shift_duration_mins: shift.shift_duration_mins ?? "",
      is_night_shift: !!shift.is_night_shift,
      plant_id: shift.plant_id ?? "",
      line_id: shift.line_id ?? "",
      status: shift.status ?? "Active",
      created_by: shift.created_by ?? "",
    });
    setEditingShiftId(shift.shift_id ?? shift.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/shifts/${id}`);
      fetchShifts();
    } catch (error) {
      console.error("Error deleting shift", error);
    }
  };

  // ---- UI helpers ---------------------------------------------------
  const renderStatusBadge = (shift) => {
    const active =
      currentShiftNo != null && Number(shift.shift_no) === Number(currentShiftNo);
    const text = active ? "Active" : "Inactive";
    const cls = active ? "badge bg-success" : "badge bg-secondary";
    return <span className={cls}>{text}</span>;
  };

  return (
    <div className="container3 mt-5">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2 p-2 border rounded bg-light">
        <div className="fs-4 fw-bold" style={{ color: "#034694" }}>
          Shift Master
        </div>
        <div className="d-flex align-items-center gap-3">
          <div className="small text-muted">
            Current Shift:&nbsp;<strong>{currentShiftNo ?? "—"}</strong>
          </div>
          {!showForm && (
            <button className="btn btn-primary" onClick={() => setShowForm(true)}>
              + Add Shift
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleFormSubmit} className="row g-3 mt-4">
          <div className="col-md-3">
            <label className="form-label">Shift No</label>
            <input
              type="number"
              className="form-control"
              name="shift_no"
              value={shiftForm.shift_no}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="col-md-3">
            <label className="form-label">Shift Name</label>
            <input
              type="text"
              className="form-control"
              name="shift_name"
              value={shiftForm.shift_name}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="col-md-3">
            <label className="form-label">Start Time</label>
            <input
              type="time"
              className="form-control"
              name="shift_start_time"
              value={shiftForm.shift_start_time}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="col-md-3">
            <label className="form-label">End Time</label>
            <input
              type="time"
              className="form-control"
              name="shift_end_time"
              value={shiftForm.shift_end_time}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="col-md-3">
            <label className="form-label">Duration (mins)</label>
            <input
              type="number"
              className="form-control"
              name="shift_duration_mins"
              value={shiftForm.shift_duration_mins}
              onChange={handleInputChange}
            />
          </div>

          {/* <div className="col-md-3">
            <label className="form-label">Created By</label>
            <input
              type="number"
              className="form-control"
              name="created_by"
              value={shiftForm.created_by}
              onChange={handleInputChange}
              required
            />
          </div> */}

          <div className="col-md-3">
            <label className="form-label">Is Night Shift</label><br />
            <input
              type="checkbox"
              name="is_night_shift"
              checked={shiftForm.is_night_shift}
              onChange={handleInputChange}
            />{" "}
            Yes
          </div>

          {/* Status display is auto-driven */}
          <div className="col-md-3">
            <label className="form-label">Status (Auto)</label>
            <input
              type="text"
              className="form-control"
              value={
                currentShiftNo != null &&
                Number(shiftForm.shift_no) === Number(currentShiftNo)
                  ? "Active"
                  : "Inactive"
              }
              disabled
            />
            <div className="form-text">
              Status is set automatically based on current time.
            </div>
          </div>

          <div className="col-12">
            <button type="submit" className="btn btn-primary">
              <i className={`fas ${editingShiftId ? "fa-edit" : "fa-plus"} me-2`} />
              {editingShiftId ? "Update Shift" : "Add Shift"}
            </button>
            <button type="button" className="btn btn-secondary ms-2" onClick={resetForm}>
              <i className="fas fa-times"></i> Cancel
            </button>
          </div>
        </form>
      )}

      {!showForm && (
        <table
          className="table table-bordered table-hover mt-4"
          style={{ fontSize: "0.9rem", lineHeight: "1.2" }}
        >
          <thead className="table-light" style={{ position: "sticky", top: 1, zIndex: 1020 }}>
            <tr>
              <th style={{ color: "#034694" }}>Shift Number</th>
              <th style={{ color: "#034694" }}>Shift Name</th>
              <th style={{ color: "#034694" }}>Start Time</th>
              <th style={{ color: "#034694" }}>End Time</th>
              <th style={{ color: "#034694" }}>Status</th>
              {/* <th style={{ color: "#034694" }}>Created By</th> */}
              <th style={{ color: "#034694" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {shifts.map((shift) => (
              <tr key={shift.shift_id ?? shift.id}>
                <td>{shift.shift_no}</td>
                <td>{shift.shift_name}</td>
                <td>{shift.shift_start_time}</td>
                <td>{shift.shift_end_time}</td>
                <td>{renderStatusBadge(shift)}</td>
                {/* <td>{shift.created_by}</td> */}
                <td>
                  <button
                    className="btn btn-sm me-2"
                    onClick={() => handleEdit(shift)}
                    title="Edit"
                  >
                    <BsPencil className="me-1" style={{ color: "black" }} />
                  </button>
                  <button
                    className="btn btn-sm"
                    onClick={() => handleDelete(shift.shift_id ?? shift.id)}
                    title="Delete"
                  >
                    <BsTrash className="me-0" style={{ color: "red" }} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Shiftform;
