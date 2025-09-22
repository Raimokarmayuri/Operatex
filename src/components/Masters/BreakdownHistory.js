import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import { BsPencil, BsTrash } from "react-icons/bs";
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../config";

// ---------- Time helpers (IST) ----------
const IST_TZ = "Asia/Kolkata";
const pad = (n) => String(n).padStart(2, "0");

/** Current IST time for <input type="datetime-local"> as "YYYY-MM-DDTHH:mm" */
function nowISTForInput() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: IST_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());

  const get = (t) => parts.find((p) => p.type === t)?.value || "";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}

/** Display any date string in IST as "DD/MM/YYYY, HH:mm" */
function displayIST(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr); // JS will parse offsets/UTC if present
  if (isNaN(d)) return "-";
  return d.toLocaleString("en-IN", {
    timeZone: IST_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/** Convert any API date string to <input type="datetime-local"> in IST */
function toInputIST(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d)) return "";
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: IST_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(d);
  const get = (t) => parts.find((p) => p.type === t)?.value || "00";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}

/** Keep entered local value as explicit IST string (no UTC conversion). */
function inputToISTOffsetIso(localVal /* "YYYY-MM-DDTHH:mm" */) {
  if (!localVal) return null;
  // Store exactly with IST offset:
  return `${localVal}:00+05:30`;
}

const BreakdownForm = () => {
  const navigate = useNavigate();

  const [breakdowns, setBreakdowns] = useState([]);
  const [filteredBreakdowns, setFilteredBreakdowns] = useState([]);
  const [machineIds, setMachineIds] = useState([]);
  const [selectedMachineId, setSelectedMachineId] = useState(null);
  const [isTodayFilter, setIsTodayFilter] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [techNames, setTechNames] = useState([]);
  const [shiftOptions, setShiftOptions] = useState([]);
  const [isTodayScheduleFilter, setIsTodayScheduleFilter] = useState(false);
  const [isScheduleActive, setIsScheduleActive] = useState(false);

  const [machineMap, setMachineMap] = useState({});

  const [formData, setFormData] = useState({
    machine_id: "",
    breakdown_reason: "",
    breakdown_start: nowISTForInput(), // default to current IST
    breakdown_end: "",
    assigned_technician: "",
    remark: "",
    shift_no: "",
    breakdown_type: "",
    action_taken: "",
    root_cause: "",
    responsibility: "",
    status: "open",
    location: "",
    user_id: "",
  });

  // ---- Fetchers ----
  useEffect(() => {
    fetchBreakdowns();
    fetchShiftOptions();
    fetchMachineData();
    fetchTechnicianNames();
  }, []);

  const fetchBreakdowns = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/breakdown`);

      // Add derived fields (duration & display strings)
      const processed = data.map((b) => {
        const s = b.breakdown_start ? new Date(b.breakdown_start) : null;
        const e = b.breakdown_end ? new Date(b.breakdown_end) : null;

        const durationMs = s && e ? e - s : 0;
        const h = Math.floor(durationMs / 3600000);
        const m = Math.floor((durationMs % 3600000) / 60000);
        const duration = s && e ? `${h}h ${m}m` : "-";

        return {
          ...b,
          _displayStartIST: displayIST(b.breakdown_start),
          _displayEndIST: displayIST(b.breakdown_end),
          _duration: duration,
        };
      });

      // Sort by real start time descending
      processed.sort(
        (a, b) => new Date(b.breakdown_start) - new Date(a.breakdown_start)
      );

      setBreakdowns(processed);
      setFilteredBreakdowns(processed);
    } catch (err) {
      console.error("Error fetching breakdown data:", err);
    }
  };

  const fetchMachineData = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/machines/getallmachine`);
      const machineOptions = data.map((m) => ({
        value: m.machine_id,
        label: m.machine_name_type,
      }));
      setMachineIds(machineOptions);

      const map = {};
      data.forEach((m) => (map[m.machine_id] = m.machine_name_type));
      setMachineMap(map);
    } catch (err) {
      console.error("Error fetching machine data:", err);
    }
  };

  const fetchShiftOptions = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/shifts`);
      setShiftOptions(data || []);
    } catch {}
  };

  const fetchTechnicianNames = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/users`);
      setTechNames(data || []);
    } catch (err) {
      console.error("Error fetching technician names:", err);
    }
  };

  // ---- Filters ----
  const applyFilters = () => {
    let f = [...breakdowns];

    if (selectedMachineId) {
      f = f.filter((b) => b.machine_id === selectedMachineId.value);
    }

    if (startDate) {
      const sd = new Date(startDate);
      f = f.filter((b) => new Date(b.breakdown_start) >= sd);
    }

    if (endDate) {
      const ed = new Date(endDate);
      f = f.filter((b) => new Date(b.breakdown_end) <= ed);
    }

    if (isTodayFilter) {
      const today = new Date();
      // Compute IST "start of day" and "end of day" by using displayIST parts
      const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: IST_TZ,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).formatToParts(today);
      const y = parts.find((p) => p.type === "year")?.value;
      const m = parts.find((p) => p.type === "month")?.value;
      const d = parts.find((p) => p.type === "day")?.value;

      const istStart = new Date(`${y}-${m}-${d}T00:00:00+05:30`);
      const istEnd = new Date(`${y}-${m}-${d}T23:59:59+05:30`);

      f = f.filter((b) => {
        const bd = new Date(b.breakdown_start);
        return bd >= istStart && bd <= istEnd;
      });
    }

    setFilteredBreakdowns(f);
    setIsScheduleActive(false);
  };

  useEffect(() => {
    applyFilters();
  }, [selectedMachineId, startDate, endDate, isTodayFilter, breakdowns]);

  const filterTodaysSchedule = () => {
    const today = new Date();
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: IST_TZ,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(today);
    const y = parts.find((p) => p.type === "year")?.value;
    const m = parts.find((p) => p.type === "month")?.value;
    const d = parts.find((p) => p.type === "day")?.value;

    const istStart = new Date(`${y}-${m}-${d}T00:00:00+05:30`);
    const istEnd = new Date(`${y}-${m}-${d}T23:59:59+05:30`);

    const filtered = breakdowns.filter((b) => {
      const created = new Date(b.created_at);
      return created >= istStart && created <= istEnd;
    });

    setFilteredBreakdowns(filtered);
    setIsScheduleActive(true);
  };

  // ---- Form handlers ----
  const numOrNull = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  const handleEdit = (bd) => {
    setFormData({
      machine_id: bd.machine_id ?? "",
      breakdown_reason: bd.breakdown_reason ?? "",
      breakdown_start: toInputIST(bd.breakdown_start), // IST input shape
      breakdown_end: toInputIST(bd.breakdown_end),
      assigned_technician: bd.assigned_technician ?? "",
      remark: bd.remark ?? "",
      shift_no: bd.shift_no ?? "",
      breakdown_type: bd.breakdown_type ?? "",
      action_taken: bd.action_taken ?? "",
      root_cause: bd.root_cause ?? "",
      responsibility: bd.responsibility ?? "",
      status:
        typeof bd.status === "boolean"
          ? bd.status
            ? "closed"
            : "open"
          : bd.status || "open",
      location: bd.location ?? "",
      user_id: techNames.find((t) => t.full_name === bd.assigned_technician)?.user_id || "",
    });
    setShowForm(true);
    setIsEditing(true);
    setEditingId(bd.breakdown_id);
  };

  const resetForm = () => {
    setFormData({
      machine_id: "",
      breakdown_reason: "",
      breakdown_start: nowISTForInput(), // current IST again
      breakdown_end: "",
      assigned_technician: "",
      remark: "",
      shift_no: "",
      breakdown_type: "",
      action_taken: "",
      root_cause: "",
      responsibility: "",
      status: "open",
      location: "",
      user_id: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const selectedUser = techNames.find((u) => u.user_id === formData.user_id);

      const payload = {
        machine_id: numOrNull(formData.machine_id),
        breakdown_reason: formData.breakdown_reason?.trim() || null,
        // Save EXACTLY as IST with offset:
        breakdown_start: inputToISTOffsetIso(formData.breakdown_start),
        breakdown_end: formData.breakdown_end ? inputToISTOffsetIso(formData.breakdown_end) : null,
        assigned_technician: selectedUser?.full_name ?? null,
        remark: formData.remark?.trim() || null,
        shift_no: numOrNull(formData.shift_no),
        breakdown_type: formData.breakdown_type || null,
        action_taken: formData.action_taken?.trim() || null,
        root_cause: formData.root_cause?.trim() || null,
        responsibility: formData.responsibility?.trim() || null,
        status: formData.status || "open",
        location: formData.location?.trim() || null,
        user_id: numOrNull(formData.user_id),
      };

      const missing = [];
      if (!payload.machine_id) missing.push("machine");
      if (!payload.breakdown_reason) missing.push("reason");
      if (!formData.breakdown_start) missing.push("start time");
      if (!payload.shift_no && payload.shift_no !== 0) missing.push("shift");
      if (!payload.user_id) missing.push("technician");
      if (missing.length) {
        alert(`Please fill: ${missing.join(", ")}`);
        return;
      }

      if (formData.breakdown_end) {
        const s = new Date(payload.breakdown_start);
        const e2 = new Date(payload.breakdown_end);
        if (e2 < s) {
          alert("Breakdown End cannot be earlier than Start.");
          return;
        }
      }

      if (isEditing && editingId) {
        await axios.put(`${API_BASE_URL}/api/breakdown/${editingId}`, payload, {
          headers: { "Content-Type": "application/json" },
        });
        alert("Breakdown updated successfully!");
      } else {
        await axios.post(`${API_BASE_URL}/api/breakdown`, payload, {
          headers: { "Content-Type": "application/json" },
        });
        alert("Breakdown added successfully!");
      }

      fetchBreakdowns();
      resetForm();
      setShowForm(false);
      setIsEditing(false);
      setEditingId(null);
    } catch (err) {
      console.error("Error submitting breakdown:", err);
      const data = err.response?.data || {};
      alert(
        `Submission failed
code: ${data.code || "-"}
detail: ${data.detail || data.error || data.message || "-"}`
      );
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this breakdown?")) {
      try {
        await axios.delete(`${API_BASE_URL}/api/breakdown/${id}`);
        fetchBreakdowns();
      } catch {}
    }
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredBreakdowns);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Breakdown Data");
    XLSX.writeFile(wb, "Breakdown_Report.xlsx");
  };

  const resetFilters = () => {
    setSelectedMachineId(null);
    setStartDate("");
    setEndDate("");
    setIsTodayFilter(false);
    setIsTodayScheduleFilter(true);
    setFilteredBreakdowns(breakdowns);
  };

  return (
    <div className="" style={{ marginTop: "3rem" }}>
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mt-2 mb-2 p-2 border rounded bg-light">
        <div className="fs-4 fw-bold" style={{ color: "#034694" }}>
          Breakdowns
        </div>

        {!showForm && (
          <div className="d-flex flex-wrap align-items-center gap-2 ms-auto">
            <Select
              className="me-2"
              options={machineIds}
              value={selectedMachineId}
              onChange={(option) => {
                setSelectedMachineId(option);
                applyFilters();
              }}
              placeholder="Select Machine ID"
              isClearable
              styles={{ container: (base) => ({ ...base, width: 200 }) }}
            />

            <input
              type="text"
              className="form-control form-control-sm me-2"
              name="startDate"
              value={startDate}
              // disabled
              onChange={(e) => {
                setStartDate(e.target.value);
                applyFilters();
              }}
              placeholder="Start Date dd-mm-yyyy"
              onFocus={(e) => (e.target.type = "date")}
              onBlur={(e) => (e.target.type = "text")}
              style={{ width: "160px" }}
            />

            <input
              type="text"
              className="form-control form-control-sm me-2"
              name="endDate"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                applyFilters();
              }}
              placeholder="End Date dd-mm-yyyy"
              onFocus={(e) => (e.target.type = "date")}
              onBlur={(e) => (e.target.type = "text")}
              style={{ width: "160px" }}
            />

            <button className="btn btn-outline-primary me-2" onClick={resetFilters}>
              Reset Filters
            </button>

            {!isTodayScheduleFilter ? (
              <button
                className="btn btn-outline-primary me-2"
                onClick={() => {
                  setIsTodayScheduleFilter(true);
                  filterTodaysSchedule();
                }}
              >
                View Today's
              </button>
            ) : (
              <button
                className="btn btn-outline-primary me-2"
                onClick={() => {
                  setIsTodayScheduleFilter(false);
                  setFilteredBreakdowns(breakdowns);
                }}
              >
                All Breakdowns
              </button>
            )}

            <button className="btn btn-outline-primary" onClick={exportToExcel}>
              Export to Excel
            </button>
          </div>
        )}

        {!showForm && (
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            + Add Breakdown
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <form className="m-4" onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-4">
              <label>Machine</label>
              <Select
                options={machineIds}
                value={machineIds.find((m) => m.value === formData.machine_id)}
                onChange={(opt) => setFormData({ ...formData, machine_id: opt.value })}
                placeholder="Select Machine"
                required
              />
            </div>

            <div className="col-md-4">
              <label>Breakdown Start</label>
              <input
                type="datetime-local"
                className="form-control"
                value={formData.breakdown_start}
                onChange={(e) => setFormData({ ...formData, breakdown_start: e.target.value })}
                required
                disabled={isEditing}
              />
            </div>

            <div className="col-md-4">
              <label>Breakdown End</label>
              <input
                type="datetime-local"
                className="form-control"
                value={formData.breakdown_end}
                onChange={(e) => setFormData({ ...formData, breakdown_end: e.target.value })}
              />
            </div>

            <div className="col-md-4">
              <label>Reason</label>
              <input
                type="text"
                className="form-control"
                value={formData.breakdown_reason}
                onChange={(e) => setFormData({ ...formData, breakdown_reason: e.target.value })}
                required
              />
            </div>

            <div className="col-md-4">
              <label>Technician</label>
              <select
                className="form-control"
                value={formData.user_id}
                onChange={(e) => setFormData({ ...formData, user_id: parseInt(e.target.value) })}
                required
              >
                <option value="">Select Technician</option>
                {techNames.map((u) => (
                  <option key={u.user_id} value={u.user_id}>
                    {u.full_name} ({u.employee_code})
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-4">
              <label>Shift No</label>
              <select
                className="form-control"
                value={formData.shift_no}
                onChange={(e) => setFormData({ ...formData, shift_no: e.target.value })}
                required
              >
                <option value="">Select Shift</option>
                {shiftOptions.map((s) => (
                  <option key={s.shift_no} value={s.shift_no}>
                    {s.shift_no}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-4">
              <label>Breakdown Type</label>
              <select
                className="form-control"
                value={formData.breakdown_type}
                onChange={(e) => setFormData({ ...formData, breakdown_type: e.target.value })}
                required
              >
                <option value="">Select Type</option>
                <option value="Mechanical">Mechanical</option>
                <option value="Electrical">Electrical</option>
                <option value="Electronic">Electronic</option>
                <option value="Hydraulic">Hydraulic</option>
                <option value="Pneumatic">Pneumatic</option>
                <option value="Production Setting">Production Setting</option>
              </select>
            </div>

            <div className="col-md-4">
              <label>Action Taken</label>
              <input
                type="text"
                className="form-control"
                value={formData.action_taken}
                onChange={(e) => setFormData({ ...formData, action_taken: e.target.value })}
              />
            </div>

            <div className="col-md-4">
              <label>Root Cause</label>
              <input
                type="text"
                className="form-control"
                value={formData.root_cause}
                onChange={(e) => setFormData({ ...formData, root_cause: e.target.value })}
              />
            </div>

            <div className="col-md-4">
              <label>Responsibility</label>
              <input
                type="text"
                className="form-control"
                value={formData.responsibility}
                onChange={(e) => setFormData({ ...formData, responsibility: e.target.value })}
              />
            </div>

            <div className="col-md-4">
              <label>Status</label>
              <select
                className="form-control"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="open">Open</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div className="col-md-4">
              <label>Location</label>
              <input
                type="text"
                className="form-control"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>

            <div className="col-md-6">
              <label>Remark</label>
              <textarea
                className="form-control"
                rows={2}
                value={formData.remark}
                onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
              />
            </div>
          </div>

          <div className="mt-3">
            <button type="submit" className="btn btn-primary me-2">
              Submit
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                resetForm();
                setShowForm(false);
                setIsEditing(false);
                setEditingId(null);
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Table */}
      {!showForm && (
        <div className="table-responsive" style={{ maxHeight: "600px", overflowY: "auto" }}>
          <table
            className="table table-bordered table-hover mt-4"
            style={{ fontSize: "0.9rem", lineHeight: "1.2" }}
          >
            <thead className="table-light" style={{ top: 1, zIndex: 1020 }}>
              <tr>
                <th style={{ padding: "10px", color: "#034694" }}>SR No.</th>
                <th style={{ padding: "10px", color: "#034694" }}>Date</th>
                <th style={{ padding: "10px", color: "#034694" }}>Machine ID</th>
                <th style={{ padding: "10px", color: "#034694" }}>Technician</th>
                <th style={{ padding: "10px", color: "#034694" }}>Breakdown Reason</th>
                <th style={{ padding: "10px", color: "#034694" }}>Breakdown Duration</th>
                <th style={{ padding: "10px", color: "#034694" }}>Start Date</th>
                <th style={{ padding: "10px", color: "#034694" }}>End Date</th>
                <th style={{ padding: "10px", color: "#034694" }}>Status</th>
                <th style={{ padding: "10px", color: "#034694" }}>Actions</th>
              </tr>
            </thead>
            <tbody className="text-center">
              {filteredBreakdowns.length > 0 ? (
                filteredBreakdowns.map((b, idx) => (
                  <tr key={b._id || `${b.breakdown_id}-${idx}`}>
                    <td style={{ padding: "10px" }}>{idx + 1}</td>
                    <td style={{ padding: "10px" }}>
                      {b.created_at ? new Date(b.created_at).toLocaleDateString("en-IN", { timeZone: IST_TZ }) : "-"}
                    </td>
                    <td style={{ padding: "10px" }}>{machineMap[b.machine_id] || b.machine_id}</td>
                    <td style={{ padding: "10px" }}>{b.assigned_technician}</td>
                    <td style={{ padding: "10px" }}>{b.breakdown_reason}</td>
                    <td style={{ padding: "8px" }}>{b._duration}</td>
                    <td style={{ padding: "10px" }}>{b._displayStartIST}</td>
                    <td style={{ padding: "10px" }}>{b._displayEndIST}</td>
                    <td style={{ padding: "10px" }}>{b.status}</td>
                    <td>
                      <button
                        className="btn border-0 bg-transparent text-dark btn-sm me-2"
                        onClick={() => handleEdit(b)}
                      >
                        <BsPencil className="me-1" style={{ color: "blue" }} />
                      </button>
                      <button
                        className="btn border-0 bg-transparent text-danger btn-sm"
                        onClick={() => handleDelete(b.breakdown_id)}
                      >
                        <BsTrash className="me-1" style={{ color: "red" }} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="text-center text-danger">
                    No breakdowns found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BreakdownForm;
