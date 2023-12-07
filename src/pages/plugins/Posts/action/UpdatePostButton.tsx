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
} from '@chakra-ui/react';
import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { useTx } from '@/hooks/useink/useTx';
import { usePostsContext } from '@/pages/plugins/Posts/PostsProvider';
import { Post, Props } from '@/types';
import { renderMd } from '@/utils/mdrenderer';
import { messages } from '@/utils/messages';
import { notifyTxStatus } from '@/utils/notifications';
import { useFormik } from 'formik';
import { shouldDisableStrict } from 'useink/utils';
import * as yup from 'yup';

interface UpdatePostButtonProps extends Props {
  postId: number;
  post: Post;
}

export default function UpdatePostButton({ postId, post }: UpdatePostButtonProps) {
  const { contract } = usePostsContext();
  const updatePostTx = useTx<number>(contract, 'updatePost');
  const { isOpen, onOpen, onClose } = useDisclosure();

  const formik = useFormik({
    initialValues: {
      content: post.content.Raw,
    },
    validationSchema: yup.object().shape({
      content: yup.string().required().max(500),
    }),
    onSubmit: (values, formikHelpers) => {
      const { content } = values;
      const postContent = { Raw: content };
      updatePostTx.signAndSend([postId, postContent], undefined, (result) => {
        if (!result) {
          updatePostTx.resetState(formikHelpers);
          return;
        }

        notifyTxStatus(result);

        if (result.isInBlock) {
          if (result.dispatchError) {
            toast.error(messages.txError);
          } else {
            toast.success('Post updated successfully');

            // Set current content by updated content
            post.content = postContent;
            post.updatedAt = Date.now();
          }

          updatePostTx.resetState(formikHelpers);
          onClose();
        }
      });
    },
  });

  useEffect(() => {
    updatePostTx.resetState();
    formik.resetForm();
  }, [isOpen]);

  const processing = shouldDisableStrict(updatePostTx);

  return (
    <>
      <Text onClick={onOpen} width='100%'>
        Edit Post
      </Text>
      <Modal isOpen={isOpen} onClose={onClose} size={{ base: 'full', md: '3xl' }}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Post</ModalHeader>
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
                  size='sm'
                  colorScheme='primary'
                  type='submit'
                  minWidth={40}
                  isLoading={processing}
                  loadingText='Updating...'
                  isDisabled={processing || formik.values.content === post.content.Raw}>
                  Update
                </Button>
              </Flex>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </>
  );
}
