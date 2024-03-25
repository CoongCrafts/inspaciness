import {
  Badge,
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Input,
  InputGroup,
  InputRightAddon,
  Radio,
  RadioGroup,
  Stack,
  Text,
} from '@chakra-ui/react';
import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { formatBalance } from '@polkadot/util';
import useCurrentFreeBalance from '@/hooks/space/useCurrentFreeBalance';
import { useTx } from '@/hooks/useink/useTx';
import { step2Schema } from '@/pages/SpaceLauncher';
import { useSpaceContext } from '@/providers/SpaceProvider';
import { Pricing, RegistrationType } from '@/types';
import { messages } from '@/utils/messages';
import { notifyTxStatus } from '@/utils/notifications';
import { stringToNum } from '@/utils/number';
import { useFormik } from 'formik';
import { shouldDisableStrict } from 'useink/utils';

export default function Membership() {
  const { network, config, isOwner, contract } = useSpaceContext();
  const freeBalance = useCurrentFreeBalance();
  const updateConfigTx = useTx(contract, 'spaceProfile::updateConfig');

  const readOnly = !isOwner;

  const pricing = config
    ? typeof config.pricing === 'object'
      ? Object.keys(config.pricing)[0]
      : config.pricing
    : null;
  // @ts-ignore
  const pricingInfo = pricing && typeof config?.pricing === 'object' ? config.pricing[pricing] : null;

  const realPrice = formatBalance(stringToNum(pricingInfo?.price) || '', {
    decimals: network.decimals,
    forceUnit: network.symbol,
    withUnit: false,
    withZero: false,
  });

  const formik = useFormik({
    initialValues: {
      registrationType: config?.registration || RegistrationType.PayToJoin,
      pricing: pricing || Pricing.Free,
      price: realPrice || '',
      duration: pricingInfo?.duration || '',
    },
    validationSchema: step2Schema,
    enableReinitialize: true,
    onSubmit: (values, formikHelpers) => {
      if (freeBalance == 0) {
        formikHelpers.setSubmitting(false);
        toast.error(messages.insufficientBalance);
        return;
      }

      const { registrationType, pricing, price, duration } = values;
      const rawPrice = parseInt(price) * Math.pow(10, network.decimals);
      let spacePricing: any = pricing;
      if (pricing === Pricing.OneTimePaid) {
        spacePricing = { [pricing]: { price: rawPrice } };
      } else if (pricing === Pricing.Subscription) {
        spacePricing = { [pricing]: { price: rawPrice, duration: parseInt(duration) } };
      }

      const spaceConfig = {
        registration: registrationType,
        pricing: spacePricing,
      };

      updateConfigTx.signAndSend([spaceConfig], {}, (result) => {
        if (!result) {
          updateConfigTx.resetState(formikHelpers);
          return;
        }

        notifyTxStatus(result);

        if (result?.isInBlock) {
          if (result.dispatchError) {
            toast.error(messages.txError);
          } else {
            toast.success('Space membership updated');
          }

          updateConfigTx.resetState(formikHelpers);
        }
      });
    },
  });

  const registrationType = formik.values.registrationType;

  useEffect(() => {
    if (registrationType == RegistrationType.InviteOnly) {
      formik.setValues({
        registrationType,
        pricing: Pricing.Free,
        price: '',
        duration: '',
      });
    }
  }, [registrationType]);

  const disablePricing = formik.values.registrationType === RegistrationType.InviteOnly;

  if (!config) {
    return null;
  }

  return (
    <Box mt={3} border='1px' borderColor='gray.200' p={4} borderRadius={4} mb={4}>
      <Text fontWeight='semibold'>Membership</Text>
      <Box ml={2} as='form' onSubmit={formik.handleSubmit}>
        <FormControl mt={4} isRequired>
          <FormLabel>Registration</FormLabel>
          <RadioGroup
            colorScheme='primary'
            name='registrationType'
            value={formik.values.registrationType || RegistrationType.PayToJoin}
            isDisabled={readOnly}>
            <Stack spacing={0}>
              <Radio value={RegistrationType.PayToJoin} onChange={formik.handleChange}>
                Pay To Join
              </Radio>
              <Text ml={6} mb={2} fontSize='sm' color='gray.500'>
                Users pay directly to join the space without admin reviews or approvals.
              </Text>
              <Radio value={RegistrationType.RequestToJoin} onChange={formik.handleChange}>
                Request To Join
              </Radio>
              <Text ml={6} mb={2} fontSize='sm' color='gray.500'>
                Users pay to make a request, join upon admin approval, and receive a refund if rejected.
              </Text>
              <Radio value={RegistrationType.InviteOnly} onChange={formik.handleChange}>
                Invite Only
              </Radio>
              <Text ml={6} mb={2} fontSize='sm' color='gray.500'>
                Users join by admin invitations only.
              </Text>
              <Radio value='Claimable' isDisabled={true} onChange={formik.handleChange}>
                Claimable with NFT{' '}
                <Badge fontSize='0.6em' variant='solid'>
                  Coming soon
                </Badge>
              </Radio>
              <Text ml={6} mb={2} fontSize='sm' color='gray.500'>
                Users claim memberships by proving NFT ownership.
              </Text>
            </Stack>
          </RadioGroup>
        </FormControl>

        <FormControl mt={4} isRequired>
          <FormLabel>Pricing</FormLabel>
          <RadioGroup
            colorScheme='primary'
            name='pricing'
            value={formik.values.pricing || Pricing.Free}
            isDisabled={readOnly || disablePricing}>
            <Stack spacing={1}>
              <Radio value={Pricing.Free} onChange={formik.handleChange}>
                Free
              </Radio>
              <Radio value={Pricing.OneTimePaid} onChange={formik.handleChange}>
                One Time Paid
              </Radio>
              <Radio value={Pricing.Subscription} onChange={formik.handleChange}>
                Subscription
              </Radio>
            </Stack>
          </RadioGroup>
        </FormControl>

        {(formik.values.pricing === Pricing.OneTimePaid || formik.values.pricing === Pricing.Subscription) && (
          <FormControl mt={4} isRequired isInvalid={formik.touched.price && !!formik.errors.price}>
            <FormLabel>Price</FormLabel>
            <InputGroup>
              <Input
                type='number'
                placeholder='e.g: 10'
                width={200}
                value={formik.values.price}
                onChange={formik.handleChange}
                readOnly={readOnly}
                name='price'
              />
              <InputRightAddon children={network?.symbol} />
            </InputGroup>
            {formik.touched.price && !!formik.errors.price ? (
              <FormErrorMessage>{formik.errors.price as string}</FormErrorMessage>
            ) : (
              <FormHelperText />
            )}
          </FormControl>
        )}

        {formik.values.pricing === Pricing.Subscription && (
          <FormControl mt={4} isRequired isInvalid={formik.touched.duration && !!formik.errors.duration}>
            <FormLabel>Duration</FormLabel>
            <InputGroup>
              <Input
                type='number'
                placeholder='e.g: 30'
                width={200}
                value={formik.values.duration}
                onChange={formik.handleChange}
                readOnly={readOnly}
                name='duration'
              />
              <InputRightAddon children='days' />
            </InputGroup>
            {formik.touched.duration && !!formik.errors.duration ? (
              <FormErrorMessage>{formik.errors.duration as string}</FormErrorMessage>
            ) : (
              <FormHelperText />
            )}
          </FormControl>
        )}

        {isOwner && (
          <Button
            type='submit'
            mt={4}
            size='sm'
            variant='outline'
            colorScheme='primary'
            isLoading={formik.isSubmitting || shouldDisableStrict(updateConfigTx)}>
            Update Membership
          </Button>
        )}
      </Box>
    </Box>
  );
}
