import { Box, Button, Divider, Flex, Link, SimpleGrid, Tag, Text } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import SpaceCard from '@/components/space/SpaceCard';
import { OnChainSpace } from '@/types';
import { AlephTestnet, RococoContractsTestnet } from 'useink/chains';

const FEATURED_SPACES: OnChainSpace[] = [
  {
    chainId: AlephTestnet.id,
    address: '5HmQUVoD4WfWMoRifYaTGeQaBdKJznvoNLUsRLzQLU6Voijb',
  },
  {
    chainId: RococoContractsTestnet.id,
    address: '5GB9sKMqKfUTMHmA1YfWrFb43xJHFGb8vra7Bv9tKnPWiBjz',
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
        <Box>
          <Text fontSize='lg' fontWeight='semibold'>
            📱 Works on both desktop and mobile devices
          </Text>
          <Text color='dimgray'>
            Engage with your community while on the go with the support of{' '}
            <Link href='http://coongwallet.io' target='_blank' color='primary.500'>
              Coong Wallet
            </Link>
            .
          </Text>
        </Box>
        <Divider my={4} />
        <Box>
          <Text fontSize='lg' fontWeight='semibold'>
            🛡️ Full control over contracts and data
          </Text>
          <Text color='dimgray'>
            Launch your own smart contracts to manage your spaces, and of course you own the data.
          </Text>
        </Box>
        <Divider my={4} />
        <Box>
          <Text fontSize='lg' fontWeight='semibold'>
            🔌️ Expand functionalities with plugins
          </Text>
          <Text color='dimgray'>Add more functionalities for your spaces by installing plugins.</Text>
        </Box>
        <Divider my={4} />
        <Box>
          <Text fontSize='lg' fontWeight='semibold'>
            🤝 Flexible membership models
          </Text>
          <Text color='dimgray'>Space memberships can be free, one time paid or maintained via a subscription.</Text>
        </Box>
        <Divider my={4} />
        <Box>
          <Text fontSize='lg' fontWeight='semibold'>
            ⚙️ Upgradability
          </Text>
          <Text color='dimgray'>
            Enhance your spaces and plugins by upgrading to newer versions, and it's your choice to upgrade or not.
          </Text>
        </Box>
        <Divider my={4} />
        <Box>
          <Text fontSize='lg' fontWeight='semibold'>
            🔑 Private spaces <Tag>Coming soon</Tag>
          </Text>
          <Text color='dimgray'>
            Only active members can access confidential information on spaces by proving proof-of-memberships.
          </Text>
        </Box>
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
