import React, { useState, useMemo } from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import {
  Container,
  Row,
  Col,
  Form,
  Spinner,
  Alert,
  Table,
} from "react-bootstrap";
import API_BASE_URL from "../config";


const fetchPmcHistory = async () => {
  const response = await axios.get(`${API_BASE_URL}/api/pmcHistory/History`);
  return response.data;
};

const PmcHistoryTable = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["pmcHistory"],
    queryFn: fetchPmcHistory,
  });

  const [selectedMachineId, setSelectedMachineId] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const filteredItems = useMemo(() => {
    return (data || []).filter((item) => {
      const matchesMachine =
        selectedMachineId === "" || item.machine_id?.toString() === selectedMachineId;
      const matchesStatus =
  statusFilter === "" || item.status?.toLowerCase() === statusFilter.toLowerCase();

      return matchesMachine && matchesStatus;
    });
  }, [data, selectedMachineId, statusFilter]);

  // Get unique machine_id + machine_name_type mapping
  const machineOptions = useMemo(() => {
    const unique = new Map();
    (data || []).forEach((item) => {
      if (!unique.has(item.machine_id)) {
        unique.set(item.machine_id, item.machine_name_type || `Machine ${item.machine_id}`);
      }
    });
    return [...unique.entries()];
  }, [data]);

  return (
    <Container fluid className="py-3 mt-4">
      <div className="border rounded bg-light p-3 mb-3">
        <Row className="align-items-center">
          <Col md={6}>
            <h5 className="fw-bold fs-4" style={{ color: "#034694" }}>
              PMC Alerts History
            </h5>
          </Col>
          <Col
            md={6}
            className="d-flex justify-content-end gap-2 flex-wrap mt-2 mt-md-0"
          >
            <Form.Select
              value={selectedMachineId}
              onChange={(e) => setSelectedMachineId(e.target.value)}
              style={{ width: "220px" }}
            >
              <option value="">All Machines</option>
              {machineOptions.map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </Form.Select>

            <Form.Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: "180px" }}
            >
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </Form.Select>
          </Col>
        </Row>
      </div>

      {isLoading && (
        <div className="text-center my-4">
          <Spinner animation="border" variant="primary" />
          <div>Loading data...</div>
        </div>
      )}
      {isError && <Alert variant="danger">Error: {error.message}</Alert>}

      {!isLoading && !isError && (
        <div
          className="table-responsive"
          style={{ maxHeight: "600px", overflowY: "auto" }}
        >
          <Table
            bordered
            hover
            className="mt-3"
            style={{ fontSize: "0.9rem", lineHeight: "1.2" }}
          >
            <thead
              className="table-light"
              style={{ position: "sticky", top: 0, zIndex: 1020 }}
            >
              <tr>
                <th style={{ color: "#034694" }}>Sr No</th>
           
                <th style={{ color: "#034694" }}>Machine Name</th>
                <th style={{ color: "#034694" }}>Parameter Name</th>
                <th style={{ color: "#034694" }}>Address</th>
                <th style={{ color: "#034694" }}>Bit Position</th>
                <th style={{ color: "#034694" }}>Parameter Value</th>
                <th style={{ color: "#034694" }}>Status</th>
                <th style={{ color: "#034694" }}>Start Time</th>
                <th style={{ color: "#034694" }}>End Time</th>
                <th style={{ color: "#034694" }}>Duration (min)</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((row, index) => (
                <tr key={row.id || index}>
                  <td>{index + 1}</td>
               
                  <td>{row.machine_name_type}</td>
                  <td>{row.parameter_name}</td>
                  <td>{row.register_address}</td>
                  <td>{row.bit_position}</td>
                  <td>{row.parameter_value}</td>
                  <td
                    className={
                      row.status === "Active"
                        ? "text-danger fw-bold"
                        : "text-success fw-bold"
                    }
                  >
                    {row.status}
                  </td>
                  <td>
                    {row.start_time
                      ? new Date(row.start_time).toLocaleString()
                      : "N/A"}
                  </td>
                  <td>
                    {row.status === "Active"
                      ? "It's Active"
                      : row.end_time
                      ? new Date(row.end_time).toLocaleString()
                      : "N/A"}
                  </td>
                  <td>
  {row.status === "Active"
    ? "-"
    : typeof row.duration?.minutes === "number"
    ? row.duration.minutes.toFixed(2)
    : "N/A"}
</td>

                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </Container>
  );
};

export default PmcHistoryTable;
