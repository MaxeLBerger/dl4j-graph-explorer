package ai.maxe.dl4j.service;

import org.deeplearning4j.nn.conf.MultiLayerConfiguration;
import org.deeplearning4j.nn.conf.NeuralNetConfiguration;
import org.deeplearning4j.nn.conf.layers.DenseLayer;
import org.deeplearning4j.nn.conf.layers.OutputLayer;
import org.deeplearning4j.nn.graph.ComputationGraph;
import org.deeplearning4j.nn.multilayer.MultiLayerNetwork;
import org.deeplearning4j.util.ModelSerializer;
import org.nd4j.linalg.activations.Activation;
import org.nd4j.linalg.api.ndarray.INDArray;
import org.nd4j.linalg.factory.Nd4j;
import org.nd4j.linalg.lossfunctions.LossFunctions;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class ModelRegistry {

    public static class LoadedModel {
        public final String id;
        public final String type; // GRAPH or MULTILAYER
        public final ComputationGraph graph;
        public final MultiLayerNetwork net;
        public final List<String> inputNames;
        public final List<String> outputNames;

        public LoadedModel(String id, ComputationGraph graph) {
            this.id = id;
            this.type = "GRAPH";
            this.graph = graph;
            this.net = null;
            this.inputNames = Arrays.asList(graph.getConfiguration().getNetworkInputs().toArray(new String[0]));
            this.outputNames = Arrays.asList(graph.getConfiguration().getNetworkOutputs().toArray(new String[0]));
        }

        public LoadedModel(String id, MultiLayerNetwork net) {
            this.id = id;
            this.type = "MULTILAYER";
            this.graph = null;
            this.net = net;
            this.inputNames = Collections.singletonList("input");
            this.outputNames = Collections.singletonList("output");
        }
    }

    private final Map<String, LoadedModel> models = new ConcurrentHashMap<>();

    public LoadedModel load(File zipFile) throws IOException {
        try {
            ComputationGraph g = ModelSerializer.restoreComputationGraph(zipFile);
            String id = UUID.randomUUID().toString();
            LoadedModel lm = new LoadedModel(id, g);
            models.put(id, lm);
            return lm;
        } catch (Exception e) {
            MultiLayerNetwork n = ModelSerializer.restoreMultiLayerNetwork(zipFile);
            String id = UUID.randomUUID().toString();
            LoadedModel lm = new LoadedModel(id, n);
            models.put(id, lm);
            return lm;
        }
    }

    public LoadedModel createSample() {
        MultiLayerConfiguration conf = new NeuralNetConfiguration.Builder()
            .activation(Activation.RELU)
            .list()
            .layer(new DenseLayer.Builder().nIn(4).nOut(3).build())
            .layer(new OutputLayer.Builder(LossFunctions.LossFunction.NEGATIVELOGLIKELIHOOD)
                .activation(Activation.SOFTMAX)
                .nIn(3).nOut(3).build())
            .build();

        MultiLayerNetwork net = new MultiLayerNetwork(conf);
        net.init();
        
        String id = UUID.randomUUID().toString();
        LoadedModel lm = new LoadedModel(id, net);
        models.put(id, lm);
        return lm;
    }

    public Optional<LoadedModel> get(String id) {
        return Optional.ofNullable(models.get(id));
    }

    public void remove(String id) {
        models.remove(id);
    }

    public Map<String, Object> meta(LoadedModel m) {
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("id", m.id);
        res.put("type", m.type);
        res.put("inputs", m.inputNames);
        res.put("outputs", m.outputNames);
        res.put("numLayers", m.type.equals("GRAPH") ? m.graph.getNumLayers() : m.net.getnLayers());
        return res;
    }

    public double[] infer(LoadedModel m, Map<String, double[]> inputMap) {
        if (m.type.equals("GRAPH")) {
            INDArray[] inputs = m.inputNames.stream()
                    .map(name -> {
                        double[] v = inputMap.getOrDefault(name, new double[0]);
                        return Nd4j.create(v).reshape(1, v.length);
                    })
                    .toArray(INDArray[]::new);
            INDArray out = m.graph.outputSingle(inputs);
            return out.toDoubleVector();
        } else {
            double[] input = inputMap.getOrDefault("input", new double[0]);
            INDArray in = Nd4j.create(input).reshape(1, input.length);
            INDArray out = m.net.output(in);
            return out.toDoubleVector();
        }
    }
}
