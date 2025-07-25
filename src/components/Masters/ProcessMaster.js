import React, { useEffect, useState } from "react";
import axios from "axios";
import { BsPencil, BsTrash } from "react-icons/bs";
import { FaSave, FaTimes } from "react-icons/fa";
import API_BASE_URL from "../config";

export default function ProcessMasterForm() {
  const [processes, setProcesses] = useState([]);
  const [processRows, setProcessRows] = useState([]);
  const [selectedPartId, setSelectedPartId] = useState("");
  const [partList, setPartList] = useState([]);
  const [machineList, setMachineList] = useState([]);
  const [filterPart, setFilterPart] = useState("");
  const [filterMachine, setFilterMachine] = useState("");
  const [editProcessId, setEditProcessId] = useState(null);

  const fetchData = async () => {
    const res = await axios.get(`${API_BASE_URL}/api/processes`);
    setProcesses(res.data);
  };

  const fetchDropdownData = async () => {
    try {
      const [parts, machines] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/parts`),
        axios.get(`${API_BASE_URL}/api/machines/getallmachine`),
      ]);
      setPartList(parts.data);
      setMachineList(machines.data);
    } catch (error) {
      console.error("Dropdown fetch error:", error.message);
    }
  };

  useEffect(() => {
    fetchData();
    fetchDropdownData();
  }, []);

  const addProcessRow = () => {
    setProcessRows([
      ...processRows,
      {
        machine_id: "",
        cycle_time: "",
        no_of_parts_per_cycle: "",
        program_no: "",
        setup_time_sec: "",
        operation_name: "",
        ideal_time_limit_sec: "",
        setup_change_type: "",
        setup_time_standard: "",
        setup_validation_required: false,
        sequence_no: "",
      },
    ]);
  };

  const handleRowChange = (index, field, value) => {
    const updated = [...processRows];
    updated[index][field] = value;
    setProcessRows(updated);
  };

  const handleSave = async (index) => {
    const row = processRows[index];
    const payload = {
      ...row,
      part_id: Number(selectedPartId),
      machine_id: Number(row.machine_id),
      cycle_time: Number(row.cycle_time),
      no_of_parts_per_cycle: Number(row.no_of_parts_per_cycle),
      setup_time_sec: Number(row.setup_time_sec),
      ideal_time_limit_sec: Number(row.ideal_time_limit_sec),
      setup_time_standard: parseFloat(row.setup_time_standard),
      setup_validation_required: row.setup_validation_required,
      sequence_no: Number(row.sequence_no),
      production_part_count: Number(row.production_part_count),
      quality_part_count: Number(row.quality_part_count),
    };

    if (editProcessId) {
      await axios.put(
        `${API_BASE_URL}/api/processes/${editProcessId}`,
        payload
      );
      setEditProcessId(null);
    } else {
      await axios.post(`${API_BASE_URL}/api/processes`, payload);
    }

    fetchData();
    const updatedRows = [...processRows];
    updatedRows.splice(index, 1);
    setProcessRows(updatedRows);
  };

  const handleCancel = (index) => {
    const updated = [...processRows];
    updated.splice(index, 1);
    setProcessRows(updated);
  };

  const handleEdit = (process) => {
    setSelectedPartId(process.part_id);
    setProcessRows([process]);
    setEditProcessId(process.process_id);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this process?")) {
      try {
        await axios.delete(`${API_BASE_URL}/api/processes/${id}`);
        fetchData();
      } catch (error) {
        console.error("Delete error:", error);
        if (
          error.response &&
          error.response.data &&
          error.response.data.message
        ) {
          alert(`This Process is used in setups, cannot be deleted.`);
        } else {
          alert("This Process is used in setups, cannot be deleted.");
        }
      }
    }
  };

  const getUsedMachineIdsForPart = () => {
    const saved = processes
      .filter((p) => p.part_id === Number(selectedPartId))
      .map((p) => p.machine_id);

    const inProgress = processRows
      .map((row) => Number(row.machine_id))
      .filter((id) => id); // filter out empty selections

    return new Set([...saved, ...inProgress]);
  };

  const filteredProcesses = processes.filter((p) => {
    const matchPart = !filterPart || p.part_id === Number(filterPart);
    const matchMachine =
      !filterMachine || p.machine_id === Number(filterMachine);
    return matchPart && matchMachine;
  });

  return (
    <div className="container3 mb-4" style={{ marginTop: "50px" }}>
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2 p-2 border rounded bg-light">
        <div className="fs-4 fw-bold" style={{ color: "#034694" }}>
          Process Master
        </div>
      </div>

      <div className="row mb-3">
        <div className="col-md-3">
          <label>Select Part</label>
          <select
            className="form-control"
            value={selectedPartId}
            onChange={(e) => setSelectedPartId(e.target.value)}
          >
            <option value="">Select Part</option>
            {partList.map((p) => (
              <option key={p.part_id} value={p.part_id}>
                {p.part_name}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-3 d-flex align-items-end">
          <button
            className="btn btn-primary"
            onClick={addProcessRow}
            disabled={!selectedPartId}
          >
            + Add Process
          </button>
        </div>
        <div className="col-md-3">
          <label>Filter by Part</label>
          <select
            className="form-control"
            value={filterPart}
            onChange={(e) => setFilterPart(e.target.value)}
          >
            <option value="">All</option>
            {partList.map((p) => (
              <option key={p.part_id} value={p.part_id}>
                {p.part_name}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-3">
          <label>Filter by Machine</label>
          <select
            className="form-control"
            value={filterMachine}
            onChange={(e) => setFilterMachine(e.target.value)}
          >
            <option value="">All</option>
            {machineList.map((m) => (
              <option key={m.machine_id} value={m.machine_id}>
                {m.machine_name_type}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div
        className="table-responsive"
        style={{ maxHeight: "600px", overflowY: "auto" }}
      >
        <table
          className="table table-bordered table-hover mt-4"
          style={{ fontSize: "0.9rem", lineHeight: "1.2" }}
        >
          <thead
            className="table-light"
            style={{ position: "sticky", top: 1, zIndex: 1020 }}
          >
            <tr>
              <th style={{ color: "#034694" }}>Part Name</th>
              <th style={{ color: "#034694" }}>Machine</th>
              <th style={{ color: "#034694" }}>Seq No</th>
              <th style={{ color: "#034694" }}>Cycle Time</th>
              <th style={{ color: "#034694" }}>Parts/Cycle</th>
              <th style={{ color: "#034694" }}>Program No</th>
              <th style={{ color: "#034694" }}>Setup Time</th>
              <th style={{ color: "#034694" }}>Operation Name</th>
              <th style={{ color: "#034694" }}>Ideal Time</th>
              <th style={{ color: "#034694" }}>Setup Type</th>
              <th style={{ color: "#034694" }}>Std Setup</th>
              <th style={{ color: "#034694" }}>Validation</th>

              <th style={{ color: "#034694" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {processRows.map((row, index) => (
              <tr key={`new-${index}`}>
                <td>
                  {partList.find((p) => p.part_id === Number(selectedPartId))
                    ?.part_name || selectedPartId}
                </td>
                <td>
                  <select
                    className="form-control"
                    value={row.machine_id}
                    onChange={(e) =>
                      handleRowChange(index, "machine_id", e.target.value)
                    }
                  >
                    <option value="">Select</option>
                    {machineList
                      .filter((m) => {
                        const usedIds = getUsedMachineIdsForPart();
                        return (
                          !usedIds.has(m.machine_id) ||
                          m.machine_id === Number(row.machine_id)
                        );
                      })
                      .map((m) => (
                        <option key={m.machine_id} value={m.machine_id}>
                          {m.machine_name_type}
                        </option>
                      ))}
                  </select>
                </td>
                <td>
                  <input
                    type="number"
                    className="form-control"
                    value={row.sequence_no}
                    onChange={(e) =>
                      handleRowChange(index, "sequence_no", e.target.value)
                    }
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className="form-control"
                    value={row.cycle_time}
                    onChange={(e) =>
                      handleRowChange(index, "cycle_time", e.target.value)
                    }
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className="form-control"
                    value={row.no_of_parts_per_cycle}
                    onChange={(e) =>
                      handleRowChange(
                        index,
                        "no_of_parts_per_cycle",
                        e.target.value
                      )
                    }
                  />
                </td>
                <td>
                  <input
                    type="text"
                    className="form-control"
                    value={row.program_no}
                    onChange={(e) =>
                      handleRowChange(index, "program_no", e.target.value)
                    }
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className="form-control"
                    value={row.setup_time_sec}
                    onChange={(e) =>
                      handleRowChange(index, "setup_time_sec", e.target.value)
                    }
                  />
                </td>
                <td>
                  <input
                    type="text"
                    className="form-control"
                    value={row.operation_name}
                    onChange={(e) =>
                      handleRowChange(index, "operation_name", e.target.value)
                    }
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className="form-control"
                    value={row.ideal_time_limit_sec}
                    onChange={(e) =>
                      handleRowChange(
                        index,
                        "ideal_time_limit_sec",
                        e.target.value
                      )
                    }
                  />
                </td>
                <td>
                  <input
                    type="text"
                    className="form-control"
                    value={row.setup_change_type}
                    onChange={(e) =>
                      handleRowChange(
                        index,
                        "setup_change_type",
                        e.target.value
                      )
                    }
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className="form-control"
                    step="0.01"
                    value={row.setup_time_standard}
                    onChange={(e) =>
                      handleRowChange(
                        index,
                        "setup_time_standard",
                        e.target.value
                      )
                    }
                  />
                </td>
                <td>
                  <input
                    type="checkbox"
                    checked={row.setup_validation_required}
                    onChange={(e) =>
                      handleRowChange(
                        index,
                        "setup_validation_required",
                        e.target.checked
                      )
                    }
                  />
                </td>

                <td>
                  <button
                    className="btn btn-sm  me-2"
                    onClick={() => handleSave(index)}
                  >
                    ✔️
                  </button>
                  <button
                    className="btn btn-sm "
                    onClick={() => handleCancel(index)}
                  >
                    ❌
                  </button>
                </td>
              </tr>
            ))}

            {[...filteredProcesses]
              .sort((a, b) => a.sequence_no - b.sequence_no)
              .map((p) => (
                <tr key={`existing-${p.process_id}`}>
                  <td>
                    {partList.find((pt) => pt.part_id === p.part_id)
                      ?.part_name || p.part_id}
                  </td>
                  <td>
                    {machineList.find((m) => m.machine_id === p.machine_id)
                      ?.machine_name_type || p.machine_id}
                  </td>
                  <td>{p.sequence_no}</td>
                  <td>{p.cycle_time}</td>
                  <td>{p.no_of_parts_per_cycle}</td>
                  <td>{p.program_no}</td>
                  <td>{p.setup_time_sec}</td>
                  <td>{p.operation_name}</td>
                  <td>{p.ideal_time_limit_sec}</td>
                  <td>{p.setup_change_type}</td>
                  <td>{p.setup_time_standard}</td>
                  <td>{p.setup_validation_required ? "Yes" : "No"}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-primary me-2"
                      onClick={() => handleEdit(p)}
                    >
                      <BsPencil />
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(p.process_id)}
                    >
                      <BsTrash />
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
