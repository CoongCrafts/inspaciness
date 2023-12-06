import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  useDisclosure,
  FormControl,
  FormLabel,
  Input,
  FormHelperText,
  Text,
  FormErrorMessage,
} from '@chakra-ui/react';
import { FormEvent, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useTx } from '@/hooks/useink/useTx';
import { useSpaceContext } from '@/providers/SpaceProvider';
import { messages } from '@/utils/messages';
import { notifyTxStatus } from '@/utils/notifications';
import { useFormik } from 'formik';
import { shouldDisableStrict } from 'useink/utils';
import * as yup from 'yup';

function UpdateDisplayNameButton() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { contract, memberInfo } = useSpaceContext();
  const updateMemberInfoTx = useTx(contract, 'updateMemberInfo');

  const formik = useFormik({
    initialValues: { displayName: '' },
    validationSchema: yup.object().shape({
      displayName: yup
        .string()
        .matches(/^[A-Za-z0-9_\-\s]*$/, {
          message: 'Display name should only contains letters, numbers, white spaces, - and _',
        })
        .min(3, 'Display name must be at least 3 characters')
        .max(30, 'Display name must be at most 30 characters'),
    }),
    onSubmit: ({ displayName }, formikHelpers) => {
      updateMemberInfoTx.signAndSend([displayName], {}, (result) => {
        if (!result) {
          updateMemberInfoTx.resetState(formikHelpers);
          return;
        }

        notifyTxStatus(result);

        if (result.isInBlock) {
          if (result.dispatchError) {
            toast.error(messages.txError);
          } else {
            toast.success('Display name updated');
          }

          updateMemberInfoTx.resetState(formikHelpers);
          onClose();
        }
      });
    },
  });

  useEffect(() => {
    formik.resetForm();
    updateMemberInfoTx.resetState();
  }, [isOpen]);

  return (
    <>
      <Text onClick={onOpen} width='100%' textAlign='left'>
        {memberInfo?.name ? 'Change Display Name' : 'Set Display Name'}
      </Text>
      <Modal isOpen={isOpen} onClose={onClose} size={{ base: 'full', md: 'md' }}>
        <ModalOverlay />
        <ModalContent as='form' onSubmit={(e) => formik.handleSubmit(e as FormEvent<HTMLFormElement>)}>
          <ModalHeader>{memberInfo?.name ? 'Change Display Name' : 'Set Display Name'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl isRequired isInvalid={!!formik.errors.displayName}>
              <FormLabel>Display name</FormLabel>
              <Input
                value={formik.values.displayName}
                onChange={formik.handleChange}
                placeholder={memberInfo?.name || ''}
                name='displayName'
              />
              {!!formik.errors.displayName ? (
                <FormErrorMessage>{formik.errors.displayName}</FormErrorMessage>
              ) : (
                <FormHelperText>Leave empty to clear name.</FormHelperText>
              )}
            </FormControl>
          </ModalBody>
          <ModalFooter gap={2}>
            <Button variant='outline' onClick={onClose}>
              Cancel
            </Button>
            <Button
              type='submit'
              colorScheme='primary'
              isLoading={formik.isSubmitting || shouldDisableStrict(updateMemberInfoTx)}
              isDisabled={formik.isSubmitting || !formik.isValid}>
              Update
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default UpdateDisplayNameButton;
