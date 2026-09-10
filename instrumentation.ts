import { registerOTel } from "@vercel/otel";
import { InstanaExporter } from "@instana/opentelemetry-exporter";

export function register() {
  if (!process.env.INSTANA_AGENT_KEY || !process.env.INSTANA_ENDPOINT_URL) {
    return;
  }

  registerOTel({
    serviceName: "my-ai-app",
    traceExporter: new InstanaExporter(),
  });
}
