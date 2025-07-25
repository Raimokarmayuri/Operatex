import React, { useState } from "react";
import { Container, Card, Button, Form, Table } from "react-bootstrap";

const MachineSetupChecksheet = ({ machineId, operatorId }) => {
  // Static checklist data
  const checklist = [
    { id: 1, parameter: "Check Emergency Stop Functionality" },
    { id: 2, parameter: "Verify Coolant Levels" },
    { id: 3, parameter: "Inspect Tooling Setup" },
    { id: 4, parameter: "Check Machine Zero Position" },
    { id: 5, parameter: "Ensure Workpiece Clamping is Secure" },
    { id: 6, parameter: "Run Dry Cycle Before Starting Production" }
  ];
  

  // State to manage responses
  const [responses, setResponses] = useState(
    checklist.reduce((acc, item) => {
      acc[item.id] = null; // Default: No selection
      return acc;
    }, {})
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState(null);

  // Handle Selection Change
  const handleSelectionChange = (id, value) => {
    setResponses((prevResponses) => ({
      ...prevResponses,
      [id]: value
    }));
  };

  // Handle Submit Button Click
  const handleSubmit = () => {
    setIsSubmitting(true);

    setTimeout(() => {
      console.log("Checklist Submitted:", {
        machineId,
        operatorId,
        date: new Date().toISOString(),
        responses
      });

      // Check if any parameter is marked "Not OK"
      if (Object.values(responses).includes("Not OK")) {
        setSubmissionStatus("⚠️ Some items are marked as 'Not OK'. Please review before proceeding.");
      } else {
        setSubmissionStatus("✅ Checklist submitted successfully!");
      }

      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <Container className="d-flex justify-content-center align-items-center vh-100">
      <Card className="p-4 shadow-lg" style={{ width: "750px" }}>
        <h3 className="mb-3 text-center">Machine Setup Checklist</h3>
        <p><strong>Machine ID:</strong> {machineId}</p>
        <p><strong>Operator ID:</strong> {operatorId}</p>

        <Table striped bordered hover>
          <thead>
            <tr>
              <th>#</th>
              <th>Checklist Item</th>
              <th className="text-center">OK</th>
              <th className="text-center">Not OK</th>
            </tr>
          </thead>
          <tbody>
            {checklist.map((item, index) => (
              <tr key={item.id}>
                <td>{index + 1}</td>
                <td>{item.parameter}</td>
                <td className="text-center">
                  <Form.Check
                    type="radio"
                    name={`check-${item.id}`}
                    onChange={() => handleSelectionChange(item.id, "OK")}
                    checked={responses[item.id] === "OK"}
                  />
                </td>
                <td className="text-center">
                  <Form.Check
                    type="radio"
                    name={`check-${item.id}`}
                    onChange={() => handleSelectionChange(item.id, "Not OK")}
                    checked={responses[item.id] === "Not OK"}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        {submissionStatus && (
          <p className={`text-${submissionStatus.includes("⚠️") ? "danger" : "success"} text-center`}>
            {submissionStatus}
          </p>
        )}

        <Button
          variant="primary"
          onClick={handleSubmit}
          className="w-100 mt-3"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit Checklist"}
        </Button>
      </Card>
    </Container>
  );
};

export default MachineSetupChecksheet;
