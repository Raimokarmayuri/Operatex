import React, { useState, useEffect } from "react";
import axios from "axios";
import { BsPencil, BsTrash } from "react-icons/bs";
import API_BASE_URL from "../config";
// const API_BASE_URL = "http://localhost:5003";

const PmcParameter = () => {
  const [parameters, setParameters] = useState([]);
  const [machineIds, setMachineIds] = useState([]);
  const [selectedMachineId, setSelectedMachineId] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [filterMachine, setFilterMachine] = useState("");
  const [filterParameterName, setFilterParameterName] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    machine_id: "",
    parameter_name: "",
    register_address: "",
    boolean_expected_value: null,
    min_value: null,
    max_value: null,
    unit: null,
    alert_threshold: null,
    data_collection_frequency: "",
    // New fields
    data_type: "",
    ok: "",
    bit_position: "",
    parameter_value: "",
  });

  // Fetch all PMC parameters
  const fetchParameters = async () => {
    const res = await axios.get(`${API_BASE_URL}/api/pmc-parameters`);
    setParameters(res.data);
  };

  const [machines, setMachines] = useState([]); // instead of machineIds

  // Fetch machine list
  const fetchMachineIds = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/machines/getallmachine`);
      setMachines(res.data); // full machine objects
    } catch (err) {
      console.error("Error fetching machines:", err);
    }
  };

  useEffect(() => {
    fetchParameters();
    fetchMachineIds();
  }, []);

  // Form change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isBoolean = form.boolean_expected_value === "1";

    // Basic required
    if (form.parameter_name.trim().length < 3) {
      return alert("Parameter Name must be at least 3 characters.");
    }

    if (isBoolean) {
      if (
        form.min_value ||
        form.max_value ||
        form.alert_threshold ||
        form.unit
      ) {
        return alert("For Boolean type, analog fields must be empty.");
      }
    } else {
      if (
        !form.min_value ||
        !form.max_value ||
        !form.unit ||
        !form.alert_threshold
      ) {
        return alert("For Analog type, all analog fields are required.");
      }

      const min = parseFloat(form.min_value);
      const max = parseFloat(form.max_value);
      const threshold = parseFloat(form.alert_threshold);
      if (threshold < min || threshold > max) {
        return alert("Alert threshold must be between min and max.");
      }
    }

    // Prepare payload
    const payload = {
      ...form,
      machine_id: Number(form.machine_id),
      boolean_expected_value: isBoolean ? true : null,
      min_value: form.min_value ? parseFloat(form.min_value) : null,
      max_value: form.max_value ? parseFloat(form.max_value) : null,
      alert_threshold: form.alert_threshold
        ? parseFloat(form.alert_threshold)
        : null,
      unit: form.unit || null,
      data_collection_frequency: form.data_collection_frequency || null,
      data_type: form.data_type || null,
      ok: form.ok || null,
      bit_position: form.bit_position || null,
      parameter_value: form.parameter_value || null,
    };

    try {
      if (editingId) {
        await axios.put(
          `${API_BASE_URL}/api/pmc-parameters/${editingId}`,
          payload
        );
        alert("Parameter updated");
      } else {
        await axios.post(`${API_BASE_URL}/api/pmc-parameters`, payload);
        alert("Parameter created");
      }

      resetForm();
      fetchParameters();
    } catch (err) {
      console.error("Error saving:", err);
      alert("Error saving data");
    }
  };

  const handleEdit = (param) => {
    setForm({
      ...param,
      data_type: param.data_type || "",
      ok: param.ok || "",
      bit_position: param.bit_position || "",
      parameter_value: param.parameter_value || "",
      boolean_expected_value: param.boolean_expected_value === true ? "1" : "",
    });
    setEditingId(param.pmc_parameter_id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure to delete?")) {
      await axios.delete(`${API_BASE_URL}/api/pmc-parameters/${id}`);
      fetchParameters();
    }
  };

  const resetForm = () => {
    setForm({
      machine_id: "",
      parameter_name: "",
      register_address: "",
      boolean_expected_value: "",
      min_value: "",
      max_value: "",
      unit: "",
      alert_threshold: "",
      data_collection_frequency: "",
      data_type: "",
      ok: "",
      bit_position: "",
      parameter_value: "",
    });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="container3 mb-4 ms-4" style={{ marginTop: "50px" }}>
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2 p-2 border rounded bg-light">
        <div className="fs-4 fw-bold" style={{ color: "#034694" }}>
          Parameter Master
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          + Add Parameter
        </button>

        <select
          className="form-select"
          style={{ maxWidth: "250px" }}
          value={filterMachine}
          onChange={(e) => setFilterMachine(e.target.value)}
        >
          <option value="">All Machines</option>
          {machines.map((m) => (
            <option key={m.machine_id} value={m.machine_id}>
              {m.machine_name_type}
            </option>
          ))}
        </select>
      </div>
      {/* {!showForm && (
        <div className="row g-2 mb-3">
          <div className="col-md-4">
            <label className="form-label">Filter by Machine</label>
            <select
              className="form-control"
              value={filterMachine}
              onChange={(e) => setFilterMachine(e.target.value)}
            >
              <option value="">All Machines</option>
              {machines.map((m) => (
                <option key={m.machine_id} value={m.machine_id}>
                  {m.machine_name_type}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label">Filter by Parameter Name</label>
            <input
              type="text"
              className="form-control"
              value={filterParameterName}
              onChange={(e) => setFilterParameterName(e.target.value)}
              placeholder="Search by parameter..."
            />
          </div>
        </div>
      )} */}

      {!showForm ? (
        <table className="table table-bordered">
          <thead className="table-light">
            <tr>
              <th style={{ color: "#034694" }}>Machine</th>
              <th style={{ color: "#034694" }}>Parameter Name</th>
              <th style={{ color: "#034694" }}>Register Address</th>
              <th style={{ color: "#034694" }}>Expected Value</th>
              <th style={{ color: "#034694" }}>Ok</th>
              <th style={{ color: "#034694" }}>Min</th>
              <th style={{ color: "#034694" }}>Max</th>
              <th style={{ color: "#034694" }}>Unit</th>
              <th style={{ color: "#034694" }}>Threshold</th>
              <th style={{ color: "#034694" }}>Frequency</th>
              <th style={{ color: "#034694" }}>Data Type</th>
              <th style={{ color: "#034694" }}>Bit Position</th>
              <th style={{ color: "#034694" }}>Parameter Value</th>
              <th style={{ color: "#034694" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {parameters.length > 0 ? (
              parameters
                .filter((p) => {
                  const matchesMachine =
                    !filterMachine || String(p.machine_id) === filterMachine;
                  const matchesParam =
                    !filterParameterName ||
                    p.parameter_name
                      .toLowerCase()
                      .includes(filterParameterName.toLowerCase());
                  return matchesMachine && matchesParam;
                })
                .map((p) => (
                  <tr key={p.id}>
                    <td>
                      {machines.find((m) => m.machine_id === p.machine_id)
                        ?.machine_name_type || p.machine_id}
                    </td>
                    <td>{p.parameter_name}</td>
                    <td>{p.register_address}</td>
                    <td>
                      {p.boolean_expected_value === true
                        ? "True"
                        : p.boolean_expected_value === false
                        ? "False"
                        : "-"}
                    </td>
                    <td>{p.ok}</td>
                    <td>{p.min_value}</td>
                    <td>{p.max_value}</td>
                    <td>{p.unit}</td>
                    <td>{p.alert_threshold}</td>
                    <td>{p.data_collection_frequency}</td>
                    <td>{p.data_type}</td>
                    <td>{p.bit_position}</td>
                    <td>{p.parameter_value}</td>
                    <td>
                      <button
                        className="btn btn-sm text-primary"
                        onClick={() => handleEdit(p)}
                      >
                        <BsPencil />
                      </button>
                      <button
                        className="btn btn-sm text-danger"
                        onClick={() => handleDelete(p.pmc_parameter_id)}
                      >
                        <BsTrash />
                      </button>
                    </td>
                  </tr>
                ))
            ) : (
              <tr>
                <td colSpan="14" className="text-center">
                  No parameters found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      ) : (
        <form onSubmit={handleSubmit} className="row g-3">
          {/* Machine ID Dropdown */}
          <div className="col-md-4">
            <label className="form-label">Machine</label>
            <select
              className="form-control"
              name="machine_id"
              value={form.machine_id}
              onChange={handleChange}
              required
            >
              <option value="">Select Machine</option>
              {machines.map((machine) => (
                <option key={machine.machine_id} value={machine.machine_id}>
                  {machine.machine_name_type}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-4">
            <label className="form-label">Parameter Name</label>
            <input
              type="text"
              className="form-control"
              name="parameter_name"
              value={form.parameter_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-4">
            <label className="form-label">Register Address</label>
            <input
              type="text"
              className="form-control"
              name="register_address"
              value={form.register_address}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-4">
            <label className="form-label">Is Boolean Parameter?</label>
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="isBooleanCheckbox"
                checked={form.boolean_expected_value === "1"}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    boolean_expected_value: e.target.checked ? "1" : "",
                    min_value: "",
                    max_value: "",
                    unit: "",
                    alert_threshold: "",
                  }))
                }
              />
              <label className="form-check-label" htmlFor="isBooleanCheckbox">
                Expected Boolean Value (True)
              </label>
            </div>
          </div>

          <div className="col-md-4">
            <label className="form-label">Min Value</label>
            <input
              type="number"
              className="form-control"
              name="min_value"
              value={form.min_value}
              onChange={handleChange}
              disabled={form.boolean_expected_value === "1"}
              required={form.boolean_expected_value !== "1"}
            />
          </div>

          <div className="col-md-4">
            <label className="form-label">Max Value</label>
            <input
              type="number"
              className="form-control"
              name="max_value"
              value={form.max_value}
              onChange={handleChange}
              disabled={form.boolean_expected_value === "1"}
              required={form.boolean_expected_value !== "1"}
            />
          </div>

          <div className="col-md-4">
            <label className="form-label">Unit</label>
            <select
              name="unit"
              className="form-control"
              value={form.unit}
              onChange={handleChange}
              disabled={form.boolean_expected_value === "1"}
            >
              <option value="">Select Unit</option>
              <option value="°C">°C</option>
              <option value="%">%</option>
              <option value="mm/s">mm/s</option>
              <option value="bar">bar</option>
              <option value="V">V</option>
            </select>
          </div>

          <div className="col-md-4">
            <label className="form-label">Alert Threshold</label>
            <input
              type="number"
              className="form-control"
              name="alert_threshold"
              value={form.alert_threshold}
              onChange={handleChange}
              disabled={form.boolean_expected_value === "1"}
              required={form.boolean_expected_value !== "1"}
            />
          </div>

          <div className="col-md-4">
            <label className="form-label">Data Collection Frequency</label>
            <select
              name="data_collection_frequency"
              className="form-control"
              value={form.data_collection_frequency}
              onChange={handleChange}
            >
              <option value="">Select Frequency</option>
              <option value="real-time">Real-time</option>
              <option value="1-min">1-min</option>
              <option value="hourly">Hourly</option>
            </select>
          </div>

          {/* New fields */}
          <div className="col-md-4">
            <label className="form-label">Data Type</label>
            <select
              name="data_type"
              className="form-control"
              value={form.data_type}
              onChange={handleChange}
              required
            >
              <option value="">Select Data Type</option>
              <option value="bit">Bit</option>
              <option value="byte">Byte</option>
              <option value="boolean">Boolean</option>
              {/* <option value="analog">Analog</option>
              <option value="digital">Digital</option> */}
              <option value="string">String</option>
              {/* Add more as needed */}
            </select>
          </div>

          <div className="col-md-4">
            <label className="form-label">Ok</label>
            <select
              className="form-control"
              name="ok"
              value={form.ok}
              onChange={handleChange}
              required
            >
              <option value="">Select Ok Value</option>
              <option value="1">1</option>
              <option value="0">0</option>
            </select>
          </div>

          <div className="col-md-4">
            <label className="form-label">Bit Position</label>
            <input
              type="number"
              className="form-control"
              name="bit_position"
              value={form.bit_position}
              onChange={handleChange}
            />
          </div>

          {/* <div className="col-md-4">
            <label className="form-label">Parameter Value</label>
            <input
              type="text"
              className="form-control"
              name="parameter_value"
              value={form.parameter_value}
              onChange={handleChange}
            />
          </div> */}

          <div className="col-12">
            <button type="submit" className="btn btn-success me-2">
              {editingId ? "Update" : "Add"}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={resetForm}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default PmcParameter;
