import { useEffect, useState } from 'react';
import { getAttestations } from '../getAttestations';
import { Attestation, UseAttestations } from '../types';

/**
 * Fetches EAS Attestations for a given address, chain, and schemaId.
 */
export function useAttestations({ address, chain, schemaId }: UseAttestations): Attestation[] {
  const [attestations, setAttestations] = useState<Attestation[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const foundAttestations = await getAttestations(address, chain, {
        schemas: [schemaId],
      });
      setAttestations(foundAttestations);
    };
    fetchData();
  }, [address, chain, schemaId]);

  return attestations;
}
