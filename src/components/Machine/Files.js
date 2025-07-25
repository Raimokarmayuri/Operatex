

import React from "react";
import { Container, Row, Col, Nav } from "react-bootstrap";
import { NavLink, useParams } from "react-router-dom";

function Files() {
  const { machineId } = useParams();

  // ✅ Retrieve role from localStorage
  const userRole = localStorage.getItem("userRole"); // should return "operator" or "admin"
  console.log("User Role:", userRole); // <-- Check console to confirm

  // All available tabs
  const allLinks = [
    { path: `/machine/${machineId}/summary`, label: "Summary" },
    { path: `/machine/${machineId}/monitoring`, label: "Monitoring" },
    { path: `/machine/${machineId}/maintenance/pmdash`, label: "Maintenance" },
    { path: `/machine/${machineId}/report`, label: "Production" },
    { path: `/machine/${machineId}/machinedetails`, label: "Tools" },
    { path: `/machine/${machineId}/alert`, label: "Alarm" },
  ];

  // ✅ Only show Summary tab if operator
  const links = userRole === "operator"
    ? allLinks.filter((link) => link.label === "Summary")
    : allLinks;

  return (
    <nav className="mb-2">
      <Container>
        <Row className="justify-content-center">
          <Col>
            <Nav className="nav justify-content-center">
              {links.map((link, index) => (
                <NavLink
                  key={index}
                  to={link.path}
                  className={({ isActive }) =>
                    `nav-link text-dark fs-5 fw-bold ${
                      isActive ? "active text-primary border-bottom border-primary" : ""
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </Nav>
          </Col>
        </Row>
      </Container>
    </nav>
  );
}

export default Files;


