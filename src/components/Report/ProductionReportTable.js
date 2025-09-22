import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Table,
  InputGroup
} from 'react-bootstrap';
import { FaCaretDown } from 'react-icons/fa';
import API_BASE_URL from "../config";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const API_URL = `${API_BASE_URL}/api/oee-logs/forProductionchart`;

const ProductionReport = () => {
  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [machineNameType, setMachineNameType] = useState('');
  const [shiftNo, setShiftNo] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    axios.get(API_URL)
      .then(({ data }) => {
        setData(data);
        setFiltered(data);
      })
      .catch(console.error);
  }, []);

  const machineOptions = useMemo(
    () => Array.from(new Set(data.map(r => r.machine_name_type))).sort(),
    [data]
  );
  const shiftOptions = useMemo(
    () => Array.from(new Set(data.map(r => r.shift_no))).sort(),
    [data]
  );

  // Auto-filter on filter value change
  useEffect(() => {
    let tmp = [...data];
    if (machineNameType) tmp = tmp.filter(r => r.machine_name_type === machineNameType);
    if (shiftNo)         tmp = tmp.filter(r => String(r.shift_no) === shiftNo);
    if (startDate)
  tmp = tmp.filter(r =>
    dayjs(r.createdAt).isAfter(dayjs(startDate).subtract(1, 'day').endOf('day'))
  );

if (endDate)
  tmp = tmp.filter(r =>
    dayjs(r.createdAt).isBefore(dayjs(endDate).add(1, 'day').startOf('day'))
  );

    setFiltered(tmp);
  }, [machineNameType, shiftNo, startDate, endDate, data]);

  const clearFilter = () => {
    setMachineNameType('');
    setShiftNo('');
    setStartDate('');
    setEndDate('');
    setFiltered(data);
  };

  const todayFilter = () => {
    const today = dayjs().format('YYYY-MM-DD');
    setStartDate(today);
    setEndDate(today);
    setMachineNameType('');
    setShiftNo('');
  };

  const exportToExcel = () => {
  const worksheetData = filtered.map((row, i) => ({
    "Sr No": i + 1,
    "Created At": dayjs(row.createdAt).format("DD/MM/YYYY"),
    "Shift No": row.shift_no,
    "Machine Name": row.machine_name_type,
    "Target Qty": row.expectedPartCount,
    "Actual Qty": row.TotalPartsProduced,
    "Defect Qty": row.defectiveParts,
    "DownTime": row.downtimeDuration,
  }));

  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Report");

  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });

  const data = new Blob([excelBuffer], { type: "application/octet-stream" });
  saveAs(data, `Production_Report_${dayjs().format("YYYY-MM-DD")}.xlsx`);
};


  return (
    <Container fluid>
      <Row className="justify-content-end align-items-end mb-3">
        <Col xs="auto">
          <InputGroup>
            <Form.Control
              as="select"
              value={machineNameType}
              onChange={e => setMachineNameType(e.target.value)}
            >
              <option value="">All Machines</option>
              {machineOptions.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </Form.Control>
            <InputGroup.Text><FaCaretDown /></InputGroup.Text>
          </InputGroup>
        </Col>

        <Col xs="auto">
          <InputGroup>
            <Form.Control
              as="select"
              value={shiftNo}
              onChange={e => setShiftNo(e.target.value)}
            >
              <option value="">All Shifts</option>
              {shiftOptions.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Form.Control>
            <InputGroup.Text><FaCaretDown /></InputGroup.Text>
          </InputGroup>
        </Col>

        <Col xs="auto">
          <Form.Control
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
          />
        </Col>
        <Col xs="auto">
          <Form.Control
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
          />
        </Col>

        <Col xs="auto" className="d-flex flex-wrap gap-2">
          <Button variant="secondary" onClick={clearFilter}>Clear</Button>
          <Button variant="primary" onClick={todayFilter}>Today</Button>
          <Button variant="outline-success" onClick={exportToExcel}>Export</Button>

        </Col>
      </Row>

      <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
        <Table striped bordered hover>
          <thead style={{ position: 'sticky', top: 0, background: '#fff', zIndex: 10 }}>
            <tr>
              <th style={{ color: '#034694' }}>Sr No</th>
              <th style={{ color: '#034694' }}>Created At</th>
              <th style={{ color: '#034694' }}>Shift No</th>
              <th style={{ color: '#034694' }}>Machine Name</th>
              <th style={{ color: '#034694' }}>Target Qty</th>
              <th style={{ color: '#034694' }}>Actual Qty</th>
              <th style={{ color: '#034694' }}>Defect Qty</th>
              <th style={{ color: '#034694' }}>DownTime</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, i) => (
              <tr key={row.id ?? i}>
                <td>{i + 1}</td>
                <td>{dayjs(row.createdAt).format('DD/MM/YYYY')}</td>
                <td>{row.shift_no}</td>
                <td>{row.machine_name_type}</td>
                <td>{row.expectedPartCount}</td>
                <td>{row.TotalPartsProduced}</td>
                <td>{row.defectiveParts}</td>
                <td>{row.downtimeDuration}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </Container>
  );
};

export default ProductionReport;
