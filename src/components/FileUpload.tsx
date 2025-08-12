import React, { useCallback, useState } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, Truck, Package } from 'lucide-react';
import Papa from 'papaparse';
import { BlueDartRaw, DelhiveryRaw } from '../types';

interface FileUploadProps {
  onDataLoaded: (blueDartData: BlueDartRaw[], delhiveryData: DelhiveryRaw[]) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onDataLoaded }) => {
  const [blueDartFile, setBlueDartFile] = useState<File | null>(null);
  const [delhiveryFile, setDelhiveryFile] = useState<File | null>(null);
  const [blueDartData, setBlueDartData] = useState<BlueDartRaw[]>([]);
  const [delhiveryData, setDelhiveryData] = useState<DelhiveryRaw[]>([]);
  const [uploading, setUploading] = useState<'none' | 'bluedart' | 'delhivery' | 'processing'>('none');
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState<string[]>([]);

  const parseCSV = useCallback((file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        complete: (results) => {
          if (results.errors.length > 0) {
            reject(new Error(`CSV parsing error: ${results.errors[0].message}`));
          } else {
            resolve(results.data);
          }
        },
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim(),
        transform: (value, header) => {
          // Auto-convert numeric fields
          if (header && (
            header.includes('_WT') || header.includes('AMOUNT') || header.includes('VALUE') || 
            header.includes('FREIGHT') || header.includes('charge_') || header.includes('PCS') ||
            header.includes('weight') || header.includes('amount') || header.includes('value') ||
            header.includes('CGST') || header.includes('IGST') || header.includes('SGST') ||
            header.includes('ACT_WT') || header.includes('CHRG_WT')
          )) {
            const num = parseFloat(value);
            return isNaN(num) ? 0 : num;
          }
          return value;
        }
      });
    });
  }, []);

  const handleBlueDartUpload = async (file: File) => {
    setUploading('bluedart');
    setErrors([]);
    
    try {
      const data = await parseCSV(file);
      
      // Validate BlueDart columns
      const columns = Object.keys(data[0] || {});
      console.log('BlueDart columns:', columns);
      console.log('First few rows of data:', data.slice(0, 3));
      
      // Check for BlueDart required columns (handle both formats)
      const hasAwb = columns.includes('AWB_NO') || columns.includes('AWB');
      const hasPickupDate = columns.includes('PICKUP_DT') || columns.includes('PICKUP_DATE');
      
      if (!hasAwb) {
        throw new Error('BlueDart file missing AWB column (expected AWB_NO or AWB)');
      }
      
      if (!hasPickupDate) {
        throw new Error('BlueDart file missing pickup date column (expected PICKUP_DT or PICKUP_DATE)');
      }
      
      setBlueDartData(data as BlueDartRaw[]);
      setSuccess(prev => [...prev.filter(s => !s.includes('BlueDart')), `BlueDart: ${data.length} records loaded`]);
      
    } catch (error) {
      setErrors([error instanceof Error ? error.message : 'Error processing BlueDart file']);
    } finally {
      setUploading('none');
    }
  };

  const handleDelhiveryUpload = async (file: File) => {
    setUploading('delhivery');
    setErrors([]);
    
    try {
      const data = await parseCSV(file);
      
      // Validate Delhivery columns
      const columns = Object.keys(data[0] || {});
      console.log('Delhivery columns:', columns);
      
      const requiredCols = ['waybill_num', 'pickup_date'];
      const missingCols = requiredCols.filter(col => !columns.includes(col));
      
      if (missingCols.length > 0) {
        throw new Error(`Delhivery file missing required columns: ${missingCols.join(', ')}`);
      }
      
      setDelhiveryData(data as DelhiveryRaw[]);
      setSuccess(prev => [...prev.filter(s => !s.includes('Delhivery')), `Delhivery: ${data.length} records loaded`]);
      
    } catch (error) {
      setErrors([error instanceof Error ? error.message : 'Error processing Delhivery file']);
    } finally {
      setUploading('none');
    }
  };

  const handleFileChange = (type: 'blueDart' | 'delhivery') => (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      setErrors([`${type === 'blueDart' ? 'BlueDart' : 'Delhivery'} file must be a CSV file`]);
      return;
    }

    if (type === 'blueDart') {
      setBlueDartFile(file);
      handleBlueDartUpload(file);
    } else {
      setDelhiveryFile(file);
      handleDelhiveryUpload(file);
    }
  };

  const handleStartAnalysis = () => {
    if (blueDartData.length === 0 && delhiveryData.length === 0) {
      setErrors(['Please upload at least one file to start analysis']);
      return;
    }
    
    setUploading('processing');
    onDataLoaded(blueDartData, delhiveryData);
  };

  const canStartAnalysis = blueDartData.length > 0 || delhiveryData.length > 0;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Truck className="h-16 w-16 text-blue-600 mr-4" />
            <Package className="h-16 w-16 text-orange-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Courier Weight & Cost Validation</h2>
          <p className="text-gray-600">Upload your courier data files individually to begin comprehensive analysis</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* BlueDart Upload */}
          <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 hover:border-blue-500 transition-colors bg-blue-50">
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <Truck className="h-12 w-12 text-blue-600 mr-2" />
                <div className="text-left">
                  <h3 className="text-xl font-bold text-blue-900">BlueDart Express</h3>
                  <p className="text-sm text-blue-700">Professional courier service</p>
                </div>
              </div>
              
              <p className="text-sm text-gray-700 mb-4">
                Required: AWB_NO, PICKUP_DT<br/>
                Optional: ACT_WT, CHRG_WT, AMOUNT, VALUE, etc.
              </p>
              
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange('blueDart')}
                  className="hidden"
                  disabled={uploading === 'bluedart'}
                />
                <div className={`px-6 py-3 rounded-lg inline-flex items-center transition-colors font-medium ${
                  uploading === 'bluedart' 
                    ? 'bg-blue-300 text-blue-800 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}>
                  {uploading === 'bluedart' ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 mr-2" />
                      Choose BlueDart CSV
                    </>
                  )}
                </div>
              </label>
              
              {blueDartFile && (
                <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                  <p className="text-sm text-blue-800 font-medium flex items-center justify-center">
                    <FileText className="w-4 h-4 mr-2" />
                    {blueDartFile.name}
                  </p>
                  {blueDartData.length > 0 && (
                    <p className="text-xs text-blue-600 mt-1">
                      ✓ {blueDartData.length} records loaded successfully
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Delhivery Upload */}
          <div className="border-2 border-dashed border-orange-300 rounded-lg p-6 hover:border-orange-500 transition-colors bg-orange-50">
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <Package className="h-12 w-12 text-orange-600 mr-2" />
                <div className="text-left">
                  <h3 className="text-xl font-bold text-orange-900">Delhivery</h3>
                  <p className="text-sm text-orange-700">Logistics & supply chain</p>
                </div>
              </div>
              
              <p className="text-sm text-gray-700 mb-4">
                Required: waybill_num, pickup_date<br/>
                Optional: charged_weight, total_amount, ctlg_dead_wt, etc.
              </p>
              
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange('delhivery')}
                  className="hidden"
                  disabled={uploading === 'delhivery'}
                />
                <div className={`px-6 py-3 rounded-lg inline-flex items-center transition-colors font-medium ${
                  uploading === 'delhivery' 
                    ? 'bg-orange-300 text-orange-800 cursor-not-allowed' 
                    : 'bg-orange-600 hover:bg-orange-700 text-white'
                }`}>
                  {uploading === 'delhivery' ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 mr-2" />
                      Choose Delhivery CSV
                    </>
                  )}
                </div>
              </label>
              
              {delhiveryFile && (
                <div className="mt-4 p-3 bg-orange-100 rounded-lg">
                  <p className="text-sm text-orange-800 font-medium flex items-center justify-center">
                    <FileText className="w-4 h-4 mr-2" />
                    {delhiveryFile.name}
                  </p>
                  {delhiveryData.length > 0 && (
                    <p className="text-xs text-orange-600 mt-1">
                      ✓ {delhiveryData.length} records loaded successfully
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status Messages */}
        {errors.length > 0 && (
          <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-semibold text-red-800 mb-2">Upload Errors:</h4>
                <ul className="text-sm text-red-700 space-y-1">
                  {errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {success.length > 0 && (
          <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-start">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-semibold text-green-800 mb-2">Files Loaded Successfully:</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  {success.map((msg, index) => (
                    <li key={index}>• {msg}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Analysis Summary */}
        {canStartAnalysis && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="text-sm font-semibold text-blue-800 mb-2">Ready for Analysis:</h4>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-700">
              <div>
                <span className="font-medium">BlueDart Records:</span> {blueDartData.length.toLocaleString()}
              </div>
              <div>
                <span className="font-medium">Delhivery Records:</span> {delhiveryData.length.toLocaleString()}
              </div>
              <div className="md:col-span-2">
                <span className="font-medium">Total Shipments:</span> {(blueDartData.length + delhiveryData.length).toLocaleString()}
              </div>
            </div>
          </div>
        )}

        {/* Start Analysis Button */}
        <div className="text-center">
          <button
            onClick={handleStartAnalysis}
            disabled={!canStartAnalysis || uploading === 'processing'}
            className="bg-gradient-to-r from-blue-600 to-orange-600 hover:from-blue-700 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-4 px-8 rounded-lg transition-all duration-200 disabled:cursor-not-allowed text-lg"
          >
            {uploading === 'processing' ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                Starting Analysis...
              </div>
            ) : (
              `Start Analysis (${(blueDartData.length + delhiveryData.length).toLocaleString()} shipments)`
            )}
          </button>
        </div>

        {/* Sample Data Info */}
        <div className="mt-8 p-6 bg-gray-50 rounded-lg">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Expected Data Format:</h4>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="font-medium text-blue-700 mb-2">BlueDart CSV Columns:</p>
              <div className="text-xs text-gray-600 bg-white p-3 rounded border font-mono">
                <div className="text-red-600">Required:</div>
                AWB_NO, PICKUP_DT<br/>
                <div className="text-green-600 mt-2">Optional:</div>
                ACT_WT, CHRG_WT, AMOUNT, VALUE, ORIGIN, DESTINATION, PIN_CODE, PCS, etc.
              </div>
            </div>
            <div>
              <p className="font-medium text-orange-700 mb-2">Delhivery CSV Columns:</p>
              <div className="text-xs text-gray-600 bg-white p-3 rounded border font-mono">
                <div className="text-red-600">Required:</div>
                waybill_num, pickup_date<br/>
                <div className="text-green-600 mt-2">Optional:</div>
                charged_weight, total_amount, ctlg_dead_wt, ctlg_vl_wt, zone, status, etc.
              </div>
            </div>
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> You can upload files individually or together. The system will handle missing weight/amount columns gracefully and use default values for analysis.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};