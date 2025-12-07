# Backend Service

This is the Spring Boot backend for the DL4J Graph Explorer. It provides endpoints for model inference using Deeplearning4j.

## Prerequisites

- Java 17 or higher
- Maven (included in `maven/` folder if not installed globally)

## Running the Backend

1. Open a terminal in the `backend` directory.
2. Build the project:
   ```powershell
   & ".\maven\apache-maven-3.9.11\bin\mvn.cmd" clean package
   ```
3. Run the application:
   ```powershell
   java -jar target/dl4j-inference-api-0.1.0.jar
   ```
   The server will start on port **8089**.

## API Endpoints

- **POST /api/models**: Upload a DL4J model (ZIP file).
- **POST /api/models/sample**: Create and load a sample model for testing.
- **GET /api/models/{id}/meta**: Get metadata for a loaded model.
- **POST /api/models/{id}/infer**: Run inference.
  - Body: `{ "inputs": { "input": [1.0, 2.0, ...] } }`

## Testing

You can test the backend using the sample model endpoint:

```powershell
# Create sample model
$r = Invoke-RestMethod -Uri "http://localhost:8089/api/models/sample" -Method Post
$id = $r.id

# Run inference
$body = @{ inputs = @{ input = @(1.0, 2.0, 3.0, 4.0) } } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:8089/api/models/$id/infer" -Method Post -Body $body -ContentType "application/json"
```
