declare module "@instana/opentelemetry-exporter" {
  import type { Configuration } from "@vercel/otel";

  type TraceExporter = Exclude<
    Configuration["traceExporter"],
    string | undefined
  >;

  type InstanaExporterOptions = {
    agentKey?: string;
    endpointUrl?: string;
  };

  export class InstanaExporter {
    constructor(options?: InstanaExporterOptions);

    export: TraceExporter["export"];
    shutdown: TraceExporter["shutdown"];
    forceFlush?: TraceExporter["forceFlush"];
  }
}
