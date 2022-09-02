import { createMetricsLogger, Unit } from "aws-embedded-metrics";
import { ErrorLogDetails } from '@app/types';
import asyncLocalStorage from '@app/utils/async-local-storage';

const sendErrorMetrics = async (
  properties: Record<string, any>
): Promise<void> => {
  const requestId: string = asyncLocalStorage.getStore().get('awsRequestId');
  const metrics = createMetricsLogger();
  metrics.setProperty('requestId', requestId);
  // Add custom k/v of properties into the embedded metric logs
  for (let key in properties) {
    metrics.setProperty(key, properties[key]);
  }
  metrics.putDimensions({ Service: "Aggregator" });
  metrics.putMetric("Error", 1, Unit.Count);
  metrics.setNamespace("Webhook-Service");
  await metrics.flush();
};

export default sendErrorMetrics;
