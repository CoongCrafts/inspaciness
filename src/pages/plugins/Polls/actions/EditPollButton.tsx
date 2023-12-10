import {
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Textarea,
  useDisclosure,
  MenuItem,
} from '@chakra-ui/react';
import { FormEvent, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useTx } from '@/hooks/useink/useTx';
import { usePollsContext } from '@/pages/plugins/Polls/PollsProvider';
import { pollValidationScheme } from '@/pages/plugins/Polls/actions/NewPollButton';
import { Poll, Props } from '@/types';
import { formatDate } from '@/utils/date';
import { messages } from '@/utils/messages';
import { notifyTxStatus } from '@/utils/notifications';
import { EditIcon } from '@chakra-ui/icons';
import { useFormik } from 'formik';
import { shouldDisableStrict } from 'useink/utils';

interface EditPollButtonProps extends Props {
  poll: Poll;
}

export default function EditPollButton({ poll }: EditPollButtonProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { contract } = usePollsContext();
  const updatePollTx = useTx(contract, 'updatePoll');

  const [numOfOption, setNumOfOption] = useState(poll.options.length + 1);

  const formik = useFormik({
    initialValues: {
      question: poll.title,
      options: poll.options,
      expiredAt: poll.expiredAt ? formatDate(poll.expiredAt) : '',
    },
    validationSchema: pollValidationScheme,
    onSubmit: ({ question, options, expiredAt }, formikHelpers) => {
      options = options.filter((one) => !!one);
      expiredAt = expiredAt ? Date.parse(expiredAt).toString() : '';

      updatePollTx.signAndSend([poll.id, question, null, options, expiredAt || null], undefined, (result) => {
        if (!result) {
          updatePollTx.resetState(formikHelpers);
          return;
        }

        notifyTxStatus(result);

        if (result.isInBlock) {
          if (result.dispatchError) {
            toast.error(messages.txError);
          } else {
            toast.success(`Poll #${poll.id} updated`);
          }

          onClose();
          updatePollTx.resetState(formikHelpers);
        }
      });
    },
  });

  useEffect(() => {
    if (!formik.values.options.at(numOfOption - 1)) {
      return;
    }

    setNumOfOption((pre) => pre + 1);
  }, [formik.values.options]);

  useEffect(() => {
    formik.resetForm();
    formik.setValues({
      question: poll.title,
      options: poll.options,
      expiredAt: poll.expiredAt ? formatDate(poll.expiredAt) : '',
    });
    updatePollTx.resetState();
  }, [isOpen]);

  const processing = shouldDisableStrict(updatePollTx);

  return (
    <>
      <MenuItem icon={<EditIcon />} onClick={onOpen}>
        Edit
      </MenuItem>
      <Modal isOpen={isOpen} onClose={onClose} size={{ base: 'full', md: '3xl' }}>
        <ModalOverlay />
        <ModalContent as='form' onSubmit={(e) => formik.handleSubmit(e as FormEvent<HTMLFormElement>)}>
          <ModalHeader>Edit poll #{poll.id}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex flexDir='column' gap={4}>
              <FormControl isInvalid={!!formik.errors.question} isRequired>
                <FormLabel>Question</FormLabel>
                <Textarea
                  value={formik.values.question}
                  onChange={formik.handleChange}
                  name='question'
                  maxLength={300}
                  placeholder='Got a poll topic in mind?'
                />
                {!!formik.errors.question ? (
                  <FormErrorMessage>{formik.errors.question}</FormErrorMessage>
                ) : (
                  <FormHelperText>Maximum 300 characters</FormHelperText>
                )}
              </FormControl>
              <FormControl>
                <FormLabel>Options</FormLabel>
                <Flex flexDir='column' gap={2}>
                  {[...Array(numOfOption)].map((_, idx) => (
                    <Input
                      maxLength={200}
                      key={`${poll.id}${idx}`}
                      value={formik.values.options[idx]}
                      onChange={(e) =>
                        formik.setFieldValue('options', formik.values.options.toSpliced(idx, 1, e.currentTarget.value))
                      }
                      placeholder={`Option ${idx + 1}`}
                      isDisabled={idx < poll.options.length}
                    />
                  ))}
                </Flex>
                <FormHelperText>At least 2 options required, maximum 200 each</FormHelperText>
              </FormControl>
              <FormControl>
                <FormLabel>Expired at</FormLabel>
                <Input
                  type='datetime-local'
                  value={formik.values.expiredAt}
                  onChange={formik.handleChange}
                  name='expiredAt'
                />
                <FormHelperText>Leave empty for non expiring poll</FormHelperText>
              </FormControl>
            </Flex>
          </ModalBody>
          <ModalFooter gap={2}>
            <Button onClick={onClose} variant='outline' size='sm'>
              Cancel
            </Button>
            <Button
              type='submit'
              colorScheme='primary'
              size='sm'
              isLoading={processing}
              loadingText='Updating...'
              isDisabled={processing || !formik.isValid}>
              Update
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
