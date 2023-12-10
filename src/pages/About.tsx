import { Box, Button, Divider, Flex, Link, SimpleGrid, Tag, Text } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import SpaceCard from '@/components/space/SpaceCard';
import { OnChainSpace } from '@/types';
import { AlephTestnet } from 'useink/chains';

const FEATURED_SPACES: OnChainSpace[] = [
  {
    chainId: AlephTestnet.id,
    address: '5HmQUVoD4WfWMoRifYaTGeQaBdKJznvoNLUsRLzQLU6Voijb',
  },
  {
    chainId: AlephTestnet.id,
    address: '5HkJzUvS85WpxJZtbj2rmTFcJfosHgrHsyHLb4YquP2xiDPM',
  },
  {
    chainId: AlephTestnet.id,
    address: '5CGMt8gYoTU23wsWS9aUvKRUZNjysh6Zr6LW39bu1bDYgLwD',
  },
  {
    chainId: AlephTestnet.id,
    address: '5FysFYUP1j11FmfviBpj6CwvpwN5XW1k9u5wA9cyoXSyFuW4',
  },
  {
    chainId: AlephTestnet.id,
    address: '5HrBR1UY579LZHTNdk3m667qVSxmkTMpiDQ6Sp4QrbPaUFEu',
  },
  {
    chainId: AlephTestnet.id,
    address: '5C9XMtrkEfYSmBJJvKMacuCkcJdLAUeAuS4pyLzdke3bEYic',
  },
  {
    chainId: AlephTestnet.id,
    address: '5Ek9RhiUMi3SsKBgR4Mipb19yRsz1P9upNufcep2TYAaSsng',
  },
  {
    chainId: AlephTestnet.id,
    address: '5DPMZj3uu5yxHJYG8CrB4osGWS5rDWko8Wt4Rvf3EX5NU6bt',
  },
];

const FEATURES = [
  {
    title: '📱 Works on both desktop and mobile devices',
    description: (
      <>
        Engage with your community while on the go with the support of{' '}
        <Link href='http://coongwallet.io' target='_blank' color='primary.500'>
          Coong Wallet
        </Link>
        .
      </>
    ),
  },
  {
    title: '🛡️ Full control over contracts and data',
    description: 'Launch your own smart contracts to manage your spaces, and of course you own the data.',
  },
  {
    title: '🔌️ Expand functionalities with plugins',
    description: 'Add more functionalities for your spaces by installing plugins.',
  },
  {
    title: '🤝 Flexible membership models',
    description: 'Space memberships can be free, one time paid or maintained via a subscription.',
  },
  {
    title: '⚙️ Upgradable',
    description:
      "Enhance your spaces and plugins by upgrading to newer versions, and it's your choice to upgrade or not.",
  },
  {
    title: (
      <>
        🔑 Private spaces <Tag>Coming soon</Tag>
      </>
    ),
    description: 'Only active members can access confidential information on spaces by proving proof-of-memberships.',
  },
];

function About() {
  return (
    <Box>
      <Flex direction='column' my={12}>
        <Text
          fontSize={{ base: '4xl', sm: '5xl' }}
          fontWeight='extrabold'
          bgGradient='linear(to-l, #FF0080, #6753DF)'
          bgClip='text'>
          InSpace
        </Text>

        <Text fontSize={{ base: '4xl', sm: '5xl' }} lineHeight={1.2} fontWeight='bold'>
          Launch Your Community{' '}
          <Text as='span' whiteSpace='nowrap'>
            On-Chain
          </Text>
        </Text>

        <Text mt={2} fontSize={{ base: 'xl', md: '2xl' }} fontWeight='semibold' color='dimgray'>
          A protocol to launch and manage your community spaces using{' '}
          <Link color='primary.500' href='https://use.ink' target='_blank'>
            ink!
          </Link>{' '}
          smart contracts.
        </Text>
      </Flex>
      <Box my={8}>
        <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
          {FEATURES.map((one) => (
            <Box borderWidth='1px' borderColor='primary.100' borderRadius={4} p={4}>
              <Text fontSize='lg' fontWeight='semibold'>
                {one.title}
              </Text>
              <Divider my={2} />
              <Text color='dimgray'>{one.description}</Text>
            </Box>
          ))}
        </SimpleGrid>
      </Box>
      <Box my={8}>
        <Text fontSize='2xl' fontWeight='semibold' bgGradient='linear(to-l, #FF0080, #6753DF)' bgClip='text'>
          Featured spaces powered by InSpace
        </Text>
        <Box my={6}>
          <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={4}>
            {FEATURED_SPACES.map((space) => (
              <SpaceCard space={space} />
            ))}
          </SimpleGrid>
        </Box>
        <Box textAlign='center'>
          <Button as={RouterLink} to='/explore' variant='outline' px={12} colorScheme='primary'>
            Explore More
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

export default About;
