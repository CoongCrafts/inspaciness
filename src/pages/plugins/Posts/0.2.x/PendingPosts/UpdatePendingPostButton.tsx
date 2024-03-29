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
  Link,
  MenuItem,
} from '@chakra-ui/react';
import { FormEvent, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useTx } from '@/hooks/useink/useTx';
import { PostContent, PostRecord, Props } from '@/types';
import { pinData, unpinData } from '@/utils/ipfs';
import { renderMd } from '@/utils/mdrenderer';
import { messages } from '@/utils/messages';
import { notifyTxStatus } from '@/utils/notifications';
import { EditIcon } from '@chakra-ui/icons';
import { useFormik } from 'formik';
import { shouldDisableStrict } from 'useink/utils';
import { usePostsContext } from '../PostsProvider';
import { postValidationScheme } from '../actions/NewPostButton';

interface UpdatePostButtonProps extends Props {
  postRecord: PostRecord;
  defaultValue: string;
  disabled?: boolean;
}

export default function UpdatePendingPostButton({
  postRecord: { post, postId },
  defaultValue,
  disabled = false,
}: UpdatePostButtonProps) {
  const { contract } = usePostsContext();
  const updatePostTx = useTx<number>(contract, 'updatePendingPost');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const postContentType = PostContent.IpfsCid in post.content ? PostContent.IpfsCid : PostContent.Raw;

  const formik = useFormik({
    initialValues: {
      content: defaultValue,
    },
    validationSchema: postValidationScheme,
    onSubmit: async (values, formikHelpers) => {
      const oldPostContent = post.content;

      let postContent: any;
      switch (postContentType) {
        case 'IpfsCid':
          const cid = await pinData(values.content);

          if (!cid) {
            toast.error('Error happen when pushing data to Ipfs');
          }

          postContent = { IpfsCid: cid };
          break;
        case 'Raw':
          const { content } = values;

          postContent = { Raw: content };
          break;
      }

      updatePostTx.signAndSend([postId, postContent], {}, (result) => {
        if (!result) {
          updatePostTx.resetState(formikHelpers);
          if (postContentType === PostContent.IpfsCid) {
            unpinData(postContent.IpfsCid);
          }

          return;
        }

        notifyTxStatus(result);

        if (result.isInBlock) {
          if (result.dispatchError) {
            toast.error(messages.txError);
            if (postContentType === PostContent.IpfsCid) {
              unpinData(postContent.IpfsCid);
            }
          } else {
            toast.success('Post updated');

            if (postContentType === PostContent.IpfsCid) {
              unpinData((oldPostContent as { [PostContent.IpfsCid]: string }).IpfsCid);
            }
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
      <MenuItem icon={<EditIcon />} isDisabled={disabled} onClick={onOpen}>
        Edit
      </MenuItem>
      <Modal isOpen={isOpen} onClose={onClose} size={{ base: 'full', md: '3xl' }} closeOnOverlayClick={false}>
        <ModalOverlay />
        <ModalContent as='form' onSubmit={(e) => formik.handleSubmit(e as FormEvent<HTMLFormElement>)}>
          <ModalHeader>Edit Post #{postId}</ModalHeader>
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
              , maximum 3000 characters.
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
                loadingText='Saving...'
                isDisabled={processing || !formik.isValid}>
                Save
              </Button>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
