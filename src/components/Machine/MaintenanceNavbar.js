// Import required dependencies
import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { useLocation } from "react-router-dom";
import { NavLink, useParams } from "react-router-dom";

// import "bootstrap/dist/css/bootstrap.min.css";

const MaintenanceOverview = () => {
  const { machineId } = useParams();
  const location = useLocation(); // Get the current location
  const links = [
    { path: `/machine/${machineId}/maintenance/pmdash`, label: "PM Dashboard" },
    { path: `/machine/${machineId}/maintenance/Schedules`, label: "Schedules" },
    // { path: `/machine/${machineId}/maintenance/schedule`, label: "Schedule" },
    {
      path: `/machine/${machineId}/maintenance/assetsdetails`,
      label: "Assets Details",
    },
  ];

  return (
    <div>
      {/* Navigation */}
      <nav
        style={{
          background: "white", //  background for the navigation bar
          height: "3%",
          width: "100%",
        }}
      >
        <Container fluid>
          {/* Single Row with 5 Columns */}
          <Row className="gx-5 text-center justify-content-evenly py-1">
            {links.map((link, index) => (
              <Col
                key={index}
                xs={12}
                md={2}
                className="d-flex justify-content-center align-items-center mb-0 mb-md-0"
              >
                <NavLink
                  to={link.path}
                  className={({ isActive }) =>
                    `text-center px-3 py-2 fw-bold ${
                      isActive ? "active-tab" : "text-black"
                    }`
                  }
                  style={{
                    fontSize: "1rem",
                    textDecoration: "none",
                    fontWeight: "bold",
                    fontFamily: "Montserrat, sans-serif",
                    color: location.pathname === link.path ? "blue" : "black",
                    // borderBottom:
                    //   location.pathname === link.path ? "3px solid orange" : "none",
                  }}
                >
                  {link.label}
                </NavLink>
              </Col>
            ))}
          </Row>
        </Container>
      </nav>
    </div>
  );
};

export default MaintenanceOverview;
