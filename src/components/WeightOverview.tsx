import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { LayerNode, WeightStat } from '@/types/model';
import { Sparkline } from './Sparkline';

interface WeightOverviewProps {
  layers: LayerNode[];
  weightStats: WeightStat[];
  onLayerSelect: (layerId: string) => void;
}

type SortField = 'name' | 'layer_type' | 'num_parameters' | 'mean' | 'std_dev';

export function WeightOverview({ layers, weightStats, onLayerSelect }: WeightOverviewProps) {
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const weightStatsByLayer = useMemo(() => {
    const map = new Map<string, WeightStat[]>();
    weightStats.forEach(ws => {
      if (!map.has(ws.layer_node_id)) {
        map.set(ws.layer_node_id, []);
      }
      map.get(ws.layer_node_id)!.push(ws);
    });
    return map;
  }, [weightStats]);

  const layersWithStats = useMemo(() => {
    return layers.map(layer => {
      const stats = weightStatsByLayer.get(layer.id) || [];
      const kernelStat = stats.find(s => s.parameter_group === 'kernel');
      
      return {
        layer,
        hasWeights: stats.length > 0,
        mean: kernelStat?.mean || 0,
        std_dev: kernelStat?.std_dev || 0,
        histogram: kernelStat?.histogram_bins || [],
      };
    });
  }, [layers, weightStatsByLayer]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedLayers = useMemo(() => {
    return [...layersWithStats].sort((a, b) => {
      let aVal: string | number;
      let bVal: string | number;

      switch (sortField) {
        case 'name':
          aVal = a.layer.name;
          bVal = b.layer.name;
          break;
        case 'layer_type':
          aVal = a.layer.layer_type;
          bVal = b.layer.layer_type;
          break;
        case 'num_parameters':
          aVal = a.layer.num_parameters;
          bVal = b.layer.num_parameters;
          break;
        case 'mean':
          aVal = a.mean;
          bVal = b.mean;
          break;
        case 'std_dev':
          aVal = a.std_dev;
          bVal = b.std_dev;
          break;
        default:
          aVal = a.layer.name;
          bVal = b.layer.name;
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }

      return 0;
    });
  }, [layersWithStats, sortField, sortDirection]);

  const formatNumber = (num: number, decimals: number = 4) => {
    if (Math.abs(num) < 0.0001 && num !== 0) {
      return num.toExponential(2);
    }
    return num.toFixed(decimals);
  };

  return (
    <div className="h-full overflow-auto p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground">Weight Statistics Overview</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Compare weight distributions across all layers. Click any row to view detailed statistics.
        </p>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50 select-none"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center gap-2">
                  Layer Name
                  {sortField === 'name' && <span className="text-xs">{sortDirection === 'asc' ? '↑' : '↓'}</span>}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50 select-none"
                onClick={() => handleSort('layer_type')}
              >
                <div className="flex items-center gap-2">
                  Type
                  {sortField === 'layer_type' && <span className="text-xs">{sortDirection === 'asc' ? '↑' : '↓'}</span>}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50 select-none text-right"
                onClick={() => handleSort('num_parameters')}
              >
                <div className="flex items-center justify-end gap-2">
                  Parameters
                  {sortField === 'num_parameters' && <span className="text-xs">{sortDirection === 'asc' ? '↑' : '↓'}</span>}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50 select-none text-right"
                onClick={() => handleSort('mean')}
              >
                <div className="flex items-center justify-end gap-2">
                  Mean Weight
                  {sortField === 'mean' && <span className="text-xs">{sortDirection === 'asc' ? '↑' : '↓'}</span>}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50 select-none text-right"
                onClick={() => handleSort('std_dev')}
              >
                <div className="flex items-center justify-end gap-2">
                  Std Dev
                  {sortField === 'std_dev' && <span className="text-xs">{sortDirection === 'asc' ? '↑' : '↓'}</span>}
                </div>
              </TableHead>
              <TableHead className="text-center">Distribution</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedLayers.map(({ layer, hasWeights, mean, std_dev, histogram }) => (
              <TableRow
                key={layer.id}
                className="cursor-pointer"
                onClick={() => onLayerSelect(layer.id)}
              >
                <TableCell className="font-mono text-sm font-medium">
                  {layer.name}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="text-xs">
                    {layer.layer_type.split('.').pop() || layer.layer_type}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-mono text-sm">
                  {layer.num_parameters.toLocaleString()}
                </TableCell>
                <TableCell className="text-right font-mono text-sm">
                  {hasWeights ? formatNumber(mean) : '-'}
                </TableCell>
                <TableCell className="text-right font-mono text-sm">
                  {hasWeights ? formatNumber(std_dev) : '-'}
                </TableCell>
                <TableCell>
                  <div className="flex justify-center">
                    {hasWeights && histogram.length > 0 ? (
                      <Sparkline data={histogram} width={80} height={24} />
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {layers.length === 0 && (
        <Card className="p-8 text-center mt-6">
          <p className="text-sm text-muted-foreground">No layers available</p>
        </Card>
      )}
    </div>
  );
}
