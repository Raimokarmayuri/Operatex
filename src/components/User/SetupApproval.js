import React, { useState, useEffect } from "react";
import { Container, Card, Table, Button, Form, Alert, Spinner } from "react-bootstrap";
import BackButton from "../BackButton";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import API_BASE_URL from "../config";

const SetupApproval = ({ onSubmit }) => {
  const { user } = useAuth();
  const machineId = user?.machineId || "";
  const operatorId = user?.name || "";

  const [partList, setPartList] = useState([]);
  const [selectedPart, setSelectedPart] = useState(null);
  const [dynamicSetupDetails, setDynamicSetupDetails] = useState([]);
  const [comments, setComments] = useState("");
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shiftNumber, setShiftNumber] = useState(null); // ⬅️ add shift number state

  // Fetch current shift number
  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/shifts/current`)
      .then((res) => {
        setShiftNumber(res.data.shiftNumber);
      })
      .catch((err) => {
        console.error("Error fetching current shift:", err);
        setSubmissionStatus("⚠️ Failed to fetch current shift.");
      });
  }, []);

  // Fetch part list
  useEffect(() => {
    if (machineId) {
      axios.get(`${API_BASE_URL}/api/part/getall`)
        .then((res) => {
          const parts = res.data.filter(part => part.machineId === machineId);
          setPartList(parts);
        })
        .catch((err) => {
          console.error("Error fetching parts:", err);
          setSubmissionStatus("❌ Failed to load part list. Check server.");
        });
    }
  }, [machineId]);

  const handleInputChange = (index, pIndex, value) => {
    const updated = [...dynamicSetupDetails];
    updated[index].operatorMeasuredValues[pIndex] = value;
    setDynamicSetupDetails(updated);
  };

  const handleSubmit = async () => {
    setSubmissionStatus(null);

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
      shiftNo: shiftNumber, // ⬅️ add shift number here
      status: "Pending",
      comments: comments || "No comments provided",
      savedAt: new Date().toISOString(),
    };

    setIsSubmitting(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/setup-approvals`, payload);
      setSubmissionStatus(`✅ Setup saved successfully!`);
      console.log("Saved:", res.data);

      if (onSubmit) onSubmit();

    } catch (error) {
      console.error("Error submitting setup approval:", error.response?.data || error.message);
      setSubmissionStatus("❌ Error saving setup approval. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Container className="d-flex justify-content-center align-items-center">
        <Card className="p-4 shadow-lg" style={{ width: "1000px" }}>
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

                const setupParams = selected?.setupParameters || [];
                const enrichedParams = setupParams.map((param, index) => ({
                  id: index + 1,
                  setupParameter: param.setupParameter,
                  specification: param.specification,
                  QualityParameter: param.QualityParameter,
                  MeasuredValue: param.MeasuredValue,
                  prevMeasuredValue: param.prevMeasuredValue,
                  operatorMeasuredValues: param.operatorMeasuredValues?.length === 5
                    ? param.operatorMeasuredValues
                    : ["", "", "", "", ""]
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
              placeholder="Add any notes or observations here..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
            />
          </Form.Group>

          {submissionStatus && (
            <Alert
              className="text-center mt-3"
              variant={submissionStatus.startsWith("✅") ? "success" :
                       submissionStatus.startsWith("⚠️") ? "warning" : "danger"}
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
            ) : "Submit Setup Approval"}
          </Button>
        </Card>
      </Container>
    </>
  );
};

export default SetupApproval;
