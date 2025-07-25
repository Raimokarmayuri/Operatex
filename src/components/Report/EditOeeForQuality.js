import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../config";
// const API_BASE_URL = "http://localhost:5003";


const EditOEE = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [oeeData, setOeeData] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [rejectionQuantity, setRejectionQuantity] = useState(0);
    const [rejectionType, setRejectionType] = useState("");
    const [mainDefect, setMainDefect] = useState("");

    useEffect(() => {
        axios.get(`${API_BASE_URL}/api/oee-logs/${id}`)
            .then((response) => {
                setOeeData(response.data);
            })
            .catch((error) => {
                console.error("Error fetching OEE data:", error);
            });
    }, [id]);

    const handleSaveRejection = async () => {
        if (rejectionQuantity <= 0 || !mainDefect || !rejectionType) {
            alert("Please fill in all required fields!");
            return;
        }

        const updatedDefectiveParts = Number(oeeData.defectiveParts) + Number(rejectionQuantity);
        const totalPartsProduced = Number(oeeData.TotalPartsProduced);
        const goodParts = totalPartsProduced - updatedDefectiveParts;

        const updatedQuality = totalPartsProduced > 0 ? ((goodParts / totalPartsProduced) * 100).toFixed(2) : 0;
        const updatedOEE = ((oeeData.availability * oeeData.performance * updatedQuality) / 10000).toFixed(2);

        const updatedData = {
            ...oeeData,
            defectiveParts: updatedDefectiveParts,
            quality: updatedQuality,
            TotalPartsProduced: totalPartsProduced,
            OEE: updatedOEE,
        };

        const newPartRejection = {
            machine_id: oeeData.machine_id,
            shift_no: oeeData.shift_no,
            part_name: oeeData.part_name,
            quantity: rejectionQuantity,
            plan_id: oeeData.part_id,
            rejectiontype: rejectionType,
            rejectionreason: mainDefect,
        };
    //      machine_id: "",
    // plan_id: "",
    // shift_no: "",
    // part_name: "",
    // quantity: "",
    // rejectionreason: "",
    // rejectiontype: "",
    // date: "",

        try {
            await axios.put(`${API_BASE_URL}/api/oee-logs/${id}`, updatedData);
            await axios.post(`${API_BASE_URL}/api/partrejections`, newPartRejection);

            alert("Rejection Added Successfully!");
            setShowPopup(false);
            setOeeData(updatedData);
            setRejectionQuantity(0);
            setRejectionType("");
            setMainDefect("");
        } catch (error) {
            console.error("Error saving rejection data:", error);
        }
    };

    return (
        <div className="container" style={{ marginTop: "6rem" }}>
            <h3 className="text-center">Edit OEE Data</h3>

            {oeeData ? (
                <form className="mb-5">
                    <div className="row">
                        <div className="col-md-4 mb-3"><label>Machine ID</label><input type="text" className="form-control" value={oeeData.machine_id} disabled /></div>
                        <div className="col-md-4 mb-3"><label>Shift Number</label><input type="number" className="form-control" value={oeeData.shift_no} disabled /></div>
                        <div className="col-md-4 mb-3"><label>Part Name</label><input type="text" className="form-control" value={oeeData.part_name} disabled /></div>
                    </div>

                    <div className="row">
                        <div className="col-md-4 mb-3"><label>Cycle Time</label><input type="number" className="form-control" value={oeeData.idealCycleTime} disabled /></div>
                        <div className="col-md-4 mb-3"><label>OEE (%)</label><input type="number" className="form-control" value={oeeData.OEE} disabled /></div>
                        <div className="col-md-4 mb-3"><label>Total Parts Produced</label><input type="number" className="form-control" value={oeeData.TotalPartsProduced} disabled /></div>
                    </div>

                    <div className="row">
                        <div className="col-md-4 mb-3"><label>Defective Parts</label><input type="number" className="form-control" value={oeeData.defectiveParts} disabled /></div>
                        <div className="col-md-4 mb-3"><label>Planned Quantity</label><input type="number" className="form-control" value={oeeData.expectedPartCount} disabled /></div>
                        <div className="col-md-4 mb-3"><label>Availability (%)</label><input type="number" className="form-control" value={oeeData.availability} disabled /></div>
                    </div>

                    <div className="row">
                        <div className="col-md-4 mb-3"><label>Performance (%)</label><input type="number" className="form-control" value={oeeData.performance} disabled /></div>
                        <div className="col-md-4 mb-3"><label>Quality (%)</label><input type="number" className="form-control" value={oeeData.quality} disabled /></div>
                        <div className="col-md-4 mb-3"><label>Selected User</label><input type="text" className="form-control" value={oeeData.selectedUser} disabled /></div>
                    </div>

                    <button type="button" className="btn btn-warning" onClick={() => setShowPopup(true)}>Add Rejection</button>
                    <button type="button" className="btn btn-secondary ms-2" onClick={() => navigate("/OEEReport")}>Cancel</button>
                </form>
            ) : <p>Loading data...</p>}

            {showPopup && (
                <div className="modal show d-block mt-5">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Add Rejection</h5>
                                <button type="button" className="btn-close" onClick={() => setShowPopup(false)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="row">
                                    <div className="col-md-4 mb-3"><label>Machine ID</label><input type="text" className="form-control" value={oeeData.machine_id} disabled /></div>
                                    <div className="col-md-4 mb-3"><label>Shift Number</label><input type="number" className="form-control" value={oeeData.shift_no} disabled /></div>
                                    <div className="col-md-4 mb-3"><label>Part Name</label><input type="text" className="form-control" value={oeeData.part_name} disabled /></div>
                                </div>

                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label>Rejection Quantity</label>
                                        <input type="number" className="form-control" value={rejectionQuantity} onChange={(e) => setRejectionQuantity(e.target.value)} />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label>Rejection Type</label>
                                        <select className="form-control" value={rejectionType} onChange={(e) => setRejectionType(e.target.value)}>
                                            <option value="" disabled>Select Rejection Type</option>
                                            <option value="Rework">Rework</option>
                                            <option value="Rejected">Rejected</option>
                                        </select>
                                    </div>
                                </div>

                                {rejectionType && (
                                    <div className="mb-3">
                                        <label>Main Defect</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={mainDefect}
                                            placeholder="Enter Main Defect"
                                            onChange={(e) => setMainDefect(e.target.value)}
                                        />
                                    </div>
                                )}

                                <div className="modal-footer">
                                    <button className="btn btn-secondary" onClick={() => setShowPopup(false)}>Close</button>
                                    <button className="btn btn-primary" onClick={handleSaveRejection}>Save Rejection</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EditOEE;