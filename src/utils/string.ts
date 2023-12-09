import { formatBalance as formatBalancePolka } from '@polkadot/util';
import { encodeAddress } from '@polkadot/util-crypto';
import { NetworkInfo } from '@/types';

export const trimTrailingSlash = (input: string): string => {
  return input.endsWith('/') ? trimTrailingSlash(input.slice(0, -1)) : input;
};

export const shortenAddress = (address?: string): string => {
  if (!address) {
    return '';
  }

  const length = address.length;
  if (length <= 15) {
    return address;
  }

  return `${address.substring(0, 4)}...${address.substring(length - 4, length)}`;
};

export function formatBalance(balance: string, network: NetworkInfo, withUnit = true, withZero = false) {
  balance = balance.replaceAll(',', '');

  return formatBalancePolka(balance, {
    decimals: network.decimals,
    withZero,
    withUnit: withUnit && network.symbol,
  });
}

export function equalAddresses(address01?: string, address02?: string) {
  return !!address01 && !!address02 && encodeAddress(address01) === encodeAddress(address02);
}
