export interface Model {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  source_file_name: string;
  num_layers: number;
  total_parameters: number;
  raw_config_json?: string; // optional original configuration for recalculation
  // Binary weights metadata (from coefficients.bin)
  binary_parameters?: number; // total float values detected in coefficients.bin
  expected_parameters?: number; // same as total_parameters at parse time
  parameter_mismatch?: boolean; // true if binary_parameters differs from expected_parameters
  parameter_match_ratio?: number; // binary_parameters / expected_parameters
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
  // Optional raw weight values for approximate inference (dense/conv bias & kernel)
  kernel_values?: number[];
  bias_values?: number[];
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
    has_binary_weights?: boolean;
    has_updater_state?: boolean;
    binary_parameters?: number;
    expected_parameters?: number;
    parameter_mismatch?: boolean;
    parameter_match_ratio?: number;
  };
}
