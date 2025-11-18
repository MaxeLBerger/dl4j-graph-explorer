import { Card } from '@/components/ui/card';
import { Info, Eye, ChartBar, Upload } from '@phosphor-icons/react';

export function AboutPage() {
  return (
    <div className="h-full overflow-auto">
      <div className="p-6 border-b border-border">
        <h2 className="text-2xl font-bold text-foreground">About</h2>
        <p className="text-sm text-muted-foreground mt-1">DL4J Graph Explorer</p>
      </div>

      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Info size={24} className="text-primary" weight="fill" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">What is DL4J Graph Explorer?</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                DL4J Graph Explorer is a visualization tool designed for DeepLearning4J practitioners. 
                It allows you to upload DL4J model files and explore their ComputationalGraph structures, 
                layer configurations, and weight statistics in an intuitive, interactive interface.
              </p>
            </div>
          </div>
        </Card>

        <div className="grid md:grid-cols-3 gap-4">
          <Card className="p-6">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-3">
              <Upload size={20} className="text-accent" />
            </div>
            <h4 className="font-semibold text-foreground mb-2">Import Models</h4>
            <p className="text-sm text-muted-foreground">
              Upload DL4J model files in JSON or ZIP format to begin exploring your neural network architectures.
            </p>
          </Card>

          <Card className="p-6">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-3">
              <Eye size={20} className="text-accent" />
            </div>
            <h4 className="font-semibold text-foreground mb-2">Visualize Graphs</h4>
            <p className="text-sm text-muted-foreground">
              View interactive directed graphs showing layer connections, data flow, and computational topology.
            </p>
          </Card>

          <Card className="p-6">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-3">
              <ChartBar size={20} className="text-accent" />
            </div>
            <h4 className="font-semibold text-foreground mb-2">Inspect Weights</h4>
            <p className="text-sm text-muted-foreground">
              Examine weight distributions with statistical summaries and histogram visualizations for each layer.
            </p>
          </Card>
        </div>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Supported Features</h3>
          <ul className="space-y-2">
            <li className="flex items-start gap-2 text-sm text-muted-foreground">
              <span className="text-accent font-bold">•</span>
              <span>Parse DL4J ComputationalGraph JSON configurations and ZIP archives</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-muted-foreground">
              <span className="text-accent font-bold">•</span>
              <span>Interactive graph visualization with zoom, pan, and node selection</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-muted-foreground">
              <span className="text-accent font-bold">•</span>
              <span>Detailed layer inspection including shapes, parameters, and connectivity</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-muted-foreground">
              <span className="text-accent font-bold">•</span>
              <span>Weight statistics with min, max, mean, standard deviation, and histograms</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-muted-foreground">
              <span className="text-accent font-bold">•</span>
              <span>Sortable overview tables for quick comparison across layers</span>
            </li>
          </ul>
        </Card>

        <Card className="p-6 bg-muted">
          <h3 className="text-lg font-semibold text-foreground mb-4">Important Notice</h3>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            This tool is strictly for <strong>visualization and inspection only</strong>. It does not:
          </p>
          <ul className="space-y-2">
            <li className="flex items-start gap-2 text-sm text-muted-foreground">
              <span className="text-destructive font-bold">×</span>
              <span>Train models or perform backpropagation</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-muted-foreground">
              <span className="text-destructive font-bold">×</span>
              <span>Run inference or make predictions</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-muted-foreground">
              <span className="text-destructive font-bold">×</span>
              <span>Modify or update model parameters</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-muted-foreground">
              <span className="text-destructive font-bold">×</span>
              <span>Export or save modified models</span>
            </li>
          </ul>
          <p className="text-sm text-muted-foreground leading-relaxed mt-3">
            All operations are read-only statistical computations for visualization purposes.
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Getting Started</h3>
          <ol className="space-y-3">
            <li className="flex items-start gap-3 text-sm text-foreground">
              <span className="font-mono font-bold text-accent">1.</span>
              <div>
                <strong>Navigate to Models:</strong> Click on the "Models" link in the sidebar.
              </div>
            </li>
            <li className="flex items-start gap-3 text-sm text-foreground">
              <span className="font-mono font-bold text-accent">2.</span>
              <div>
                <strong>Import a Model:</strong> Click "Import Model" and upload your DL4J JSON or ZIP file.
              </div>
            </li>
            <li className="flex items-start gap-3 text-sm text-foreground">
              <span className="font-mono font-bold text-accent">3.</span>
              <div>
                <strong>Explore the Graph:</strong> Click on any model to view its computational graph and layer details.
              </div>
            </li>
            <li className="flex items-start gap-3 text-sm text-foreground">
              <span className="font-mono font-bold text-accent">4.</span>
              <div>
                <strong>Inspect Weights:</strong> Select nodes or view the Weight Overview tab to examine distributions.
              </div>
            </li>
          </ol>
        </Card>
      </div>
    </div>
  );
}
