import React from 'react';
import { Card } from '@/components/ui/card';
import { Info, Eye, ChartBar, Upload } from '@phosphor-icons/react';

export function AboutPage() {
  return (
    <div className="h-full overflow-auto">
      <div className="p-6 border-b border-border">
        <h2 className="text-2xl font-bold text-foreground">About</h2>
        <p className="text-sm text-muted-foreground mt-1">DL4J Graph Explorer</p>
      </div>

      <div className="p-6 max-w-6xl mx-auto space-y-8">
        {/* Intro */}
        <div className="grid md:grid-cols-4 gap-6">
          <Card className="p-6 md:col-span-2 flex flex-col gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Info size={24} className="text-primary" weight="fill" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">What is DL4J Graph Explorer?</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  A visualization tool for DeepLearning4J models. Upload JSON or ZIP exports to explore graph structure,
                  layer connectivity and synthetic weight statistics in a clean interface.
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-6 flex flex-col gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <Upload size={20} className="text-accent" />
            </div>
            <h4 className="font-semibold text-foreground">Import Models</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Drag & drop or select a DL4J JSON or ZIP archive produced by ModelSerializer.
            </p>
          </Card>
          <Card className="p-6 flex flex-col gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <Eye size={20} className="text-accent" />
            </div>
            <h4 className="font-semibold text-foreground">Visualize Graphs</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Interactive layout with pan/zoom, node selection & connectivity overview.
            </p>
          </Card>
        </div>

        {/* Features */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Supported Features</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <ul className="space-y-2">
              <li>Parse DL4J JSON configs & ZIP archives</li>
              <li>Hierarchical force graph visualization</li>
              <li>Layer detail panel with shapes & connections</li>
              <li>Weight statistics (synthetic) & histograms</li>
            </ul>
            <ul className="space-y-2">
              <li>Sortable layer overview table</li>
              <li>Model summary badges (layers/parameters)</li>
              <li>Local persistence (browser storage)</li>
              <li>Zero-updater graceful handling</li>
            </ul>
          </div>
        </Card>

        {/* Notice */}
        <Card className="p-6 bg-muted">
          <h3 className="text-lg font-semibold text-foreground mb-4">Important Notice</h3>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            Read-only inspection: the tool does <span className="font-semibold">not</span> perform training, inference or parameter modification.
          </p>
          <div className="grid md:grid-cols-2 gap-4 text-xs text-muted-foreground">
            <ul className="space-y-2">
              <li>× Train models / backprop</li>
              <li>× Run inference</li>
            </ul>
            <ul className="space-y-2">
              <li>× Edit parameters</li>
              <li>× Export modified models</li>
            </ul>
          </div>
          <p className="text-xs text-muted-foreground mt-4">All statistics are synthetic approximations—no real weights are executed.</p>
        </Card>

        {/* Getting Started */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Getting Started</h3>
          <ol className="space-y-3 text-sm text-foreground">
            <li><span className="font-mono text-accent mr-2">1.</span> Open Models tab.</li>
            <li><span className="font-mono text-accent mr-2">2.</span> Import a JSON/ZIP.</li>
            <li><span className="font-mono text-accent mr-2">3.</span> Select model to view graph.</li>
            <li><span className="font-mono text-accent mr-2">4.</span> Use Weight Overview for distributions.</li>
          </ol>
        </Card>
      </div>
    </div>
  );
}
