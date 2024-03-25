import {
  TabPanels,
  Text,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Textarea,
  useDisclosure,
  TabPanel,
  Box,
  Tabs,
  TabList,
  Tab,
  IconButton,
  Link,
} from '@chakra-ui/react';
import { FormEvent, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useEffectOnce } from 'react-use';
import { useTx } from '@/hooks/useink/useTx';
import { Props } from '@/types';
import { eventEmitter, EventName } from '@/utils/eventemitter';
import { renderMd } from '@/utils/mdrenderer';
import { messages } from '@/utils/messages';
import { notifyTxStatus } from '@/utils/notifications';
import { AddIcon } from '@chakra-ui/icons';
import { useFormik } from 'formik';
import { shouldDisableStrict } from 'useink/utils';
import * as yup from 'yup';
import { usePostsContext } from '../PostsProvider';

export const postValidationScheme = yup.object().shape({
  content: yup.string().required().max(500, 'Content must be at most 500 characters'),
});

interface NewPostButtonProps extends Props {
  onPostCreated: () => void;
}

export default function NewPostButton({ onPostCreated }: NewPostButtonProps) {
  const { contract, shouldCreatePendingPost } = usePostsContext();
  const newPostTx = useTx<number>(contract, 'newPost');
  const { isOpen, onOpen, onClose } = useDisclosure();

  const formik = useFormik({
    initialValues: {
      content: '',
    },
    validationSchema: postValidationScheme,
    onSubmit: (values, formikHelpers) => {
      const { content } = values;
      const postContent = { Raw: content };
      newPostTx.signAndSend([postContent], undefined, (result) => {
        if (!result) {
          newPostTx.resetState(formikHelpers);
          return;
        }

        notifyTxStatus(result);

        if (result.isInBlock) {
          if (result.dispatchError) {
            toast.error(messages.txError);
          } else {
            toast.success(
              shouldCreatePendingPost
                ? 'Your post will be show up after being reviewed by space owner'
                : 'New post created',
            );

            onPostCreated();
          }

          newPostTx.resetState(formikHelpers);
          onClose();
        }
      });
    },
  });

  useEffect(() => {
    newPostTx.resetState();
    formik.resetForm();
  }, [isOpen]);

  useEffectOnce(() => {
    const showPopup = () => onOpen();
    eventEmitter.on(EventName.SHOW_NEW_POST_POPUP, showPopup);

    return () => {
      eventEmitter.off(EventName.SHOW_NEW_POST_POPUP, showPopup);
    };
  });

  const processing = shouldDisableStrict(newPostTx);

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
        aria-label={'New post'}
        colorScheme='primary'
        variant='outline'
        size='sm'
        onClick={onOpen}
        icon={<AddIcon />}
        display={{ base: 'block', md: 'none' }}
      />
      <Modal isOpen={isOpen} onClose={onClose} size={{ base: 'full', md: '3xl' }} closeOnOverlayClick={false}>
        <ModalOverlay />
        <ModalContent as='form' onSubmit={(e) => formik.handleSubmit(e as FormEvent<HTMLFormElement>)}>
          <ModalHeader>New Post</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Tabs variant='enclosed' borderStyle='solid' borderWidth={1} borderRadius={4} size='sm'>
              <TabList mt='-1px' ml='-1px'>
                <Tab borderTopLeftRadius={4} borderTopRightRadius={0}>
                  Write
                </Tab>
                <Tab borderRadius={0}>Preview</Tab>
              </TabList>
              <TabPanels>
                <TabPanel p={2}>
                  <FormControl isInvalid={!!formik.values.content && !!formik.errors.content}>
                    <Textarea
                      height={40}
                      size='md'
                      id='content'
                      name='content'
                      value={formik.values.content}
                      placeholder='What do you want to share?'
                      autoFocus
                      onChange={formik.handleChange}
                    />
                    {!!formik.values.content && !!formik.errors.content && (
                      <FormErrorMessage>{formik.errors.content}</FormErrorMessage>
                    )}
                  </FormControl>
                </TabPanel>
                <TabPanel p={2}>
                  <Box
                    height='fit-content'
                    p={2}
                    className='post-content'
                    dangerouslySetInnerHTML={{ __html: renderMd(formik.values.content || '') }}></Box>
                </TabPanel>
              </TabPanels>
            </Tabs>
            <Text mt={2} fontSize='sm' color='dimgray'>
              <Link href='https://www.markdownguide.org/cheat-sheet/' target='_blank' color='primary.500'>
                Markdown supported
              </Link>
              , maximum 500 characters.
            </Text>
          </ModalBody>
          <ModalFooter justifyContent='end' alignItems='center'>
            <Flex>
              <Button variant='ghost' mr={2} onClick={onClose} isDisabled={processing}>
                Close
              </Button>
              <Button
                minWidth={40}
                colorScheme='primary'
                type='submit'
                width={100}
                isLoading={processing}
                loadingText='Posting...'
                isDisabled={processing || !formik.isValid}>
                Post
              </Button>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
