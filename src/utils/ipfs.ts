import env from '@/utils/env';
import { messages } from '@/utils/messages';

export const pinData = async (data: string) => {
  if (!env.pinUrl || !env.pinSecret) {
    throw new Error('Pin API not configured');
  }

  const response = await fetch(env.pinUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + env.pinSecret,
    },
    body: JSON.stringify({ data }),
  });

  if (!response.ok) {
    throw new Error(messages.cannotPinData);
  }

  return (await response.json()).IpfsHash;
};

export const unpinData = async (cid: string) => {
  if (!env.pinUrl || !env.pinSecret) {
    throw new Error('Pin API not configured');
  }

  const response = await fetch(env.unpinUrl + cid, {
    method: 'DELETE',
    headers: {
      Authorization: 'Bearer ' + env.pinSecret,
    },
  });

  if (!response.ok) {
    throw new Error(messages.cannotUnpinData);
  }
};

export const getData = async (cid: string) => {
  const response = await fetch(env.ipfsGateway + cid);

  if (!response.ok) {
    throw new Error(messages.cannotFetchData);
  }

  return (await response.json()).data;
};
