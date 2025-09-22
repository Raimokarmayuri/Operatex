// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { Form, Row, Col, Button, Table } from "react-bootstrap";
// import API_BASE_URL from "../config";

// // const API_BASE_URL = "http://localhost:5003";


// const SetupApprovalForm = () => {
//   const [machineList, setMachineList] = useState([]);
//   const [partList, setPartList] = useState([]);
//   const [selectedMachine, setSelectedMachine] = useState("");
//   const [selectedPart, setSelectedPart] = useState("");
//   const [parameterRows, setParameterRows] = useState([]);

//   useEffect(() => {
//     fetchMachines();
//     fetchParts();
//   }, []);

//   useEffect(() => {
//     if (selectedMachine && selectedPart) {
//       fetchSetupParameters(selectedMachine, selectedPart);
//     }
//   }, [selectedMachine, selectedPart]);

//   const fetchMachines = async () => {
//     const res = await axios.get(`${API_BASE_URL}/api/machines/getallmachine`);
//     setMachineList(res.data);
//   };

//   const fetchParts = async () => {
//     const res = await axios.get(`${API_BASE_URL}/api/parts`);
//     setPartList(res.data);
//   };

//   // const fetchSetupParameters = async (machine_id, partId) => {
//   //   const res = await axios.get(`${API_BASE_URL}/api/setups/parameters/${machine_id}/${partId}`);
//   //   const setupData = res.data.map((row) => {
//   //     const inputs = Array.from({ length: row.production_part_count || 5 }, () => "");
//   //     return {
//   //       parameters: row.parameters || "",
//   //       specification: row.specifications || "",
//   //       inspection_method: row.inspection_method || "",
//   //       production_part_count: row.production_part_count || 5,
//   //       inputs: inputs
//   //     };
//   //   });
//   //   setParameterRows(setupData);
//   // };
//   const fetchSetupParameters = async (machine_id, partId) => {
//     const res = await axios.get(
//       `${API_BASE_URL}/api/setups/parameters/${machine_id}/${partId}`
//     );
//     const setupData = res.data.map((row) => {
//       const count = row.production_part_count || 5;
//       const inputs = Array.from({ length: count }, () => "");
//       return {
//         parameters: row.parameters || "",
//         specification: row.specifications || "",
//         inspection_method: row.inspection_method || "",
//         production_part_count: count,
//         boolean_expected_value: row.boolean_expected_value || false,
//         inputs: inputs,
//       };
//     });
//     setParameterRows(setupData);
//   };

//   const handleInputChange = (index, inputIndex, value) => {
//     const updatedRows = [...parameterRows];
//     updatedRows[index].inputs[inputIndex] = value;
//     setParameterRows(updatedRows);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const payload = {
//       machine_id: selectedMachine,
//       part_id: selectedPart,
//       parameters: parameterRows.map((row) => ({
//         parameter: row.parameters,
//         specification: row.specification,
//         inspection_method: row.inspection_method,
//         inputs: row.inputs,
//       })),
//     };

//     try {
//       await axios.post(`${API_BASE_URL}/api/setup-approvals`, payload);
//       alert("Setup approval saved successfully.");
//     } catch (error) {
//       console.error("Save failed", error);
//       alert("Error saving setup approval");
//     }
//   };

//   return (
//     <div className="container3 p-3">
//       <h4 className="mb-3" style={{ color: "#034694" }}>
//         Setup Approval
//       </h4>

//       <Form onSubmit={handleSubmit} className="mb-4">
//         <Row>
//           <Col md={4} className="mb-3">
//             <Form.Group>
//               <Form.Label>Machine</Form.Label>
//               <Form.Select
//                 value={selectedMachine}
//                 onChange={(e) => setSelectedMachine(e.target.value)}
//               >
//                 <option value="">Select Machine</option>
//                 {machineList.map((m) => (
//                   <option key={m.machine_id} value={m.machine_id}>
//                     {m.machine_name_type}
//                   </option>
//                 ))}
//               </Form.Select>
//             </Form.Group>
//           </Col>
//           <Col md={4} className="mb-3">
//             <Form.Group>
//               <Form.Label>Part</Form.Label>
//               <Form.Select
//                 value={selectedPart}
//                 onChange={(e) => setSelectedPart(e.target.value)}
//               >
//                 <option value="">Select Part</option>
//                 {partList.map((p) => (
//                   <option key={p.part_id} value={p.part_id}>
//                     {p.part_name}
//                   </option>
//                 ))}
//               </Form.Select>
//             </Form.Group>
//           </Col>
//         </Row>

//         <Table bordered hover responsive>
//           <thead className="table-light">
//             <tr>
//               <th style={{ color: "#034694" }}>Parameter</th>
//               <th style={{ color: "#034694" }}>Specification</th>
//               <th style={{ color: "#034694" }}>Inspection Method</th>
//               <th style={{ color: "#034694" }} colSpan={10}>Inputs</th>
//             </tr>
//           </thead>
//           <tbody>
//             {parameterRows.map((row, idx) => (
//               <tr key={idx}>
//                 <td>{row.parameters}</td>
//                 <td>{row.specification}</td>
//                 <td>{row.inspection_method}</td>
//                 {row.inputs.map((val, i) => (
//                   <td key={i}>
//                     {row.boolean_expected_value ? (
//                       <Form.Select
//                         value={val}
//                         onChange={(e) =>
//                           handleInputChange(idx, i, e.target.value)
//                         }
//                       >
//                         <option value="">Select</option>
//                         <option value="OK">OK</option>
//                         <option value="NOT OK">NOT OK</option>
//                       </Form.Select>
//                     ) : (
//                       <Form.Control
//                         type="number" // Ensures only number input is allowed
//                         step="0.01"
//                         min="0"
//                         value={val}
//                         onChange={(e) =>
//                           handleInputChange(idx, i, e.target.value)
//                         }
//                         placeholder={`Input ${i + 1}`}
//                       />
//                     )}
//                   </td>
//                 ))}
//               </tr>
//             ))}
//           </tbody>
//         </Table>

//         <Button type="submit">Save Setup Approval</Button>
//       </Form>
//     </div>
//   );
// };

// export default SetupApprovalForm;
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Form, Row, Col, Button, Table, Alert } from "react-bootstrap";
import API_BASE_URL from "../config";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";


const SetupApprovalForm = () => {
  const { user } = useAuth();
  const authmachine_id = user?.machine_id || "1";
  const [currentShift, setCurrentShift] = useState(null);
  const navigate = useNavigate();

  const [selectedMachine, setSelectedMachine] = useState("");
  const [selectedPart, setSelectedPart] = useState("");
  const [parameterRows, setParameterRows] = useState([]);
  const [formDisabled, setFormDisabled] = useState(true);
  const [infoMsg, setInfoMsg] = useState("");
  const [selectedPartId, setSelectedPartId] = useState("");

  useEffect(() => {
    if (authmachine_id) {
      fetchRunningPartInfo();
    }
  }, []);

  const fetchRunningPartInfo = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/production/getRunning`);
      const currentMachine = res.data.find(
        (item) => item.machine_id === parseInt(authmachine_id)
      );

      if (currentMachine) {
        setSelectedMachine(currentMachine.machine_id);
        setCurrentShift(currentMachine.shift_no);
        setSelectedPartId(currentMachine.part_id); // when fetched from part list or API

        setSelectedPart(currentMachine.part_name);
checkIfApprovalExistsToday(
  currentMachine.machine_id,
  currentMachine.part_id,
  currentMachine.shift_no
);
        fetchSetupParameters(currentMachine.machine_id, currentMachine.part_id);
      } else {
        setInfoMsg("No running production found for your machine.");
        setFormDisabled(true);
      }
    } catch (err) {
      console.error("Error fetching running info:", err);
      setInfoMsg("Failed to fetch current running production.");
    }
  };

  const checkIfApprovalExistsToday = async (machine_id, part_id, shift_no) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/setup-approvals/today/${machine_id}`);
      const today = new Date().toISOString().split("T")[0];
  
      const approvals = res.data || [];
  
      const approvalExists = approvals.some((entry) => {
        const createdDate = new Date(entry.created_at || entry.createdAt).toISOString().split("T")[0];
        return createdDate === today && entry.part_id === part_id;
      });
  
      if (!approvalExists) {
        setFormDisabled(false);
        setInfoMsg("No setup approval submitted today. You can fill the form.");
      } else {
        if (shift_no === 1) {
          setFormDisabled(true);
          setInfoMsg("Setup approval already submitted in Shift 1. Form will be available in Shift 2.");
        } else if (shift_no === 2) {
          setFormDisabled(false);
          setInfoMsg("Shift 2 active. You can now submit setup approval.");
        } else {
          setFormDisabled(true);
          setInfoMsg("Setup approval already submitted for this shift.");
        }
      }
    } catch (err) {
      if (err.response?.status === 404) {
        // No approvals yet for today
        setFormDisabled(false);
        setInfoMsg("No setup approval submitted today. You can fill the form.");
      } else {
        console.error("Error verifying approval status:", err);
        setFormDisabled(true);
        setInfoMsg("Error verifying existing approval.");
      }
    }
  };
  
  

  const fetchSetupParameters = async (machine_id, part_id) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/setups/parameters/${machine_id}/${part_id}`);
      const setupData = res.data.map((row) => {
        const count = row.production_part_count || 5;
        return {
          parameters: row.parameters || "",
          specification: row.specifications || "",
          inspection_method: row.inspection_method || "",
          production_part_count: count,
          boolean_expected_value: row.boolean_expected_value || false,
          inputs: Array.from({ length: count }, () => ""),
        };
      });
      setParameterRows(setupData);
    } catch (err) {
      console.error("Error fetching setup parameters:", err);
    }
  };

  const handleInputChange = (index, inputIndex, value) => {
    const updated = [...parameterRows];
    updated[index].inputs[inputIndex] = value;
    setParameterRows(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      machine_id: selectedMachine,
      part_id: selectedPartId,
      status: "Pending",
      parameters: parameterRows.map((row) => ({
        parameter: row.parameters,
        specification: row.specification,
        inspection_method: row.inspection_method,
        inputs: row.inputs,
      })),
    };

    try {
      await axios.post(`${API_BASE_URL}/api/setup-approvals`, payload);
      alert("Setup approval submitted successfully.");
      setFormDisabled(true);
      navigate("/user");
      setInfoMsg("Setup approval has been submitted.");
    } catch (error) {
      console.error("Submission error:", error);
      alert("Failed to submit setup approval.");
    }
  };

  return (
    <div className="container3 p-3">
      <h4 className="mb-3 text-primary">Setup Approval</h4>

      {infoMsg && <Alert variant="warning">{infoMsg}</Alert>}

      <Form onSubmit={handleSubmit}>
        <fieldset disabled={formDisabled}>
          <Row>
            <Col md={4} className="mb-3">
              <Form.Group>
                <Form.Label>Machine</Form.Label>
                <Form.Control type="text" value={selectedMachine} readOnly />
              </Form.Group>
            </Col>
            <Col md={4} className="mb-3">
              <Form.Group>
                <Form.Label>Part</Form.Label>
                <Form.Control type="text" value={selectedPart} readOnly />
              </Form.Group>
            </Col>
          </Row>

          <Table bordered hover responsive>
            <thead className="table-light">
              <tr>
                <th className="text-primary">Parameter</th>
                <th className="text-primary">Specification</th>
                <th className="text-primary">Inspection Method</th>
                <th className="text-primary" colSpan={10}>Inputs</th>
              </tr>
            </thead>
            <tbody>
              {parameterRows.map((row, idx) => (
                <tr key={idx}>
                  <td>{row.parameters}</td>
                  <td>{row.specification}</td>
                  <td>{row.inspection_method}</td>
                  {row.inputs.map((val, i) => (
                    <td key={i}>
                      {row.boolean_expected_value ? (
                        <Form.Select
                          value={val}
                          onChange={(e) => handleInputChange(idx, i, e.target.value)}
                        >
                          <option value="">Select</option>
                          <option value="OK">OK</option>
                          <option value="NOT OK">NOT OK</option>
                        </Form.Select>
                      ) : (
                        <Form.Control
                          type="number"
                          step="0.01"
                          value={val}
                          onChange={(e) => handleInputChange(idx, i, e.target.value)}
                          placeholder={`Input ${i + 1}`}
                        />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </Table>

          <Button type="submit" >Save Setup Approval</Button>
        </fieldset>
      </Form>
    </div>
  );
};

export default SetupApprovalForm;
