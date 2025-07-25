import React, { useState } from "react";
import { Container, Card, Table, Button, Badge } from "react-bootstrap";

const ProcessOperation = ({ machineId, operatorId }) => {
  // Static list of CNC process operations
  const [operations, setOperations] = useState([
    { id: 1, name: "Workpiece Mounting", status: "Pending", description: "Secure the workpiece properly before machining." },
    { id: 2, name: "Tool Setup", status: "Pending", description: "Select and mount the appropriate tool for operation." },
    { id: 3, name: "Rough Cutting", status: "Pending", description: "Perform initial cutting to remove excess material." },
    { id: 4, name: "Drilling", status: "Pending", description: "Drill holes as per the CAD design specifications." },
    { id: 5, name: "Finishing & Deburring", status: "Pending", description: "Smoothen edges and remove any burrs from the workpiece." },
    { id: 6, name: "Final Inspection", status: "Pending", description: "Check the final dimensions and quality of the part." },
  ]);

  // Function to mark an operation as Completed
  const markAsCompleted = (id) => {
    setOperations((prevOperations) =>
      prevOperations.map((operation) =>
        operation.id === id ? { ...operation, status: "Completed" } : operation
      )
    );
  };

  return (
    <Container className="d-flex justify-content-center align-items-center vh-100">
      <Card className="p-4 shadow-lg" style={{ width: "800px" }}>
        <h3 className="mb-3 text-center">Process Operation - CNC Machine</h3>
        <p><strong>Machine ID:</strong> {machineId}</p>
        <p><strong>Operator ID:</strong> {operatorId}</p>

        <Table striped bordered hover className="text-center">
          <thead>
            <tr>
              <th>#</th>
              <th>Operation Step</th>
              <th>Description</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {operations.map((operation, index) => (
              <tr key={operation.id}>
                <td>{index + 1}</td>
                <td>{operation.name}</td>
                <td>{operation.description}</td>
                <td>
                  {operation.status === "Completed" ? (
                    <Badge bg="success">Completed</Badge>
                  ) : (
                    <Badge bg="warning">Pending</Badge>
                  )}
                </td>
                <td>
                  {operation.status !== "Completed" && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => markAsCompleted(operation.id)}
                    >
                      Mark as Completed
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </Container>
  );
};

export default ProcessOperation;
