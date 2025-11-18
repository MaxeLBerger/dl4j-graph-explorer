import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { LayerNode, WeightStat } from '@/types/model';
import { HistogramChart } from './HistogramChart';

interface LayerDetailProps {
  layer: LayerNode;
  weightStats: WeightStat[];
}

export function LayerDetail({ layer, weightStats }: LayerDetailProps) {
  const [selectedParamGroup, setSelectedParamGroup] = useState<string>(
    weightStats.length > 0 ? weightStats[0].parameter_group : ''
  );

  const currentWeightStat = weightStats.find(ws => ws.parameter_group === selectedParamGroup);

  const formatNumber = (num: number, decimals: number = 2) => {
    if (Math.abs(num) < 0.0001 && num !== 0) {
      return num.toExponential(decimals);
    }
    return num.toFixed(decimals);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h3 className="font-semibold text-foreground text-lg mb-1 font-mono">{layer.name}</h3>
        <Badge variant="secondary" className="text-xs">
          {layer.layer_type.split('.').pop() || layer.layer_type}
        </Badge>
      </div>

      <Separator />

      <div className="space-y-4">
        <div>
          <div className="text-xs text-muted-foreground mb-1">Input Shape</div>
          <div className="text-sm font-mono text-foreground">
            {layer.input_shape || 'Unknown'}
          </div>
        </div>

        <div>
          <div className="text-xs text-muted-foreground mb-1">Output Shape</div>
          <div className="text-sm font-mono text-foreground">
            {layer.output_shape || 'Unknown'}
          </div>
        </div>

        <div>
          <div className="text-xs text-muted-foreground mb-1">Parameters</div>
          <div className="text-sm font-mono text-foreground">
            {layer.num_parameters.toLocaleString()}
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <div>
          <div className="text-xs text-muted-foreground mb-2">Inbound Connections</div>
          {layer.inbound_nodes.length > 0 ? (
            <div className="space-y-1">
              {layer.inbound_nodes.map((node, idx) => (
                <Badge key={idx} variant="outline" className="text-xs font-mono mr-1">
                  {node}
                </Badge>
              ))}
            </div>
          ) : (
            <div className="text-xs text-muted-foreground italic">None (input layer)</div>
          )}
        </div>

        <div>
          <div className="text-xs text-muted-foreground mb-2">Outbound Connections</div>
          {layer.outbound_nodes.length > 0 ? (
            <div className="space-y-1">
              {layer.outbound_nodes.map((node, idx) => (
                <Badge key={idx} variant="outline" className="text-xs font-mono mr-1">
                  {node}
                </Badge>
              ))}
            </div>
          ) : (
            <div className="text-xs text-muted-foreground italic">None (output layer)</div>
          )}
        </div>
      </div>

      {weightStats.length > 0 && (
        <>
          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-foreground text-sm">Weight Statistics</h4>
              {weightStats.length > 1 && (
                <Select value={selectedParamGroup} onValueChange={setSelectedParamGroup}>
                  <SelectTrigger className="w-32 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {weightStats.map(ws => (
                      <SelectItem key={ws.id} value={ws.parameter_group} className="text-xs">
                        {ws.parameter_group}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {currentWeightStat && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <Card className="p-3 bg-muted/50">
                    <div className="text-xs text-muted-foreground mb-1">Min</div>
                    <div className="text-sm font-mono font-semibold text-foreground">
                      {formatNumber(currentWeightStat.min)}
                    </div>
                  </Card>

                  <Card className="p-3 bg-muted/50">
                    <div className="text-xs text-muted-foreground mb-1">Max</div>
                    <div className="text-sm font-mono font-semibold text-foreground">
                      {formatNumber(currentWeightStat.max)}
                    </div>
                  </Card>

                  <Card className="p-3 bg-muted/50">
                    <div className="text-xs text-muted-foreground mb-1">Mean</div>
                    <div className="text-sm font-mono font-semibold text-foreground">
                      {formatNumber(currentWeightStat.mean)}
                    </div>
                  </Card>

                  <Card className="p-3 bg-muted/50">
                    <div className="text-xs text-muted-foreground mb-1">Std Dev</div>
                    <div className="text-sm font-mono font-semibold text-foreground">
                      {formatNumber(currentWeightStat.std_dev)}
                    </div>
                  </Card>
                </div>

                <div>
                  <div className="text-xs text-muted-foreground mb-1">Values</div>
                  <div className="text-sm font-mono text-foreground">
                    {currentWeightStat.num_values.toLocaleString()}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-muted-foreground mb-3">Distribution</div>
                  <HistogramChart data={currentWeightStat.histogram_bins} />
                </div>
              </>
            )}
          </div>
        </>
      )}

      {weightStats.length === 0 && layer.num_parameters > 0 && (
        <>
          <Separator />
          <Card className="p-4 bg-muted text-center">
            <p className="text-xs text-muted-foreground">No weight data available for this layer</p>
          </Card>
        </>
      )}
    </div>
  );
}
