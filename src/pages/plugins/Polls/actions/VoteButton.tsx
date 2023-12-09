import { Button } from '@chakra-ui/react';
import { toast } from 'react-toastify';
import { useTx } from '@/hooks/useink/useTx';
import { usePollsContext } from '@/pages/plugins/Polls/PollsProvider';
import { Props } from '@/types';
import { messages } from '@/utils/messages';
import { notifyTxStatus } from '@/utils/notifications';

interface VoteButtonProps extends Props {
  pollId: number;
  optionIndex: number;
}

export default function VoteButton({ pollId, optionIndex }: VoteButtonProps) {
  const { contract } = usePollsContext();
  const voteTx = useTx(contract, 'vote');

  const doVote = () => {
    voteTx.signAndSend([pollId, optionIndex], undefined, (result) => {
      if (!result) {
        return;
      }

      notifyTxStatus(result);

      if (result.isInBlock) {
        if (result.dispatchError) {
          toast.error(messages.txError);
        } else {
          toast.success('Vote success');
        }
      }

      voteTx.resetState();
    });
  };

  return (
    <Button onClick={doVote} size='sm' colorScheme='primary' minWidth={20}>
      Vote
    </Button>
  );
}
