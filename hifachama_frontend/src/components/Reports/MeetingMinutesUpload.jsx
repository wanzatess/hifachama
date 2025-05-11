import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { toast } from 'react-toastify';
import '../../pages/Dashboards/Dashboard.css';

const MeetingMinutesUpload = ({ chamaId, canUpload }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [minutes, setMinutes] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchMinutes = async () => {
      const { data, error } = await supabase.storage
        .from('meeting-minutes')
        .list(`${chamaId}/`, { limit: 100 });
      if (error) {
        console.error('Error fetching meeting minutes:', error);
        toast.error('Failed to load meeting minutes.');
      } else {
        setMinutes(data);
      }
    };
    fetchMinutes();
  }, [chamaId]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
    } else {
      toast.error('Please select a PDF file.');
      setFile(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('No file selected.');
      return;
    }

    setUploading(true);
    setSuccessMessage('');
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${file.name}`;
      const filePath = `${chamaId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('meeting-minutes')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: updatedFiles, error: listError } = await supabase.storage
        .from('meeting-minutes')
        .list(`${chamaId}/`, { limit: 100 });

      if (listError) {
        throw listError;
      }

      setMinutes(updatedFiles);
      setFile(null);
      setSuccessMessage('Meeting minutes uploaded successfully!');
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload meeting minutes.');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (fileName) => {
    try {
      const { data, error } = await supabase.storage
        .from('meeting-minutes')
        .download(`${chamaId}/${fileName}`);

      if (error) {
        throw error;
      }

      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download meeting minutes.');
    }
  };

  return (
    <div className="report-card">
      <h3 className="report-title">Meeting Minutes</h3>
      {canUpload && (
        <div className="report-section">
          <h4 className="report-section-title">Upload Meeting Minutes (PDF)</h4>
          {successMessage && (
            <div style={{
              padding: '12px',
              marginBottom: '20px',
              borderRadius: '8px',
              textAlign: 'center',
              fontSize: '0.95rem',
              backgroundColor: '#D4EDDA',
              color: '#155724'
            }}>
              <p style={{
                margin: '0',
                padding: '8px',
                borderRadius: '6px',
                backgroundColor: 'rgba(255, 255, 255, 0.7)'
              }}>
                {successMessage}
              </p>
            </div>
          )}
          <div className="form-group">
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="file-input"
            />
          </div>
          <button
            onClick={handleUpload}
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