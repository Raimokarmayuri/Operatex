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
  InputGroup,
  ButtonGroup
} from 'react-bootstrap';
import {
  FaCaretDown,
  FaFilter,
  FaSyncAlt,
  FaCalendarDay,
  FaFileExport
} from 'react-icons/fa';
import API_BASE_URL from "../config";

const API_URL = `${API_BASE_URL}/api/partrejections`;

const PartRejectionReport = () => {
  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [machineName, setMachineName] = useState('');
  const [shiftNo, setShiftNo] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    axios.get(API_URL)
      .then(({ data }) => {
        setData(data);
        setFiltered(data);
      })
      .catch(console.error);
  }, []);

  const machines = useMemo(
    () => Array.from(new Set(data.map(r => r.machine_name_type))).sort(),
    [data]
  );
  const shifts = useMemo(
    () => Array.from(new Set(data.map(r => r.shift_no))).sort(),
    [data]
  );

  // Auto filter when any filter changes
  useEffect(() => {
    let tmp = [...data];
    if (machineName) tmp = tmp.filter(r => r.machine_name_type === machineName);
    if (shiftNo) tmp = tmp.filter(r => String(r.shift_no) === shiftNo);
    if (dateFilter) tmp = tmp.filter(r => dayjs(r.date).isSame(dateFilter, 'day'));
    setFiltered(tmp);
  }, [machineName, shiftNo, dateFilter, data]);

  const clearFilter = () => {
    setMachineName('');
    setShiftNo('');
    setDateFilter('');
    setFiltered(data);
  };

  const todayFilter = () => {
    const today = dayjs().format('YYYY-MM-DD');
    setDateFilter(today);
    setMachineName('');
    setShiftNo('');
  };

  return (
    <Container fluid className="py-3 mt-2">
      <Row className="justify-content-end align-items-center mb-3 mt-5">
        <Col xs="auto">
          <InputGroup size="sm" style={{ fontSize: '1rem' }}>
            <Form.Control
              as="select"
              value={machineName}
              onChange={e => setMachineName(e.target.value)}
            >
              <option value="">All Machines</option>
              {machines.map(m => <option key={m} value={m}>{m}</option>)}
            </Form.Control>
            <InputGroup.Text style={{ fontSize: '1.8rem' }}>
              <FaCaretDown />
            </InputGroup.Text>
          </InputGroup>
        </Col>

        <Col xs="auto">
          <InputGroup size="sm" style={{ fontSize: '1rem' }}>
            <Form.Control
              as="select"
              value={shiftNo}
              onChange={e => setShiftNo(e.target.value)}
            >
              <option value="">All Shifts</option>
              {shifts.map(s => <option key={s} value={s}>{s}</option>)}
            </Form.Control>
            <InputGroup.Text style={{ fontSize: '1.8rem' }}>
              <FaCaretDown />
            </InputGroup.Text>
          </InputGroup>
        </Col>

        <Col xs="auto">
          <InputGroup size="sm" style={{ fontSize: '1rem' }}>
            <Form.Control
              type="date"
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
            />
            <InputGroup.Text style={{ fontSize: '1.8rem' }}>
              <FaCalendarDay />
            </InputGroup.Text>
          </InputGroup>
        </Col>

        <Col xs="auto">
          <ButtonGroup size="md">
            <Button variant="outline-secondary" onClick={clearFilter} title="Clear" style={{ fontSize: '0.95rem' }}>
              <FaSyncAlt /> Clear
            </Button>
            <Button variant="outline-info" onClick={todayFilter} title="Today" style={{ fontSize: '0.95rem' }}>
              <FaCalendarDay /> Today
            </Button>
            {/* <Button variant="outline-success" title="Export" style={{ fontSize: '0.95rem' }}>
              <FaFileExport /> Export
            </Button> */}
          </ButtonGroup>
        </Col>
      </Row>

      <div style={{ maxHeight: '75vh', overflowY: 'auto' }}>
        <Table striped bordered hover>
          <thead style={{ position: 'sticky', top: 0, background: '#fff', zIndex: 10 }}>
            <tr>
              <th style={{ color: '#034694' }}>Sr No.</th>
              <th style={{ color: '#034694' }}>Date</th>
              <th style={{ color: '#034694' }}>Machine Name</th>
              <th style={{ color: '#034694' }}>Shift No</th>
              <th style={{ color: '#034694' }}>Part Name</th>
              <th style={{ color: '#034694' }}>Quantity</th>
              <th style={{ color: '#034694' }}>Rejection Reason</th>
              <th style={{ color: '#034694' }}>Rejection Type</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, idx) => (
              <tr key={idx}>
                <td>{idx + 1}</td>
                <td>{dayjs(row.date).format('M/D/YYYY')}</td>
                <td>{row.machine_name_type}</td>
                <td>{row.shift_no}</td>
                <td>{row.part_name}</td>
                <td>{row.quantity}</td>
                <td>{row.rejectionreason}</td>
                <td>{row.rejectiontype}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </Container>
  );
};

export default PartRejectionReport;
