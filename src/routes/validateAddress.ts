import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { parseAddressRequest } from '../schemas/validateAddress.js';
import { validateAddressWithGoogle } from '../services/googleAddressValidation.js';
import { getAddressSuggestions } from '../services/googlePlacesAutocomplete.js';
import { standardizeAddress } from '../domain/addressStandardizer.js';
import { assessDeliverability, DeliverabilityIssue } from '../domain/deliverability.js';

const validateAddressRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  // POST /validate-address: free-form US address -> standardized fields + deliverability verdict.
  app.post('/validate-address', async (request, reply) => {
    if (typeof request.body !== 'string' || request.body.trim() === '') {
      return reply.status(400).send({
        error: 'INVALID_REQUEST',
        message: 'address is required',
      });
    }
    const address = request.body.trim();

    try {
      const googleResult = await validateAddressWithGoogle(address);
      const standardized = standardizeAddress(googleResult);
      const deliverability = assessDeliverability(googleResult);

      const knownIssues: DeliverabilityIssue[] = ['INSUFFICIENT_ADDRESS', 'UNCONFIRMED_COMPONENTS', 'DPV_NOT_CONFIRMED'];

      const shouldFetchSuggestions =
        !deliverability.isDeliverable &&
        deliverability.issues.some((issue) => knownIssues.includes(issue));

      const suggestions = shouldFetchSuggestions ? await getAddressSuggestions(address) : [];

      console.log('\nGOOGLE RESULT', googleResult);
      console.log('\nSTANDARDIZED', standardized);
      console.log('\nDELIVERABILITY', deliverability);
      console.log('\nSUGGESTIONS', suggestions);

      const responsePayload = {
        input: address,
        formattedAddress: googleResult.address?.formattedAddress,
        isDeliverable: deliverability.isDeliverable,
        standardized,
        metadata: {
          zipPlus4: standardized.zipPlus4,
          dpvConfirmation: deliverability.dpvConfirmation,
          dpvFootnotes: deliverability.dpvFootnotes,
          missingSecondary: deliverability.missingSecondary,
        },
        issues: deliverability.issues,
        suggestions,
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

