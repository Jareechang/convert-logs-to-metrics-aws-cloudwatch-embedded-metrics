import { APIGatewayProxyEvent } from 'aws-lambda';
import crypto from 'crypto';
import config from '@app/config';
import { VerifySignatureError } from '@app/errors';

/*
 *
 * Verify the generated signature and the signature in the header matches
 *
 * **/
export default function verifySignature(
  event: APIGatewayProxyEvent
): void {
  const headerSignature: string = event?.headers[config.webhook.signature.header] ?? '';
  const hash = crypto.createHmac(
    config.webhook.signature.algo,
    config.webhook.signature.secret
  )
  .update(event?.body ?? '')
  .digest('hex');
  const generatedSignature = `${config.webhook.signature.algo}=${hash}`;
  if (generatedSignature !== headerSignature) {
    const error: Error = new VerifySignatureError('Signature Mis-match')
      .setOperation('utils/verifySignature')
      .setContext({
        generatedSignature,
        headerSignature,
        'config.webhook.signature.header': config.webhook.signature.header,
        'config.webhook.signature.algo': config.webhook.signature.algo
      });
    throw error;
  }
}
