import {
  Avatar,
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Input,
  Text,
  Textarea,
} from '@chakra-ui/react';
import { toast } from 'react-toastify';
import NetworkSelection from '@/components/shared/NetworkSelection';
import useCurrentFreeBalance from '@/hooks/space/useCurrentFreeBalance';
import { useTx } from '@/hooks/useink/useTx';
import { step1Schema } from '@/pages/SpaceLauncher';
import { useSpaceContext } from '@/pages/space/0.1.x/SpaceProvider';
import { messages } from '@/utils/messages';
import { notifyTxStatus } from '@/utils/notifications';
import { useFormik } from 'formik';
import { shouldDisableStrict } from 'useink/utils';

export default function SpaceInfo() {
  const { network, info, isOwner, contract } = useSpaceContext();
  const freeBalance = useCurrentFreeBalance();
  const updateInfoTx = useTx(contract, 'spaceProfile::updateInfo');

  const formik = useFormik({
    initialValues: {
      name: info?.name || '',
      desc: info?.desc || '',
      logoUrl: info?.logo?.Url || '',
    },
    enableReinitialize: true,
    validationSchema: step1Schema,
    onSubmit: (values, formikHelpers) => {
      if (freeBalance == 0) {
        toast.error(messages.insufficientBalance);
        return;
      }

      const { name, desc, logoUrl } = values;

      const spaceInfo = { name, desc, logo: { Url: logoUrl } };

      updateInfoTx.signAndSend([spaceInfo], {}, (result) => {
        if (!result) {
          updateInfoTx.resetState(formikHelpers);
          return;
        }

        notifyTxStatus(result);

        if (result?.isInBlock) {
          if (result.dispatchError) {
            toast.error(messages.txError);
          } else {
            toast.success('Space profile updated');
          }

          updateInfoTx.resetState(formikHelpers);
        }
      });
    },
  });

  const readOnly = !isOwner;

  if (!info) {
    return null;
  }

  return (
    <Box mt={3} border='1px' borderColor='gray.200' p={4} borderRadius={4} mb={4}>
      <Text fontWeight='semibold'>Basic Information</Text>
      <Box as='form' width={{ base: 'auto', md: 400 }} onSubmit={formik.handleSubmit}>
        <FormControl mt={4}>
          <FormLabel>Network</FormLabel>
          <NetworkSelection defaultNetwork={network} disabled />
        </FormControl>
        <FormControl mt={4} isRequired isInvalid={formik.touched.name && !!formik.errors.name}>
          <FormLabel>Name</FormLabel>
          <Input
            type='text'
            placeholder='Choose a name for your space'
            maxLength={30}
            value={formik.values.name}
            onChange={formik.handleChange}
            readOnly={readOnly}
            name='name'
          />
          {formik.touched.name && !!formik.errors.name ? (
            <FormErrorMessage>{formik.errors.name}</FormErrorMessage>
          ) : (
            <FormHelperText>Maximum 30 characters</FormHelperText>
          )}
        </FormControl>

        <FormControl mt={4}>
          <FormLabel>Description</FormLabel>
          <Textarea
            placeholder='What describes best about your space?'
            maxLength={200}
            value={formik.values.desc}
            onChange={formik.handleChange}
            readOnly={readOnly}
            name='desc'
          />
          <FormHelperText>Maximum 200 characters</FormHelperText>
        </FormControl>

        <FormControl mt={4}>
          <FormLabel>Logo Url</FormLabel>
          <Input
            type='text'
            placeholder='https://example.com/logo.png'
            maxLength={500}
            value={formik.values.logoUrl}
            onChange={formik.handleChange}
            readOnly={readOnly}
            name='logoUrl'
          />
          <FormHelperText>
            Logo image should be in .png, .jpg or .gif formats. A square image is recommended. Maximum 500 characters.
          </FormHelperText>
          {formik.values.logoUrl && (
            <Box mt={4}>
              <Avatar
                boxSize='100px'
                src={formik.values.logoUrl || 'https://placehold.co/300x300?text=space'}
                name={formik.values.name}
              />
            </Box>
          )}
        </FormControl>
        {isOwner && (
          <Button
            type='submit'
            size='sm'
            mt={8}
            variant='outline'
            colorScheme='primary'
            isLoading={formik.isSubmitting || shouldDisableStrict(updateInfoTx)}>
            Update Profile
          </Button>
        )}
      </Box>
    </Box>
  );
}
