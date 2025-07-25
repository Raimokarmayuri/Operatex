// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { BsTrashFill } from "react-icons/bs"; // Import the required icons
// import { FaTools } from "react-icons/fa";
// import API_BASE_URL from "../config";

// const Toollifeform = () => {
//   const machineId = localStorage.getItem("selectedMachineId");
//   const [toolDetails, setToolDetails] = useState([]);
//   const [filteredToolDetails, setFilteredToolDetails] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [formData, setFormData] = useState({
//     machineId: machineId, 
//     toolNumber: "",
//     toolName: "",
//     setLife: "",
//     // toolChangeDate: "",
//     actualLife: 0, // Default actual life to 0
//   });
//   const [isEditing, setIsEditing] = useState(false);
//   const [editId, setEditId] = useState(null);
//   const [showForm, setShowForm] = useState(false);

//   const [machineIds, setMachineIds] = useState([]);

//   // Fetch machine IDs from the API
//   const fetchMachineData = async () => {
//     try {
//       const response = await axios.get(
//         `${API_BASE_URL}/api/machines/ORG001`
//       );
//       const machineIds = response.data.map((machine) => machine.machineId);
//       setMachineIds(machineIds);
//     } catch (error) {
//       // console.error("Error fetching machine data:", error);
//     }
//   };

//   useEffect(() => {
//     fetchMachineData();
//     fetchToolDetails();
//     const interval = setInterval(fetchToolDetails, 1000);
//     return () => clearInterval(interval);
//   }, []);

//   const fetchToolDetails = async () => {
//     try {
//       const response = await axios.get(
//         `${API_BASE_URL}/api/tools/machine/${machineId}`
//       );
  
//       // Sort the data in descending order based on toolChangeDate
//       const sortedData = response.data.sort(
//         (a, b) => new Date(b.toolChangeDate) - new Date(a.toolChangeDate)
//       );
  
//       // Set the sorted data to state
//       setToolDetails(sortedData);
//       setFilteredToolDetails(sortedData);
//     } catch (error) {
//       // console.error("Error fetching tool details data:", error);
//     }
//   };
//   ;

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prevData) => ({
//       ...prevData,
//       [name]: value,
//     }));
//   };

//  const handleReplicate = async (tool) => {
//     const confirmReplicate = window.confirm(
//       `Are you sure you want to replicate Tool "${tool.toolNumber} - ${tool.toolName}" Its Actual Life is ${tool.actualLife}?`
//     );
  
//     if (!confirmReplicate) {
//       return;
//     }
  
//     const newToolData = {
//       ...tool,
//       toolChangeDate: new Date().toISOString().split("T")[0], // today's date
//       actualLife: 0, // set actual life to 0
//     };
//     delete newToolData._id; // remove id so the backend creates a new one
  
//     // try {
//     //   const isValid = await validateToolData(newToolData);
//     //   if (!isValid) {
//     //     window.alert("Tool with the same name or number already exists with a different actual life!");
//     //     return;
//     //   }
  
//       await axios.post(
//         `${API_BASE_URL}/api/tools`,
//         newToolData
//       );
//       window.alert("Tool details replicated successfully!");
  
//       // Optionally, refresh the tool list to reflect changes
//       fetchToolDetails(); // Replace with your function to reload tools, if needed
//     // } catch (error) {
//     //   console.error("Error replicating tool details:", error);
//     // }
//   };

//   const handleDelete = async (id) => {
//     const confirmDelete = window.confirm(
//       "Are you sure you want to delete this record?"
//     );
//     if (confirmDelete) {
//       try {
//         await axios.delete(`${API_BASE_URL}/api/tools/${id}`);
//         window.alert("Tool details deleted successfully!");
//         fetchToolDetails();
//       } catch (error) {
//         console.error(
//           "Error deleting tool details:",
//           error.response?.data || error.message
//         );
//       }
//     }
//   };

//   // Function to validate form data
// const validateFormData = async (formData) => {
//   try {
//     const response = await axios.get(`${API_BASE_URL}/api/tools`);
//     const tools = response.data;

//     const isDuplicate = tools.some(
//       (tool) => 
//         (tool.toolName === formData.toolName || tool.toolNumber === formData.toolNumber)
//     );

//     return !isDuplicate;
//   } catch (error) {
//     // console.error("Error validating form data:", error);
//     return false;
//   }
// };

// const handleSubmit = async (e) => {
//   e.preventDefault();
//   try {
//     const isValid = await validateFormData(formData);
//     if (!isValid) {
//       window.alert("Tool with the same name or number already exists!");
//       return;
//     }

//     if (isEditing) {
//       await axios.put(
//         `${API_BASE_URL}/api/tools/${editId}`,
//         formData
//       );
//       window.alert("Tool details updated successfully!");
//       setIsEditing(false);
//       setEditId(null);
//     } else {
//       await axios.post(
//         `${API_BASE_URL}/api/tools`,
//         formData
//       );
//         window.alert("Tool details created successfully!");
//       }
//       fetchToolDetails();
//       resetForm();
//       setShowForm(false);
//     } catch (error) {
//       // console.error("Error saving tool details:", error);
//     }
//   };

//   const resetForm = () => {
//     setFormData({
//       machineId: machineId,
//       toolNumber: "",
//       toolName: "",
//       setLife: "",
//       // toolChangeDate: "",
//       actualLife: 0, // Reset actual life to 0
//     });
//   };

//   const [searchMachineId, setSearchMachineId] = useState("");

//   // Filter tool details based on selected machine ID
//   const handleMachineFilterChange = (e) => {
//     const selectedMachineId = e.target.value;
//     setSearchMachineId(selectedMachineId);
//     setFilteredToolDetails(
//       selectedMachineId
//         ? toolDetails.filter((tool) => tool.machineId === selectedMachineId)
//         : toolDetails // Show all if no filter is selected
//     );
//   };

//   return (
//     <div className="container mt-2 mb-5">
//       <div className="">
//         <div className="row align-items-center mb-3">
//           {/* Heading */}
//           <div className="col-12 col-md-4 order-1 order-md-3 text-center text-md-end mb-3 mb-md-0">
//             <h1 className="mb-3 text-center">Manage Tool Details</h1>
//           </div>

         

//           {/* Button to Add Tool */}
//           {/* <div className="col-12 col-md-4 order-3 order-md-2"> */}
//             {/* <button
//               className="btn btn-primary "
//               onClick={() => setShowForm(true)}
//             >
//               Add Tool
//             </button> */}
//           {/* </div> */}
//         </div>
//       </div>

//       {!showForm && (
//         <form onSubmit={handleSubmit}>
//           <div className="row fs-3">
//             <div className="col-md-4 mb-4">
//               <div className="form-group">
//                 <label>Machine ID</label>
//                 <input
//                   name="machineId"
//                   className="form-control fs-3"
//                   value={formData.machineId}
//                   // onChange={handleInputChange}
//                   readOnly
//                 />
//               </div>
//             </div>
//             <div className="col-md-4">
//               <label>Tool Number</label>
//               <input
//                 type="number"
//                 name="toolNumber"
//                 value={formData.toolNumber}
//                 onChange={handleInputChange}
//                 className="form-control fs-3"
//                 required
//               />
//             </div>
//             <div className="col-md-4">
//               <label>Tool Name</label>
//               <input
//                 type="text"
//                 name="toolName"
//                 value={formData.toolName}
//                 onChange={handleInputChange}
//                 className="form-control fs-3"
//                 required
//               />
//             </div>
//             <div className="col-md-4">
//               <label>Set Life</label>
//               <input
//                 type="number"
//                 name="setLife"
//                 value={formData.setLife}
//                 onChange={handleInputChange}
//                 className="form-control fs-3"
//                 required
//               />
//             </div>
//             <div className="col-md-4 mb-4">
//               <label>Actual Life</label>
//               <input
//                 type="number"
//                 name="actualLife"
//                 value={formData.actualLife}
//                 onChange={handleInputChange}
//                 className="form-control fs-3"
//                 readOnly
//               />
//             </div>
//           </div>
//           <button type="submit" className="btn btn-primary me-3 fs-2">
//             {isEditing ? "Update Tool Details" : "Add Tool Details"}
//           </button>
//           <button
//             type="button"
//             className="btn btn-secondary me-3 ml-2 fs-2"
//             onClick={() => {
//               resetForm();
//               setShowForm(false);
//             }}
//           >
//             Cancel
//           </button>
//         </form>
//       )}

     
//     </div>
//   );
// };

// export default Toollifeform;
