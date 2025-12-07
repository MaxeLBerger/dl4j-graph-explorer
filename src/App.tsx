import { useState, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Toaster } from '@/components/ui/sonner';
import { AppLayout } from '@/components/AppLayout';
import { ModelsList } from '@/components/ModelsList';
import { ModelDetailView } from '@/components/ModelDetailView';
import { AboutPage } from '@/components/AboutPage';
import type { Model, LayerNode, WeightStat } from '@/types/model';

type Page = 'models' | 'about' | 'model-detail';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('models');
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  
  const [models, setModels] = useLocalStorage<Model[]>('dl4j-models', []);
  const [layers, setLayers] = useLocalStorage<LayerNode[]>('dl4j-layers', []);
  const [weightStats, setWeightStats] = useLocalStorage<WeightStat[]>('dl4j-weight-stats', []);
  
  const [modelsData, setModelsData] = useState<Model[]>([]);
  const [layersData, setLayersData] = useState<LayerNode[]>([]);
  const [weightStatsData, setWeightStatsData] = useState<WeightStat[]>([]);

  useEffect(() => {
    if (models) setModelsData(models);
  }, [models]);

  useEffect(() => {
    if (layers) setLayersData(layers);
  }, [layers]);
  // Migration: recalculate total_parameters if a model has zero but raw config available
  useEffect(() => {
    if (!models || !layers) return;
    let updated = false;
    const newModels = models.map(m => {
      if (m.total_parameters === 0 && m.raw_config_json) {
        const modelLayers = layers.filter(l => l.model_id === m.id);
        const newTotal = modelLayers.reduce((acc, l) => acc + (l.num_parameters || 0), 0);
        if (newTotal > 0) {
          updated = true;
          return { ...m, total_parameters: newTotal };
        }
      }
      return m;
    });
    if (updated) {
      setModels(newModels);
      setModelsData(newModels);
    }
  }, [models, layers, setModels]);

  useEffect(() => {
    if (weightStats) setWeightStatsData(weightStats);
  }, [weightStats]);

  const handleNavigate = (page: 'models' | 'about') => {
    setCurrentPage(page);
    setSelectedModelId(null);
  };

  const handleModelSelect = (modelId: string) => {
    setSelectedModelId(modelId);
    setCurrentPage('model-detail');
  };

  const handleBackToModels = () => {
    setCurrentPage('models');
    setSelectedModelId(null);
  };

  const handleModelImported = () => {
    // Force migration recalculation post-import
    setTimeout(() => {
      const ms = (models || []).map(m => {
        const modelLayers = (layers || []).filter(l => l.model_id === m.id);
        const tp = modelLayers.reduce((acc, l) => acc + l.num_parameters, 0);
        return { ...m, total_parameters: tp };
      });
      setModels(ms);
      setModelsData(ms);
    }, 50);
  };

  const handleModelDelete = (modelId: string) => {
    // Remove model
    const newModels = (models || []).filter(m => m.id !== modelId);
    // Remove layers tied to model
    const newLayers = (layers || []).filter(l => l.model_id !== modelId);
    // Remove weight stats tied to removed layers
    const removedLayerIds = new Set((layers || []).filter(l => l.model_id === modelId).map(l => l.id));
    const newWeightStats = (weightStats || []).filter(ws => !removedLayerIds.has(ws.layer_node_id));

    setModels(newModels);
    setLayers(newLayers);
    setWeightStats(newWeightStats);
    setModelsData(newModels);
    setLayersData(newLayers);
    setWeightStatsData(newWeightStats);

    if (selectedModelId === modelId) {
      handleBackToModels();
    }
  };

  const selectedModel = modelsData.find(m => m.id === selectedModelId);
  const modelLayers = layersData.filter(l => l.model_id === selectedModelId);
  const modelWeightStats = weightStatsData.filter(ws => 
    modelLayers.some(layer => layer.id === ws.layer_node_id)
  );

  return (
    <>
      <AppLayout 
        currentPage={currentPage === 'model-detail' ? 'models' : currentPage}
        onNavigate={handleNavigate}
      >
        {currentPage === 'models' && (
          <ModelsList 
            models={modelsData}
            onModelSelect={handleModelSelect}
            onModelImported={handleModelImported}
            onModelDelete={handleModelDelete}
          />
        )}
        
        {currentPage === 'model-detail' && selectedModel && (
          <ModelDetailView
            model={selectedModel}
            layers={modelLayers}
            weightStats={modelWeightStats}
            onBack={handleBackToModels}
          />
        )}
        
        {currentPage === 'about' && <AboutPage />}
      </AppLayout>
      
      <Toaster />
    </>
  );
}

export default App;