// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { BsPencil, BsTrash } from "react-icons/bs";
// import API_BASE_URL from "../config";

// const CncMachineForm = () => {
//   const [machines, setMachines] = useState([]);
//   const [formData, setFormData] = useState({
//     machine_name_type: "",
//     make_model: "",
//     controller_make_model: "",
//     installed_date: "",
//     location: "",
//     ip_address: "",
//     bottleneck: "",
//     communication_protocol: "",
//     tool_count: "",
//     power_rating: "",
//     no_of_spindels: "",
//     no_of_servo: "",
//     no_of_encoder: "",
//     no_of_batteries: "",
//     status: "",
//   });
//   const [lineOptions, setLineOptions] = useState([]);

//   const [isEditing, setIsEditing] = useState(false);
//   const [editId, setEditId] = useState(null);
//   const [showForm, setShowForm] = useState(false);
//   const [alertMessage, setAlertMessage] = useState("");
//   const [alertType, setAlertType] = useState("");

//   useEffect(() => {
//     fetchMachines();
//     fetchLineOptions(); // ⬅️ New
//   }, []);

//   const fetchLineOptions = async () => {
//     try {
//       const res = await axios.get(`${API_BASE_URL}/api/lines`); // 🔁 Update to your actual endpoint
//       const options = res.data.map((line) => ({
//         value: line.line_id, // assuming line_id is the unique ID
//         label: line.line_name, // assuming line_name is the display name
//       }));
//       setLineOptions(options);
//     } catch (error) {
//       console.error("Error fetching lines:", error);
//       setAlertMessage("Failed to fetch line options.");
//       setAlertType("danger");
//     }
//   };

//   const fetchMachines = async () => {
//     try {
//       const res = await axios.get(`${API_BASE_URL}/api/machines/getallmachine`);
//       setMachines(res.data);
//     } catch (err) {
//       console.error(err);
//       setAlertMessage("Failed to fetch machines.");
//       setAlertType("danger");
//     }
//   };

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const payload = {
//         ...formData,
//         location: parseInt(formData.location) || 0,
//         bottleneck: parseInt(formData.bottleneck),
//         tool_count: formData.tool_count ? parseInt(formData.tool_count) : null,
//         power_rating: parseInt(formData.power_rating),
//         no_of_spindels: parseInt(formData.no_of_spindels),
//         no_of_servo: parseInt(formData.no_of_servo),
//         no_of_encoder: parseInt(formData.no_of_encoder),
//         no_of_batteries: parseInt(formData.no_of_batteries),
//       };

//       if (isEditing) {
//         await axios.put(`${API_BASE_URL}/api/machines/${editId}`, payload);
//         setAlertMessage("Machine updated successfully!");
//       } else {
//         await axios.post(`${API_BASE_URL}/api/machines/register`, payload);
//         setAlertMessage("Machine added successfully!");
//       }

//       setAlertType("success");
//       resetForm();
//       fetchMachines();
//       setShowForm(false);
//     } catch (err) {
//       console.error("Error saving machine:", err);
//       setAlertMessage("Error saving machine.");
//       setAlertType("danger");
//     }
//   };

//   const handleEdit = (machine) => {
//     const { created_at, updated_at, machine_id, ...editableFields } = machine;

//     setFormData(editableFields);
//     setEditId(machine_id); // store separately
//     setIsEditing(true);
//     setShowForm(true);
//   };

//   const resetForm = () => {
//     setFormData({
//       machine_name_type: "",
//       make_model: "",
//       controller_make_model: "",
//       installed_date: "",
//       location: "",
//       ip_address: "",
//       bottleneck: "",
//       communication_protocol: "",
//       tool_count: "",
//       power_rating: "",
//       no_of_spindels: "",
//       no_of_servo: "",
//       no_of_encoder: "",
//       no_of_batteries: "",
//       status: "",
//     });
//     setIsEditing(false);
//     setEditId(null);
//   };

//   return (
//     <div className="container3 mb-4" style={{ marginTop: "50px" }}>
//       <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2 p-2 border rounded bg-light">
//         <div className="fs-4 fw-bold" style={{ color: "#034694" }}>
//           Manage CNC Machines
//         </div>
//         {!showForm && (
//           <div className="d-flex flex-wrap align-items-center justify-content-end gap-2">
//             <button
//               className="btn btn-primary"
//               title="Add Machine Data"
//               onClick={() => setShowForm(true)}
//             >
//               <i className="fas fa-file-medical"></i>
//             </button>
//           </div>
//         )}
//       </div>

//       {alertMessage && (
//         <div
//           className={`alert alert-${alertType} alert-dismissible fade show`}
//           role="alert"
//         >
//           {alertMessage}
//           <button
//             type="button"
//             className="btn-close"
//             data-bs-dismiss="alert"
//             aria-label="Close"
//             onClick={() => setAlertMessage("")}
//           ></button>
//         </div>
//       )}

//       {showForm && (
//         <form onSubmit={handleSubmit} className="row ms-2">
//           {Object.entries(formData)
//             .filter(([key]) => key !== "created_at" && key !== "updated_at")
//             .map(([key, val]) => (
//               <div className="col-md-3 mb-3" key={key}>
//                 <label className="form-label">
//                   {key.replace(/_/g, " ").toUpperCase()}
//                 </label>

//                 {key === "location" ? (
//                   <select
//                     name="location"
//                     className="form-control"
//                     value={formData.location}
//                     onChange={handleChange}
//                     required
//                   >
//                     <option value="">Select Line</option>
//                     {lineOptions.map((line) => (
//                       <option key={line.value} value={line.value}>
//                         {line.label}
//                       </option>
//                     ))}
//                   </select>
//                 ) : key === "bottleneck" ? (
//                   <select
//                     name="bottleneck"
//                     className="form-control"
//                     value={formData.bottleneck}
//                     onChange={handleChange}
//                     required
//                   >
//                     <option value="">Select Type</option>
//                     <option value="bottleneck">Bottleneck</option>
//                     <option value="Non-Bottleneck">Non-Bottleneck</option>
//                   </select>
//                 ) : (
//                   <input
//                     type={
//                       key.includes("date")
//                         ? "date"
//                         : key.includes("ip")
//                         ? "text"
//                         : "text"
//                     }
//                     name={key}
//                     className="form-control"
//                     value={val}
//                     onChange={handleChange}
//                     required
//                   />
//                 )}
//               </div>
//             ))}

//           <div className="text-center mb-3">
//             <button type="submit" className="btn btn-primary me-2">
//               {isEditing ? "Update Machine" : "Save Machine"}
//             </button>
//             <button
//               type="button"
//               className="btn btn-secondary"
//               onClick={() => setShowForm(false)}
//             >
//               Cancel
//             </button>
//           </div>
//         </form>
//       )}

//       {!showForm && (
//         <div
//           className="table-responsive"
//           style={{ maxHeight: "600px", overflowY: "auto" }}
//         >
//           <table
//             className="table table-bordered table-hover mt-4"
//             style={{ fontSize: "0.9rem", lineHeight: "1.2" }}
//           >
//             <thead
//               className="table-light"
//               style={{ position: "sticky", top: 1, zIndex: 1020 }}
//             >
//               <tr>
//                 <th style={{ color: "#034694" }}>Machine ID</th>
//                 <th style={{ color: "#034694" }}>Machine Name</th>
//                 <th style={{ color: "#034694" }}>BottleNeck</th>
//                 <th style={{ color: "#034694" }}>Status</th>
//                 <th style={{ color: "#034694" }}>Location</th>
//                 <th style={{ color: "#034694" }}>IP Address</th>
//                 <th style={{ color: "#034694" }}>Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {machines.map((machine) => (
//                 <tr key={machine.machine_id}>
//                   <td>{machine.machine_id}</td>
//                   <td>{machine.machine_name_type}</td>
//                   <td>{machine.bottleneck}</td>
//                   <td>{machine.status}</td>
//                   <td>{machine.location}</td>
//                   <td>{machine.ip_address}</td>
//                   <td>
//                     <button
//                       className="btn border-0 bg-transparent text-dark btn-sm me-2"
//                       onClick={() => handleEdit(machine)}
//                     >
//                       <BsPencil className="me-1" style={{ color: "black" }} />
//                     </button>
//                     <button className="btn btn-sm">
//                       <BsTrash style={{ color: "red" }} />
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );
// };

// export default CncMachineForm;

import React, { useState, useEffect } from "react";
import axios from "axios";
import { BsPencil, BsTrash } from "react-icons/bs";
import API_BASE_URL from "../config";

const initialFormData = {
  machine_name_type: "",
  make_model: "",
  controller_make_model: "",
  installed_date: "",
  location: "",
  ip_address: "",
  bottleneck: "",
  communication_protocol: "",
  tool_count: "",
  power_rating: "",
  no_of_spindels: "",
  no_of_servo: "",
  no_of_encoder: "",
  no_of_batteries: "",
  status: "",
};

const CncMachineForm = () => {
  const [machines, setMachines] = useState([]);
  const [formData, setFormData] = useState(initialFormData);
  const [lineOptions, setLineOptions] = useState([]);

  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("");

  useEffect(() => {
    fetchMachines();
    fetchLineOptions();
  }, []);

  const fetchLineOptions = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/lines`);
      const options = res.data.map((line) => ({
        value: line.line_id,
        label: line.line_name,
      }));
      setLineOptions(options);
    } catch (error) {
      console.error("Error fetching lines:", error);
      setAlertMessage("Failed to fetch line options.");
      setAlertType("danger");
    }
  };

  const fetchMachines = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/machines/getallmachine`);
      setMachines(res.data);
    } catch (err) {
      console.error(err);
      setAlertMessage("Failed to fetch machines.");
      setAlertType("danger");
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

 const handleSubmit = async (e) => {
  e.preventDefault();

  // 🔹 Check for duplicate machine_name_type
  const normalizedName = formData.machine_name_type.trim().toLowerCase();
  const isDuplicate = machines.some(
    (m) =>
      m.machine_name_type?.trim().toLowerCase() === normalizedName &&
      (!isEditing || m.machine_id !== editId) // allow same name if editing the same record
  );

  if (isDuplicate) {
    setAlertMessage("Duplicate machine name not allowed!");
    setAlertType("danger");
    return; // stop submission
  }

  try {
    const payload = {
      ...formData,
      location: formData.location ? parseInt(formData.location) : null,
      bottleneck: formData.bottleneck || null,
      tool_count: formData.tool_count ? parseInt(formData.tool_count) : null,
      power_rating: formData.power_rating
        ? parseInt(formData.power_rating)
        : null,
      no_of_spindels: formData.no_of_spindels
        ? parseInt(formData.no_of_spindels)
        : null,
      no_of_servo: formData.no_of_servo
        ? parseInt(formData.no_of_servo)
        : null,
      no_of_encoder: formData.no_of_encoder
        ? parseInt(formData.no_of_encoder)
        : null,
      no_of_batteries: formData.no_of_batteries
        ? parseInt(formData.no_of_batteries)
        : null,
    };

    if (isEditing && editId != null) {
      await axios.put(`${API_BASE_URL}/api/machines/${editId}`, payload);
      setAlertMessage("Machine updated successfully!");
    } else {
      await axios.post(`${API_BASE_URL}/api/machines/register`, payload);
      setAlertMessage("Machine added successfully!");
    }

    setAlertType("success");
    resetForm();
    await fetchMachines();
    setShowForm(false);
  } catch (err) {
    console.error("Error saving machine:", err);
    setAlertMessage("Error saving machine.");
    setAlertType("danger");
  }
};


  const handleEdit = (machine) => {
    const { created_at, updated_at, machine_id, ...editableFields } = machine;

    // Normalize any null/undefined to "" for controlled inputs
    const cleaned = Object.fromEntries(
      Object.entries(editableFields).map(([k, v]) => [k, v ?? ""])
    );

    setFormData(cleaned);
    setEditId(machine_id);
    setIsEditing(true);
    setShowForm(true);
  };

  const startAddNew = () => {
    // ✅ Ensure brand-new state when adding
    resetForm();
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setIsEditing(false);
    setEditId(null);
  };

  const handleCancel = () => {
    resetForm();
    setShowForm(false);
  };

  return (
    <div className="container3 mb-4" style={{ marginTop: "50px" }}>
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2 p-2 border rounded bg-light">
        <div className="fs-4 fw-bold" style={{ color: "#034694" }}>
          Manage CNC Machines
        </div>
        {!showForm && (
          <div className="d-flex flex-wrap align-items-center justify-content-end gap-2">
            <button
              className="btn btn-primary"
              title="Add Machine Data"
              onClick={startAddNew}
            >
              <i className="fas fa-file-medical"></i>
            </button>
          </div>
        )}
      </div>

      {alertMessage && (
        <div
          className={`alert alert-${alertType} alert-dismissible fade show`}
          role="alert"
        >
          {alertMessage}
          <button
            type="button"
            className="btn-close"
            data-bs-dismiss="alert"
            aria-label="Close"
            onClick={() => setAlertMessage("")}
          ></button>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="row ms-2">
          {Object.entries(formData).map(([key, val]) => (
            <div className="col-md-3 mb-3" key={key}>
              <label className="form-label">
                {key.replace(/_/g, " ").toUpperCase()}
              </label>

              {key === "location" ? (
                <select
                  name="location"
                  className="form-control"
                  value={formData.location}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Line</option>
                  {lineOptions.map((line) => (
                    <option key={line.value} value={line.value}>
                      {line.label}
                    </option>
                  ))}
                </select>
              ) : key === "bottleneck" ? (
                <select
                  name="bottleneck"
                  className="form-control"
                  value={formData.bottleneck}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Type</option>
                  <option value="Bottleneck">Bottleneck</option>
                  <option value="Non-Bottleneck">Non-Bottleneck</option>
                </select>
              ) : (
                <input
                  type={
                    key.includes("date")
                      ? "date"
                      : key.includes("ip")
                      ? "text"
                      : "text"
                  }
                  name={key}
                  className="form-control"
                  value={val}
                  onChange={handleChange}
                  required
                />
              )}
            </div>
          ))}

          <div className="text-center mb-3">
            <button type="submit" className="btn btn-primary me-2">
              {isEditing ? "Update Machine" : "Save Machine"}
            </button>
            <button type="button" className="btn btn-secondary" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {!showForm && (
        <div className="table-responsive" style={{ maxHeight: "600px", overflowY: "auto" }}>
          <table
            className="table table-bordered table-hover mt-4"
            style={{ fontSize: "0.9rem", lineHeight: "1.2" }}
          >
            <thead className="table-light" style={{ position: "sticky", top: 1, zIndex: 1020 }}>
              <tr>
                <th style={{ color: "#034694" }}>Machine ID</th>
                <th style={{ color: "#034694" }}>Machine Name</th>
                <th style={{ color: "#034694" }}>BottleNeck</th>
                <th style={{ color: "#034694" }}>Status</th>
                <th style={{ color: "#034694" }}>Location</th>
                <th style={{ color: "#034694" }}>IP Address</th>
                <th style={{ color: "#034694" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {machines.map((machine) => (
                <tr key={machine.machine_id}>
                  <td>{machine.machine_id}</td>
                  <td>{machine.machine_name_type}</td>
                  <td>{machine.bottleneck}</td>
                  <td>{machine.status}</td>
                  <td>{machine.location}</td>
                  <td>{machine.ip_address}</td>
                  <td>
                    <button
                      className="btn border-0 bg-transparent text-dark btn-sm me-2"
                      onClick={() => handleEdit(machine)}
                    >
                      <BsPencil className="me-1" style={{ color: "black" }} />
                    </button>
                    {/* <button className="btn btn-sm">
                      <BsTrash style={{ color: "red" }} />
                    </button> */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CncMachineForm;
