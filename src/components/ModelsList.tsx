import { useState } from 'react';
import { Upload } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
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
import type { Model } from '@/types/model';
import { ImportModelDialog } from './ImportModelDialog';

interface ModelsListProps {
  models: Model[];
  onModelSelect: (modelId: string) => void;
  onModelImported: () => void;
}

export function ModelsList({ models, onModelSelect, onModelImported }: ModelsListProps) {
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [sortField, setSortField] = useState<keyof Model>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: keyof Model) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedModels = [...models].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];
    
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

  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  if (models.length === 0) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Models</h2>
              <p className="text-sm text-muted-foreground mt-1">Import and explore DL4J computational graphs</p>
            </div>
            <Button onClick={() => setImportDialogOpen(true)}>
              <Upload className="mr-2" size={18} />
              Import Model
            </Button>
          </div>
        </div>
        
        <div className="flex-1 flex items-center justify-center p-6">
          <Card className="max-w-lg p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Upload size={32} className="text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No models yet</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Get started by importing a DL4J model file. Supported formats include JSON configuration files 
              and ZIP archives exported from DeepLearning4J.
            </p>
            <Button onClick={() => setImportDialogOpen(true)}>
              <Upload className="mr-2" size={18} />
              Import Your First Model
            </Button>
          </Card>
        </div>
        
        <ImportModelDialog
          open={importDialogOpen}
          onOpenChange={setImportDialogOpen}
          onImported={onModelImported}
        />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Models</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {models.length} {models.length === 1 ? 'model' : 'models'} imported
            </p>
          </div>
          <Button onClick={() => setImportDialogOpen(true)}>
            <Upload className="mr-2" size={18} />
            Import Model
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50 select-none"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-2">
                    Name
                    {sortField === 'name' && <span className="text-xs">{sortDirection === 'asc' ? '↑' : '↓'}</span>}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50 select-none"
                  onClick={() => handleSort('created_at')}
                >
                  <div className="flex items-center gap-2">
                    Created
                    {sortField === 'created_at' && <span className="text-xs">{sortDirection === 'asc' ? '↑' : '↓'}</span>}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50 select-none text-right"
                  onClick={() => handleSort('num_layers')}
                >
                  <div className="flex items-center justify-end gap-2">
                    Layers
                    {sortField === 'num_layers' && <span className="text-xs">{sortDirection === 'asc' ? '↑' : '↓'}</span>}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50 select-none text-right"
                  onClick={() => handleSort('total_parameters')}
                >
                  <div className="flex items-center justify-end gap-2">
                    Parameters
                    {sortField === 'total_parameters' && <span className="text-xs">{sortDirection === 'asc' ? '↑' : '↓'}</span>}
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedModels.map((model) => (
                <TableRow
                  key={model.id}
                  className="cursor-pointer"
                  onClick={() => onModelSelect(model.id)}
                >
                  <TableCell className="font-medium">
                    <div>
                      <div className="text-sm text-foreground">{model.name}</div>
                      {model.description && (
                        <div className="text-xs text-muted-foreground mt-1">{model.description}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(model.created_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="secondary">{formatNumber(model.num_layers)}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="outline" className="font-mono">{formatNumber(model.total_parameters)}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      <ImportModelDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        onImported={onModelImported}
      />
    </div>
  );
}
