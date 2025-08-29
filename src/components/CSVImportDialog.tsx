'use client';

import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, X } from 'lucide-react';

interface CSVImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: (count: number) => void;
}

export default function CSVImportDialog({ isOpen, onClose, onImportComplete }: CSVImportDialogProps) {
  const [csvContent, setCsvContent] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [validation, setValidation] = useState<any>(null);
  const [importResult, setImportResult] = useState<any>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setCsvContent(content);
        setValidation(null);
        setImportResult(null);
      };
      reader.readAsText(file);
    }
  };

  const validateCSV = async () => {
    if (!csvContent) return;
    
    setIsValidating(true);
    try {
      const response = await fetch('/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvContent, validate: true })
      });
      
      const result = await response.json();
      setValidation(result);
    } catch (error) {
      setValidation({
        valid: false,
        errors: ['Failed to validate CSV: ' + (error as Error).message]
      });
    } finally {
      setIsValidating(false);
    }
  };

  const importCSV = async () => {
    if (!csvContent || !validation?.valid) return;
    
    setIsImporting(true);
    try {
      const response = await fetch('/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvContent })
      });
      
      const result = await response.json();
      setImportResult(result);
      
      if (result.success) {
        onImportComplete(result.imported);
        setTimeout(() => {
          onClose();
          resetState();
        }, 2000);
      }
    } catch (error) {
      setImportResult({
        success: false,
        errors: ['Import failed: ' + (error as Error).message]
      });
    } finally {
      setIsImporting(false);
    }
  };

  const resetState = () => {
    setCsvContent('');
    setValidation(null);
    setImportResult(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Import CSV Data
          </h2>
          <button
            onClick={() => {
              onClose();
              resetState();
            }}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select CSV File
            </label>
            <input
              type="file"
              accept=".csv,.tsv,.txt"
              onChange={handleFileUpload}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
            />
            <p className="mt-1 text-sm text-gray-500">
              Expected format: Tab-separated values with Blake's tracking columns
            </p>
          </div>

          {/* CSV Content Preview */}
          {csvContent && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CSV Content Preview
              </label>
              <textarea
                value={csvContent.substring(0, 500) + (csvContent.length > 500 ? '...' : '')}
                readOnly
                className="w-full h-32 p-3 border border-gray-300 rounded-md bg-gray-50 text-sm"
              />
              <p className="mt-1 text-sm text-gray-500">
                {csvContent.split('\n').length - 1} rows detected
              </p>
            </div>
          )}

          {/* Validation */}
          {csvContent && !validation && (
            <button
              onClick={validateCSV}
              disabled={isValidating}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4" />
              {isValidating ? 'Validating...' : 'Validate CSV Format'}
            </button>
          )}

          {/* Validation Results */}
          {validation && (
            <div className={`p-4 rounded-md ${validation.valid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                {validation.valid ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600" />
                )}
                <span className={`font-medium ${validation.valid ? 'text-green-800' : 'text-red-800'}`}>
                  {validation.valid ? 'CSV Format Valid' : 'CSV Format Invalid'}
                </span>
              </div>
              
              {validation.errors?.length > 0 && (
                <ul className="text-sm text-red-700 space-y-1">
                  {validation.errors.map((error: string, index: number) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              )}
              
              {validation.preview && (
                <div className="mt-3">
                  <p className="text-sm text-green-700 mb-2">
                    Preview: {validation.preview.length} sessions ready to import
                  </p>
                  <div className="text-xs bg-white p-2 rounded border max-h-32 overflow-y-auto">
                    <pre>{JSON.stringify(validation.preview[0], null, 2)}</pre>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Import */}
          {validation?.valid && !importResult && (
            <button
              onClick={importCSV}
              disabled={isImporting}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" />
              {isImporting ? 'Importing...' : 'Import Sessions'}
            </button>
          )}

          {/* Import Results */}
          {importResult && (
            <div className={`p-4 rounded-md ${importResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                {importResult.success ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600" />
                )}
                <span className={`font-medium ${importResult.success ? 'text-green-800' : 'text-red-800'}`}>
                  {importResult.success ? 'Import Successful!' : 'Import Failed'}
                </span>
              </div>
              
              {importResult.success ? (
                <p className="text-sm text-green-700">
                  Successfully imported {importResult.imported} sessions
                </p>
              ) : (
                <ul className="text-sm text-red-700 space-y-1">
                  {importResult.errors?.map((error: string, index: number) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h3 className="font-medium text-blue-800 mb-2">CSV Format Requirements:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Tab-separated values (not comma-separated)</li>
              <li>• Headers must match your tracking format exactly</li>
              <li>• Date format: MM/DD/YY HH:MM AM/PM</li>
              <li>• Vessel types will be automatically mapped</li>
              <li>• Quantity formats: Medium/Small/Large/Tiny or Hits_X</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
