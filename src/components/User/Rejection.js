import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import BackButton from '../BackButton';
import API_BASE_URL from "../config";


const PartRejectionForm = () => {
    const [partRejections, setPartRejections] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        machineId: "",
        shiftNo: "",
        partName: "",
        quantity: "",
        rejectionReason: "",
        rejectionType: "",
        date: ""
    });

    const { user } = useAuth();
      const machineId = user?.machineId || "";
    

    useEffect(() => {
        fetchPartRejections();
    }, []);

   const fetchPartRejections = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/getAllPartRejections`);

        // Filter data by machineId
        const filtered = response.data.filter(
            (item) => item.machineId === machineId
        );
        setPartRejections(filtered);
    } catch (error) {
        console.error("Error fetching data:", error);
    }
};


    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_BASE_URL}/api/addPartRejection`, formData);
            fetchPartRejections(); // Refresh list after adding
            setFormData({
                machineId: "",
                shiftNo: "",
                partName: "",
                quantity: "",
                rejectionReason: "",
                rejectionType: "",
                date: ""
            });
            setShowForm(false);
        } catch (error) {
            console.error("Error adding record:", error);
        }
    };

    return (
        <>
        <BackButton />
       
        <div className=" mt-4 ms-3">
            <h2>Part Rejections</h2>
            <button className="btn btn-primary mb-3" onClick={() => setShowForm(!showForm)}>
                {showForm ? "Close Form" : "Add Rejection"}
            </button>
            {showForm && (
                <form onSubmit={handleSubmit} className="mb-4">
                    <div className="row">
                        <div className="col-md-4">
                            <label>Machine ID</label>
                            <input type="text" name="machineId" className="form-control" value={formData.machineId} onChange={handleChange} required />
                        </div>
                        <div className="col-md-4">
                            <label>Shift No</label>
                            <input type="number" name="shiftNo" className="form-control" value={formData.shiftNo} onChange={handleChange} required />
                        </div>
                        <div className="col-md-4">
                            <label>Part Name</label>
                            <input type="text" name="partName" className="form-control" value={formData.partName} onChange={handleChange} required />
                        </div>
                    </div>
                    <div className="row mt-2">
                        <div className="col-md-4">
                            <label>Quantity</label>
                            <input type="number" name="quantity" className="form-control" value={formData.quantity} onChange={handleChange} required />
                        </div>
                        <div className="col-md-4">
                            <label>Rejection Reason</label>
                            <input type="text" name="rejectionReason" className="form-control" value={formData.rejectionReason} onChange={handleChange} required />
                        </div>
                        <div className="col-md-4">
                            <label>Rejection Type</label>
                            <select name="rejectionType" className="form-control" value={formData.rejectionType} onChange={handleChange} required>
                                <option value="">Select Type</option>
                                <option value="Reject">Reject</option>
                                <option value="Rework">Rework</option>
                            </select>
                        </div>
                    </div>
                    <div className="row mt-2">
                        <div className="col-md-4">
                            <label>Date</label>
                            <input type="datetime-local" name="date" className="form-control" value={formData.date} onChange={handleChange} required />
                        </div>
                    </div>
                    <button type="submit" className="btn btn-success mt-3">Submit</button>
                </form>
            )}
             <table
              className="table table-bordered table-hover mt-4"
              style={{
                fontSize: "0.9rem", // Reduce font size
                lineHeight: "1.2", // Adjust line height
              }}
            >
              <thead
                className="table-light"
                style={{
                  position: "sticky",
                  top: 1,
                  zIndex: 1020,
                }}
              >
                    <tr>
                        <th style={{ padding: "10px", color: "#034694" }}>Machine ID</th>
                        <th style={{ padding: "10px", color: "#034694" }}>Shift No</th>
                        <th style={{ padding: "10px", color: "#034694" }}>Part Name</th>
                        <th style={{ padding: "10px", color: "#034694" }}>Quantity</th>
                        <th style={{ padding: "10px", color: "#034694" }}>Rejection Reason</th>
                        <th style={{ padding: "10px", color: "#034694" }}>Rejection Type</th>
                        <th style={{ padding: "10px", color: "#034694" }}>Date</th>
                    </tr>
                </thead>
                <tbody>
                    {partRejections.map((record) => (
                        <tr key={record._id}>
                            <td style={{ padding: "10px" }}>{record.machineId}</td>
                            <td style={{ padding: "10px" }}>{record.shiftNo}</td>
                            <td style={{ padding: "10px" }}>{record.partName}</td>
                            <td style={{ padding: "10px" }}>{record.quantity}</td>
                            <td style={{ padding: "10px" }}>{record.rejectionReason}</td>
                            <td style={{ padding: "10px" }}>{record.rejectionType}</td>
                            <td style={{ padding: "10px" }}>{new Date(record.date).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
         </>
    );
};

export default PartRejectionForm;
