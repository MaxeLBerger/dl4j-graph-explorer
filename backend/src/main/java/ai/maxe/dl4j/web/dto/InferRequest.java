package ai.maxe.dl4j.web.dto;

import jakarta.validation.constraints.NotEmpty;
import java.util.Map;

public class InferRequest {
    @NotEmpty
    public Map<String, double[]> inputs;
}
