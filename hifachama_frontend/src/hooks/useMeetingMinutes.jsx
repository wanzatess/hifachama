import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { toast } from 'react-toastify';

export const useMeetingMinutes = (chamaId) => {
  const [minutes, setMinutes] = useState([]);
  const [uploading, setUploading] = useState(false);

  const fetchMinutes = async () => {
    const { data, error } = await supabase.storage
      .from('meeting-minutes')
      .list(`${chamaId}/`, { limit: 100 });
    if (error) {
      toast.error('Failed to load meeting minutes.');
    } else {
      setMinutes(data);
    }
  };

  const handleUpload = async (file) => {
    if (!file) {
      toast.error('No file selected.');
      return;
    }

    setUploading(true);
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
      toast.success('Meeting minutes uploaded successfully!');
    } catch (error) {
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
      toast.error('Failed to download meeting minutes.');
    }
  };

  useEffect(() => {
    if (chamaId) {
      fetchMinutes();
    }
  }, [chamaId]);

  return { minutes, uploading, handleUpload, handleDownload };
};