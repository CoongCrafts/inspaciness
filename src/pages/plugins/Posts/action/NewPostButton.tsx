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
} from '@chakra-ui/react';
import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { useTx } from '@/hooks/useink/useTx';
import { usePostsContext } from '@/pages/plugins/Posts/PostsProvider';
import { Props } from '@/types';
import { renderMd } from '@/utils/mdrenderer';
import { messages } from '@/utils/messages';
import { notifyTxStatus } from '@/utils/notifications';
import { AddIcon } from '@chakra-ui/icons';
import { useFormik } from 'formik';
import { shouldDisableStrict } from 'useink/utils';
import * as yup from 'yup';

interface NewPostButtonProps extends Props {
  onPostCreated: () => void;
}

export default function NewPostButton({ onPostCreated }: NewPostButtonProps) {
  const { contract } = usePostsContext();
  const newPostTx = useTx<number>(contract, 'newPost');
  const { isOpen, onOpen, onClose } = useDisclosure();

  const formik = useFormik({
    initialValues: {
      content: '',
    },
    validationSchema: yup.object().shape({
      content: yup.string().required().max(500),
    }),
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
            toast.success('New post created');

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
      <Modal isOpen={isOpen} onClose={onClose} size={{ base: 'full', md: '3xl' }}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>New Post</ModalHeader>
          <ModalCloseButton />
          <form onSubmit={formik.handleSubmit}>
            <ModalBody>
              <Tabs variant='enclosed' borderStyle='solid' borderWidth={1} borderRadius={6} size='md'>
                <TabList>
                  <Tab border='none' _selected={{ bg: 'white', borderRight: '1px solid lightgray' }}>
                    Write
                  </Tab>
                  <Tab
                    border='none'
                    _selected={{
                      bg: 'white',
                      borderRight: '1px solid lightgray',
                      borderLeft: '1px solid lightgray',
                    }}>
                    Preview
                  </Tab>
                </TabList>
                <TabPanels>
                  <TabPanel>
                    <FormControl isInvalid={formik.touched.content && !!formik.errors.content}>
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
                      {formik.touched.content && !!formik.errors.content && (
                        <FormErrorMessage>{formik.errors.content}</FormErrorMessage>
                      )}
                    </FormControl>
                  </TabPanel>
                  <TabPanel>
                    <Box
                      height='fit-content'
                      py={2}
                      px={4}
                      className='post-content'
                      dangerouslySetInnerHTML={{ __html: renderMd(formik.values.content || '') }}></Box>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </ModalBody>
            <ModalFooter justifyContent='space-between' alignItems='center'>
              <Text fontSize='sm' color='dimgray'>
                Markdown supported, maximum 500 characters
              </Text>
              <Flex>
                <Button size='sm' variant='ghost' mr={2} onClick={onClose} isDisabled={processing}>
                  Close
                </Button>
                <Button
                  minWidth={40}
                  size='sm'
                  colorScheme='primary'
                  type='submit'
                  width={100}
                  isLoading={processing}
                  loadingText='Posting...'
                  isDisabled={processing || !formik.values.content}>
                  Post
                </Button>
              </Flex>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </>
  );
}
