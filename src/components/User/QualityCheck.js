import React, { useState, useEffect } from "react";
import { Container, Card, Table, Button, Form, Alert, Spinner } from "react-bootstrap";
// import BackButton from '../BackButton';
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import API_BASE_URL from "../config";

const QualityCheckSheet = () => {
 const { user } = useAuth();
const machineId = user?.machineId || "";
const operatorId = user?.name || "";

  const qualityUser = user?.name || "QualityUser1";

  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [status, setStatus] = useState({});
  const [p6Values, setP6Values] = useState({});
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchPendingApprovals();
  }, []);

  //for show all pending setup
  const fetchPendingApprovals = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/setup-approvals/setup-approvals/pending`);
      setPendingApprovals(res.data);
      console.log("Pending approvals:", res.data);
    } catch (err) {
      console.error("Error fetching pending approvals:", err);
    }
  };


  // for logged in user only show pending setup
//   const fetchPendingApprovals = async () => {
//   try {
//     const res = await axios.get(`${API_BASE_URL}/api/setup-approvals/setup-approvals/pending`);
//     const allApprovals = res.data;

//     // 🔒 Filter by machineId
//     const filtered = allApprovals.filter(app => app.machineId === machineId);

//     setPendingApprovals(filtered);
//   } catch (err) {
//     console.error("Error fetching pending approvals:", err);
//   }
// };

  const handleStatusChange = (index, value) => {
    setStatus(prev => ({ ...prev, [index]: value }));
  };

  const handleP6Change = (index, value) => {
    setP6Values(prev => ({ ...prev, [index]: value }));
  };

  const handleSubmit = async () => {
    if (!selectedApproval) return;

    const setupItemEntries = selectedApproval.setupItem.map((item, index) => {
      // P1 ~ P5
      const currentValues = item.operatorMeasuredValues || ["", "", "", "", ""];
      // Add P6 from state
      const finalValues = [...currentValues, p6Values[index] || ""];

      return {
        setupParameter: item.setupParameter,
        specification: item.specification,
        QualityParameter: item.QualityParameter,
        MeasuredValue: item.MeasuredValue,
        prevMeasuredValue: item.prevMeasuredValue,
        operatorMeasuredValues: finalValues,
        status: status[index] || "Pending"
      };
    });

    const unmarked = setupItemEntries.filter(i => i.status === "Pending" || i.status === "");
    if (unmarked.length > 0) {
      setSubmissionStatus(`❌ Please approve/reject all ${unmarked.length} parameters.`);
      return;
    }

    const payload = {
      setupItem: setupItemEntries,
      qualityApprovedBy: qualityUser,
      qualityApprovedAt: new Date().toISOString()
    };

    setIsSubmitting(true);
    try {
      const res = await axios.put(`${API_BASE_URL}/api/setup-approvals/setup-approvals/approve/${selectedApproval._id}`, payload);
      setSubmissionStatus("✅ Quality approval saved!");
      fetchPendingApprovals();
      setSelectedApproval(null);
      setStatus({});
      setP6Values({});
    } catch (error) {
      console.error("Error submitting quality approval:", error);
      setSubmissionStatus("❌ Error saving approval.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const [isPinVerified, setIsPinVerified] = useState(false);
const [enteredPin, setEnteredPin] = useState("");

const QUALITY_PIN = "1234"; // Set your pin here (later can come from backend)

const handleVerifyPin = () => {
  if (enteredPin === QUALITY_PIN) {
    setIsPinVerified(true);
  } else {
    alert("Incorrect PIN!");
  }
};

// 👇 PIN screen
// if (!isPinVerified) {
//   return (
//     <>
//       {/* <BackButton /> */}
//       <Container className="d-flex justify-content-center align-items-center mt-5 vh-80">
//         <Card className="p-4 shadow-lg" style={{ width: "400px" }}>
//           <h4 className="text-center mb-3">Quality Verification</h4>
//           <p><strong>Operator ID:</strong> {operatorId}</p>
// <p><strong>Machine ID:</strong> {machineId}</p>
//           <Form.Group className="mb-3">
//             <Form.Label>Enter Quality PIN</Form.Label>
//             <Form.Control
//               type="password"
//               value={enteredPin}
//               onChange={(e) => setEnteredPin(e.target.value)}
//             />
//           </Form.Group>
//           <Button variant="primary" onClick={handleVerifyPin} className="w-100">
//             Verify
//           </Button>
//         </Card>
//       </Container>
//     </>
//   );
// }




  return (
    <>
      {/* <BackButton /> */}
      <Container className="d-flex justify-content-center align-items-center vh-100">
        <Card className="p-4 shadow-lg" style={{ width: "1000px" }}>
          <h3 className="mb-3 text-center">CNC Quality Check Sheet</h3>
          <p><strong>Quality User:</strong> {qualityUser}</p>

          {/* Pending approvals dropdown */}
          <Form.Group className="mb-3">
            <Form.Label><strong>Select Pending Setup Approval</strong></Form.Label>
            <Form.Select
              value={selectedApproval?._id || ""}
              onChange={(e) => {
                const selected = pendingApprovals.find(p => p._id === e.target.value);
                setSelectedApproval(selected);

                const resetStatus = {};
                const resetP6 = {};
                selected?.setupItem.forEach((p, index) => {
                  resetStatus[index] = p.status || "";
                  resetP6[index] = ""; // Clear P6 values on change
                });
                setStatus(resetStatus);
                setP6Values(resetP6);
              }}
            >
              <option value="">-- Select Approval --</option>
              {pendingApprovals.map(app => (
                <option key={app._id} value={app._id}>
                  {app.machineId} - {app.partName} ({new Date(app.savedAt).toLocaleString()})
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          {selectedApproval && (
            <>
              <p><strong>Machine ID:</strong> {selectedApproval.machineId}</p>
              <p><strong>Part Name:</strong> {selectedApproval.partName}</p>

              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Setup Parameter</th>
                    <th>Specification</th>
                    <th>Quality Parameter</th>
                    <th>P1</th>
                    <th>P2</th>
                    <th>P3</th>
                    <th>P4</th>
                    <th>P5</th>
                    <th>P6</th>
                    <th>Approve</th>
                    <th>Reject</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedApproval.setupItem.map((item, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{item.setupParameter}</td>
                      <td>{item.specification}</td>
                      <td>{item.QualityParameter}</td>

                      {(item.operatorMeasuredValues || ["", "", "", "", ""]).map((val, pIndex) => (
                        <td key={pIndex}>{val}</td>
                      ))}

                      {/* P6 entry */}
                      <td>
                        <Form.Control
                          type="text"
                          value={p6Values[index] || ""}
                          onChange={(e) => handleP6Change(index, e.target.value)}
                        />
                      </td>

                      <td>
                        <Form.Check
                          type="radio"
                          name={`status-${index}`}
                          onChange={() => handleStatusChange(index, "Approved")}
                          checked={status[index] === "Approved"}
                        />
                      </td>
                      <td>
                        <Form.Check
                          type="radio"
                          name={`status-${index}`}
                          onChange={() => handleStatusChange(index, "Rejected")}
                          checked={status[index] === "Rejected"}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              {submissionStatus && (
                <Alert
                  className="text-center mt-3"
                  variant={submissionStatus.startsWith("✅") ? "success" : "danger"}
                >
                  {submissionStatus}
                </Alert>
              )}

              <Button
                variant="primary"
                onClick={handleSubmit}
                className="w-100 mt-3"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Spinner size="sm" animation="border" className="me-2" />
                    Saving...
                  </>
                ) : "Submit Quality Approval"}
              </Button>
            </>
          )}
        </Card>
      </Container>
    </>
  );
};

export default QualityCheckSheet;
