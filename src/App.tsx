import { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { Dashboard } from './components/Dashboard';
import { ProcessingProgress } from './components/ProcessingProgress';
import { BlueDartRaw, DelhiveryRaw, NormalizedShipment } from './types';
import { normalizeBlueDart, normalizeDelhivery, calculateOutliers } from './utils/dataProcessing';

interface ProcessingStep {
  id: string;
  label: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  details?: string;
  progress?: number;
}

function App() {
  const [shipments, setShipments] = useState<NormalizedShipment[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [processingSteps, setProcessingSteps] = useState<ProcessingStep[]>([]);
  const [processingLogs, setProcessingLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    console.log(message);
    setProcessingLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const updateStep = (stepId: string, updates: Partial<ProcessingStep>) => {
    setProcessingSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, ...updates } : step
    ));
  };

  const handleDataLoaded = async (blueDartData: BlueDartRaw[], delhiveryData: DelhiveryRaw[]) => {
    setLoading(true);
    setProcessingLogs([]);
    
    const steps: ProcessingStep[] = [
      { id: 'validate', label: 'Validating Data Structure', status: 'pending' },
      { id: 'normalize-bluedart', label: 'Normalizing BlueDart Data', status: 'pending' },
      { id: 'normalize-delhivery', label: 'Normalizing Delhivery Data', status: 'pending' },
      { id: 'combine', label: 'Combining Datasets', status: 'pending' },
      { id: 'calculate', label: 'Calculating Outliers & Flags', status: 'pending' },
      { id: 'finalize', label: 'Finalizing Dashboard', status: 'pending' }
    ];
    setProcessingSteps(steps);
    
    try {
      // Step 1: Validate data
      updateStep('validate', { status: 'processing' });
      addLog(`Starting data validation...`);
      addLog(`BlueDart records: ${blueDartData.length}`);
      addLog(`Delhivery records: ${delhiveryData.length}`);
      
      if (blueDartData.length === 0 && delhiveryData.length === 0) {
        throw new Error('No data found in uploaded files');
      }
      
      updateStep('validate', { status: 'completed', details: `${blueDartData.length + delhiveryData.length} total records` });

      // Normalize the data
      updateStep('normalize-bluedart', { status: 'processing' });
      addLog('Normalizing BlueDart data...');
      const normalizedBlueDart = normalizeBlueDart(blueDartData);
      addLog(`BlueDart normalization complete: ${normalizedBlueDart.length} records processed`);
      updateStep('normalize-bluedart', { status: 'completed', details: `${normalizedBlueDart.length} records` });
      
      updateStep('normalize-delhivery', { status: 'processing' });
      addLog('Normalizing Delhivery data...');
      const normalizedDelhivery = normalizeDelhivery(delhiveryData);
      addLog(`Delhivery normalization complete: ${normalizedDelhivery.length} records processed`);
      updateStep('normalize-delhivery', { status: 'completed', details: `${normalizedDelhivery.length} records` });
      
      // Combine and calculate outliers
      updateStep('combine', { status: 'processing' });
      addLog('Combining datasets...');
      const combinedShipments = [...normalizedBlueDart, ...normalizedDelhivery];
      addLog(`Combined dataset: ${combinedShipments.length} total shipments`);
      updateStep('combine', { status: 'completed', details: `${combinedShipments.length} total shipments` });
      
      updateStep('calculate', { status: 'processing' });
      addLog('Calculating outliers and flags...');
      const shipmentsWithOutliers = calculateOutliers(combinedShipments);
      
      const flaggedCount = shipmentsWithOutliers.filter(s => s.flag_miscalculated).length;
      addLog(`Outlier calculation complete. ${flaggedCount} shipments flagged for review`);
      updateStep('calculate', { status: 'completed', details: `${flaggedCount} flagged shipments` });
      
      updateStep('finalize', { status: 'processing' });
      addLog('Finalizing dashboard...');
      setShipments(shipmentsWithOutliers);
      addLog('Dashboard ready!');
      updateStep('finalize', { status: 'completed', details: 'Ready to view' });
      
      // Small delay to show completion
      await new Promise(resolve => setTimeout(resolve, 500));
      setShowDashboard(true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred while processing the files';
      addLog(`ERROR: ${errorMessage}`);
      
      // Mark current processing step as error
      const currentStep = processingSteps.find(step => step.status === 'processing');
      if (currentStep) {
        updateStep(currentStep.id, { status: 'error', details: errorMessage });
      }
      
      console.error('Error processing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setShipments([]);
    setShowDashboard(false);
    setProcessingSteps([]);
    setProcessingLogs([]);
  };

  if (loading) {
    return (
      <ProcessingProgress 
        steps={processingSteps} 
        logs={processingLogs}
        onCancel={handleReset}
      />
    );
  }

  if (showDashboard && shipments.length > 0) {
    return (
      <div>
        <button
          onClick={handleReset}
          className="fixed top-6 right-6 z-40 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg shadow-lg transition-all duration-200 font-medium flex items-center space-x-2 backdrop-blur-sm border border-white/20 text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <span>Upload New Data</span>
        </button>
        <Dashboard shipments={shipments} onUploadNewData={handleReset} />
      </div>
    );
  }

  return <FileUpload onDataLoaded={handleDataLoaded} />;
}

export default App;