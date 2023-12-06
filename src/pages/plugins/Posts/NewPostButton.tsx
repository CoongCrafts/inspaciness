import {
  Button,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  IconButton,
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
import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { useTx } from '@/hooks/useink/useTx';
import { usePostsContext } from '@/pages/plugins/Posts/PostsProvider';
import { messages } from '@/utils/messages';
import { notifyTxStatus } from '@/utils/notifications';
import { AddIcon } from '@chakra-ui/icons';
import { useFormik } from 'formik';
import { shouldDisableStrict } from 'useink/utils';
import * as yup from 'yup';

export default function NewPostButton() {
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

      <Modal isOpen={isOpen} onClose={onClose} size={{ base: 'full', md: 'xl' }}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>New post</ModalHeader>
          <ModalCloseButton />
          <form onSubmit={formik.handleSubmit}>
            <ModalBody>
              <FormControl isInvalid={formik.touched.content && !!formik.errors.content}>
                <Textarea
                  id='content'
                  name='content'
                  value={formik.values.content}
                  placeholder='What do you want to share?'
                  autoFocus
                  onChange={formik.handleChange}
                />
                {formik.touched.content && !!formik.errors.content ? (
                  <FormErrorMessage>{formik.errors.content}</FormErrorMessage>
                ) : (
                  <FormHelperText>Markdown supported, maximum 500 characters</FormHelperText>
                )}
              </FormControl>
            </ModalBody>
            <ModalFooter>
              <Button size='sm' variant='ghost' mr={2} onClick={onClose} isDisabled={processing}>
                Close
              </Button>
              <Button
                size='sm'
                colorScheme='primary'
                type='submit'
                minWidth={120}
                isLoading={processing}
                loadingText='Posting...'
                isDisabled={formik.isSubmitting || !formik.values.content}>
                Post
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </>
  );
}
