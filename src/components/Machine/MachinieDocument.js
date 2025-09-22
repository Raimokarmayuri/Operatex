

// import React, { useState } from 'react';
// import axios from 'axios';
//  import API_BASE_URL from "../config";

// const DocumentForm = () => {
//   const [formData, setFormData] = useState({
//     document_title: '',
//     document_type: '',
//     machine_id: '',
//     part_id: '',
//     process_id: '',
//     document_category: '',
//     uploaded_by: '',
//     remarks: '',
//   });

//   const [file, setFile] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState('');

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//   };

//   const handleFileChange = (e) => {
//     setFile(e.target.files[0]);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setMessage('');

//     if (!file) {
//       setMessage('Please select a document file.');
//       setLoading(false);
//       return;
//     }

//     const data = new FormData();
//     Object.entries(formData).forEach(([key, value]) => {
//       if (value !== '') data.append(key, value);
//     });
//     data.append('document_file', file);

//     try {
//       const response = await axios.post(`${API_BASE_URL}/api/documents`, data, {
//         headers: { 'Content-Type': 'multipart/form-data' },
//       });

//       setMessage('Document uploaded successfully.');
//       setFormData({
//         document_title: '',
//         document_type: '',
//         machine_id: '',
//         part_id: '',
//         process_id: '',
//         document_category: '',
//         uploaded_by: '',
//         remarks: '',
//       });
//       setFile(null);
//       // Optionally clear file input, or you can force reload form.
//     } catch (err) {
//       console.error(err);
//       setMessage('Failed to upload document.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="container my-5">
//   <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3 p-2 border rounded bg-light">
//     <div className="fs-4 fw-bold" style={{ color: "#034694" }}>
//       Upload Document
//     </div>
//   </div>

//       {message && (
//         <div className={`alert ${message.includes('successfully') ? 'alert-success' : 'alert-danger'}`}>
//           {message}
//         </div>
//       )}

//       <form onSubmit={handleSubmit} className="row g-3" encType="multipart/form-data">
//         <div className="col-md-6">
//           <label className="form-label">Document Title *</label>
//           <input
//             type="text"
//             name="document_title"
//             className="form-control"
//             value={formData.document_title}
//             onChange={handleChange}
//             required
//           />
//         </div>

//         <div className="col-md-6">
//           <label className="form-label">Document Type *</label>
//           <input
//             type="text"
//             name="document_type"
//             className="form-control"
//             value={formData.document_type}
//             onChange={handleChange}
//             required
//           />
//         </div>

//         <div className="col-md-4">
//           <label className="form-label">Machine ID</label>
//           <input
//             type="number"
//             name="machine_id"
//             className="form-control"
//             value={formData.machine_id}
//             onChange={handleChange}
//           />
//         </div>

//         <div className="col-md-4">
//           <label className="form-label">Part ID</label>
//           <input
//             type="number"
//             name="part_id"
//             className="form-control"
//             value={formData.part_id}
//             onChange={handleChange}
//           />
//         </div>

//         <div className="col-md-4">
//           <label className="form-label">Process ID</label>
//           <input
//             type="number"
//             name="process_id"
//             className="form-control"
//             value={formData.process_id}
//             onChange={handleChange}
//           />
//         </div>

//         <div className="col-md-6">
//           <label className="form-label">Document Category</label>
//           <input
//             type="text"
//             name="document_category"
//             className="form-control"
//             value={formData.document_category}
//             onChange={handleChange}
//           />
//         </div>

//         <div className="col-md-6">
//           <label className="form-label">Uploaded By</label>
//           <input
//             type="text"
//             name="uploaded_by"
//             className="form-control"
//             value={formData.uploaded_by}
//             onChange={handleChange}
//           />
//         </div>

//         <div className="col-12">
//           <label className="form-label">Remarks</label>
//           <textarea
//             name="remarks"
//             className="form-control"
//             rows="3"
//             value={formData.remarks}
//             onChange={handleChange}
//           ></textarea>
//         </div>

//         <div className="col-12">
//           <label className="form-label">Document File *</label>
//           <input
//             type="file"
//             className="form-control"
//             accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.png"
//             onChange={handleFileChange}
//             required
//           />
//         </div>

//         <div className="col-12">
//           <button type="submit" className="btn btn-primary" disabled={loading}>
//             {loading ? 'Uploading...' : 'Upload Document'}
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default DocumentForm;


import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from "../config";

const DocumentForm = () => {
  const [formData, setFormData] = useState({
    document_title: '',
    document_type: '',
    machine_id: '',
    part_id: '',
    process_id: '',
    document_category: '',
    uploaded_by: '',
    remarks: '',
  });

  const [machines, setMachines] = useState([]);
  const [parts, setParts] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // 🔁 Fetch machines and parts on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [machineRes, partRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/machines/getallmachine`),
          axios.get(`${API_BASE_URL}/api/parts`)
        ]);
        setMachines(machineRes.data);
        setParts(partRes.data);
      } catch (err) {
        console.error('Error fetching machines or parts:', err);
      }
    };

    fetchData();
  }, []);

  // 🔁 Auto-fetch process_id based on selected machine and part
  useEffect(() => {
    const { machine_id, part_id } = formData;

    if (machine_id && part_id) {
      axios.get(`${API_BASE_URL}/api/processes`, {
        params: {
          machine_id: parseInt(machine_id),
          part_id: parseInt(part_id)
        }
      })
        .then(res => {
          if (Array.isArray(res.data) && res.data.length > 0) {
            const matched = res.data.find(
              item => item.machine_id == machine_id && item.part_id == part_id
            );
            setFormData(prev => ({
              ...prev,
              process_id: matched?.process_id || ''
            }));
          } else {
            setFormData(prev => ({ ...prev, process_id: '' }));
          }
        })
        .catch(err => {
          console.error('Error fetching process_id:', err);
          setFormData(prev => ({ ...prev, process_id: '' }));
        });
    }
  }, [formData.machine_id, formData.part_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (!file) {
      setMessage('Please select a document file.');
      setLoading(false);
      return;
    }

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== '') data.append(key, value);
    });
    data.append('document_file', file);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/documents`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setMessage('Document uploaded successfully.');
      setFormData({
        document_title: '',
        document_type: '',
        machine_id: '',
        part_id: '',
        process_id: '',
        document_category: '',
        uploaded_by: '',
        remarks: '',
      });
      setFile(null);
    } catch (err) {
      console.error(err);
      setMessage('Failed to upload document.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container my-5">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3 p-2 border rounded bg-light">
        <div className="fs-4 fw-bold" style={{ color: "#034694" }}>
          Upload Document
        </div>
      </div>

      {message && (
        <div className={`alert ${message.includes('successfully') ? 'alert-success' : 'alert-danger'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="row g-3" encType="multipart/form-data">
        <div className="col-md-6">
          <label className="form-label">Document Title *</label>
          <input
            type="text"
            name="document_title"
            className="form-control"
            value={formData.document_title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">Document Type *</label>
          <input
            type="text"
            name="document_type"
            className="form-control"
            value={formData.document_type}
            onChange={handleChange}
            required
          />
        </div>

        <div className="col-md-4">
          <label className="form-label">Machine *</label>
          <select
            name="machine_id"
            className="form-select"
            value={formData.machine_id}
            onChange={handleChange}
            required
          >
            <option value="">Select Machine</option>
            {machines.map(m => (
              <option key={m.machine_id} value={m.machine_id}>
                {m.machine_name_type}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-4">
          <label className="form-label">Part *</label>
          <select
            name="part_id"
            className="form-select"
            value={formData.part_id}
            onChange={handleChange}
            required
          >
            <option value="">Select Part</option>
            {parts.map(p => (
              <option key={p.part_id} value={p.part_id}>
                {p.part_name}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-4">
          <label className="form-label">Process ID</label>
          <input
            type="text"
            name="process_id"
            className="form-control"
            value={formData.process_id}
            readOnly
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">Document Category</label>
          <input
            type="text"
            name="document_category"
            className="form-control"
            value={formData.document_category}
            onChange={handleChange}
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">Uploaded By</label>
          <input
            type="text"
            name="uploaded_by"
            className="form-control"
            value={formData.uploaded_by}
            onChange={handleChange}
          />
        </div>

        <div className="col-12">
          <label className="form-label">Remarks</label>
          <textarea
            name="remarks"
            className="form-control"
            rows="3"
            value={formData.remarks}
            onChange={handleChange}
          ></textarea>
        </div>

        <div className="col-12">
          <label className="form-label">Document File *</label>
          <input
            type="file"
            className="form-control"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.png"
            onChange={handleFileChange}
            required
          />
        </div>

        <div className="col-12 d-flex justify-content-center mt-4">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Uploading...' : 'Upload Document'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DocumentForm;
