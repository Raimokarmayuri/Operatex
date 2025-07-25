import React, { useEffect, useState } from "react";
import axios from "axios";
import { Form, Row, Col, Button, Table } from "react-bootstrap";
import API_BASE_URL from "../config";

// const API_BASE_URL = "http://localhost:5003";


const SetupApprovalForm = () => {
  const [machineList, setMachineList] = useState([]);
  const [partList, setPartList] = useState([]);
  const [selectedMachine, setSelectedMachine] = useState("");
  const [selectedPart, setSelectedPart] = useState("");
  const [parameterRows, setParameterRows] = useState([]);

  useEffect(() => {
    fetchMachines();
    fetchParts();
  }, []);

  useEffect(() => {
    if (selectedMachine && selectedPart) {
      fetchSetupParameters(selectedMachine, selectedPart);
    }
  }, [selectedMachine, selectedPart]);

  const fetchMachines = async () => {
    const res = await axios.get(`${API_BASE_URL}/api/machines/getallmachine`);
    setMachineList(res.data);
  };

  const fetchParts = async () => {
    const res = await axios.get(`${API_BASE_URL}/api/parts`);
    setPartList(res.data);
  };

  // const fetchSetupParameters = async (machineId, partId) => {
  //   const res = await axios.get(`${API_BASE_URL}/api/setups/parameters/${machineId}/${partId}`);
  //   const setupData = res.data.map((row) => {
  //     const inputs = Array.from({ length: row.production_part_count || 5 }, () => "");
  //     return {
  //       parameters: row.parameters || "",
  //       specification: row.specifications || "",
  //       inspection_method: row.inspection_method || "",
  //       production_part_count: row.production_part_count || 5,
  //       inputs: inputs
  //     };
  //   });
  //   setParameterRows(setupData);
  // };
  const fetchSetupParameters = async (machineId, partId) => {
    const res = await axios.get(
      `${API_BASE_URL}/api/setups/parameters/${machineId}/${partId}`
    );
    const setupData = res.data.map((row) => {
      const count = row.production_part_count || 5;
      const inputs = Array.from({ length: count }, () => "");
      return {
        parameters: row.parameters || "",
        specification: row.specifications || "",
        inspection_method: row.inspection_method || "",
        production_part_count: count,
        boolean_expected_value: row.boolean_expected_value || false,
        inputs: inputs,
      };
    });
    setParameterRows(setupData);
  };

  const handleInputChange = (index, inputIndex, value) => {
    const updatedRows = [...parameterRows];
    updatedRows[index].inputs[inputIndex] = value;
    setParameterRows(updatedRows);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      machine_id: selectedMachine,
      part_id: selectedPart,
      parameters: parameterRows.map((row) => ({
        parameter: row.parameters,
        specification: row.specification,
        inspection_method: row.inspection_method,
        inputs: row.inputs,
      })),
    };

    try {
      await axios.post(`${API_BASE_URL}/api/setup-approvals`, payload);
      alert("Setup approval saved successfully.");
    } catch (error) {
      console.error("Save failed", error);
      alert("Error saving setup approval");
    }
  };

  return (
    <div className="container3 p-3">
      <h4 className="mb-3" style={{ color: "#034694" }}>
        Setup Approval
      </h4>

      <Form onSubmit={handleSubmit} className="mb-4">
        <Row>
          <Col md={4} className="mb-3">
            <Form.Group>
              <Form.Label>Machine</Form.Label>
              <Form.Select
                value={selectedMachine}
                onChange={(e) => setSelectedMachine(e.target.value)}
              >
                <option value="">Select Machine</option>
                {machineList.map((m) => (
                  <option key={m.machine_id} value={m.machine_id}>
                    {m.machine_name_type}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={4} className="mb-3">
            <Form.Group>
              <Form.Label>Part</Form.Label>
              <Form.Select
                value={selectedPart}
                onChange={(e) => setSelectedPart(e.target.value)}
              >
                <option value="">Select Part</option>
                {partList.map((p) => (
                  <option key={p.part_id} value={p.part_id}>
                    {p.part_name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        <Table bordered hover responsive>
          <thead className="table-light">
            <tr>
              <th style={{ color: "#034694" }}>Parameter</th>
              <th style={{ color: "#034694" }}>Specification</th>
              <th style={{ color: "#034694" }}>Inspection Method</th>
              <th style={{ color: "#034694" }} colSpan={10}>Inputs</th>
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
                        onChange={(e) =>
                          handleInputChange(idx, i, e.target.value)
                        }
                      >
                        <option value="">Select</option>
                        <option value="OK">OK</option>
                        <option value="NOT OK">NOT OK</option>
                      </Form.Select>
                    ) : (
                      <Form.Control
                        type="number" // Ensures only number input is allowed
                        step="0.01"
                        min="0"
                        value={val}
                        onChange={(e) =>
                          handleInputChange(idx, i, e.target.value)
                        }
                        placeholder={`Input ${i + 1}`}
                      />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </Table>

        <Button type="submit">Save Setup Approval</Button>
      </Form>
    </div>
  );
};

export default SetupApprovalForm;
