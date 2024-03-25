import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import { useEffect } from 'react';
import { toast } from 'react-toastify';
import useCurrentFreeBalance from '@/hooks/space/useCurrentFreeBalance';
import { useTx } from '@/hooks/useink/useTx';
import { useSpaceContext } from '@/pages/space/0.1.x/SpaceProvider';
import { messages } from '@/utils/messages';
import { notifyTxStatus } from '@/utils/notifications';
import { shouldDisableStrict } from 'useink/utils';

export default function LeaveSpaceButton() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { contract, info } = useSpaceContext();
  const leaveSpaceTx = useTx(contract, 'leave');
  const freeBalance = useCurrentFreeBalance();

  const doLeave = async () => {
    if (freeBalance === 0) {
      toast.error(messages.insufficientBalance);
      return;
    }

    leaveSpaceTx.signAndSend([], {}, (result) => {
      if (!result) {
        leaveSpaceTx.resetState();
        return;
      }

      notifyTxStatus(result);

      if (result?.isInBlock) {
        if (result.dispatchError) {
          toast.error(messages.txError);
        } else {
          toast.success('You left the space');
        }

        leaveSpaceTx.resetState();
        onClose();
      }
    });
  };

  useEffect(() => {
    leaveSpaceTx.resetState();
  }, [isOpen]);

  return (
    <>
      <Text onClick={onOpen} width='100%' textAlign='left'>
        Leave
      </Text>
      <Modal isOpen={isOpen} onClose={onClose} size={{ base: 'full', md: 'md' }}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Leaving {info?.name}?</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            Please confirm to leave <b>{info?.name}</b>, this action cannot be undone.
          </ModalBody>
          <ModalFooter gap={2}>
            <Button variant='outline' onClick={onClose}>
              Cancel
            </Button>
            <Button type='submit' onClick={doLeave} colorScheme='red' isLoading={shouldDisableStrict(leaveSpaceTx)}>
              Leave
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
