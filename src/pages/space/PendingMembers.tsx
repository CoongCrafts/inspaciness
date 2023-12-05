import { Flex, Tag, Text, IconButton, Button } from '@chakra-ui/react';
import { Identicon } from '@polkadot/react-identicon';
import { useState } from 'react';
import { toast } from 'react-toastify';
import useCurrentFreeBalance from '@/hooks/space/useCurrentFreeBalance';
import usePagination from '@/hooks/usePagination';
import { useTx } from '@/hooks/useink/useTx';
import { useSpaceContext } from '@/providers/SpaceProvider';
import { MembershipRequest, RequestApproval } from '@/types';
import { fromNow } from '@/utils/date';
import { messages } from '@/utils/messages';
import { shortenAddress } from '@/utils/string';
import { AddIcon, CheckIcon, ChevronLeftIcon, ChevronRightIcon, CloseIcon } from '@chakra-ui/icons';
import { shouldDisable } from 'useink/utils';

const RECORD_PER_PAGE = 9;

export default function PendingMembers() {
  const { pendingRequestsCount, contract } = useSpaceContext();
  const submitRequestApprovalsTx = useTx(contract, 'submitRequestApprovals');
  const [requestApprovals, setRequestApprovals] = useState<RequestApproval[]>([]);
  const { pageIndex, setPageIndex, numberOfPage, items } = usePagination<MembershipRequest>(
    contract,
    'pendingRequests',
    RECORD_PER_PAGE,
  );
  const freeBalance = useCurrentFreeBalance();

  const submitApprovals = (requestApprovals: RequestApproval[]) => {
    if (requestApprovals.length === 0) {
      return;
    }

    if (freeBalance === 0) {
      toast.error(messages.insufficientBalance);
      return;
    }

    submitRequestApprovalsTx.signAndSend([requestApprovals], {}, (result) => {
      if (result?.isInBlock) {
        if (result.dispatchError) {
          toast.error(result.dispatchError.toString());
        } else {
          toast.success('Approved');
        }
      }

      setRequestApprovals([]);
    });
  };

  const handleSelect = (requestApproval: RequestApproval) => {
    setRequestApprovals((prevState) => {
      const index = prevState.findIndex(([address]) => address === requestApproval[0]);
      if (index >= 0) {
        if (requestApproval[1] === prevState[index][1]) {
          return prevState.toSpliced(index, 1);
        }
        return prevState.toSpliced(index, 1, requestApproval);
      }
      return [...prevState, requestApproval];
    });
  };

  return (
    <Flex flexDirection='column'>
      <Flex justifyContent='space-between' gap={4}>
        <Flex alignItems='center' gap={2}>
          <Text fontSize={{ md: 'xl' }} fontWeight='semibold'>
            Pending Membership Requests
          </Text>
          <Tag size='sm'>{pendingRequestsCount}</Tag>
        </Flex>
        <Button
          variant='outline'
          colorScheme='primary'
          size='sm'
          onClick={() => submitApprovals(requestApprovals)}
          isDisabled={requestApprovals.length === 0 || shouldDisable(submitRequestApprovalsTx)}
          display={{ base: 'none', md: 'block' }}>
          Submit Approvals
        </Button>
        <IconButton
          onClick={() => submitApprovals(requestApprovals)}
          aria-label={'Submit'}
          icon={<AddIcon />}
          isDisabled={requestApprovals.length === 0 || shouldDisable(submitRequestApprovalsTx)}
          display={{ base: 'block', md: 'none' }}
        />
      </Flex>
      <Flex mt={4} flexDirection='column' gap={2} flexGrow={1}>
        {items?.map((one) => (
          <Flex
            p={2}
            alignItems='center'
            borderStyle='solid'
            borderWidth={1}
            borderColor='chakra-border-color'
            justifyContent='space-between'
            flexGrow={1}>
            <Flex alignItems='center' gap={2}>
              <Flex px={2} alignItems='center'>
                <Identicon value={one.who} size={30} theme='polkadot' />
              </Flex>
              <Flex flexDir='column'>
                <Text fontWeight='semibold' color='dimgray'>
                  {shortenAddress(one.who)}
                </Text>
                <Text fontSize='xs' color='darkgray'>{`Requested ${fromNow(one.requestedAt.toString())}`}</Text>
              </Flex>
            </Flex>
            <Flex gap={2} px={1}>
              <IconButton
                onClick={() => handleSelect([one.who, true])}
                colorScheme={
                  requestApprovals.some(([address, isApprove]) => address === one.who && isApprove) ? 'green' : 'gray'
                }
                aria-label={'Approve'}
                icon={<CheckIcon />}
                isRound={true}
              />
              <IconButton
                onClick={() => handleSelect([one.who, false])}
                colorScheme={
                  requestApprovals.some(([address, isApprove]) => address === one.who && !isApprove) ? 'red' : 'gray'
                }
                aria-label={'Refuse'}
                icon={<CloseIcon />}
                isRound={true}
              />
            </Flex>
          </Flex>
        ))}
      </Flex>
      <Flex mt={4} justifyContent={'space-between'} alignItems='center' gap={2}>
        <Text fontSize='sm'>{`Page ${pageIndex}/${numberOfPage}`}</Text>
        <Flex alignItems='center' gap={2}>
          <IconButton
            onClick={() => setPageIndex((pre) => pre - 1)}
            aria-label='Back'
            size='sm'
            icon={<ChevronLeftIcon fontSize='1.2rem' />}
            isDisabled={pageIndex === 1}
          />
          <IconButton
            onClick={() => setPageIndex((pre) => pre + 1)}
            aria-label='Next'
            size='sm'
            icon={<ChevronRightIcon fontSize='1.2rem' />}
            isDisabled={pageIndex === numberOfPage}
          />
        </Flex>
      </Flex>
    </Flex>
  );
}
