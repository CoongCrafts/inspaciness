import { useState } from 'react';
import useContractState from '@/hooks/useContractState';
import { Pagination } from '@/types';
import { stringToNum } from '@/utils/number';
import { ChainContract } from 'useink';

export default function usePagination<T>(
  contract: ChainContract | undefined,
  paginationMessage: string,
  recordPerPage: number,
  reCallOnBlockNumber = true,
) {
  const [pageIndex, setPageIndex] = useState(1);
  const { state: page } = useContractState<Pagination<T>>(
    contract,
    paginationMessage,
    [(pageIndex - 1) * recordPerPage, recordPerPage],
    true,
    reCallOnBlockNumber,
  );

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
