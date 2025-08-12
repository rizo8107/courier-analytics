import React, { useState } from 'react';
import { 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Loader2, 
  ChevronDown, 
  ChevronUp,
  X,
  FileText,
  Database,
  BarChart3
} from 'lucide-react';

interface ProcessingStep {
  id: string;
  label: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  details?: string;
  progress?: number;
}

interface ProcessingProgressProps {
  steps: ProcessingStep[];
  logs: string[];
  onCancel: () => void;
}

export const ProcessingProgress: React.FC<ProcessingProgressProps> = ({ 
  steps, 
  logs, 
  onCancel 
}) => {
  const [showLogs, setShowLogs] = useState(false);
  
  const completedSteps = steps.filter(step => step.status === 'completed').length;
  const totalSteps = steps.length;
  const overallProgress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;
  
  const currentStep = steps.find(step => step.status === 'processing');
  const hasError = steps.some(step => step.status === 'error');

  const getStepIcon = (step: ProcessingStep) => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'processing':
        return <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStepColor = (step: ProcessingStep) => {
    switch (step.status) {
      case 'completed':
        return 'text-green-800 bg-green-50 border-green-200';
      case 'processing':
        return 'text-blue-800 bg-blue-50 border-blue-200';
      case 'error':
        return 'text-red-800 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Database className="w-12 h-12 text-blue-600 mr-3" />
              <BarChart3 className="w-12 h-12 text-orange-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Processing Courier Data
            </h2>
            <p className="text-gray-600">
              {hasError 
                ? 'An error occurred during processing' 
                : currentStep 
                  ? `Currently: ${currentStep.label.toLowerCase()}...`
                  : 'Preparing to process your data...'
              }
            </p>
          </div>

          {/* Overall Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                Overall Progress
              </span>
              <span className="text-sm text-gray-500">
                {completedSteps} of {totalSteps} steps completed
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-500 ${
                  hasError ? 'bg-red-500' : 'bg-gradient-to-r from-blue-500 to-orange-500'
                }`}
                style={{ width: `${overallProgress}%` }}
              />
            </div>
            <div className="text-center mt-2">
              <span className="text-lg font-semibold text-gray-800">
                {Math.round(overallProgress)}%
              </span>
            </div>
          </div>

          {/* Processing Steps */}
          <div className="space-y-3 mb-6">
            {steps.map((step, index) => (
              <div 
                key={step.id}
                className={`p-4 rounded-lg border-2 transition-all duration-300 ${getStepColor(step)}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {getStepIcon(step)}
                    </div>
                    <div>
                      <h3 className="font-medium">
                        {step.label}
                      </h3>
                      {step.details && (
                        <p className="text-sm opacity-75 mt-1">
                          {step.details}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-sm font-medium">
                    Step {index + 1}
                  </div>
                </div>
                
                {step.status === 'processing' && (
                  <div className="mt-3">
                    <div className="w-full bg-white bg-opacity-50 rounded-full h-2">
                      <div className="bg-current h-2 rounded-full animate-pulse" style={{ width: '60%' }} />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Logs Section */}
          <div className="border-t pt-6">
            <button
              onClick={() => setShowLogs(!showLogs)}
              className="flex items-center justify-between w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-gray-600" />
                <span className="font-medium text-gray-800">Processing Logs</span>
                <span className="text-sm text-gray-500">({logs.length} entries)</span>
              </div>
              {showLogs ? (
                <ChevronUp className="w-4 h-4 text-gray-600" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-600" />
              )}
            </button>
            
            {showLogs && (
              <div className="mt-3 bg-gray-900 rounded-lg p-4 max-h-64 overflow-y-auto">
                <div className="font-mono text-sm space-y-1">
                  {logs.length === 0 ? (
                    <div className="text-gray-400 italic">No logs yet...</div>
                  ) : (
                    logs.map((log, index) => (
                      <div 
                        key={index} 
                        className={`${
                          log.includes('ERROR') 
                            ? 'text-red-400' 
                            : log.includes('complete') || log.includes('Ready')
                              ? 'text-green-400'
                              : 'text-gray-300'
                        }`}
                      >
                        {log}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center mt-8">
            <button
              onClick={onCancel}
              className="flex items-center px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel & Return
            </button>
          </div>

          {/* Status Message */}
          {hasError && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-semibold text-red-800 mb-1">
                    Processing Failed
                  </h4>
                  <p className="text-sm text-red-700">
                    Please check the logs above for details, then try uploading your files again.
                    Make sure your CSV files have the correct format and column headers.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};