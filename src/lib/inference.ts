import type { LayerNode, Model } from '@/types/model';

export interface InferenceInput {
  branchA: number[]; // flattened vector for path A
  branchB: number[]; // input for path B
}

export interface InferenceResult {
  layerOutputs: Record<string, number[]>;
  finalOutput: number[];
  warnings: string[];
}

function activate(values: number[], activation: string): number[] {
  switch (activation) {
    case 'tanh':
      return values.map(v => Math.tanh(v));
    case 'identity':
    default:
      return values;
  }
}

// Attempt to infer activation from layer_type string or fall back to tanh for DenseLayer
function inferActivation(layer: LayerNode): string {
  const lt = layer.layer_type.toLowerCase();
  if (lt.includes('outputlayer')) return 'identity';
  if (lt.includes('denselayer')) return 'tanh';
  if (lt.includes('convolutionlayer')) return 'tanh';
  return 'identity';
}

function denseForward(input: number[], layer: LayerNode, warnings: string[]): number[] {
  if (!layer.kernel_values || !layer.bias_values) {
    warnings.push(`Missing weights for layer ${layer.name}`);
    return input.slice();
  }
  const nIn = input.length;
  const nOut = layer.bias_values.length;
  if (layer.kernel_values.length !== nIn * nOut) {
    warnings.push(`Kernel size mismatch for ${layer.name} expected ${nIn * nOut} got ${layer.kernel_values.length}`);
    return input.slice();
  }
  const out: number[] = new Array(nOut).fill(0);
  for (let i = 0; i < nIn; i++) {
    const base = i * nOut; // assuming row-major [nIn, nOut]
    const val = input[i];
    for (let j = 0; j < nOut; j++) {
      out[j] += val * layer.kernel_values[base + j];
    }
  }
  for (let j = 0; j < nOut; j++) out[j] += layer.bias_values[j] || 0;
  return activate(out, inferActivation(layer));
}

// Merge strategy: concatenate inbound outputs
function mergeConcat(inboundOutputs: number[][]): number[] {
  return inboundOutputs.flat();
}

function isWeighted(l?: LayerNode): l is LayerNode {
  return !!l && Array.isArray(l.kernel_values) && Array.isArray(l.bias_values) && l.bias_values.length > 0;
}

function forwardChainFrom(start: LayerNode, layerMap: Map<string, LayerNode>, warnings: string[]): { chain: LayerNode[]; last: LayerNode } {
  const chain: LayerNode[] = [start];
  let last = start;
  const visited = new Set<string>([start.name]);
  while (true) {
    const outs = last.outbound_nodes
      .map(n => layerMap.get(n))
      .filter(isWeighted) as LayerNode[];
    const next = outs.find(n => (n.inbound_nodes || []).length <= 1);
    if (!next || visited.has(next.name)) break;
    chain.push(next);
    visited.add(next.name);
    last = next;
  }
  return { chain, last };
}

export function runInference(model: Model, layers: LayerNode[], input: InferenceInput, options?: { startA?: string; startB?: string }): InferenceResult {
  const warnings: string[] = [];
  const outputs: Record<string, number[]> = {};
  const layerMap = new Map<string, LayerNode>(layers.map(l => [l.name, l]));

  const weighted = layers.filter(isWeighted);
  if (weighted.length === 0) {
    warnings.push('No weighted layers available for inference.');
    return { layerOutputs: outputs, finalOutput: [], warnings };
  }

  // Detect start candidates: weighted layers with no weighted inbound
  const startCandidates = weighted.filter(l => l.inbound_nodes.length === 0 || l.inbound_nodes.every(n => !isWeighted(layerMap.get(n))));
  let startA = options?.startA ? layerMap.get(options.startA) : undefined;
  let startB = options?.startB ? layerMap.get(options.startB) : undefined;
  if (!startA || !isWeighted(startA)) startA = startCandidates[0] || weighted[0];
  if (!startB || !isWeighted(startB)) startB = startCandidates.find(l => l.name !== startA!.name) || weighted.find(l => l.name !== startA!.name) || startA;

  // Validate inputs vs expected sizes if possible
  const expectedA = isWeighted(startA) ? startA.kernel_values!.length / startA.bias_values!.length : undefined;
  const expectedB = isWeighted(startB) ? startB.kernel_values!.length / startB.bias_values!.length : undefined;
  if (expectedA != null && input.branchA.length !== expectedA) warnings.push(`branchA length ${input.branchA.length} != expected ${expectedA}`);
  if (expectedB != null && input.branchB.length !== expectedB) warnings.push(`branchB length ${input.branchB.length} != expected ${expectedB}`);

  // Build chains
  const aChain = forwardChainFrom(startA, layerMap, warnings);
  const bChain = forwardChainFrom(startB, layerMap, warnings);

  // Forward on A
  let aOut = input.branchA;
  for (const l of aChain.chain) {
    aOut = denseForward(aOut, l, warnings);
    outputs[l.name] = aOut;
  }

  // Forward on B
  let bOut = input.branchB;
  for (const l of bChain.chain) {
    bOut = denseForward(bOut, l, warnings);
    outputs[l.name] = bOut;
  }

  // Find merge node that takes both last A and last B
  const mergeNode = layers.find(l => l.inbound_nodes.includes(aChain.last.name) && l.inbound_nodes.includes(bChain.last.name));
  let merged = mergeConcat([aOut, bOut]);
  if (mergeNode) outputs[mergeNode.name] = merged;

  // Post-merge dense chain
  let postStart: LayerNode | undefined = undefined;
  if (mergeNode) {
    postStart = isWeighted(mergeNode) ? mergeNode : mergeNode.outbound_nodes.map(n => layerMap.get(n)).find(isWeighted);
  } else {
    warnings.push('Merge node not found; proceeding with concatenated vector.');
    // try to find any node that has size matching merged output
    postStart = weighted.find(l => (l.kernel_values!.length / l.bias_values!.length) === merged.length);
  }

  let currentOut = merged;
  const visitedPost = new Set<string>();
  let currentNode = postStart;
  while (currentNode && !visitedPost.has(currentNode.name)) {
    currentOut = denseForward(currentOut, currentNode, warnings);
    outputs[currentNode.name] = currentOut;
    visitedPost.add(currentNode.name);
    const next = currentNode.outbound_nodes.map(n => layerMap.get(n)).find(isWeighted);
    if (!next) break;
    currentNode = next;
  }

  const finalOutput = currentOut;
  return { layerOutputs: outputs, finalOutput, warnings };
}

// Utility to generate random input with given length
export function randomInput(length: number, scale = 1): number[] {
  return Array.from({ length }, () => (Math.random() - 0.5) * scale);
}