import { useState } from 'react';
import useContractState from '@/hooks/useContractState';
import { Ordering, Pagination } from '@/types';
import { stringToNum } from '@/utils/number';
import { ChainContract } from 'useink';

export default function usePagination<T>(
  contract: ChainContract | undefined,
  paginationMessage: string,
  recordPerPage: number,
  descending = false,
  nonce = 0,
) {
  const [pageIndex, setPageIndex] = useState(1);

  // Nonce only for descending
  let args: unknown[];
  if (descending) {
    args = [nonce - (pageIndex - 1) * recordPerPage, recordPerPage, Ordering.Descending];
  } else {
    args = [(pageIndex - 1) * recordPerPage, recordPerPage];
  }

  const { state: page } = useContractState<Pagination<T>>(contract, paginationMessage, args);

  const { items, total } = page || {};
  const numberOfPage = stringToNum(total) ? Math.ceil(parseInt(total!) / recordPerPage) : 1;

  return {
    pageIndex,
    setPageIndex,
    numberOfPage,
    items,
    total: stringToNum(total) || 0,
    hasNextPage: page?.hasNextPage,
  };
}
