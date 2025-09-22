import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Table,
  Accordion,
  Card,
  Spinner,
  Form,
  Row,
  Col,
  Button,
} from "react-bootstrap";
import API_BASE_URL from "../config";

const SetupApprovalHistory = () => {
  const [approvals, setApprovals] = useState([]);
  const [filteredApprovals, setFilteredApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [machineList, setMachineList] = useState([]);
  const [selectedMachine, setSelectedMachine] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    fetchMachines();
    fetchHistory();
  }, []);

  const [machineMap, setMachineMap] = useState({});

  const fetchMachines = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/machines/getallmachine`);
      setMachineList(res.data);

      // Build a map: { [machine_id]: machine_name_type }
      const map = {};
      res.data.forEach((m) => {
        map[m.machine_id] = m.machine_name_type;
      });
      setMachineMap(map);
    } catch (err) {
      console.error("Failed to load machines", err);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/setup-approvals`);
      setApprovals(res.data);
      setFilteredApprovals(res.data);
    } catch (err) {
      console.error("Error fetching setup approval history:", err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (
    machineId = selectedMachine,
    from = fromDate,
    to = toDate
  ) => {
    const fromDateObj = from ? new Date(from) : null;
    const toDateObj = to ? new Date(to) : null;

    const filtered = approvals.filter((a) => {
      const created = new Date(a.created_at);
      const matchMachine = machineId
        ? a.machine_id === parseInt(machineId)
        : true;
      const matchFrom = fromDateObj ? created >= fromDateObj : true;
      const matchTo = toDateObj ? created <= toDateObj : true;
      return matchMachine && matchFrom && matchTo;
    });

    setFilteredApprovals(filtered);
  };

  const resetFilters = () => {
    setSelectedMachine("");
    setFromDate("");
    setToDate("");
    setFilteredApprovals(approvals);
  };

  return (
    <div className="container3 mt-5">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2 p-2 border rounded bg-light">
        <div className="fs-4 fw-bold text-primary">Setup History</div>
      </div>

      <Form className="mb-3">
        <Row className="align-items-end">
          <Col md={3}>
            <Form.Group>
              <Form.Label>Machine</Form.Label>
              <Form.Select
                value={selectedMachine}
                onChange={(e) => {
                  setSelectedMachine(e.target.value);
                  applyFilters(e.target.value, fromDate, toDate); // 👈 pass new state
                }}
              >
                <option value="">All Machines</option>
                {machineList.map((m) => (
                  <option key={m.machine_id} value={m.machine_id}>
                    {m.machine_name_type}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label>From Date</Form.Label>
              <Form.Control
                type="date"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  applyFilters(selectedMachine, e.target.value, toDate);
                }}
              />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label>To Date</Form.Label>
              <Form.Control
                type="date"
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value);
                  applyFilters(selectedMachine, fromDate, e.target.value);
                }}
              />
            </Form.Group>
          </Col>
          <Col md={3}>
            <div className="d-flex gap-2">
              {/* <Button variant="primary" onClick={applyFilters}>
                Apply
              </Button> */}
              <Button variant="secondary" onClick={resetFilters}>
                Reset
              </Button>
            </div>
          </Col>
        </Row>
      </Form>

      {loading ? (
        <Spinner animation="border" variant="primary" />
      ) : filteredApprovals.length === 0 ? (
        <p>No setup approvals found.</p>
      ) : (
        <Accordion defaultActiveKey="0">
          {filteredApprovals.map((approval, index) => (
            <Accordion.Item
              eventKey={index.toString()}
              key={approval.setup_approval_id}
            >
              <Accordion.Header>
                <div className="d-flex justify-content-between w-100">
                  <div>
                    {" "}
                    <strong>Machine:</strong>{" "}
                    {machineMap[approval.machine_id] || approval.machine_id}
                  </div>
                  <div>
                    <strong>Part:</strong> {approval.part_id}
                  </div>
                  <div>
                    <strong>Date:</strong>{" "}
                    {new Date(approval.created_at).toLocaleString("en-IN")}
                  </div>
                </div>
              </Accordion.Header>
              <Accordion.Body>
                {approval.parameters.length === 0 ? (
                  <p className="text-danger">No parameters provided.</p>
                ) : (
                  <Table bordered responsive className="mt-2">
                    <thead className="table-light">
                      <tr>
                        <th>Parameter</th>
                        <th>Specification</th>
                        <th>Inspection Method</th>
                        <th>Operator Inputs</th>
                        <th>Quality Inputs</th>
                      </tr>
                    </thead>
                    <tbody>
                      {approval.parameters.map((param, i) => {
                        const inputs = param.inputs || [];
                        const operatorInputs = inputs.slice(0, 5);
                        const qualityInputs = inputs.slice(5);

                        return (
                          <tr key={i}>
                            <td>{param.parameter}</td>
                            <td>{param.specification}</td>
                            <td>{param.inspection_method}</td>
                            <td>{operatorInputs.join(", ") || "—"}</td>
                            <td>{qualityInputs.join(", ") || "—"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                )}
              </Accordion.Body>
            </Accordion.Item>
          ))}
        </Accordion>
      )}
    </div>
  );
};

export default SetupApprovalHistory;
