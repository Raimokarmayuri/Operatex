import React, { useEffect, useState } from "react";
import axios from "axios";
import { Form, Row, Col, Button, Table } from "react-bootstrap";
import API_BASE_URL from "../config";
// const API_BASE_URL = "http://localhost:5003";

const SetupApprovalQualityView = () => {
  const [machineList, setMachineList] = useState([]);
  const [partList, setPartList] = useState([]);
  const [selectedMachine, setSelectedMachine] = useState("");
  const [selectedPart, setSelectedPart] = useState("");
  const [parameterRows, setParameterRows] = useState([]);
  const [setupApprovalId, setSetupApprovalId] = useState(null);
  const [remarkByQuality, setRemarkByQuality] = useState("");

  useEffect(() => {
    fetchMachines();
    fetchParts();
  }, []);

  useEffect(() => {
    if (selectedMachine && selectedPart) {
      fetchSetupApprovalData(selectedMachine, selectedPart);
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

  const fetchSetupApprovalData = async (machineId, partId) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/setup-approvals`);
      const qualityMeta = await axios.get(
        `${API_BASE_URL}/api/setups/parameters/${machineId}/${partId}`
      );

      const qualityMap = {};
      qualityMeta.data.forEach((q) => {
        qualityMap[q.parameters] = q.quality_part_count || 0;
      });

      const filtered = res.data.find(
        (sa) =>
          sa.machine_id === parseInt(machineId) &&
          sa.part_id === parseInt(partId)
      );

      if (filtered) {
        setSetupApprovalId(filtered.setup_approval_id);
        setRemarkByQuality(filtered.remark_by_quality || "");

        const rows = filtered.parameters.map((param, idx) => {
          const count = qualityMap[param.parameter || param.name || ""] || 0;
          const inputFields = Array.from(
            { length: count },
            (_, i) => param.inputs?.[5 + i] || ""
          );

          return {
            parameter: param.parameter || param.name || "",
            specification: param.specification || "",
            inspection_method: param.inspection_method || "",
            inputs: param.inputs?.slice(0, 5) || ["", "", "", "", ""],
            dynamic_inputs: inputFields,
            quality_part_count: count,
            remark_by_quality: param.remark_by_quality || "",
            boolean_expected_value: param.boolean_expected_value || false,
            inputs: param.inputs,
          };
        });

        setParameterRows(rows);
      } else {
        setParameterRows([]);
      }
    } catch (err) {
      console.error("Failed to fetch setup approvals", err);
    }
  };

  const handleDynamicInputChange = (rowIdx, inputIdx, value) => {
    const updatedRows = [...parameterRows];
    updatedRows[rowIdx].dynamic_inputs[inputIdx] = value;
    setParameterRows(updatedRows);
  };

  const handleRemarkChange = (rowIdx, value) => {
    const updatedRows = [...parameterRows];
    updatedRows[rowIdx].remark_by_quality = value;
    setParameterRows(updatedRows);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!setupApprovalId) return;

    try {
      await axios.put(
        `${API_BASE_URL}/api/setup-approvals/${setupApprovalId}`,
        {
          parameters: parameterRows.map((row) => ({
            ...row,
            inputs: [...row.inputs, ...row.dynamic_inputs],
            remark_by_quality: row.remark_by_quality,
          })),
          remark_by_quality: remarkByQuality,
        }
      );
      alert("Remarks submitted successfully.");
    } catch (err) {
      console.error("Error submitting remarks", err);
      alert("Failed to submit remarks");
    }
  };

  return (
    <div className="container3 p-3">
      <h4 className="mb-3" style={{ color: "#034694" }}>
        Quality Approval
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
          {/* <Col md={4} className="mb-3">
            <Form.Group>
              <Form.Label>Overall Remark by Quality</Form.Label>
              <Form.Control
                type="text"
                value={remarkByQuality}
                onChange={(e) => setRemarkByQuality(e.target.value)}
                placeholder="Enter overall remark or decision"
              />
            </Form.Group>
          </Col> */}
        </Row>

        <Table bordered hover responsive>
          <thead className="table-light">
            <tr>
              <th style={{ color: "#034694" }}>Parameter</th>
              <th style={{ color: "#034694" }}>Specification</th>
              <th style={{ color: "#034694" }}>Inspection Method</th>
              {[1, 2, 3, 4, 5].map((n) => (
                <th style={{ color: "#034694" }} key={n}>Input {n}</th>
              ))}
              <th style={{ color: "#034694" }} colSpan={5}>Dynamic Inputs (Quality)</th>
              {/* <th>Quality Part Count</th>
              <th>Remark by Quality</th> */}
            </tr>
          </thead>
          <tbody>
            {parameterRows.map((row, idx) => (
              <tr key={idx}>
                <td>{row.parameter}</td>
                <td>{row.specification}</td>
                <td>{row.inspection_method}</td>
                {row.inputs.map((val, i) => (
                  <td key={i}>
                    <Form.Control value={val} disabled />
                  </td>
                ))}
                {row.dynamic_inputs.map((val, i) => (
                  <td key={i}>
                    {row.boolean_expected_value ? (
                      <Form.Select
                        value={val}
                        onChange={(e) =>
                          handleDynamicInputChange(idx, i, e.target.value)
                        }
                        // required
                      >
                        <option value="">Select</option>
                        <option value="OK">OK</option>
                        <option value="Not OK">Not OK</option>
                      </Form.Select>
                    ) : (
                      <Form.Control
                        type="number" // Ensures only number input is allowed
                        step="0.01"
                        min="0"
                        value={val}
                        onChange={(e) =>
                          handleDynamicInputChange(idx, i, e.target.value)
                        }
                        placeholder={`Input ${i + 6}`}
                        required
                      />
                    )}
                  </td>
                ))}

                {/* <td>{row.quality_part_count}</td> */}
                <td>
                  <Form.Control
                    type="text"
                    value={row.remark_by_quality || ""}
                    onChange={(e) => handleRemarkChange(idx, e.target.value)}
                    placeholder="Remark"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        <Button type="submit" disabled={!setupApprovalId}>
          Submit Remarks
        </Button>
      </Form>
    </div>
  );
};

export default SetupApprovalQualityView;
