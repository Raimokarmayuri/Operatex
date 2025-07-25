import React, { useState } from "react";
import { Container, Card, Table, Button, Badge } from "react-bootstrap";
import moment from "moment";

const GaugeCalibrationCalendar = ({ machineId, operatorId }) => {
  // Static list of gauges with last calibration dates & intervals (in months)
  const [gauges, setGauges] = useState([
    { id: 1, name: "Micrometer", lastCalibrated: "2024-01-15", interval: 3 },
    { id: 2, name: "Vernier Caliper", lastCalibrated: "2024-02-01", interval: 6 },
    { id: 3, name: "Dial Indicator", lastCalibrated: "2023-11-10", interval: 3 },
    { id: 4, name: "Bore Gauge", lastCalibrated: "2023-12-05", interval: 6 },
    { id: 5, name: "Height Gauge", lastCalibrated: "2024-03-01", interval: 12 },
  ]);

  // Handle Calibration Update
  const updateCalibrationDate = (id) => {
    setGauges((prevGauges) =>
      prevGauges.map((gauge) =>
        gauge.id === id ? { ...gauge, lastCalibrated: moment().format("YYYY-MM-DD") } : gauge
      )
    );
  };

  return (
    <Container className="d-flex justify-content-center align-items-center vh-100">
      <Card className="p-4 shadow-lg" style={{ width: "800px" }}>
        <h3 className="mb-3 text-center">Gauge Calibration Calendar</h3>
        <p><strong>Machine ID:</strong> {machineId}</p>
        <p><strong>Operator ID:</strong> {operatorId}</p>

        <Table striped bordered hover className="text-center">
          <thead>
            <tr>
              <th>#</th>
              <th>Gauge Name</th>
              <th>Last Calibrated</th>
              <th>Next Calibration</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {gauges.map((gauge, index) => {
              const lastCalDate = moment(gauge.lastCalibrated);
              const nextCalDate = lastCalDate.add(gauge.interval, "months");
              const daysUntilDue = nextCalDate.diff(moment(), "days");

              // Determine Status Color
              let statusBadge;
              if (daysUntilDue > 30) {
                statusBadge = <Badge bg="success">Up-to-Date</Badge>; // ✅ Green
              } else if (daysUntilDue > 0) {
                statusBadge = <Badge bg="warning">Due Soon</Badge>; // ⚠️ Yellow
              } else {
                statusBadge = <Badge bg="danger">Overdue</Badge>; // ❌ Red
              }

              return (
                <tr key={gauge.id}>
                  <td>{index + 1}</td>
                  <td>{gauge.name}</td>
                  <td>{moment(gauge.lastCalibrated).format("DD-MMM-YYYY")}</td>
                  <td>{nextCalDate.format("DD-MMM-YYYY")}</td>
                  <td>{statusBadge}</td>
                  <td>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => updateCalibrationDate(gauge.id)}
                    >
                      Mark Calibrated
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Card>
    </Container>
  );
};

export default GaugeCalibrationCalendar;
