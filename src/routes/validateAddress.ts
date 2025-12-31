import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { validateAddressRequestSchema } from '../schemas/validateAddress.js';
import { validateAddressWithGoogle } from '../services/googleAddressValidation.js';
import { standardizeAddress } from '../domain/addressStandardizer.js';
import { assessDeliverability } from '../domain/deliverability.js';

const validateAddressRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  // POST /validate-address: free-form US address -> standardized fields + deliverability verdict.
  app.post('/validate-address', async (request, reply) => {
    const parseResult = validateAddressRequestSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: 'INVALID_REQUEST',
        message: parseResult.error.errors.map((e) => e.message).join(', '),
      });
    }

    const address = parseResult.data;

    try {
      const googleResult = await validateAddressWithGoogle(address);
      const standardized = standardizeAddress(googleResult);
      const deliverability = assessDeliverability(googleResult);

      console.log('googleResult', googleResult);
      console.log('standardized', standardized);
      console.log('deliverability', deliverability);

      const responsePayload = {
        input: address,
        isDeliverable: deliverability.isDeliverable,
        standardized,
        metadata: {
          zipPlus4: standardized.zipPlus4,
          dpvConfirmation: deliverability.dpvConfirmation,
          dpvFootnotes: deliverability.dpvFootnotes,
          missingSecondary: deliverability.missingSecondary,
        },
        issues: deliverability.issues,
      };

      if (deliverability.isDeliverable) {
        return reply.status(200).send(responsePayload);
      }

      return reply.status(422).send(responsePayload);
    } catch (err) {
      request.log.error({ err }, 'Address validation failed');
      return reply.status(502).send({
        error: 'UPSTREAM_ERROR',
        message: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  });
};

export default validateAddressRoutes;

