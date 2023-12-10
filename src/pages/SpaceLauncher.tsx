import {
  Alert,
  AlertDescription,
  AlertIcon,
  Avatar,
  Badge,
  Box,
  Button,
  Divider,
  Flex,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Heading,
  Input,
  InputGroup,
  InputRightAddon,
  Radio,
  RadioGroup,
  Stack,
  Step,
  StepDescription,
  StepIcon,
  StepIndicator,
  StepNumber,
  Stepper,
  StepSeparator,
  StepStatus,
  StepTitle,
  Switch,
  Tag,
  Text,
  Textarea,
  useMediaQuery,
  useSteps,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import NetworkSelection from '@/components/shared/NetworkSelection';
import NetworkLabel from '@/components/space/NetworkLabel';
import SpaceAvatar from '@/components/space/SpaceAvatar';
import useMotherlandContract from '@/hooks/contracts/useMotherContract';
import useContractState from '@/hooks/useContractState';
import useFreeBalance from '@/hooks/useFreeBalance';
import { useTx } from '@/hooks/useink/useTx';
import { useWalletContext } from '@/providers/WalletProvider';
import { NetworkInfo, Pricing, RegistrationType } from '@/types';
import env from '@/utils/env';
import { messages } from '@/utils/messages';
import { notifyTxStatus } from '@/utils/notifications';
import { findPlugin } from '@/utils/plugins';
import { useFormik } from 'formik';
import { asContractInstantiatedEvent, isContractInstantiatedEvent, shouldDisableStrict } from 'useink/utils';
import * as yup from 'yup';

// const DEFAULT_LOGO = 'https://ipfs.filebase.io/ipfs/QmQXLfTiSakezeLtoAQvgYBXnQ3tbvVfNXk6sUhjZAg1iK';

enum STEP {
  First,
  Second,
  Last,
}

const STEPS = [
  { title: 'First', description: 'Basic information' },
  { title: 'Second', description: 'Membership & plugins' },
  { title: 'Last', description: 'Launch space' },
];

export const step1Schema = yup.object().shape({
  name: yup.string().min(3).max(30).required(),
  desc: yup.string().optional().max(200),
  logoUrl: yup.string().url().optional().max(500),
});

export const step2Schema = yup.object().shape({
  registrationType: yup.string().oneOf(Object.values(RegistrationType)).required(),
  pricing: yup.string().oneOf(Object.values(Pricing)).required(),
  price: yup.number().when('pricing', {
    is: (pricing: any) => pricing === Pricing.OneTimePaid || pricing === Pricing.Subscription,
    then: (schema) => schema.required(),
  }),
  duration: yup.number().when('pricing', {
    is: (pricing: any) => pricing === Pricing.Subscription,
    then: (schema) => schema.required(),
  }),
});

export default function SpaceLauncher() {
  const { activeStep: step, setActiveStep: setStep } = useSteps({
    index: 0,
    count: STEPS.length,
  });
  const [network, setNetwork] = useState<NetworkInfo>();
  const contract = useMotherlandContract(network?.id || env.defaultChainId);
  const { state: pluginLaunchers } = useContractState<[string, string][]>(contract, 'pluginLaunchers');
  const launchNewSpaceTx = useTx(contract, 'deployNewSpace');
  const navigate = useNavigate();
  const { selectedAccount } = useWalletContext();
  const [smallest] = useMediaQuery('(max-width: 700px)');

  const freeBalance = useFreeBalance(selectedAccount, network);
  const currentStep = STEPS[step];

  const back = () => {
    if (step === STEP.First) {
      navigate('/');
    } else if (step === STEP.Second) {
      setStep(STEP.First);
    } else {
      setStep(STEP.Second);
    }
  };

  const formikStep1 = useFormik({
    initialValues: {
      name: '',
      desc: '',
      logoUrl: '',
    },
    validationSchema: step1Schema,
    onSubmit: async () => setStep(STEP.Second),
  });

  const formikStep2 = useFormik({
    initialValues: {
      registrationType: RegistrationType.PayToJoin,
      pricing: Pricing.Free,
      price: '',
      duration: '', // subscription duration
      plugins: [] as string[],
    },
    validationSchema: step2Schema,
    onSubmit: async () => setStep(STEP.Last),
  });

  const formikStep3 = useFormik({
    initialValues: {},
    onSubmit: async (_values, formikHelpers) => {
      formikHelpers.setSubmitting(true);

      const { name, desc, logoUrl } = formikStep1.values;
      const { registrationType, pricing, price, duration, plugins } = formikStep2.values;

      let spacePricing: any = pricing;
      if (pricing === Pricing.OneTimePaid) {
        spacePricing = { [pricing]: { price: parseInt(price) * Math.pow(10, network!.decimals) } };
      } else if (pricing === Pricing.Subscription) {
        spacePricing = {
          [pricing]: {
            price: parseInt(price) * Math.pow(10, network!.decimals),
            duration: parseInt(duration),
          },
        };
      }

      // Reset pricing for invite only
      if (registrationType === RegistrationType.InviteOnly) {
        spacePricing = Pricing.Free;
      }

      const spaceInfo = { name, desc, logo: logoUrl ? { Url: logoUrl } : null };
      const spaceConfig = {
        registration: registrationType,
        pricing: spacePricing,
      };
      const spaceOwner = null; // default

      launchNewSpaceTx.signAndSend([spaceInfo, spaceConfig, spaceOwner, plugins], {}, (result) => {
        if (!result) {
          launchNewSpaceTx.resetState();
          return;
        }

        notifyTxStatus(result);

        if (result?.isInBlock) {
          if (result.dispatchError) {
            toast.error(messages.txError);
          } else {
            // @ts-ignore
            const deployedEvent = result.events.find(
              (record) =>
                isContractInstantiatedEvent(record) &&
                asContractInstantiatedEvent(record)!.deployer === network?.motherAddress,
            );
            toast.success(`The space has successfully deployed to ${network?.name}.`);
            if (deployedEvent) {
              // @ts-ignore
              const contractAddress = asContractInstantiatedEvent(deployedEvent)!.contractAddress;
              navigate(`/${network!.id}/spaces/${contractAddress}`);
            }
          }

          formikHelpers.setSubmitting(false);
          launchNewSpaceTx.resetState();
        }
      });
    },
  });

  const registrationType = formikStep2.values.registrationType;

  useEffect(() => {
    if (registrationType == RegistrationType.InviteOnly) {
      formikStep2.setValues({
        ...formikStep2.values,
        pricing: Pricing.Free,
        price: '',
        duration: '',
      });
    }
  }, [registrationType]);

  const cannotMakeTransaction = !network || freeBalance == '0';
  const disablePricing = formikStep2.values.registrationType === RegistrationType.InviteOnly;

  return (
    <Box maxWidth='container.md' marginX='auto'>
      {network && cannotMakeTransaction && (
        <Alert status='error' mb={2}>
          <AlertIcon />
          <AlertDescription>You don't have enough balance to make transaction!</AlertDescription>
        </Alert>
      )}
      <Text as='h1' fontSize='2xl' fontWeight='semibold'>
        Create a new space
      </Text>

      <Stepper index={step} my={4} colorScheme='primary'>
        {STEPS.map((step, index) => (
          <Step key={index}>
            <StepIndicator>
              <StepStatus complete={<StepIcon />} incomplete={<StepNumber />} active={<StepNumber />} />
            </StepIndicator>
            {!smallest && (
              <Box flexShrink='0'>
                <StepTitle>{step.title}</StepTitle>
                <StepDescription>{step.description}</StepDescription>
              </Box>
            )}
            <StepSeparator />
          </Step>
        ))}
      </Stepper>
      {smallest && (
        <Text color='gray.500' fontSize='sm'>
          {currentStep.title}:{' '}
          <Text as='span' fontWeight='semibold'>
            {currentStep.description}
          </Text>
        </Text>
      )}

      <Box mb={8}>
        {step === STEP.First && (
          <Box maxWidth='container.sm' marginX='auto' as='form' mt={4} onSubmit={formikStep1.handleSubmit}>
            <Text fontSize='xl' fontWeight='semibold' mb={4}>
              Basic information
            </Text>
            <FormControl isRequired>
              <FormLabel>Network</FormLabel>
              <NetworkSelection defaultNetwork={network} onSelect={setNetwork} />
              <FormHelperText>Your space will be deployed to the selected network</FormHelperText>
            </FormControl>
            <FormControl mt={4} isRequired isInvalid={formikStep1.touched.name && !!formikStep1.errors.name}>
              <FormLabel>Name</FormLabel>
              <Input
                type='text'
                placeholder='Choose a name for your space'
                maxLength={30}
                value={formikStep1.values.name}
                onChange={formikStep1.handleChange}
                name='name'
              />
              {formikStep1.touched.name && !!formikStep1.errors.name ? (
                <FormErrorMessage>{formikStep1.errors.name}</FormErrorMessage>
              ) : (
                <FormHelperText>Maximum 30 characters</FormHelperText>
              )}
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Description</FormLabel>
              <Textarea
                placeholder='What describes best about your space?'
                maxLength={200}
                value={formikStep1.values.desc}
                onChange={formikStep1.handleChange}
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
                value={formikStep1.values.logoUrl}
                onChange={formikStep1.handleChange}
                name='logoUrl'
              />
              <FormHelperText>
                Logo image should be in .png, .jpg or .gif formats. A square image is recommended. Maximum 500
                characters.
              </FormHelperText>
              {formikStep1.values.logoUrl && (
                <Box mt={4}>
                  <Avatar
                    boxSize='100px'
                    src={formikStep1.values.logoUrl || 'https://placehold.co/300x300?text=space'}
                    name={formikStep1.values.name}
                  />
                </Box>
              )}
            </FormControl>

            <Flex justify='space-between' mt={8}>
              <Button onClick={back}>Cancel</Button>
              <Button
                colorScheme='primary'
                type='submit'
                minWidth={150}
                isDisabled={formikStep1.isSubmitting || cannotMakeTransaction}>
                Next
              </Button>
            </Flex>
          </Box>
        )}

        {step === STEP.Second && (
          <Box maxWidth='container.sm' marginX='auto' as='form' mt={4} onSubmit={formikStep2.handleSubmit}>
            <Box mb={4}>
              <Text fontSize='xl' fontWeight='semibold'>
                Membership
              </Text>
              <Text color='gray.500' fontSize='sm'>
                Configure membership for your space
              </Text>
            </Box>

            <FormControl mt={4} isRequired>
              <FormLabel>Registration</FormLabel>
              <RadioGroup
                colorScheme='primary'
                name='registrationType'
                value={formikStep2.values.registrationType || RegistrationType.PayToJoin}>
                <Stack spacing={0}>
                  <Radio value={RegistrationType.PayToJoin} onChange={formikStep2.handleChange}>
                    Pay To Join
                  </Radio>
                  <Text ml={6} mb={2} fontSize='sm' color='gray.500'>
                    Users pay directly to join the space without admin reviews or approvals.
                  </Text>
                  <Radio value={RegistrationType.RequestToJoin} onChange={formikStep2.handleChange}>
                    Request To Join
                  </Radio>
                  <Text ml={6} mb={2} fontSize='sm' color='gray.500'>
                    Users pay to make a request, join upon admin approval, and receive a refund if rejected.
                  </Text>
                  <Radio value={RegistrationType.InviteOnly} onChange={formikStep2.handleChange}>
                    Invite Only
                  </Radio>
                  <Text ml={6} mb={2} fontSize='sm' color='gray.500'>
                    Users join by admin invitations only.
                  </Text>
                  <Radio value='Claimable' isDisabled={true} onChange={formikStep2.handleChange}>
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
                value={formikStep2.values.pricing || Pricing.Free}
                isDisabled={disablePricing}>
                <Stack spacing={1}>
                  <Radio value={Pricing.Free} onChange={formikStep2.handleChange}>
                    Free
                  </Radio>
                  <Radio value={Pricing.OneTimePaid} onChange={formikStep2.handleChange}>
                    One Time Paid
                  </Radio>
                  <Radio value={Pricing.Subscription} onChange={formikStep2.handleChange}>
                    Subscription
                  </Radio>
                </Stack>
              </RadioGroup>
            </FormControl>

            {(formikStep2.values.pricing === Pricing.OneTimePaid ||
              formikStep2.values.pricing === Pricing.Subscription) && (
              <FormControl mt={4} isInvalid={formikStep2.touched.price && !!formikStep2.errors.price}>
                <FormLabel>Price</FormLabel>
                <InputGroup>
                  <Input
                    type='number'
                    placeholder='e.g: 10'
                    width={200}
                    value={formikStep2.values.price}
                    onChange={formikStep2.handleChange}
                    name='price'
                  />
                  <InputRightAddon children={network?.symbol} />
                </InputGroup>
                {formikStep2.touched.price && !!formikStep2.errors.price ? (
                  <FormErrorMessage>{formikStep2.errors.price}</FormErrorMessage>
                ) : (
                  <FormHelperText />
                )}
              </FormControl>
            )}

            {formikStep2.values.pricing === Pricing.Subscription && (
              <FormControl mt={4} isInvalid={formikStep2.touched.duration && !!formikStep2.errors.duration}>
                <FormLabel>Duration</FormLabel>
                <InputGroup>
                  <Input
                    type='number'
                    placeholder='e.g: 30'
                    width={200}
                    value={formikStep2.values.duration}
                    onChange={formikStep2.handleChange}
                    name='duration'
                  />
                  <InputRightAddon children='days' />
                </InputGroup>
                {formikStep2.touched.duration && !!formikStep2.errors.duration ? (
                  <FormErrorMessage>{formikStep2.errors.duration}</FormErrorMessage>
                ) : (
                  <FormHelperText />
                )}
              </FormControl>
            )}

            <Box mb={4} mt={8}>
              <Text fontSize='xl' fontWeight='semibold'>
                Plugins
              </Text>
              <Text color='gray.500' fontSize='sm'>
                Add functionalities to your space, you can add, remove and configure plugins later after deployment as
                needed
              </Text>
            </Box>

            <Flex direction='column' gap={2}>
              {pluginLaunchers?.map((one, index) => {
                const pluginInfo = findPlugin(one[0]);

                if (!pluginInfo) return null;

                return (
                  <Box key={index}>
                    <FormControl>
                      <Flex align='center'>
                        <FormLabel mb='0'>{pluginInfo.name}</FormLabel>
                        <Switch
                          colorScheme='primary'
                          onChange={(e) => {
                            const checked = e.target.checked;
                            const plugins = formikStep2.values.plugins.filter((one) => one !== pluginInfo.id);
                            if (checked) {
                              plugins.push(pluginInfo.id);
                            }

                            formikStep2.setFieldValue('plugins', plugins);
                          }}
                          isChecked={formikStep2.values.plugins.includes(pluginInfo.id)}
                        />
                      </Flex>

                      <Text fontSize='sm' color='gray.500'>
                        {pluginInfo.description}
                      </Text>
                    </FormControl>
                    <Divider mt={2} />
                  </Box>
                );
              })}

              <FormControl display='flex' alignItems='center' opacity={0.5}>
                <FormLabel htmlFor='email-alerts' mb='0'>
                  Discussions{' '}
                </FormLabel>
                <Switch id='plugin-discussions' disabled />
                <Badge ml={4} fontSize='0.6em' variant='solid'>
                  Coming soon
                </Badge>
              </FormControl>
              <FormControl display='flex' alignItems='center' opacity={0.5}>
                <FormLabel htmlFor='email-alerts' mb='0'>
                  Polls
                </FormLabel>
                <Switch id='plugin-polls' disabled />
                <Badge ml={4} fontSize='0.6em' variant='solid'>
                  Coming soon
                </Badge>
              </FormControl>
              <FormControl display='flex' alignItems='center' opacity={0.5}>
                <FormLabel htmlFor='email-alerts' mb='0'>
                  Auction
                </FormLabel>
                <Switch id='plugin-auction' disabled />
                <Badge ml={4} fontSize='0.6em' variant='solid'>
                  Coming soon
                </Badge>
              </FormControl>
              <FormControl display='flex' alignItems='center' opacity={0.5}>
                <FormLabel htmlFor='email-alerts' mb='0'>
                  Governance
                </FormLabel>
                <Switch id='plugin-governance' disabled />
                <Badge ml={4} fontSize='0.6em' variant='solid'>
                  Coming soon
                </Badge>
              </FormControl>
              <Text fontSize='sm' color='gray'>
                ...and more to come soon!
              </Text>
            </Flex>

            <Flex justify='space-between' mt={8}>
              <Button onClick={back}>Back</Button>
              <Button
                colorScheme='primary'
                type='submit'
                minWidth={150}
                isDisabled={formikStep2.isSubmitting || cannotMakeTransaction}>
                Next
              </Button>
            </Flex>
          </Box>
        )}

        {step === STEP.Last && (
          <Box maxWidth='container.sm' marginX='auto' as='form' mt={4} onSubmit={formikStep3.handleSubmit}>
            <Box mb={4}>
              <Text fontSize='xl' fontWeight='semibold'>
                Space Information
              </Text>
              <Text color='gray.500' fontSize='sm'>
                Review your space information before launching
              </Text>
            </Box>

            <Flex gap={6} borderColor='chakra-border-color' borderWidth='1px' py={6} px={4}>
              {network && (
                <SpaceAvatar
                  space={{ address: '', chainId: network.id }}
                  info={{ name: formikStep1.values.name, desc: '', logo: { Url: formikStep1.values.logoUrl } }}
                />
              )}

              <Box>
                <Heading size='lg' mb={2}>
                  {formikStep1.values.name}
                </Heading>
                <Text fontSize='md' color='gray'>
                  {formikStep1.values.desc}
                </Text>
              </Box>
            </Flex>

            <Box mt={4}>
              {network && (
                <Text fontWeight='semibold'>
                  Deploy to <NetworkLabel chainId={network.id} />
                  <Tag>{network.name}</Tag>
                </Text>
              )}
              <Box mt={3}>
                <Text fontWeight='semibold'>Membership</Text>
                <Box ml={4}>
                  <Text mt={3}>
                    Registration type{' '}
                    <Tag variant='solid' colorScheme='blue'>
                      {formikStep2.values.registrationType}
                    </Tag>
                  </Text>
                  <Text mt={3}>
                    Pricing{' '}
                    <Tag variant='solid' colorScheme='green'>
                      {formikStep2.values.pricing}
                    </Tag>
                  </Text>
                  {(formikStep2.values.pricing === Pricing.OneTimePaid ||
                    formikStep2.values.pricing === Pricing.Subscription) && (
                    <Text mt={3}>
                      Price{' '}
                      <Tag>
                        {formikStep2.values.price} {network?.symbol}
                      </Tag>
                    </Text>
                  )}
                  {formikStep2.values.pricing === Pricing.Subscription && (
                    <Text mt={3}>
                      Duration{' '}
                      <Tag variant='solid' colorScheme='gray'>
                        {formikStep2.values.duration} days
                      </Tag>
                    </Text>
                  )}
                </Box>
              </Box>
              <Box mt={3}>
                <Text fontWeight='semibold'>Plugins</Text>
                <Box ml={4} mt={3}>
                  {formikStep2.values.plugins.length === 0 && (
                    <Text fontStyle='italic' color='gray.500'>
                      No plugins
                    </Text>
                  )}
                  <Box>
                    {formikStep2.values.plugins.map((one) => (
                      <Tag key={one} mr={2}>
                        {findPlugin(one)?.name}
                      </Tag>
                    ))}
                  </Box>
                </Box>
              </Box>
            </Box>

            <Flex justify='space-between' mt={8}>
              <Button onClick={back}>Back</Button>
              <Button
                colorScheme='primary'
                type='submit'
                minWidth={150}
                isLoading={formikStep3.isSubmitting || shouldDisableStrict(launchNewSpaceTx)}
                loadingText='Launching'
                isDisabled={formikStep3.isSubmitting || cannotMakeTransaction || shouldDisableStrict(launchNewSpaceTx)}>
                Launch
              </Button>
            </Flex>
          </Box>
        )}
      </Box>
    </Box>
  );
}
