import React, { useState, useEffect } from "react";
import {
  Container, Card, Row, Col, Button,
  Spinner, ProgressBar, Alert, Table, Form
} from "react-bootstrap";
import BackButton from "../BackButton";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import API_BASE_URL from "../config";

// Persist state hook
function useStickyState(defaultVal, key) {
  const [val, setVal] = useState(() => {
    const stored = window.localStorage.getItem(key);
    return stored !== null ? JSON.parse(stored) : defaultVal;
  });
  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(val));
  }, [val, key]);
  return [val, setVal];
}

const MergedMachineSetup = () => {
  const { user } = useAuth();
  const machineId = user?.machineId || "";
  const operatorId = user?.name || "";

  const [flowStep, setFlowStep] = useState("idle");
  const [isSetupActive, setIsSetupActive] = useStickyState(false, "setup_active");
  const [setupStartTime, setSetupStartTime] = useStickyState(null, "setup_start_time");
  const [setupEndTime, setSetupEndTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(null);
  const [loadingStart, setLoadingStart] = useState(false);
  const [loadingEnd, setLoadingEnd] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [setupApprovalId, setSetupApprovalId] = useState(null);

  const [shiftNumber, setShiftNumber] = useState(null);
  const [partList, setPartList] = useState([]);
  const [selectedPart, setSelectedPart] = useState(null);
  const [dynamicSetupDetails, setDynamicSetupDetails] = useState([]);
  const [comments, setComments] = useState("");
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Timer update
  useEffect(() => {
    let tid;
    if (isSetupActive && setupStartTime) {
      const start = new Date(setupStartTime).getTime();
      setElapsedTime(Math.floor((Date.now() - start) / 1000));
      tid = setInterval(() => setElapsedTime(t => t + 1), 1000);
    }
    return () => clearInterval(tid);
  }, [isSetupActive, setupStartTime]);

  const formatTime = sec => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;

  // Fetch shift number
  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/shifts/current`)
      .then((res) => setShiftNumber(res.data.shiftNumber))
      .catch((err) => {
        console.error("Error fetching shift:", err);
        setSubmissionStatus("⚠️ Failed to fetch current shift.");
      });
  }, []);

  // Fetch parts
  useEffect(() => {
    if (machineId) {
      axios.get(`${API_BASE_URL}/api/part/getall`)
        .then((res) => {
          const parts = res.data.filter(part => part.machineId === machineId);
          setPartList(parts);
        })
        .catch((err) => {
          console.error("Error fetching parts:", err);
          setSubmissionStatus("❌ Failed to load part list.");
        });
    }
  }, [machineId]);

  const startSetup = () => {
    setLoadingStart(true);
    setSetupStartTime(new Date().toISOString());
    setIsSetupActive(true);
    setFlowStep("approval");
    setTimeout(() => setLoadingStart(false), 500);
  };

  const handleInputChange = (index, pIndex, value) => {
    const updated = [...dynamicSetupDetails];
    updated[index].operatorMeasuredValues[pIndex] = value;
    setDynamicSetupDetails(updated);
  };

  const handleApprovalSubmit = async () => {
    if (!selectedPart || dynamicSetupDetails.length === 0) {
      setSubmissionStatus("❌ Please select a part and enter measured values.");
      return;
    }

    const setupItemEntries = dynamicSetupDetails.map((item) => ({
      setupParameter: item.setupParameter,
      specification: item.specification,
      QualityParameter: item.QualityParameter,
      MeasuredValue: item.MeasuredValue,
      prevMeasuredValue: item.prevMeasuredValue,
      operatorMeasuredValues: item.operatorMeasuredValues
    }));

    const payload = {
      machineId,
      operatorId,
      partId: selectedPart._id,
      partName: selectedPart.PartName,
      setupItem: setupItemEntries,
      shiftNo: shiftNumber,
      status: "Pending",
      comments: comments || "No comments provided",
      savedAt: new Date().toISOString(),
    };

    setIsSubmitting(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/setup-approvals`, payload);
      setSubmissionStatus("✅ Setup saved successfully!");
      setSetupApprovalId(res.data._id);
      setFlowStep("running");
    } catch (error) {
      console.error("Error submitting setup approval:", error.response?.data || error.message);
      setSubmissionStatus("❌ Error saving setup approval.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const endSetup = async () => {
    setLoadingEnd(true);
    const now = new Date();
    setSetupEndTime(now);
    setIsSetupActive(false);

    const diffMs = now.getTime() - new Date(setupStartTime).getTime();
    const mins = Math.floor(diffMs / 60000);
    const secs = Math.floor((diffMs % 60000) / 1000);
    const durationStr = `${mins}m ${secs}s`;

    setTotalDuration({ minutes: mins, seconds: secs });
    setShowAlert(true);

    try {
      if (!setupApprovalId) {
        console.error("❌ No SetupApproval ID available to update!");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/setup-approvals/${setupApprovalId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          setupDuration: durationStr
        })
      });

      if (response.ok) {
        console.log("✅ Duration saved successfully");
      } else {
        console.error("❌ Failed to save duration", await response.text());
      }
    } catch (err) {
      console.error("❌ Error saving duration:", err);
    }

    setTimeout(() => {
      setLoadingEnd(false);
      setFlowStep("done");
    }, 500);
  };

  return (
    <>
      <BackButton />

      {showAlert && (
        <Alert variant="success" dismissible onClose={() => setShowAlert(false)} className="m-3">
          ✅ Setup ended at {setupEndTime?.toLocaleTimeString()}. Duration: {totalDuration?.minutes}m {totalDuration?.seconds}s.
        </Alert>
      )}

      <Container fluid className="vh-60 d-flex align-items-center mb-4">
        <Row className="justify-content-center w-100">
          <Col sm={10} md={8} lg={6}>
            <Card className="shadow-lg rounded-3">
              <Card.Header className="text-center bg-white text-primary">
                <h3>Machine Setup</h3>
              </Card.Header>
              <Card.Body className="text-center">
                <Row className="mb-3">
                  <Col><strong>Machine:</strong> {machineId || "—"}</Col>
                  <Col><strong>Operator:</strong> {operatorId || "—"}</Col>
                </Row>
                <Row className="mb-3">
                  <Col><strong>Status:</strong>{" "}
                    {flowStep === "idle" && "Ready"}
                    {flowStep === "approval" && "Approval Pending..."}
                    {flowStep === "running" && `Running — ${formatTime(elapsedTime)}`}
                    {flowStep === "done" && "Completed"}
                  </Col>
                  <Col><strong>Total duration:</strong>
                    {(totalDuration?.minutes ?? 0)}m {(totalDuration?.seconds ?? 0)}s
                  </Col>
                </Row>

                <ProgressBar
                  now={isSetupActive ? (elapsedTime % 3600) / 3600 * 100 : 0}
                  animated={isSetupActive}
                  striped
                  variant={isSetupActive ? "warning" : "secondary"}
                  label={isSetupActive ? formatTime(elapsedTime) : ""}
                  style={{ width: "80%", height: "10px", margin: "auto" }}
                />
              </Card.Body>

              <Card.Footer className="d-flex justify-content-center">
                {flowStep === "idle" && (
                  <Button onClick={startSetup} disabled={loadingStart}>
                    {loadingStart ? <Spinner animation="border" size="sm" /> : "Start Setup"}
                  </Button>
                )}
                {flowStep === "running" && (
                  <Button variant="danger" onClick={endSetup} disabled={loadingEnd}>
                    {loadingEnd ? <Spinner animation="border" size="sm" /> : "End Setup"}
                  </Button>
                )}
              </Card.Footer>
            </Card>
          </Col>
        </Row>
      </Container>

      {flowStep === "approval" && (
        <Container className="mb-4">
          <Card className="p-4 shadow-lg">
            <h3 className="mb-3 text-center">CNC Machine Setup Approval</h3>
            <p><strong>Machine ID:</strong> {machineId}</p>
            <p><strong>Operator ID:</strong> {operatorId}</p>
            <p><strong>Shift No:</strong> {shiftNumber !== null ? shiftNumber : "Loading..."}</p>

            <Form.Group className="mb-3">
              <Form.Label><strong>Select Part</strong></Form.Label>
              <Form.Select
                value={selectedPart?._id || ""}
                onChange={(e) => {
                  const selected = partList.find(p => p._id === e.target.value);
                  setSelectedPart(selected);
                  const enrichedParams = (selected?.setupParameters || []).map((param, index) => ({
                    id: index + 1,
                    setupParameter: param.setupParameter,
                    specification: param.specification,
                    QualityParameter: param.QualityParameter,
                    MeasuredValue: param.MeasuredValue,
                    prevMeasuredValue: param.prevMeasuredValue,
                    operatorMeasuredValues: param.operatorMeasuredValues?.length === 5 ? param.operatorMeasuredValues : ["", "", "", "", ""]
                  }));
                  setDynamicSetupDetails(enrichedParams);
                }}
              >
                <option value="">-- Select a Part --</option>
                {partList.map(part => (
                  <option key={part._id} value={part._id}>{part.PartName}</option>
                ))}
              </Form.Select>
            </Form.Group>

            {dynamicSetupDetails.length > 0 && (
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Setup Parameter</th>
                    <th>Specification</th>
                    <th>Quality Parameter</th>
                    <th>Measured Value</th>
                    <th>P1</th>
                    <th>P2</th>
                    <th>P3</th>
                    <th>P4</th>
                    <th>P5</th>
                  </tr>
                </thead>
                <tbody>
                  {dynamicSetupDetails.map((item, index) => (
                    <tr key={item.id}>
                      <td>{index + 1}</td>
                      <td>{item.setupParameter}</td>
                      <td>{item.specification}</td>
                      <td>{item.QualityParameter}</td>
                      <td>{item.MeasuredValue}</td>
                      {(item.operatorMeasuredValues || ["", "", "", "", ""]).map((val, pIndex) => (
                        <td key={pIndex}>
                          <Form.Control
                            type="text"
                            value={val}
                            onChange={(e) => handleInputChange(index, pIndex, e.target.value)}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}

            <Form.Group className="mt-3">
              <Form.Label><strong>Comments (Optional):</strong></Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Add any notes here..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
              />
            </Form.Group>

            {submissionStatus && (
              <Alert className="text-center mt-3" variant={
                submissionStatus.startsWith("✅") ? "success" :
                submissionStatus.startsWith("⚠️") ? "warning" : "danger"
              }>
                {submissionStatus}
              </Alert>
            )}

            <Button variant="primary" onClick={handleApprovalSubmit} className="w-100 mt-3" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Spinner size="sm" animation="border" className="me-2" />
                  Saving...
                </>
              ) : "Submit Setup Approval"}
            </Button>
          </Card>
        </Container>
      )}
    </>
  );
};

export default MergedMachineSetup;
