# DL4J Graph Explorer

DL4J Graph Explorer is a read-only visualization tool for DeepLearning4J (DL4J) computational graph models. It lets you:

* Import DL4J JSON or ZIP model exports
* Inspect layer topology (inbound/outbound connections)
* View per-layer parameter counts
* Explore simulated weight statistics (histograms, mean, std dev) – real weight parsing coming soon
* Navigate between a graph view and a tabular weight overview

## Tech Stack

* React + Vite
* TypeScript
* Tailwind CSS + Radix UI primitives
* D3.js for graph layout

## Key Principles

* Local-first: no external backend, all data persisted in `localStorage`
* Read-only: no training, mutation, or inference
* Fast import feedback with an import summary
* Accessible, keyboard-friendly UI components

## Planned Enhancements

* Parse real weight arrays from DL4J ZIP (`coefficients.bin`) if feasible in-browser
* Export lightweight JSON report of model structure and stats
* Dark mode toggle
* Graph layout presets (hierarchical, force-directed, compact)

## Development

Install dependencies and start the dev server:

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

## License

MIT
