import env from '@/utils/env';

export const pinData = async (data: string) => {
  if (!env.pinUrl || !env.pinSecret) return;

  const response = await fetch(env.pinUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + env.pinSecret,
    },
    body: JSON.stringify({ data }),
  });

  if (!response.ok) return;
  return (await response.json()).IpfsHash;
};

export const unpinData = async (cid: string) => {
  if (!env.pinUrl || !env.pinSecret) return;

  const response = await fetch(env.unpinUrl + cid, {
    method: 'DELETE',
    headers: {
      Authorization: 'Bearer ' + env.pinSecret,
    },
  });

  return response.ok;
};

export const getData = async (cid: string) => {
  const response = await fetch(env.ipfsGateway + cid);

  if (!response.ok) return;
  return (await response.json()).data;
};
