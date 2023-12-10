import { Button } from '@chakra-ui/react';
import { toast } from 'react-toastify';
import { useTx } from '@/hooks/useink/useTx';
import { usePollsContext } from '@/pages/plugins/Polls/PollsProvider';
import { Props } from '@/types';
import { messages } from '@/utils/messages';
import { notifyTxStatus } from '@/utils/notifications';
import { shouldDisableStrict } from 'useink/utils';

interface VoteButtonProps extends Props {
  pollId: number;
  optionIndex?: number;
  label?: string;
}

export default function VoteButton({ pollId, optionIndex, label = 'Vote' }: VoteButtonProps) {
  const { contract } = usePollsContext();
  const voteTx = useTx(contract, 'vote');

  const doVote = () => {
    voteTx.signAndSend([pollId, optionIndex], undefined, (result) => {
      if (!result) {
        voteTx.resetState();
        return;
      }

      notifyTxStatus(result);

      if (result.isInBlock) {
        if (result.dispatchError) {
          toast.error(messages.txError);
        } else {
          toast.success('Voted!');
        }
      }

      voteTx.resetState();
    });
  };

  const isDisabled = optionIndex === undefined;

  return (
    <Button
      onClick={doVote}
      size='sm'
      variant={isDisabled ? 'outline' : 'solid'}
      colorScheme='primary'
      minWidth={20}
      isLoading={shouldDisableStrict(voteTx)}
      isDisabled={isDisabled}>
      {label}
    </Button>
  );
}
