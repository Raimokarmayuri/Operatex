import React, { useEffect, useState } from "react";
import axios from "axios";
import { BsPencil, BsTrash } from "react-icons/bs";
import { FaSave, FaTimes } from "react-icons/fa";
import API_BASE_URL from "../config";

export default function SetupMasterForm() {
  const [setups, setSetups] = useState([]);
  const [setupRows, setSetupRows] = useState([]);
  const [partList, setPartList] = useState([]);
  const [machineList, setMachineList] = useState([]);
  const [processList, setProcessList] = useState([]);
  const [filterMachineId, setFilterMachineId] = useState("");
  const [editingRowId, setEditingRowId] = useState(null);
  const [newParam, setNewParam] = useState({});
  const [paramRowIndex, setParamRowIndex] = useState(null);



  const fetchData = async () => {
    const res = await axios.get(`${API_BASE_URL}/api/setups/setups`);
    setSetups(res.data);
  };

  const fetchDropdownData = async () => {
    const [parts, machines, processes] = await Promise.all([
      axios.get(`${API_BASE_URL}/api/parts`),
      axios.get(`${API_BASE_URL}/api/machines/getallmachine`),
      axios.get(`${API_BASE_URL}/api/processes`),
    ]);
    setPartList(parts.data);
    setMachineList(machines.data);
    setProcessList(processes.data);
  };

  useEffect(() => {
    fetchData();
    fetchDropdownData();
  }, []);

  // const addSetupRow = () => {
  //   setSetupRows([
  //     ...setupRows,
  //     {
  //       part_id: "",
  //       machine_id: "",
  //       process_id: "",
  //       step_no: "",
  //       checklist_item_description: "",
  //       type: "",
  //       boolean_expected_value: false,
  //       spec_target_value: "",
  //       spec_min_tolerance: "",
  //       spec_max_tolerance: "",
  //       unit: "",
  //       validation_method: "",
  //       mandatory: false,
  //       production_part_count: "",
  //       quality_part_count: "",
  //       parameters: [],
  //     },
  //   ]);
  // };

  const addSetupRow = () => {
    setSetupRows([
      ...setupRows,
      {
        part_id: "",
        machine_id: "",
        process_id: "",
        step_no: "",
        checklist_item_description: "",
        type: "",
        boolean_expected_value: false,
        spec_target_value: "",
        spec_min_tolerance: "",
        spec_max_tolerance: "",
        unit: "",
        validation_method: "",
        mandatory: false,
        production_part_count: "",
        quality_part_count: "",
        parameters: "",
        specifications: "",
        inspectionmethod: "",
      },
    ]);
  };

  const handleRowChange = (index, field, value) => {
    const updated = [...setupRows];
    updated[index][field] = value;
    setSetupRows(updated);
  };


const handleSave = async (index) => {
  const row = setupRows[index];

  // Basic validation
  if (!row.type) {
    alert("Type is required");
    return;
  }

  if (row.type === 'Boolean' && typeof row.boolean_expected_value !== 'boolean') {
    alert("Boolean Expected Value is required for Boolean type");
    return;
  }

  if (row.type === 'Spec' && (
    row.spec_target_value === '' ||
    row.spec_min_tolerance === '' ||
    row.spec_max_tolerance === '' ||
    !row.unit
  )) {
    alert("All specification fields are required for Spec type");
    return;
  }

  const payload = {
    ...row,
    part_id: Number(row.part_id),
    machine_id: Number(row.machine_id),
    process_id: Number(row.process_id),
    step_no: Number(row.step_no),
    spec_target_value: row.spec_target_value ? parseFloat(row.spec_target_value) : null,
    spec_min_tolerance: row.spec_min_tolerance ? parseFloat(row.spec_min_tolerance) : null,
    spec_max_tolerance: row.spec_max_tolerance ? parseFloat(row.spec_max_tolerance) : null,
    production_part_count: row.production_part_count ? Number(row.production_part_count) : null,
    quality_part_count: row.quality_part_count ? Number(row.quality_part_count) : null,
     parameters: row.parameters,
    specifications: row.specifications ? Number(row.specifications) : null,
    inspection_method: row.inspection_method,

  };

  try {
    if (row.setup_id) {
      // UPDATE existing
      await axios.put(`${API_BASE_URL}/api/setups/setups/${row.setup_id}`, payload);
    } else {
      // CREATE new
      await axios.post(`${API_BASE_URL}/api/setups/setups`, payload);
    }

    fetchData();
    const updatedRows = [...setupRows];
    updatedRows.splice(index, 1);
    setSetupRows(updatedRows);
    console.log("Saving row:", row);
console.log("Payload:", payload);
  } catch (error) {
    console.error("Error saving setup:", error);
    alert("Error saving setup. See console for details.");
  }
};


  const handleCancel = (index) => {
    const updated = [...setupRows];
    updated.splice(index, 1);
    setSetupRows(updated);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this setup?")) {
      await axios.delete(`${API_BASE_URL}/api/setups/setups/${id}`);
      fetchData();
    }
  };

const handleEdit = (id) => {
  const editRow = setups.find((s) => s.setup_id === id);
  if (editRow) {
    const prefilled = {
      ...editRow,
      spec_target_value: editRow.spec_target_value || '',
      spec_min_tolerance: editRow.spec_min_tolerance || '',
      spec_max_tolerance: editRow.spec_max_tolerance || '',
      unit: editRow.unit || '',
      parameters: editRow.parameters || '',
      specifications: editRow.specifications || '',
      inspection_method: editRow.inspection_method || '',
    };
    setSetupRows([prefilled]);  // overwrite all for single row edit
    setEditingRowId(id);        // track edited row'
    
  }
};



//   const handleEdit = (id) => {
//   const editRow = setups.find(s => s.setup_id === id);
//   if (editRow) {
//     setSetupRows([
//       ...setupRows,
//       {
//         ...editRow,
//         spec_target_value: editRow.spec_target_value || '',
//         spec_min_tolerance: editRow.spec_min_tolerance || '',
//         spec_max_tolerance: editRow.spec_max_tolerance || '',
//         unit: editRow.unit || '',
//         parameters: editRow.parameters || []
//       }
//     ]);
//   }
// };


  const filteredSetups = filterMachineId
    ? setups.filter((s) => s.machine_id == filterMachineId)
    : setups;

  return (
    <div className="container3 mb-4" style={{ marginTop: "50px" }}>
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2 p-2 border rounded bg-light">
        <div className="fs-4 fw-bold" style={{ color: "#034694" }}>
          Setup Master
        </div>
        <div className="d-flex gap-2">
          <select
            className="form-select"
            value={filterMachineId}
            onChange={(e) => setFilterMachineId(e.target.value)}
          >
            <option value="">All Machines</option>
            {machineList.map((m) => (
              <option key={m.machine_id} value={m.machine_id}>
                {m.machine_name_type}
              </option>
            ))}
          </select>
          <button className="btn btn-primary" onClick={addSetupRow}>
            AddSetup
          </button>
        </div>
      </div>

      <div className="table-responsive" style={{ overflowX: "auto" }}>
                <table className="table table-bordered" >

          <thead>
            <tr>
              <th style={{ color: "#034694"}}>PartName</th>
              <th style={{ color: "#034694" }}>MachineName</th>
              <th style={{ color: "#034694" }}>Process</th>
              <th style={{ color: "#034694" }}>StepNo</th>
              <th style={{ color: "#034694" }}>Checklist_Description</th>
              <th style={{ color: "#034694" }}>parameter</th>
              <th style={{ color: "#034694" }}>specification</th>
              <th style={{ color: "#034694" }}>inspection_method</th>
              <th style={{ color: "#034694" }}>Type</th>
              <th style={{ color: "#034694" }}>boolean_expected_value</th>
              <th style={{ color: "#034694" }}>Targetvalue</th>
              <th style={{ color: "#034694" }}>MinTolerance</th>
              <th style={{ color: "#034694" }}>MaxTolerance</th>
              <th style={{ color: "#034694" }}>Unit</th>
              <th style={{ color: "#034694" }}>Validation</th>
              <th style={{ color: "#034694" }}>Mandatory</th>
              <th style={{ color: "#034694" }}>ProdCount</th>
              <th style={{ color: "#034694" }}>QualityCount</th>
              <th style={{ color: "#034694" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {setupRows.map((row, index) => (
              <React.Fragment key={index}>
                <tr>
                  <td>
                    <select
                      className="form-control"
                      style={{ width: "150px" }}
                      value={row.part_id}
                      onChange={(e) =>
                        handleRowChange(index, "part_id", e.target.value)
                      }
                    >
                      <option value="">Select</option>
                      {partList.map((p) => (
                        <option key={p.part_id} value={p.part_id}>
                          {p.part_name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <select
                      className="form-control"
                      style={{ width: "150px" }}
                      value={row.machine_id}
                      onChange={(e) =>
                        handleRowChange(index, "machine_id", e.target.value)
                      }
                    >
                      <option value="">Select</option>
                      {machineList.map((m) => (
                        <option key={m.machine_id} value={m.machine_id}>
                          {m.machine_name_type}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <select
                      className="form-control"
                      value={row.process_id}
                      style={{ width: "150px" }}
                      onChange={(e) =>
                        handleRowChange(index, "process_id", e.target.value)
                      }
                    >
                      <option value="">Select</option>
                      {processList.map((p) => (
                        <option key={p.process_id} value={p.process_id}>
                          {p.program_no}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                      type="number"
                      style={{ width: "150px" }}
                      className="form-control"
                      value={row.step_no}
                      onChange={(e) =>
                        handleRowChange(index, "step_no", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      style={{ width: "150px" }}
                      className="form-control"
                      value={row.checklist_item_description}
                      onChange={(e) =>
                        handleRowChange(
                          index,
                          "checklist_item_description",
                          e.target.value
                        )
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      style={{ width: "150px" }}
                      className="form-control"
                      value={row.parameters}
                      onChange={(e) =>
                        handleRowChange(index, "parameters", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      style={{ width: "150px" }}
                      className="form-control"
                      value={row.specifications}
                      onChange={(e) =>
                        handleRowChange(index, "specifications", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      className="form-control"
                      value={row.inspection_method}
                      onChange={(e) =>
                        handleRowChange(
                          index,
                          "inspection_method",
                          e.target.value
                        )
                      }
                    />
                  </td>
                  <td>
                    <select
                      className="form-control"
                      value={row.type}
                      style={{ width: "150px" }}
                      onChange={(e) =>
                        handleRowChange(index, "type", e.target.value)
                      }
                    >
                      <option value="">Select</option>
                      <option value="Boolean">Boolean</option>
                      <option value="Spec">Spec</option>
                    </select>
                  </td>
                  <td>
                    {row.type === "Boolean" && (
                      <input
                        type="checkbox"
                        checked={row.boolean_expected_value}
                        onChange={(e) =>
                          handleRowChange(
                            index,
                            "boolean_expected_value",
                            e.target.checked
                          )
                        }
                      />
                    )}
                  </td>
                  {row.type === "Spec" ? (
                    <>
                      <td>
                        <input
                          type="number"
                          style={{ width: "150px" }}
                          className="form-control"
                          value={row.spec_target_value}
                          onChange={(e) =>
                            handleRowChange(
                              index,
                              "spec_target_value",
                              e.target.value
                            )
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          style={{ width: "150px" }}
                          className="form-control"
                          value={row.spec_min_tolerance}
                          onChange={(e) =>
                            handleRowChange(
                              index,
                              "spec_min_tolerance",
                              e.target.value
                            )
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          style={{ width: "150px" }}
                          className="form-control"
                          value={row.spec_max_tolerance}
                          onChange={(e) =>
                            handleRowChange(
                              index,
                              "spec_max_tolerance",
                              e.target.value
                            )
                          }
                        />
                      </td>
                      <td>
                        <select
                          className="form-control"
                          style={{ width: "150px" }}
                          value={row.unit}
                          onChange={(e) =>
                            handleRowChange(index, "unit", e.target.value)
                          }
                        >
                          <option value="">Unit</option>
                          <option value="mm">mm</option>
                          <option value="kgf">kgf</option>
                          <option value="Nm">Nm</option>
                        </select>
                      </td>
                    </>
                  ) : (
                    <>
                      <td colSpan="4"></td>
                    </>
                  )}
                  <td>
                    <select
                      className="form-control"
                      style={{ width: "150px" }}
                      value={row.validation_method}
                      onChange={(e) =>
                        handleRowChange(
                          index,
                          "validation_method",
                          e.target.value
                        )
                      }
                    >
                      <option value="">Select</option>
                      <option value="Manual">Manual</option>
                      <option value="Sensor">Sensor</option>
                      <option value="Digital Tool">Digital Tool</option>
                    </select>
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      checked={row.mandatory}
                      onChange={(e) =>
                        handleRowChange(index, "mandatory", e.target.checked)
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      style={{ width: "150px" }}
                      className="form-control"
                      value={row.production_part_count}
                      onChange={(e) =>
                        handleRowChange(
                          index,
                          "production_part_count",
                          e.target.value
                        )
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      style={{ width: "150px" }}
                      className="form-control"
                      value={row.quality_part_count}
                      onChange={(e) =>
                        handleRowChange(
                          index,
                          "quality_part_count",
                          e.target.value
                        )
                      }
                    />
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-primary me-2"
                      onClick={() => handleSave(index)}
                    >
                      ✔️
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleCancel(index)}
                    >
                      ❌
                    </button>
                  </td>
                </tr>
              </React.Fragment>
            ))}

            {filteredSetups.map((s) => (
              <tr key={`existing-${s.setup_id}`}>
                <td style={{ width: "250px" }}>
                  {partList.find((p) => p.part_id === s.part_id)?.part_name ||
                    s.part_id}
                </td>
                <td style={{ width: "150px" }}>
                  {machineList.find((m) => m.machine_id === s.machine_id)
                    ?.machine_name_type || s.machine_id}
                </td>
                <td>
                  {processList.find((p) => p.process_id === s.process_id)
                    ?.program_no || s.process_id}
                </td>
                <td style={{ width: "150px" }}>{s.step_no}</td>
                <td style={{ width: "150px" }}>
                  {s.checklist_item_description}
                </td>
                <td style={{ width: "150px" }}>{s.parameters}</td>
                <td style={{ width: "150px" }}>{s.specifications}</td>
                <td style={{ width: "150px" }}>{s.inspection_method}</td>
                <td style={{ width: "150px" }}>{s.type}</td>
                <td>{s.boolean_expected_value ? "Yes" : "No"}</td>
                <td style={{ width: "150px" }}>{s.spec_target_value}</td>
                <td style={{ width: "150px" }}>{s.spec_min_tolerance}</td>
                <td style={{ width: "150px" }}>{s.spec_max_tolerance}</td>
                <td style={{ width: "150px" }}>{s.unit}</td>
                <td style={{ width: "150px" }}>{s.validation_method}</td>
                <td style={{ width: "150px" }}>{s.mandatory ? "Yes" : "No"}</td>
                <td style={{ width: "150px" }}>{s.production_part_count}</td>
                <td style={{ width: "150px" }}>{s.quality_part_count}</td>
                <td>
                  <button
                    className="btn btn-sm btn-outline-primary me-2"
                    onClick={() => handleEdit(s.setup_id)}
                  >
                    <BsPencil />
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDelete(s.setup_id)}
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
