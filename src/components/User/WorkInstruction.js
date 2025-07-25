import React, { useState } from "react";
import { Container, Card, Button, Row, Col } from "react-bootstrap";

const OperatorWorkInstruction = ({ machineId }) => {
  const workInstructions = [
    {
      title: "Step 1: Machine Setup",
      image: "https://www.datron.com/blog/wp-content/uploads/2020/12/CNC-Machine-Setup.jpg",
      description: "Ensure the machine is powered on, check the coolant levels, and verify emergency stop functionality."
    },
    {
      title: "Step 2: Load the Workpiece",
      image: "https://www.mmsonline.com/cdn/cms/Cutting-Tool-Loading.jpg",
      description: "Place the workpiece on the fixture and secure it properly using clamps or a vice."
    },
    {
      title: "Step 3: Set Tool Offsets",
      image: "https://www.nyccnc.com/wp-content/uploads/2021/06/How-to-Set-Tool-Offets-on-a-CNC-Machine.jpg",
      description: "Adjust tool offsets using the CNC controller to ensure accurate machining. Verify tool length and diameter."
    },
    {
      title: "Step 4: Start the CNC Program",
      image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/CNC-Machine-Program.jpg/640px-CNC-Machine-Program.jpg",
      description: "Select the correct CNC program and begin the machining process."
    },
    {
      title: "Step 5: Monitor the Machining Process",
      image: "https://static.industrybuying.com/img/ib/s/b/8585/858532_1675325160.jpg",
      description: "Monitor the machining process to ensure smooth operation, check for tool wear, and inspect the finished part."
    }
  ];

  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = () => {
    if (currentStep < workInstructions.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <Container fluid className="d-flex justify-content-center align-items-center vh-100">
      <Card className="p-4 text-center shadow-lg" style={{ width: "600px" }}>
        <h3 className="mb-3">CNC Work Instructions</h3>
        <p><strong>Machine ID:</strong> {machineId}</p>

        <h5 className="mb-3">{workInstructions[currentStep].title}</h5>
        <img
          src={workInstructions[currentStep].image}
          alt={workInstructions[currentStep].title}
          className="img-fluid mb-3"
          style={{ maxHeight: "300px", borderRadius: "10px", objectFit: "cover", width: "100%" }}
        />
        <p>{workInstructions[currentStep].description}</p>

        <Row className="mt-3">
          <Col>
            <Button
              variant="secondary"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="w-100"
            >
              Previous
            </Button>
          </Col>
          <Col>
            <Button
              variant="primary"
              onClick={nextStep}
              disabled={currentStep === workInstructions.length - 1}
              className="w-100"
            >
              Next
            </Button>
          </Col>
        </Row>
      </Card>
    </Container>
  );
};

export default OperatorWorkInstruction;
