export interface Model {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  source_file_name: string;
  num_layers: number;
  total_parameters: number;
}

export interface LayerNode {
  id: string;
  model_id: string;
  name: string;
  layer_type: string;
  input_shape?: string;
  output_shape?: string;
  num_parameters: number;
  inbound_nodes: string[];
  outbound_nodes: string[];
}

export interface WeightStat {
  id: string;
  layer_node_id: string;
  parameter_group: string;
  min: number;
  max: number;
  mean: number;
  std_dev: number;
  num_values: number;
  histogram_bins: HistogramBin[];
}

export interface HistogramBin {
  min: number;
  max: number;
  count: number;
}

export interface ImportResult {
  model: Model;
  layers: LayerNode[];
  weight_stats: WeightStat[];
  summary: {
    num_layers: number;
    total_parameters: number;
    layers_with_weights: number;
    skipped_items: string[];
  };
}
