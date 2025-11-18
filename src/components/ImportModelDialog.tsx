import { useState } from 'react';
import { useKV } from '@github/spark/hooks';
import { Upload, CheckCircle, WarningCircle } from '@phosphor-icons/react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { parseDL4JModel } from '@/lib/dl4j-parser';
import type { Model, LayerNode, WeightStat, ImportResult } from '@/types/model';
import { toast } from 'sonner';

interface ImportModelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImported: () => void;
}

export function ImportModelDialog({ open, onOpenChange, onImported }: ImportModelDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  
  const [models, setModels] = useKV<Model[]>('dl4j-models', []);
  const [layers, setLayers] = useKV<LayerNode[]>('dl4j-layers', []);
  const [weightStats, setWeightStats] = useKV<WeightStat[]>('dl4j-weight-stats', []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (!name) {
        setName(selectedFile.name.replace(/\.(json|zip)$/i, ''));
      }
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast.error('Please select a file to import');
      return;
    }

    if (!name.trim()) {
      toast.error('Please provide a model name');
      return;
    }

    setImporting(true);
    
    try {
      const result = await parseDL4JModel(file);
      
      result.model.name = name;
      result.model.description = description;
      
      setModels((current) => [...(current || []), result.model]);
      setLayers((current) => [...(current || []), ...result.layers]);
      setWeightStats((current) => [...(current || []), ...result.weight_stats]);
      
      setImportResult(result);
      
      toast.success('Model imported successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to import model');
      console.error('Import error:', error);
    } finally {
      setImporting(false);
    }
  };

  const handleClose = () => {
    if (importResult) {
      onImported();
    }
    setName('');
    setDescription('');
    setFile(null);
    setImportResult(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import DL4J Model</DialogTitle>
          <DialogDescription>
            Upload a DeepLearning4J model file (JSON config or ZIP archive) to visualize its computational graph structure.
          </DialogDescription>
        </DialogHeader>

        {!importResult ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="model-name">Model Name *</Label>
              <Input
                id="model-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My DL4J Model"
                disabled={importing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="model-description">Description (Optional)</Label>
              <Textarea
                id="model-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of this model..."
                rows={3}
                disabled={importing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="model-file">Model File *</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:bg-muted/50 transition-colors">
                <Input
                  id="model-file"
                  type="file"
                  accept=".json,.zip"
                  onChange={handleFileChange}
                  disabled={importing}
                  className="hidden"
                />
                <label htmlFor="model-file" className="cursor-pointer">
                  <Upload size={32} className="mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm font-medium text-foreground">
                    {file ? file.name : 'Click to select a file'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Supported formats: .json, .zip
                  </p>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={handleClose} disabled={importing}>
                Cancel
              </Button>
              <Button onClick={handleImport} disabled={importing || !file || !name.trim()}>
                {importing ? 'Importing...' : 'Import Model'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Card className="p-4 bg-accent/10 border-accent">
              <div className="flex items-start gap-3">
                <CheckCircle size={24} className="text-accent flex-shrink-0 mt-0.5" weight="fill" />
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">Import Successful</h3>
                  <p className="text-sm text-muted-foreground">
                    Model "{importResult.model.name}" has been imported and is ready to explore.
                  </p>
                </div>
              </div>
            </Card>

            <div className="space-y-3">
              <h4 className="font-medium text-foreground">Import Summary</h4>
              
              <div className="grid grid-cols-3 gap-3">
                <Card className="p-4">
                  <div className="text-xs text-muted-foreground mb-1">Layers</div>
                  <div className="text-2xl font-bold text-foreground font-mono">
                    {importResult.summary.num_layers}
                  </div>
                </Card>
                
                <Card className="p-4">
                  <div className="text-xs text-muted-foreground mb-1">Total Parameters</div>
                  <div className="text-2xl font-bold text-foreground font-mono">
                    {importResult.summary.total_parameters.toLocaleString()}
                  </div>
                </Card>
                
                <Card className="p-4">
                  <div className="text-xs text-muted-foreground mb-1">Layers with Weights</div>
                  <div className="text-2xl font-bold text-foreground font-mono">
                    {importResult.summary.layers_with_weights}
                  </div>
                </Card>
              </div>

              {importResult.summary.skipped_items.length > 0 && (
                <Card className="p-4 bg-muted">
                  <div className="flex items-start gap-3">
                    <WarningCircle size={20} className="text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h5 className="text-sm font-medium text-foreground mb-2">
                        Skipped Items ({importResult.summary.skipped_items.length})
                      </h5>
                      <ul className="space-y-1">
                        {importResult.summary.skipped_items.slice(0, 5).map((item, idx) => (
                          <li key={idx} className="text-xs text-muted-foreground">• {item}</li>
                        ))}
                        {importResult.summary.skipped_items.length > 5 && (
                          <li className="text-xs text-muted-foreground italic">
                            ... and {importResult.summary.skipped_items.length - 5} more
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                </Card>
              )}
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={handleClose}>
                View Model
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
