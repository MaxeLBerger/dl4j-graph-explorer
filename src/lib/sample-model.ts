import JSZip from 'jszip';

// Build a more realistic DL4J model archive with required entries.
// Required: configuration.json, coefficients.bin
// Optional we include: updaterState.bin (empty placeholder), normalizer.bin (absent), preprocessor.bin (absent).
// We generate synthetic weights (float32) sized according to nIn * nOut (+ bias) for each layer with params.
export async function createSampleModelFile(): Promise<File> {
  const zip = new JSZip();

  const config = {
    vertices: [
      {
        vertexName: 'input_data',
        layer: {
          '@class': 'org.deeplearning4j.nn.conf.layers.InputType',
          nIn: 784,
          nOut: 784,
          type: 'Input'
        },
        inputs: []
      },
      {
        vertexName: 'layer_1_dense',
        layer: {
          '@class': 'org.deeplearning4j.nn.conf.layers.DenseLayer',
          nIn: 784,
          nOut: 128,
          activation: 'relu',
          hasBias: true
        },
        inputs: ['input_data']
      },
      {
        vertexName: 'layer_2_dense',
        layer: {
          '@class': 'org.deeplearning4j.nn.conf.layers.DenseLayer',
          nIn: 128,
          nOut: 64,
          activation: 'relu',
          hasBias: true
        },
        inputs: ['layer_1_dense']
      },
      {
        vertexName: 'output_layer',
        layer: {
          '@class': 'org.deeplearning4j.nn.conf.layers.OutputLayer',
          nIn: 64,
          nOut: 10,
          activation: 'softmax',
          hasBias: true
        },
        inputs: ['layer_2_dense']
      }
    ]
  };

  // Serialize configuration
  zip.file('configuration.json', JSON.stringify(config, null, 2));

  // Generate synthetic flattened parameters similar to DL4J Nd4j.write output (we don't mimic exact format).
  // We'll store raw Float32Array bytes. The parser will only use presence/size, not content.
  const floatValues: number[] = [];
  for (const v of config.vertices) {
    const l = v.layer;
    if (l.nIn !== undefined && l.nOut !== undefined && l['@class'] !== 'org.deeplearning4j.nn.conf.layers.InputType') {
      // weights
      const weightCount = l.nIn * l.nOut;
      for (let i = 0; i < weightCount; i++) {
        floatValues.push((Math.random() - 0.5) * 0.05);
      }
      // bias
      if (l.hasBias !== false) {
        for (let i = 0; i < l.nOut; i++) {
          floatValues.push((Math.random() - 0.5) * 0.01);
        }
      }
    }
  }

  const weightsArray = new Float32Array(floatValues);
  const weightsBuffer = new Uint8Array(weightsArray.buffer);
  zip.file('coefficients.bin', weightsBuffer);

  // Placeholder updater state (empty) to show optional entry
  zip.file('updaterState.bin', new Uint8Array());

  const blob = await zip.generateAsync({ type: 'blob' });
  return new File([blob], 'sample_dl4j_model.zip', { type: 'application/zip' });
}
