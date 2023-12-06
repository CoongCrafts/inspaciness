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
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router-dom';
import { MAIN_MENU_ITEM } from '@/components/shared/MainHeader';
import { HamburgerIcon } from '@chakra-ui/icons';

export default function MainMenuButton() {
  const navigate = useNavigate();
  const { onClose, onOpen, isOpen } = useDisclosure();

  const doNavigate = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <>
      <IconButton onClick={onOpen} aria-label={'Open Menu'} variant='outline' size='sm' icon={<HamburgerIcon />} />
      <Drawer isOpen={isOpen} onClose={onClose} placement='left' size='full'>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader>
            <Link to='/'>
              <Text fontSize='3xl' fontWeight='bold' color='primary.300'>
                inspace
              </Text>
            </Link>
          </DrawerHeader>
          <DrawerCloseButton size='lg' />
          <DrawerBody>
            <Flex mt={4} gap={2} flexDir='column'>
              {MAIN_MENU_ITEM.map((one) => (
                <Button key={one.name} onClick={() => doNavigate(one.path)}>
                  <Text fontWeight='semibold' color='primary.250'>
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
