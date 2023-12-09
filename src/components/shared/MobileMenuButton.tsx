import {
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  IconButton,
  Image,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router-dom';
import { MAIN_MENU_ITEM } from '@/components/shared/MainHeader';
import { HamburgerIcon } from '@chakra-ui/icons';

interface MobileMenuButtonProps {
  activeIndex: number;
}

export default function MobileMenuButton({ activeIndex }: MobileMenuButtonProps) {
  const navigate = useNavigate();
  const { onClose, onOpen, isOpen } = useDisclosure();

  const doNavigate = (path: string) => {
    if (path.startsWith('http')) {
      window.location.href = path;
    } else {
      navigate(path);
      onClose();
    }
  };

  return (
    <>
      <IconButton onClick={onOpen} aria-label={'Open Menu'} variant='outline' size='sm' icon={<HamburgerIcon />} />
      <Drawer isOpen={isOpen} onClose={onClose} placement='right' size='full'>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader textAlign='center' paddingInline={4}>
            <Link to='/'>
              <Image h='40px' src='/inspace-rounded-logo.png' alt='InSpace Logo' />
            </Link>
          </DrawerHeader>
          <DrawerCloseButton size='lg' />
          <DrawerBody paddingInline={4}>
            <Flex mt={4} gap={2} flexDir='column'>
              {MAIN_MENU_ITEM.map((one, index) => (
                <Button
                  justifyContent='start'
                  borderRadius={0}
                  py={2}
                  variant='link'
                  key={one.name}
                  onClick={() => doNavigate(one.path)}>
                  <Text
                    fontWeight='semibold'
                    color={activeIndex === index ? 'primary.600' : 'gray.600'}
                    textDecoration={activeIndex === index ? 'underline' : 'none'}>
                    {one.name}
                  </Text>
                </Button>
              ))}
            </Flex>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}
