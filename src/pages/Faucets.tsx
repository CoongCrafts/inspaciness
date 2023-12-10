import { Box, Flex, Link, Text } from '@chakra-ui/react';

export default function Faucets() {
  return (
    <Box>
      <Flex flex={1} justify='space-between' alignItems='center' mb={4}>
        <Box>
          <Text fontSize='xl' fontWeight='semibold'>
            Testnet faucets
          </Text>
          <Text color='dimgray'>Claim some free testnet tokens to try out InSpace</Text>
        </Box>
      </Flex>
      <Box>
        <Text mb={1}>
          👉{' '}
          <Link color='primary.500' href='https://use.ink/faucet' target='_blank'>
            Rococo Contracts
          </Link>
        </Text>

        <Text mb={1}>
          👉{' '}
          <Link color='primary.500' href='https://faucet.test.azero.dev/' target='_blank'>
            Aleph Zero Testnet
          </Link>
        </Text>

        <Text mb={1}>
          👉{' '}
          <Link color='primary.500' href='https://docs.astar.network/docs/build/environment/faucet/' target='_blank'>
            Shibuya (Astar)
          </Link>
        </Text>
      </Box>
    </Box>
  );
}
