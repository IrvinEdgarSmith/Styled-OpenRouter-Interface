import React, { useState, useEffect } from 'react';
import { FiChevronDown } from 'react-icons/fi';

interface Model {
  id: string;
  name: string;
  description: string;
  context_length: number;
  pricing: {
    prompt: string;
    completion: string;
  };
  architecture: {
    tokenizer: string;
  };
}

interface ModelSelectionProps {
  apiKey: string;
  onModelChange: (model: string) => void;
}

const ModelSelection: React.FC<ModelSelectionProps> = ({ apiKey, onModelChange }) => {
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const fetchModels = async () => {
    const cachedModels = localStorage.getItem('openRouterModels');
    const cacheTimestamp = localStorage.getItem('openRouterModelsTimestamp');

    if (cachedModels && cacheTimestamp) {
      const age = Date.now() - Number(cacheTimestamp);
      if (age < 5 * 60 * 1000) {
        setModels(JSON.parse(cachedModels));
        return;
      }
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('https://openrouter.ai/api/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch models');
      }

      const data = await response.json();
      const formattedModels = data.data.map((model: any) => ({
        id: model.id,
        name: model.name,
        description: model.description,
        context_length: model.context_length,
        pricing: model.pricing,
        architecture: model.architecture
      }));

      localStorage.setItem('openRouterModels', JSON.stringify(formattedModels));
      localStorage.setItem('openRouterModelsTimestamp', Date.now().toString());
      setModels(formattedModels);
    } catch (err) {
      setError('Failed to load models');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (apiKey) {
      fetchModels();
    }
  }, [apiKey]);

  const handleSelect = (modelId: string) => {
    setSelectedModel(modelId);
    onModelChange(modelId);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading || !apiKey}
        className="w-full p-2 bg-background rounded-lg flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Select model"
      >
        <span>
          {selectedModel ? models.find(m => m.id === selectedModel)?.name : 'Select a model'}
        </span>
        <FiChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {error && (
        <p className="text-sm text-accent mt-1">{error}</p>
      )}

      {isOpen && (
        <div
          className="absolute z-10 mt-2 w-full bg-surface rounded-lg shadow-lg max-h-60 overflow-y-auto"
          role="listbox"
        >
          {models.map((model) => (
            <button
              key={model.id}
              onClick={() => handleSelect(model.id)}
              className="w-full p-2 text-left hover:bg-background/50 transition-colors"
              role="option"
              aria-selected={selectedModel === model.id}
            >
              <div className="font-medium">{model.name}</div>
              <div className="text-sm text-text-secondary">
                {model.description}
              </div>
              <div className="text-xs text-text-secondary mt-1">
                Context: {model.context_length} tokens | 
                Pricing: {model.pricing.prompt} / {model.pricing.completion} per token
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ModelSelection;
