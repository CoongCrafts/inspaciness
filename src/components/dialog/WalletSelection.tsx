import {
  Button,
  ChakraProps,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import { useEffectOnce } from 'react-use';
import { useWalletContext } from '@/providers/WalletProvider';
import { eventEmitter, EventName } from '@/utils/eventemitter';
import Wallet from '@/wallets/Wallet';
import { ThemingProps } from '@chakra-ui/system';

interface WalletButtonProps {
  walletInfo: Wallet;
  afterSelectWallet?: () => void;
}

const WalletButton = ({ walletInfo, afterSelectWallet }: WalletButtonProps) => {
  const { name, id, logo, ready, installed } = walletInfo;
  const { enableWallet } = useWalletContext();

  const connectWallet = () => {
    enableWallet(id);

    afterSelectWallet && afterSelectWallet();
  };

  return (
    <Button
      variant='outline'
      onClick={connectWallet}
      isLoading={installed && !ready}
      isDisabled={!installed}
      loadingText={name}
      size='lg'
      width='full'
      justifyContent='flex-start'
      alignItems='center'
      gap={4}>
      <img src={logo} alt={`${name}`} width={24} />
      <span>{name}</span>
    </Button>
  );
};

interface WalletSelectionProps {
  buttonLabel?: string;
  buttonProps?: ChakraProps & ThemingProps<'Button'>;
}

export default function WalletSelection({ buttonLabel = 'Sign in', buttonProps }: WalletSelectionProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { availableWallets } = useWalletContext();

  useEffectOnce(() => {
    const showPopup = () => onOpen();
    eventEmitter.on(EventName.SHOW_LOGIN_POPUP, showPopup);

    return () => {
      eventEmitter.off(EventName.SHOW_LOGIN_POPUP, showPopup);
    };
  });

  return (
    <>
      <Button size='sm' colorScheme='primary' variant='outline' onClick={onOpen} {...buttonProps}>
        {buttonLabel}
      </Button>
      <Modal onClose={onClose} size='sm' isOpen={isOpen}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Sign in</ModalHeader>
          <ModalCloseButton />
          <ModalBody mb={4}>
            <Text mb={4} fontSize='xl'>
              Connect to your wallet to sign in
            </Text>
            <Stack>
              {availableWallets.map((one) => (
                <WalletButton key={one.id} walletInfo={one} afterSelectWallet={onClose} />
              ))}
            </Stack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
