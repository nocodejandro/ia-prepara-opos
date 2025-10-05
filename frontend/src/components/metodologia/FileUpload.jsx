import React, { useState, useCallback } from 'react';

const FileUpload = ({ onFileUpload, uploadProgress }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  }, []);

  const handleChange = useCallback((e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  }, []);

  const handleFileSelect = (file) => {
    if (file.type !== 'application/pdf') {
      alert('Por favor, selecciona solo archivos PDF');
      return;
    }
    
    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      alert('El archivo es demasiado grande. Máximo 50MB.');
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = () => {
    if (selectedFile) {
      onFileUpload(selectedFile);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
  };

  return (
    <div className="space-y-4">
      {/* Drop Area */}
      <div
        className={`
          upload-area border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300
          ${dragActive ? 'border-purple-500 bg-purple-50' : 'border-gray-300'}
          ${selectedFile ? 'border-green-500 bg-green-50' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-upload"
          className="hidden"
          accept=".pdf"
          onChange={handleChange}
        />
        
        {selectedFile ? (
          <div className="space-y-3">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">{selectedFile.name}</p>
              <p className="text-xs text-gray-500">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <div className="flex space-x-2 justify-center">
              <button
                onClick={handleUpload}
                disabled={uploadProgress > 0}
                className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {uploadProgress > 0 ? 'Subiendo...' : 'Procesar PDF'}
              </button>
              <button
                onClick={clearFile}
                disabled={uploadProgress > 0}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-600 disabled:opacity-50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div>
              <p className="text-gray-600 font-medium">Arrastra tu archivo PDF aquí</p>
              <p className="text-sm text-gray-500">o haz clic para seleccionar</p>
            </div>
            <label
              htmlFor="file-upload"
              className="inline-block bg-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-purple-700 cursor-pointer transition-colors"
            >
              Seleccionar archivo
            </label>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {uploadProgress > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Subiendo archivo...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="progress-bar h-2 rounded-full transition-all duration-300" 
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>• Solo archivos PDF (máximo 50MB)</p>
        <p>• El procesamiento con IA puede tardar 1-2 minutos</p>
        <p>• Recibirás flashcards, esquemas, resúmenes y más</p>
      </div>
    </div>
  );
};

export default FileUpload;