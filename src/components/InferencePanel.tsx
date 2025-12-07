import { useState, useMemo, useEffect } from 'react';
import type { Model, LayerNode } from '@/types/model';
import { runInference, randomInput } from '@/lib/inference';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface InferencePanelProps {
  model: Model;
  layers: LayerNode[];
}

function parseInput(text: string): number[] {
  return text
    .split(/[,\s]+/)
    .map(t => t.trim())
    .filter(t => t.length > 0)
    .map(Number)
    .filter(n => !isNaN(n));
}

export function InferencePanel({ model, layers }: InferencePanelProps) {
  const layerMap = useMemo(() => new Map(layers.map(l => [l.name, l])), [layers]);
  const weighted = useMemo(() => layers.filter(l => Array.isArray(l.kernel_values) && Array.isArray(l.bias_values) && l.bias_values!.length > 0), [layers]);
  const startCandidates = useMemo(() => weighted.filter(l => l.inbound_nodes.length === 0 || l.inbound_nodes.every(n => {
    const m = layerMap.get(n);
    return !(m && m.kernel_values && m.bias_values);
  })), [weighted, layerMap]);
  const [startA, setStartA] = useState<string>(startCandidates[0]?.name || weighted[0]?.name || '');
  const [startB, setStartB] = useState<string>(startCandidates[1]?.name || weighted[1]?.name || '');
  const layerA = startA ? layerMap.get(startA) : undefined;
  const layerB0 = startB ? layerMap.get(startB) : undefined;
  const [inputA, setInputA] = useState('');
  const [inputB, setInputB] = useState('');
  const [result, setResult] = useState<ReturnType<typeof runInference> | null>(null);

  const expectedA = layerA && layerA.kernel_values && layerA.bias_values ? layerA.kernel_values.length / layerA.bias_values.length : undefined;
  const expectedB = layerB0 && layerB0.kernel_values && layerB0.bias_values ? layerB0.kernel_values.length / layerB0.bias_values.length : undefined;

  const handleRandomA = () => {
    const len = expectedA ?? 16;
    setInputA(randomInput(len).join(','));
  };
  const handleRandomB = () => {
    const len = expectedB ?? 16;
    setInputB(randomInput(len).join(','));
  };

  const handleRun = () => {
    const vecA = parseInput(inputA);
    const vecB = parseInput(inputB);
    const fitLength = (arr: number[], expected?: number) => {
      if (!expected) return arr;
      if (arr.length === expected) return arr;
      if (arr.length > expected) return arr.slice(0, expected);
      const out = arr.slice();
      while (out.length < expected) out.push(0);
      return out;
    };
    const adjA = fitLength(vecA, expectedA);
    const adjB = fitLength(vecB, expectedB);
    const chosenA = startA || weighted[0]?.name;
    const chosenB = startB || (weighted.find(l => l.name !== chosenA)?.name || chosenA);
    const r = runInference(model, layers, { branchA: adjA, branchB: adjB }, { startA: chosenA, startB: chosenB });
    setResult(r);
  };

  // Ensure defaults when weighted list resolves later
  if (!startA && weighted[0]?.name) setStartA(weighted[0].name);
  if (!startB && weighted[1]?.name) setStartB(weighted[1].name);

  // When start layer changes, auto-generate inputs with correct length to avoid mismatches
  useEffect(() => {
    if (expectedA && (parseInput(inputA).length !== expectedA)) {
      setInputA(randomInput(expectedA).join(','));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startA, expectedA]);

  useEffect(() => {
    if (expectedB && (parseInput(inputB).length !== expectedB)) {
      setInputB(randomInput(expectedB).join(','));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startB, expectedB]);

  return (
    <div className="p-6 space-y-6">
      <h3 className="text-lg font-semibold">Approximate Inference</h3>
      <p className="text-sm text-muted-foreground">Provide inputs for the two branches (conv/dense path A and feed-forward path B). This forward pass uses only dense layers and concatenation, ignoring convolution spatial operations.</p>
      {weighted.length === 0 && (
        <Card className="p-4 border-destructive/40">
          <p className="text-sm">No parsed weights found for this model. Please re-import the ZIP so weights can be attached, or continue with manual vectors; results may be limited.</p>
        </Card>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Branch A Input {expectedA && <Badge variant="outline">{expectedA} values</Badge>}</span>
              <Select value={startA} onValueChange={setStartA}>
                <SelectTrigger size="sm"><SelectValue placeholder="Select start layer" /></SelectTrigger>
                <SelectContent>
                  {weighted.map(l => (
                    <SelectItem key={l.name} value={l.name}>{l.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button size="sm" variant="secondary" onClick={handleRandomA}>Random</Button>
          </div>
          <Textarea rows={6} value={inputA} onChange={e => setInputA(e.target.value)} placeholder="v1, v2, v3, ..." />
        </Card>
        <Card className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Branch B Input {expectedB && <Badge variant="outline">{expectedB} values</Badge>}</span>
              <Select value={startB} onValueChange={setStartB}>
                <SelectTrigger size="sm"><SelectValue placeholder="Select start layer" /></SelectTrigger>
                <SelectContent>
                  {weighted.map(l => (
                    <SelectItem key={l.name} value={l.name}>{l.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button size="sm" variant="secondary" onClick={handleRandomB}>Random</Button>
          </div>
          <Textarea rows={6} value={inputB} onChange={e => setInputB(e.target.value)} placeholder="v1, v2, v3, ..." />
        </Card>
      </div>
      <div className="flex gap-2">
        <Button onClick={handleRun}>Run Inference</Button>
        {result && <Badge variant={result.warnings.length ? 'destructive' : 'secondary'}>{result.warnings.length ? 'Warnings' : 'OK'}</Badge>}
      </div>
      {result && (
        <div className="space-y-4">
          <Card className="p-4">
            <h4 className="text-sm font-semibold mb-2">Final Output</h4>
            {(() => {
              const arr = result.finalOutput || [];
              const first = typeof arr[0] === 'number' ? arr[0] : 0;
              const prob = 1 / (1 + Math.exp(-first));
              const decision = prob >= 0.5 ? 'BUY' : 'NO BUY';
              return (
                <div className="space-y-2">
                  <div className="text-2xl font-bold">{prob.toFixed(4)} <span className="text-sm font-medium text-muted-foreground">(probability)</span></div>
                  <div className="text-sm">Decision: <span className={decision === 'BUY' ? 'text-green-600' : 'text-red-600'}>{decision}</span></div>
                  {arr.length > 1 && (
                    <div className="text-xs text-muted-foreground">Using first of {arr.length} outputs. Raw first value: {first.toFixed(6)}</div>
                  )}
                </div>
              );
            })()}
          </Card>
          <Card className="p-4">
            <h4 className="text-sm font-semibold mb-2">Layer Outputs</h4>
            <div className="space-y-2 max-h-64 overflow-auto text-xs font-mono">
              {Object.entries(result.layerOutputs).map(([name, out]) => (
                <div key={name}>
                  <strong>{name}</strong>: [{out.slice(0, 12).map(v => v.toFixed(4)).join(', ')}{out.length > 12 ? ' …' : ''}] (len {out.length})
                </div>
              ))}
            </div>
          </Card>
          {result.warnings.length > 0 && (
            <Card className="p-4 border-destructive">
              <h4 className="text-sm font-semibold mb-2 text-destructive">Warnings</h4>
              <ul className="text-xs list-disc pl-4 space-y-1">
                {result.warnings.map((w,i) => <li key={i}>{w}</li>)}
              </ul>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}