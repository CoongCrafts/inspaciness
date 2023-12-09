import { Box, Container, Flex, Image, Text, useMediaQuery } from '@chakra-ui/react';
import { Link, useLocation } from 'react-router-dom';
import AccountSelection from '@/components/AccountSelection';
import WalletSelection from '@/components/dialog/WalletSelection';
import MobileMenuButton from '@/components/shared/MobileMenuButton';
import { useWalletContext } from '@/providers/WalletProvider';
import { MenuItemType } from '@/types';

export const MAIN_MENU_ITEM: MenuItemType[] = [
  { name: 'Home', path: '/' },
  { name: 'Explore', path: '/explore' },
  { name: 'Github', path: 'https://github.com/CoongCrafts/inspaciness' },
  { name: 'Faucets', path: '/faucets' },
];

export default function MainHeader() {
  const { pathname } = useLocation();
  const { injectedApi } = useWalletContext();
  const activeIndex = MAIN_MENU_ITEM.findIndex(
    (one) => pathname == one.path || pathname.split('/').at(-1) === one.path,
  );
  const [smallScreen] = useMediaQuery('(max-width: 700px)');

  return (
    <Box borderBottom={1} borderStyle='solid' borderColor='chakra-border-color'>
      <Container
        maxWidth='container.lg'
        px={4}
        mx='auto'
        display='flex'
        justifyContent='space-between'
        alignItems='center'
        gap={4}
        h={16}>
        <Link to='/'>
          <Image h='40px' src='/inspace-rounded-logo.png' alt='InSpace Logo' />
        </Link>
        {!smallScreen && (
          <Flex gap={6} fontWeight='semibold'>
            {MAIN_MENU_ITEM.map((one, index) => (
              <Link key={one.name} to={one.path} target={one.path.startsWith('http') ? '_blank' : '_self'}>
                <Text
                  color={activeIndex === index ? 'primary.600' : 'gray.600'}
                  textDecoration={activeIndex === index ? 'underline' : 'none'}>
                  {one.name}
                </Text>
              </Link>
            ))}
          </Flex>
        )}
        <Flex gap={2} alignItems='center'>
          {!!injectedApi ? <AccountSelection /> : <WalletSelection />}
          {smallScreen && <MobileMenuButton activeIndex={activeIndex} />}
        </Flex>
      </Container>
    </Box>
  );
}
