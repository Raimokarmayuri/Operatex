// import React from 'react'

// const MachineDocument = () => {
//   return (
//     <div>MachineDocument</div>
//   )
// }

// export default MachineDocument

import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  ListGroup,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import BackButton from '../BackButton';
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import API_BASE_URL from "../config";


const AssetsDetails = () => {
  const [assets, setAssets] = useState("");
  // const machineId = localStorage.getItem("selectedMachineId");
  const [documents, setDocuments] = useState([]); // Store uploaded documents
  const [selectedFile, setSelectedFile] = useState(null); // File to upload

  const { user } = useAuth();
  const machineId = user?.machineId || "";

  useEffect(() => {
    fetchAssets();
    fetchDocuments();
  }, []);

  const fetchAssets = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/machines/machine/${machineId}`
      );
      // console.log(response.data)
      if (!response.data) {
        console.error("No data found for the given machine ID.");
        setAssets([]);
      } else {
        setAssets([response.data]); // Wrap in an array
      }
    } catch (error) {
      console.error("Error fetching asset details:", error);
    }
  };

  const fetchDocuments = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/documents/${machineId}`
      );
      setDocuments(response.data || []);
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      alert("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("machineId", machineId);

    try {
      await axios.post(`${API_BASE_URL}/api/upload-document`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("File uploaded successfully!");
      setSelectedFile(null);
      fetchDocuments(); // Refresh document list
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Error uploading file. Please try again.");
    }
  };

  const [showFileInput, setShowFileInput] = useState(false);

  const toggleFileInput = () => {
    setShowFileInput(!showFileInput);
  };

  return (
    <>
    <BackButton />
    
    <div className="bg-light"
      // style={{ cursor: "pointer" ,fontFamily: "Montserrat, sans-serif",  backgroundColor: "#ffdac2" }}
      style={{
        // backgroundColor: "white",
        maxWidth: "100%",
        borderRadius: "8px",
        padding: "0px",
        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
        marginTop: "3.7rem",
        height: "auto",
        fontFamily: "Montserrat, sans-serif",
      }}
    >
      
      {/* <Files /> */}
      {/* <MaintenanceOverview /> */}
      <Container className="py-4">
        {/* Asset Information Section */}
        <Row className="justify-content-center">
          <Col lg={8}>
            <Card className="mb-4 shadow-sm border-0">
              <Card.Body>
                {/* Upload Document Section */}

                {/* Asset Details Section */}
                <h3  className="text-center text-md-center mb-4"
              style={{ color: "#034694", fontWeight: "bold", fontSize: "26px", marginTop:"rem" }}
            >
                  Asset Details  {machineId || "Machine ID Not Available"}
                </h3>
                {assets.length > 0 ? (
                  assets.map((asset) => (
                    <div key={asset.machineId}>
                      <Row>
                        <Col md={6} className="mb-3">
                          <strong>ID:</strong> {asset.machineId}
                        </Col>
                        <Col md={6} className="mb-3">
                          <strong>Type:</strong> {asset.machineType}
                        </Col>
                        <Col md={6} className="mb-3">
                          <strong>Status:</strong> {asset.status}
                        </Col>
                        <Col md={6} className="mb-3">
                          <strong>Location:</strong> {asset.location}
                        </Col>
                        <Col md={6} className="mb-3">
                          <strong>Make:</strong> {asset.machineMake}
                        </Col>
                        <Col md={6} className="mb-3">
                          <strong>Model:</strong> {asset.machineModel}
                        </Col>
                        <Col md={6} className="mb-3">
                          <strong>Year:</strong> {asset.yearOfManufacturing}
                        </Col>
                        <Col md={6} className="mb-3">
                          <strong>Capacity:</strong> {asset.machineCapacity}
                        </Col>
                        <Col md={6} className="mb-3">
                          <strong>Power Rating:</strong> {asset.powerRating} kW
                        </Col>
                        <Col md={6} className="mb-3">
                          <strong>IP Address:</strong> {asset.machineIP}
                        </Col>
                      </Row>
                    </div>
                  ))
                ) : (
                  <p className="text-muted text-center">
                    No asset details available.
                  </p>
                )}
              </Card.Body>
              <div className="text-end mb-4">
                <Button
                  variant="primary"
                  onClick={toggleFileInput}
                  className="w-30 btn-sm fw-bold shadow-sm px-4 py-1 rounded-pill "
                >
                  Upload Document
                </Button>
              </div>
              {showFileInput && (
                <div className="mt-3">
                  <Form.Group controlId="formFile" className="mb-3">
                    <Form.Label>Select a file to upload</Form.Label>
                    <Form.Control type="file" onChange={handleFileChange} />
                  </Form.Group>
                  <Button
                    variant="success"
                    onClick={handleFileUpload}
                    className="w-50 "
                  >
                    Upload
                  </Button>
                </div>
              )}
            </Card>
          </Col>
        </Row>

        {/* Document List Section */}
        <Row className="justify-content-center">
          <Col lg={8}>
            <Card className="shadow-sm border-0">
              <Card.Body>
                <h4 className="text-danger mb-4">Uploaded Documents</h4>
                {documents.length > 0 ? (
                  <ListGroup>
                    {documents.map((doc) => (
                      <ListGroup.Item
                        key={doc._id}
                        className="d-flex justify-content-between align-items-center"
                      >
                        {doc.name}
                        <a
                          href={`${API_BASE_URL}/api/file/${encodeURIComponent(
                            doc.url.split("/").pop()
                          )}`}
                          download
                          className="btn btn-link text-decoration-none text-primary"
                        >
                          Download
                        </a>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                ) : (
                  <p className="text-muted text-center">
                    No documents uploaded for this machine.
                  </p>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
    </>
  );
};

export default AssetsDetails;
