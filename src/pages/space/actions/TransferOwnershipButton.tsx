import {
  Button,
  Circle,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  InputGroup,
  InputLeftElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from '@chakra-ui/react';
import { Identicon } from '@polkadot/react-identicon';
import { FormEvent, useEffect } from 'react';
import { toast } from 'react-toastify';
import { isAddress } from '@polkadot/util-crypto';
import useCurrentFreeBalance from '@/hooks/space/useCurrentFreeBalance';
import { useCall } from '@/hooks/useink/useCall';
import { useTx } from '@/hooks/useink/useTx';
import { useSpaceContext } from '@/providers/SpaceProvider';
import { MemberStatus } from '@/types';
import { messages } from '@/utils/messages';
import { notifyTxStatus } from '@/utils/notifications';
import { equalAddresses } from '@/utils/string';
import { useFormik } from 'formik';
import { pickDecoded, shouldDisableStrict } from 'useink/utils';
import * as yup from 'yup';

export default function TransferOwnershipButton() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { contract, ownerAddress } = useSpaceContext();
  const memberStatusCall = useCall<MemberStatus>(contract, 'memberStatus');
  const transferOwnershipTx = useTx(contract, 'transferOwnership');
  const freeBalance = useCurrentFreeBalance();

  const formikInviteMember = useFormik({
    initialValues: { address: '' },
    validationSchema: yup.object().shape({
      address: yup.string().test('is_valid_address', 'Invalid address format', (value) => isAddress(value)),
    }),
    onSubmit: (values, formikHelpers) => {
      (async () => {
        if (freeBalance === 0) {
          toast.error(messages.insufficientBalance);
          formikHelpers.setSubmitting(false);
          return;
        }

        const { address } = values;
        if (!isAddress(address)) {
          toast.error('Invalid address format');
          formikHelpers.setSubmitting(false);
          return;
        }

        if (ownerAddress && equalAddresses(ownerAddress, address)) {
          toast.error(`${address} is currently the owner of the space`);
          formikHelpers.setSubmitting(false);
          return;
        }

        const result = await memberStatusCall.send([address]);
        const status = pickDecoded(result);
        if (!status) {
          toast.error('Cannot check member status of the address');
          formikHelpers.setSubmitting(false);
          return;
        }

        if (status !== MemberStatus.Active) {
          toast.error('Can only transfer ownership to an active member!');
          formikHelpers.setSubmitting(false);
          return;
        }

        transferOwnershipTx.signAndSend([address], {}, (result) => {
          if (!result) {
            transferOwnershipTx.resetState(formikHelpers);
            return;
          }

          notifyTxStatus(result);

          if (result?.isInBlock) {
            if (result.dispatchError) {
              toast.error(messages.txError);
            } else {
              toast.success('Ownership transferred');
            }

            transferOwnershipTx.resetState(formikHelpers);
            onClose();
          }
        });
      })();
    },
  });

  useEffect(() => {
    formikInviteMember.resetForm();
    transferOwnershipTx.resetState();
  }, [isOpen]);

  return (
    <>
      <Button colorScheme='red' onClick={onOpen}>
        Transfer Ownership
      </Button>
      <Modal isOpen={isOpen} onClose={onClose} size={{ base: 'full', md: 'xl' }}>
        <ModalOverlay />
        <ModalContent
          as={'form'}
          onSubmit={(e) => {
            formikInviteMember.handleSubmit(e as FormEvent<HTMLFormElement>);
          }}>
          <ModalHeader>Transfer Ownership</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl
              mb={4}
              isRequired
              isInvalid={!!formikInviteMember.values.address && !!formikInviteMember.errors.address}>
              <FormLabel>New owner address</FormLabel>
              <InputGroup>
                <InputLeftElement px='auto'>
                  {!!formikInviteMember.values.address && !formikInviteMember.errors.address ? (
                    <Identicon value={formikInviteMember.values.address} theme='polkadot' size={24} />
                  ) : (
                    <Circle bg='#ddd' size={6}></Circle>
                  )}
                </InputLeftElement>
                <Input
                  value={formikInviteMember.values.address}
                  onChange={formikInviteMember.handleChange}
                  placeholder='4INSPACE120321...'
                  name='address'
                />
              </InputGroup>
              {!!formikInviteMember.values.address && !!formikInviteMember.errors.address && (
                <FormErrorMessage>{formikInviteMember.errors.address}</FormErrorMessage>
              )}
            </FormControl>
          </ModalBody>
          <ModalFooter gap='0.5rem'>
            <Button variant='outline' onClick={onClose}>
              Cancel
            </Button>
            <Button
              type='submit'
              colorScheme='primary'
              isLoading={formikInviteMember.isSubmitting || shouldDisableStrict(transferOwnershipTx)}
              isDisabled={formikInviteMember.isSubmitting || !formikInviteMember.isValid}>
              Transfer
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
