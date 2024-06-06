import { normalize } from 'viem/ens';
import { publicClient } from '../../network/client';
import { GetAvatarReturnType } from '../types';

/**
  * @deprecated Use {@link getEnsAvatar} instead.
  */
export const getAvatar = async (ensName: string): Promise<GetAvatarReturnType> => {
  return await publicClient.getEnsAvatar({
    name: normalize(ensName),
  });
};

export const getEnsAvatar = async (ensName: string): Promise<GetAvatarReturnType> => {
  return await publicClient.getEnsAvatar({
    name: normalize(ensName),
  });
};
