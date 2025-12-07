package ai.maxe.dl4j.web;

import ai.maxe.dl4j.service.ModelRegistry;
import ai.maxe.dl4j.web.dto.InferRequest;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ModelController {

    private final ModelRegistry registry;

    public ModelController(ModelRegistry registry) {
        this.registry = registry;
    }

    @PostMapping(value = "/models", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> upload(@RequestPart("file") MultipartFile file) throws IOException {
        File temp = File.createTempFile("dl4j-model", ".zip");
        file.transferTo(temp);
        var loaded = registry.load(temp);
        Map<String, Object> res = new HashMap<>();
        res.put("id", loaded.id);
        res.put("meta", registry.meta(loaded));
        return ResponseEntity.ok(res);
    }

    @PostMapping("/models/sample")
    public ResponseEntity<?> createSample() {
        var loaded = registry.createSample();
        Map<String, Object> res = new HashMap<>();
        res.put("id", loaded.id);
        res.put("meta", registry.meta(loaded));
        return ResponseEntity.ok(res);
    }

    @GetMapping("/models/{id}/meta")
    public ResponseEntity<?> meta(@PathVariable("id") String id) {
        return registry.get(id)
                .map(registry::meta)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/models/{id}")
    public ResponseEntity<?> delete(@PathVariable("id") String id) {
        registry.remove(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/models/{id}/infer")
    public ResponseEntity<?> infer(@PathVariable("id") String id, @Validated @RequestBody InferRequest req) {
        var opt = registry.get(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        // Convenience: if client sends branchA/branchB keys, pass them through as-is
        Map<String, double[]> inputs = req.inputs;
        var out = registry.infer(opt.get(), inputs);
        Map<String, Object> res = new HashMap<>();
        res.put("output", out);
        return ResponseEntity.ok(res);
    }
}
