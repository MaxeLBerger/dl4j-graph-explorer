import { useState, useEffect } from 'react';
import { ArrowLeft } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Model, LayerNode, WeightStat } from '@/types/model';
import { GraphView } from './GraphView';
import { WeightOverview } from './WeightOverview';

interface ModelDetailViewProps {
  model: Model;
  layers: LayerNode[];
  weightStats: WeightStat[];
  onBack: () => void;
}

export function ModelDetailView({ model, layers, weightStats, onBack }: ModelDetailViewProps) {
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);

  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  useEffect(() => {
    if (layers.length > 0 && !selectedLayerId) {
      setSelectedLayerId(layers[0].id);
    }
  }, [layers, selectedLayerId]);

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-border">
        <Button variant="ghost" size="sm" onClick={onBack} className="mb-4">
          <ArrowLeft className="mr-2" size={16} />
          Back to Models
        </Button>
        
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">{model.name}</h2>
            {model.description && (
              <p className="text-sm text-muted-foreground mt-1">{model.description}</p>
            )}
            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
              <span>Created: {formatDate(model.created_at)}</span>
              <span>•</span>
              <span>Source: {model.source_file_name}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-sm">
              {model.num_layers} {model.num_layers === 1 ? 'Layer' : 'Layers'}
            </Badge>
            <Badge variant="outline" className="text-sm font-mono">
              {model.total_parameters.toLocaleString()} Parameters
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="graph" className="h-full flex flex-col">
          <div className="px-6 pt-4 border-b border-border">
            <TabsList>
              <TabsTrigger value="graph">Graph View</TabsTrigger>
              <TabsTrigger value="weights">Weight Overview</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="graph" className="flex-1 mt-0 overflow-hidden">
            <GraphView
              layers={layers}
              weightStats={weightStats}
              selectedLayerId={selectedLayerId}
              onLayerSelect={setSelectedLayerId}
            />
          </TabsContent>
          
          <TabsContent value="weights" className="flex-1 mt-0 overflow-hidden">
            <WeightOverview
              layers={layers}
              weightStats={weightStats}
              onLayerSelect={setSelectedLayerId}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
