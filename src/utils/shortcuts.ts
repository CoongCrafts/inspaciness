import { AlephTestnet, ChainId } from 'useink/chains';

interface Shortcut {
  chainId: ChainId;
  spaceAddress: string;
}

export const SHORTCUTS: Record<string, Shortcut> = {
  InSpaceDAO: {
    chainId: AlephTestnet.id,
    spaceAddress: '5HmQUVoD4WfWMoRifYaTGeQaBdKJznvoNLUsRLzQLU6Voijb',
  },
};

export const findShortcut = (path: string) => {
  const cleanPath = path.toLowerCase().trim();
  const foundPath = Object.keys(SHORTCUTS).find((x) => x.toLowerCase() === cleanPath);
  return foundPath && SHORTCUTS[foundPath];
};
