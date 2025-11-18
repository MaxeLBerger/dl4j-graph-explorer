import { useState, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
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
  
  const [models] = useKV<Model[]>('dl4j-models', []);
  const [layers] = useKV<LayerNode[]>('dl4j-layers', []);
  const [weightStats] = useKV<WeightStat[]>('dl4j-weight-stats', []);
  
  const [modelsData, setModelsData] = useState<Model[]>([]);
  const [layersData, setLayersData] = useState<LayerNode[]>([]);
  const [weightStatsData, setWeightStatsData] = useState<WeightStat[]>([]);

  useEffect(() => {
    if (models) setModelsData(models);
  }, [models]);

  useEffect(() => {
    if (layers) setLayersData(layers);
  }, [layers]);

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