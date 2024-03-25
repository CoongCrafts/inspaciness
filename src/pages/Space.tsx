import {
  Box,
  Button,
  Divider,
  Flex,
  Heading,
  Icon,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Tab,
  TabIndicator,
  TabList,
  Tabs,
  Tag,
  Text,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { MdFlip } from 'react-icons/md';
import { RiChatPollLine, RiFileTextLine, RiSettings4Line, RiTeamLine, RiUserFollowLine } from 'react-icons/ri';
import { Link as LinkRouter, Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import SpaceSkeleton from '@/components/sketeton/SpaceSkeleton';
import SpaceAvatar from '@/components/space/SpaceAvatar';
import useMotherContract from '@/hooks/contracts/useMotherContract';
import useContractState from '@/hooks/useContractState';
import PendingPostsButton from '@/pages/plugins/Posts/PendingPosts/PendingPostsButton';
import CancelRequestButton from '@/pages/space/actions/CancelRequestButton';
import JoinButton from '@/pages/space/actions/JoinButton';
import LeaveSpaceButton from '@/pages/space/actions/LeaveSpaceButton';
import UpdateDisplayNameButton from '@/pages/space/actions/UpdateDisplayNameButton';
import SpaceProvider, { useSpaceContext } from '@/providers/SpaceProvider';
import { CodeHash, MemberStatus, MenuItemType, RegistrationType } from '@/types';
import { renderMd } from '@/utils/mdrenderer';
import { PLUGIN_FLIPPER, PLUGIN_POLLS, PLUGIN_POSTS } from '@/utils/plugins';
import { shortenAddress } from '@/utils/string';
import { ChevronDownIcon } from '@chakra-ui/icons';
import pluralize from 'pluralize';
import { ChainId } from 'useink/chains';

export enum SpacePath {
  Members = 'members',
  PendingMembers = 'pending-members',
  Settings = 'settings',
  Posts = 'posts',
  PendingPosts = 'pending-posts',
  Flipper = 'flipper',
  Polls = 'polls',
}

const MENU_ITEMS: MenuItemType[] = [
  { name: 'Members', path: SpacePath.Members, icon: RiTeamLine },
  { name: 'Pending Members', path: SpacePath.PendingMembers, icon: RiUserFollowLine },
  { name: 'Settings', path: SpacePath.Settings, icon: RiSettings4Line },
];

const PLUGIN_MENU_ITEMS: Record<string, MenuItemType> = {
  [PLUGIN_POSTS]: { name: 'Posts', path: SpacePath.Posts, icon: RiFileTextLine },
  [PLUGIN_FLIPPER]: { name: 'Flipper', path: SpacePath.Flipper, icon: MdFlip },
  [PLUGIN_POLLS]: { name: 'Polls', path: SpacePath.Polls, icon: RiChatPollLine },
};

function SpaceContent() {
  const [menuItems, setMenuItems] = useState<MenuItemType[]>();
  const navigate = useNavigate();
  const location = useLocation();
  const { info, config, space, membersCount, pendingRequestsCount, memberStatus, isOwner, plugins, pendingRequest } =
    useSpaceContext();

  const showPendingMembers = config?.registration === RegistrationType.RequestToJoin && isOwner;

  const showPendingPosts = plugins?.find((plugin) => plugin.id === PLUGIN_POSTS);

  useEffect(() => {
    if (!plugins) return;

    const pluginMenuItems = plugins
      .filter(({ disabled }) => !disabled)
      .map(({ id }) => PLUGIN_MENU_ITEMS[id])
      .filter((x) => x);
    let menuItems = [...pluginMenuItems, ...MENU_ITEMS];
    if (!showPendingMembers) {
      menuItems = menuItems.filter((x) => x.path !== SpacePath.PendingMembers);
    }

    if (location.pathname.endsWith(space.address)) {
      navigate(menuItems[0].path, { replace: true });
    }

    setMenuItems(menuItems);
  }, [plugins]);

  if (!info || !plugins || !menuItems) {
    return <SpaceSkeleton />;
  }

  const activeIndex = menuItems.findIndex((one) => location.pathname.split('/').at(-1) === one.path);
  const showJoinBtn = config?.registration !== RegistrationType.InviteOnly;

  return (
    <Box mt={2}>
      <Flex
        mb={6}
        align={{ base: 'start', sm: 'center' }}
        gap={{ base: 4, sm: 6 }}
        flexDir={{ base: 'column', sm: 'row' }}>
        <Box>{info && <SpaceAvatar space={space} info={info} />}</Box>
        <Flex flex={1} justify='space-between' gap={{ base: 4, md: 8 }} flexDir={{ base: 'column', md: 'row' }}>
          <Box>
            <Heading size={{ base: 'lg', sm: 'md' }} mb={1}>
              {info?.name}
            </Heading>
            <Text as='span' fontSize='md' fontWeight='semibold' color='dimgray'>
              {shortenAddress(space.address)}
            </Text>{' '}
            •{' '}
            <Text as='span' fontSize='md' fontWeight='semibold' color='dimgray'>
              {membersCount} {pluralize('member', membersCount)}
            </Text>
            {info?.desc && (
              <Box
                className='post-content'
                color='gray.800'
                fontSize='16px'
                mt={1}
                dangerouslySetInnerHTML={{ __html: renderMd(info?.desc) }}
              />
            )}
          </Box>
          <Box _empty={{ display: 'none' }}>
            {showJoinBtn &&
              (memberStatus === MemberStatus.None || memberStatus === MemberStatus.Left) &&
              (pendingRequest ? <CancelRequestButton /> : <JoinButton colorScheme='primary' />)}
            {memberStatus === MemberStatus.Inactive && (
              <Button colorScheme='primary' variant='outline' size='sm' onClick={() => toast.info('Coming soon!')}>
                Renew membership
              </Button>
            )}
            {memberStatus === MemberStatus.Active && (
              <Menu>
                <MenuButton as={Button} variant='outline' size='sm' width={100} rightIcon={<ChevronDownIcon />}>
                  Joined
                </MenuButton>
                <MenuList>
                  <MenuItem>
                    <UpdateDisplayNameButton />
                  </MenuItem>
                  {!isOwner && (
                    <MenuItem color='red'>
                      <LeaveSpaceButton />
                    </MenuItem>
                  )}
                </MenuList>
              </Menu>
            )}
          </Box>
        </Flex>
      </Flex>
      <Divider display={{ base: 'none', md: 'flex' }} />
      <Flex flexDir={{ base: 'column', md: 'row' }}>
        <Flex // Navigation bar for large screen
          direction='column'
          display={{ base: 'none', md: 'flex' }}>
          <Flex flexDir='column' position='sticky' top={4} width={220}>
            {showPendingPosts && <PendingPostsButton info={showPendingPosts} />}
            {menuItems.map((one, index) => (
              <Button
                key={one.name}
                leftIcon={<Icon boxSize='5' as={one.icon} />}
                justifyContent={'start'}
                fontSize='sm'
                width='100%'
                gap={2}
                as={LinkRouter}
                variant='link'
                p={2}
                borderRightWidth={activeIndex == index ? 2 : 1}
                borderRightColor={activeIndex == index ? 'primary.500' : 'dark'}
                color={activeIndex == index ? 'primary.500' : 'dark'}
                background={activeIndex == index ? 'primary.50' : 'dark'}
                _hover={{ textDecoration: 'none' }}
                borderRadius={0}
                to={one.path}>
                {one.name}
                {one.path === SpacePath.PendingMembers && !!pendingRequestsCount && (
                  <Tag size='sm' colorScheme='red' variant='solid'>
                    {pendingRequestsCount}
                  </Tag>
                )}
              </Button>
            ))}
          </Flex>
        </Flex>
        <Tabs // Navigation bar for small screen
          index={activeIndex}
          position='relative'
          variant='unstyled'
          borderTop='1px solid'
          borderColor='chakra-border-color'
          overflowX='scroll'
          display={{ base: 'block', md: 'none' }}
          style={{ scrollbarWidth: 'none' }} // Hide scrollbar on Firefox
          css={{
            '&::-webkit-scrollbar': {
              display: 'none', // Hide scrollbar on Chromium
            },
          }}>
          <TabList>
            {menuItems.map((one) => (
              <Tab key={one.name} as={LinkRouter} to={one.path} _selected={{ boxShadow: 'none' }} whiteSpace='nowrap'>
                {one.name}
                {one.path === SpacePath.PendingMembers && !!pendingRequestsCount && (
                  <Tag ml={2} size='sm' colorScheme='red' variant='solid'>
                    {pendingRequestsCount}
                  </Tag>
                )}
              </Tab>
            ))}
          </TabList>
          <TabIndicator mt='-3px' height='3px' bg='primary.500' borderRadius='2rem' />
        </Tabs>
        <Box
          flex={1}
          borderLeftWidth={{ base: 0, md: 1 }}
          borderTopWidth={{ base: 1, md: 0 }}
          borderColor='chakra-border-color'
          ml={{ base: 0, md: '-1px' }}
          pl={{ base: 0, md: 3 }}
          pt={{ base: 4, md: 2 }}>
          <Outlet />
        </Box>
      </Flex>
    </Box>
  );
}

export default function Space() {
  const { chainId, spaceAddress } = useParams();
  const motherContract = useMotherContract(chainId as ChainId);
  const { state: codeHash } = useContractState<{ Ok: CodeHash; Err: string }>(motherContract, 'spaceCodeHash', [
    spaceAddress!,
  ]);

  if (!codeHash) {
    return <SpaceSkeleton />;
  }

  if (codeHash.Err) {
    // TODO handle error
  }

  return (
    <SpaceProvider
      space={{ address: spaceAddress!, chainId: chainId as ChainId, codeHash: codeHash.Ok }}
      motherContract={motherContract}>
      <SpaceContent />
    </SpaceProvider>
  );
}
