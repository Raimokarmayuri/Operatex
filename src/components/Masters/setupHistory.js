import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Accordion, Card, Spinner } from "react-bootstrap";
import API_BASE_URL from "../config";
// const API_BASE_URL = "http://localhost:5003";

const SetupApprovalHistory = () => {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/setup-approvals`);
      setApprovals(res.data);
    } catch (err) {
      console.error("Error fetching setup approval history:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container3 mt-5">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2 p-2 border rounded bg-light">
        <div className="fs-4 fw-bold" style={{ color: "#034694" }}>
          Setup History
        </div>
        </div>
      {loading ? (
        <Spinner animation="border" variant="primary" />
      ) : approvals.length === 0 ? (
        <p>No setup approvals found.</p>
      ) : (
        <Accordion defaultActiveKey="0">
          {approvals.map((approval, index) => (
            <Accordion.Item eventKey={index.toString()} key={approval.setup_approval_id}>
              <Accordion.Header>
                <div className="d-flex justify-content-between w-100">
                  <div><strong>Machine:</strong> {approval.machine_id}</div>
                  <div><strong>Part:</strong> {approval.part_id}</div>
                  <div><strong>Date:</strong> {new Date(approval.created_at).toLocaleString("en-IN")}</div>
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
                        <th>Inputs</th>
                      </tr>
                    </thead>
                    <tbody>
                      {approval.parameters.map((param, i) => (
                        <tr key={i}>
                          <td>{param.parameter}</td>
                          <td>{param.specification}</td>
                          <td>{param.inspection_method}</td>
                          <td>
                            {param.inputs && param.inputs.length > 0
                              ? param.inputs.join(", ")
                              : "—"}
                          </td>
                        </tr>
                      ))}
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
