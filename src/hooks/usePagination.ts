import { useMemo, useState } from 'react';
import useContractState from '@/hooks/useContractState';
import { Ordering, Pagination } from '@/types';
import { stringToNum } from '@/utils/number';
import { ChainContract } from 'useink';

export default function usePagination<T>(
  contract: ChainContract | undefined,
  paginationMessage: string,
  recordPerPage: number,
) {
  const [pageIndex, setPageIndex] = useState(1);
  const { state: page } = useContractState<Pagination<T>>(
    contract,
    paginationMessage,
    useMemo(() => [(pageIndex - 1) * recordPerPage, recordPerPage, { Descending: ['12'] }], [pageIndex, recordPerPage]),
  );

  console.log([(pageIndex - 1) * recordPerPage, recordPerPage, { Descending: ['12'] }]);
  console.log(page);

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
