import React, { useState, useEffect } from 'react';
import { FiSettings, FiX, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import ModelSelection from './ModelSelection';

interface SettingsModalProps {
  apiKey: string;
  selectedModel: string;
  onSave: (apiKey: string, model: string) => Promise<void>;
  onModelChange: (model: string) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ 
  apiKey, 
  selectedModel,
  onSave, 
  onModelChange 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localApiKey, setLocalApiKey] = useState(apiKey);
  const [localModel, setLocalModel] = useState(selectedModel);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setLocalApiKey(apiKey);
      setLocalModel(selectedModel);
      setError('');
      setSuccessMessage('');
    }
  }, [isOpen, apiKey, selectedModel]);

  const validateSettings = (): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!localApiKey) {
      errors.push('API key is required');
    }

    if (!localModel) {
      errors.push('Model selection is required');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  };

  const handleSave = async () => {
    const validation = validateSettings();
    if (!validation.valid) {
      setError(validation.errors.join('\n'));
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      localStorage.setItem('openRouterApiKey', localApiKey);
      localStorage.setItem('selectedModel', localModel);

      await onSave(localApiKey, localModel);

      setSuccessMessage('Settings saved successfully!');
      
      setTimeout(() => {
        setIsOpen(false);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 right-4 p-2 bg-purple-700 text-white rounded-lg hover:bg-purple-600 transition-colors z-50"
        aria-label="Open settings"
      >
        <FiSettings className="w-6 h-6" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div
            className="bg-gray-900 rounded-lg w-full max-w-md p-6 relative"
            role="dialog"
            aria-labelledby="settings-modal-title"
          >
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-800/50 rounded-lg text-gray-100"
              aria-label="Close settings"
              disabled={isLoading}
            >
              <FiX className="w-5 h-5" />
            </button>

            <h2 id="settings-modal-title" className="text-xl font-semibold mb-4 text-gray-100">
              Settings
            </h2>

            <div className="space-y-4">
              {successMessage && (
                <div className="flex items-center gap-2 bg-green-500/10 text-green-500 p-3 rounded-lg">
                  <FiCheckCircle className="w-5 h-5" />
                  <span>{successMessage}</span>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 bg-red-500/10 text-red-500 p-3 rounded-lg">
                  <FiAlertCircle className="w-5 h-5" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label htmlFor="api-key" className="block text-sm font-medium mb-1 text-gray-100">
                  OpenRouter API Key
                </label>
                <input
                  id="api-key"
                  type="text"
                  value={localApiKey}
                  onChange={(e) => {
                    setLocalApiKey(e.target.value);
                    setError('');
                  }}
                  className="w-full p-2 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 text-gray-100"
                  placeholder="Enter your API key"
                  aria-describedby="api-key-error"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-100">
                  Model Selection
                </label>
                <ModelSelection
                  apiKey={localApiKey}
                  selectedModel={localModel}
                  onModelChange={(model) => {
                    setLocalModel(model);
                    setError('');
                  }}
                  disabled={isLoading}
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 rounded-lg hover:bg-gray-800/50 transition-colors text-gray-100"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="px-4 py-2 bg-purple-700 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SettingsModal;
