import React, { useState, useContext } from 'react';
import { toast } from 'react-toastify';
import { useMeetingMinutes } from '../../hooks/useMeetingMinutes'; // Adjust path
import { ChamaContext } from '../../context/ChamaContext'; // Adjust path
import '../../pages/Dashboards/Dashboard.css';

const MeetingMinutesUpload = () => {
  const { chamaData, userData } = useContext(ChamaContext);
  const { minutes, uploading, handleUpload, handleDownload } = useMeetingMinutes(chamaData?.id);
  const [file, setFile] = useState(null);
  const canUpload = userData?.role?.toLowerCase().trim() === 'chairperson';

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
    } else {
      toast.error('Please select a PDF file.');
      setFile(null);
    }
  };

  return (
    <div className="report-card">
      <h3 className="report-title">Meeting Minutes</h3>
      {canUpload && (
        <div className="report-section">
          <h4 className="report-section-title">Upload Meeting Minutes (PDF)</h4>
          <div className="form-group">
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="file-input"
            />
          </div>
          <button
            onClick={() => handleUpload(file)}
            disabled={uploading || !file}
            className={`form-button ${uploading || !file ? 'disabled' : ''}`}
          >
            {uploading ? 'Uploading...' : 'Upload PDF'}
          </button>
        </div>
      )}
      <div className="report-section">
        <h4 className="report-section-title">Uploaded Minutes</h4>
        {minutes.length > 0 ? (
          <ul className="minutes-list">
            {minutes.map((file) => (
              <li key={file.name} className="minutes-item">
                <p>{file.name}</p>
                <button onClick={() => handleDownload(file.name)}>
                  Download
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No meeting minutes uploaded yet.</p>
        )}
      </div>
    </div>
  );
};

export default MeetingMinutesUpload;