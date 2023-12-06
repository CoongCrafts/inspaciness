import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Button,
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  FormHelperText,
  InputGroup,
  InputRightAddon,
  InputLeftElement,
  Circle,
  IconButton,
} from '@chakra-ui/react';
import { Identicon } from '@polkadot/react-identicon';
import { FormEvent, useEffect } from 'react';
import { toast } from 'react-toastify';
import { isAddress } from '@polkadot/util-crypto';
import { useCall } from '@/hooks/useink/useCall';
import { useTx } from '@/hooks/useink/useTx';
import { useSpaceContext } from '@/providers/SpaceProvider';
import { MemberStatus } from '@/types';
import { messages } from '@/utils/messages';
import { notifyTxStatus } from '@/utils/notifications';
import { AddIcon } from '@chakra-ui/icons';
import { useFormik } from 'formik';
import { pickDecoded, shouldDisableStrict } from 'useink/utils';
import * as yup from 'yup';

const MILLISECS_PER_DAY = 24 * 60 * 60 * 1000;

function InviteMemberButton() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { contract } = useSpaceContext();
  const memberStatusCall = useCall<MemberStatus>(contract, 'memberStatus');
  const grantMembershipTx = useTx(contract, 'grantMembership');

  const formikInviteMember = useFormik({
    initialValues: { address: '', expire: undefined },
    validationSchema: yup.object().shape({
      address: yup.string().test('is_valid_address', 'Invalid address format', (value) => isAddress(value)),
      expire: yup.number().positive('Invalid expire time').integer('Invalid expire time'),
    }),
    onSubmit: (values, formikHelpers) => {
      (async () => {
        const { address, expire: expireAfter } = values;
        if (!isAddress(address)) {
          toast.error('Invalid address format');
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

        if (status === MemberStatus.Active) {
          toast.error('The address is already an active member of the space!');
          formikHelpers.setSubmitting(false);
          return;
        }

        grantMembershipTx.signAndSend([address, expireAfter ? expireAfter * MILLISECS_PER_DAY : null], {}, (result) => {
          if (!result) {
            grantMembershipTx.resetState(formikHelpers);
            return;
          }

          notifyTxStatus(result);

          if (result?.isInBlock) {
            if (result.dispatchError) {
              toast.error(messages.txError);
            } else {
              toast.success('Member invited');
            }

            grantMembershipTx.resetState(formikHelpers);
            onClose();
          }
        });
      })();
    },
  });

  useEffect(() => {
    formikInviteMember.resetForm();
    grantMembershipTx.resetState();
  }, [isOpen]);

  return (
    <>
      <Button
        variant='outline'
        colorScheme='primary'
        size='sm'
        onClick={onOpen}
        display={{ base: 'none', md: 'block' }}>
        Invite
      </Button>
      <IconButton
        aria-label={'Invite'}
        size='sm'
        variant='outline'
        colorScheme='primary'
        onClick={onOpen}
        icon={<AddIcon />}
        display={{ base: 'block', md: 'none' }}
      />
      <Modal isOpen={isOpen} onClose={onClose} size={{ base: 'full', md: 'xl' }}>
        <ModalOverlay />
        <ModalContent
          as={'form'}
          onSubmit={(e) => {
            formikInviteMember.handleSubmit(e as FormEvent<HTMLFormElement>);
          }}>
          <ModalHeader>Invite new member</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl
              mb={4}
              isRequired
              isInvalid={!!formikInviteMember.values.address && !!formikInviteMember.errors.address}>
              <FormLabel>Address</FormLabel>
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
            <FormControl isInvalid={!!formikInviteMember.errors.expire}>
              <FormLabel>Expire after</FormLabel>
              <InputGroup width={{ md: '50%' }}>
                <Input
                  type='number'
                  value={formikInviteMember.values.expire}
                  onChange={formikInviteMember.handleChange}
                  placeholder='e.g: 365'
                  name='expire'
                />
                <InputRightAddon children={'days'} />
              </InputGroup>
              {!!formikInviteMember.errors.expire ? (
                <FormErrorMessage>{formikInviteMember.errors.expire}</FormErrorMessage>
              ) : (
                <FormHelperText>Leave empty for non-expiring membership</FormHelperText>
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
              isLoading={formikInviteMember.isSubmitting || shouldDisableStrict(grantMembershipTx)}
              isDisabled={formikInviteMember.isSubmitting || !formikInviteMember.isValid}>
              Invite
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default InviteMemberButton;
