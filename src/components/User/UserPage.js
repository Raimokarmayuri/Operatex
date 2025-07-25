import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaTools, FaClock, FaBook, FaCogs, FaCheckCircle, FaClipboardList, FaCalendarAlt, FaBell, FaWrench, FaClipboardCheck, FaTimesCircle } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { NavLink } from "react-router-dom";

const OperatorScreen = () => {
  const { user } = useAuth();
 console.log(user);

  return (
    <div className="container-fluid bg-light vh-100 p-4 mt-5">
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="text-muted">Operator Name : {user.name}</h5>
        <h5 className="text-end flex-grow-1">MachineID : {user.machineId}</h5>
      </div>

      {/* Cards Section */}
      <div className="row justify-content-center">
        
        {/* Row 1 */}
        <div className="col-lg-3 col-md-4 col-sm-6 mb-4">
          <NavLink to="/user/setup" className="text-decoration-none">
            <div className="card text-center shadow-lg p-3 bg-white rounded">
              <div className="card-body">
                <FaTools size={50} style={{ color: "#ff5733" }} className="mb-3" />
                <h5 className="fw-bold text-dark">Setup</h5>
              </div>
            </div>
          </NavLink>
        </div>

        <div className="col-lg-3 col-md-4 col-sm-6 mb-4">
          <NavLink to="/user/downtime" className="text-decoration-none">
            <div className="card text-center shadow-lg p-3 bg-white rounded">
              <div className="card-body">
                <FaClock size={50} style={{ color: "#3498db" }} className="mb-3" />
                <h5 className="fw-bold text-dark">Downtime</h5>
              </div>
            </div>
          </NavLink>
        </div>

        <div className="col-lg-3 col-md-4 col-sm-6 mb-4">
          <NavLink to="/user/machinedocument" className="text-decoration-none">
            <div className="card text-center shadow-lg p-3 bg-white rounded">
              <div className="card-body">
                <FaBook size={50} style={{ color: "#2ecc71" }} className="mb-3" />
                <h5 className="fw-bold text-dark">Machine Document</h5>
              </div>
            </div>
          </NavLink>
        </div>

        {/* <div className="col-lg-3 col-md-4 col-sm-6 mb-4">
          <NavLink to="/user/process-operation" className="text-decoration-none">
            <div className="card text-center shadow-lg p-3 bg-white rounded">
              <div className="card-body">
                <FaCogs size={50} style={{ color: "#e74c3c" }} className="mb-3" />
                <h5 className="fw-bold text-dark">Process Operation</h5>
              </div>
            </div>
          </NavLink>
        </div> */}

        {/* Row 2 */}
        {/* <div className="col-lg-3 col-md-4 col-sm-6 mb-4">
          <NavLink to="/user/SetupApproval" className="text-decoration-none">
            <div className="card text-center shadow-lg p-3 bg-white rounded">
              <div className="card-body">
                <FaCheckCircle size={50} style={{ color: "#f1c40f" }} className="mb-3" />
                <h5 className="fw-bold text-dark">Setup Approval</h5>
              </div>
            </div>
          </NavLink>
        </div> */}

        <div className="col-lg-3 col-md-4 col-sm-6 mb-4">
          <NavLink to="/user/summary" className="text-decoration-none">
            <div className="card text-center shadow-lg p-3 bg-white rounded">
              <div className="card-body">
                <FaClipboardList size={50} style={{ color: "#8e44ad" }} className="mb-3" />
                <h5 className="fw-bold text-dark">Summary</h5>
              </div>
            </div>
          </NavLink>
        </div>

        {/* <div className="col-lg-3 col-md-4 col-sm-6 mb-4">
          <NavLink to="/user/guage-calibration" className="text-decoration-none">
            <div className="card text-center shadow-lg p-3 bg-white rounded">
              <div className="card-body">
                <FaCalendarAlt size={50} style={{ color: "#27ae60" }} className="mb-3" />
                <h5 className="fw-bold text-dark">Guage Calibration Calendar</h5>
              </div>
            </div>
          </NavLink>
        </div> */}

        <div className="col-lg-3 col-md-4 col-sm-6 mb-4">
          <NavLink to="/user/alarms" className="text-decoration-none">
            <div className="card text-center shadow-lg p-3 bg-white rounded">
              <div className="card-body">
                <FaBell size={50} style={{ color: "#ff5733" }} className="mb-3" />
                <h5 className="fw-bold text-dark">Alarms</h5>
              </div>
            </div>
          </NavLink>
        </div>

        {/* Row 3 */}
        <div className="col-lg-3 col-md-4 col-sm-6 mb-4">
          <NavLink to="/user/raise-breakdown" className="text-decoration-none">
            <div className="card text-center shadow-lg p-3 bg-white rounded">
              <div className="card-body">
                <FaWrench size={50} style={{ color: "#34495e" }} className="mb-3" />
                <h5 className="fw-bold text-dark">Raise Breakdown</h5>
              </div>
            </div>
          </NavLink>
        </div>

        {/* <div className="col-lg-3 col-md-4 col-sm-6 mb-4">
          <NavLink to="/user/quality-check" className="text-decoration-none">
            <div className="card text-center shadow-lg p-3 bg-white rounded">
              <div className="card-body">
                <FaClipboardCheck size={50} style={{ color: "#d35400" }} className="mb-3" />
                <h5 className="fw-bold text-dark">Quality Check Sheet</h5>
              </div>
            </div>
          </NavLink>
        </div> */}

        <div className="col-lg-3 col-md-4 col-sm-6 mb-4">
          <NavLink to="/user/rejection" className="text-decoration-none">
            <div className="card text-center shadow-lg p-3 bg-white rounded">
              <div className="card-body">
                <FaTimesCircle size={50} style={{ color: "#c0392b" }} className="mb-3" />
                <h5 className="fw-bold text-dark">Rejection</h5>
              </div>
            </div>
          </NavLink>
        </div>

      </div>
    </div>
  );
};

export default OperatorScreen;
