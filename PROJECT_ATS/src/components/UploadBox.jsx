import React, { useState } from 'react';
import { IconUpload } from './Icons';
import styles from './UploadBox.module.css';

const UploadBox = ({ onUpload }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (uploadedFile) => {
    setFile(uploadedFile);
    if (onUpload) {
      // Simulate processing
      setTimeout(() => onUpload(uploadedFile), 1500);
    }
  };

  return (
    <div className={styles.container}>
      <div 
        className={`${styles.dropZone} ${isDragging ? styles.dragging : ''} ${file ? styles.hasFile : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className={styles.iconWrapper}>
          <IconUpload size={32} color={isDragging ? 'var(--primary-orange)' : 'var(--text-gray)'} />
        </div>
        
        {file ? (
          <div className={styles.fileInfo}>
            <h4>{file.name}</h4>
            <p>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            <button className={styles.btnPrimary} onClick={() => setFile(null)}>Remove & Upload Another</button>
          </div>
        ) : (
          <div className={styles.prompt}>
            <h3>Drag & Drop your Resume here</h3>
            <p>or</p>
            <label className={styles.browseBtn}>
              Browse Files
              <input type="file" accept=".pdf,.doc,.docx" onChange={handleChange} className={styles.fileInput} />
            </label>
            <p className={styles.hint}>Supported formats: PDF, DOC, DOCX (Max 5MB)</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadBox;
