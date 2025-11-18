import JSZip from 'jszip';

export async function createSampleModelFile(): Promise<File> {
  const zip = new JSZip();
  
  const config = {
    "vertices": [
      {
        "vertexName": "input_data",
        "layer": {
          "@class": "org.deeplearning4j.nn.conf.layers.InputType",
          "nIn": 784,
          "nOut": 784,
          "type": "Input"
        },
        "inputs": []
      },
      {
        "vertexName": "layer_1_dense",
        "layer": {
          "@class": "org.deeplearning4j.nn.conf.layers.DenseLayer",
          "nIn": 784,
          "nOut": 128,
          "activation": "relu",
          "hasBias": true
        },
        "inputs": ["input_data"]
      },
      {
        "vertexName": "layer_2_dense",
        "layer": {
          "@class": "org.deeplearning4j.nn.conf.layers.DenseLayer",
          "nIn": 128,
          "nOut": 64,
          "activation": "relu",
          "hasBias": true
        },
        "inputs": ["layer_1_dense"]
      },
      {
        "vertexName": "output_layer",
        "layer": {
          "@class": "org.deeplearning4j.nn.conf.layers.OutputLayer",
          "nIn": 64,
          "nOut": 10,
          "activation": "softmax",
          "hasBias": true
        },
        "inputs": ["layer_2_dense"]
      }
    ]
  };

  zip.file("configuration.json", JSON.stringify(config, null, 2));
  
  const blob = await zip.generateAsync({ type: "blob" });
  return new File([blob], "sample_dl4j_model.zip", { type: "application/zip" });
}
