import {
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  IconButton,
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
} from '@chakra-ui/react';
import { FormEvent, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useEffectOnce } from 'react-use';
import { useTx } from '@/hooks/useink/useTx';
import { usePollsContext } from '@/pages/plugins/Polls/0.1.x/PollsProvider';
import { eventEmitter, EventName } from '@/utils/eventemitter';
import { messages } from '@/utils/messages';
import { notifyTxStatus } from '@/utils/notifications';
import { AddIcon } from '@chakra-ui/icons';
import { useFormik } from 'formik';
import { shouldDisableStrict } from 'useink/utils';
import * as yup from 'yup';

const DEFAULT_NUM_OF_OPTION = 3;

export const pollValidationScheme = yup.object({
  question: yup.string().max(300).required('Question is required'),
  options: yup
    .array()
    .test(
      'at_least_two_option',
      'A poll need at least two options',
      (options) => options && options.filter((one) => !!one).length >= 2,
    ),
});

export default function NewPollButton() {
  const { contract } = usePollsContext();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const newPollTx = useTx(contract, 'newPoll');

  const [numOfOption, setNumOfOption] = useState(DEFAULT_NUM_OF_OPTION);

  const formik = useFormik({
    initialValues: {
      question: '',
      options: Array(numOfOption) as string[],
      expiredAt: '',
    },
    validationSchema: pollValidationScheme,
    onSubmit: ({ question, expiredAt, options }, formikHelpers) => {
      options = options.filter((one) => !!one);
      expiredAt = expiredAt ? Date.parse(expiredAt).toString() : '';

      newPollTx.signAndSend([question, null, options, expiredAt || null], undefined, (result) => {
        if (!result) {
          newPollTx.resetState(formikHelpers);
          return;
        }

        notifyTxStatus(result);

        if (result.isInBlock) {
          if (result.dispatchError) {
            toast.error(messages.txError);
          } else {
            toast.success('New poll created');
          }

          onClose();
          newPollTx.resetState(formikHelpers);
        }
      });
    },
  });

  useEffectOnce(() => {
    const showPopup = () => onOpen();
    eventEmitter.on(EventName.SHOW_NEW_POLL_POPUP, showPopup);

    return () => {
      eventEmitter.off(EventName.SHOW_NEW_POLL_POPUP, showPopup);
    };
  });

  useEffect(() => {
    if (!formik.values.options[numOfOption - 1]) {
      return;
    }

    setNumOfOption((pre) => pre + 1);
  }, [formik.values.options]);

  useEffect(() => {
    formik.resetForm();
    newPollTx.resetState();
    setNumOfOption(DEFAULT_NUM_OF_OPTION);
  }, [isOpen]);

  const processing = shouldDisableStrict(newPollTx);

  return (
    <>
      <Button
        variant='outline'
        colorScheme='primary'
        size='sm'
        onClick={onOpen}
        display={{ base: 'none', md: 'block' }}>
        New
      </Button>
      <IconButton
        aria-label={'New poll'}
        colorScheme='primary'
        variant='outline'
        size='sm'
        onClick={onOpen}
        icon={<AddIcon />}
        display={{ base: 'block', md: 'none' }}
      />

      <Modal isOpen={isOpen} onClose={onClose} size={{ base: 'full', md: '3xl' }}>
        <ModalOverlay />
        <ModalContent as='form' onSubmit={(e) => formik.handleSubmit(e as FormEvent<HTMLFormElement>)}>
          <ModalHeader>New poll</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex flexDir='column' gap={4}>
              <FormControl isInvalid={formik.touched.question && !!formik.errors.question} isRequired>
                <FormLabel>Question</FormLabel>
                <Textarea
                  value={formik.values.question}
                  onChange={formik.handleChange}
                  name='question'
                  maxLength={300}
                  placeholder='Got a poll topic in mind?'
                />
                {formik.touched.question && !!formik.errors.question ? (
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
                      key={idx}
                      value={formik.values.options[idx]}
                      onChange={(e) =>
                        formik.setFieldValue('options', formik.values.options.toSpliced(idx, 1, e.currentTarget.value))
                      }
                      placeholder={`Option ${idx + 1}`}
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
              loadingText='Creating...'
              isDisabled={processing || !formik.isValid}>
              Create
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
