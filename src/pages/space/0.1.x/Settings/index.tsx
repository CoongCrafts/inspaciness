import { Box, Flex, Text } from '@chakra-ui/react';
import DangerZone from '@/pages/space/0.1.x/Settings/DangerZone';
import Membership from '@/pages/space/0.1.x/Settings/Membership';
import Plugins from '@/pages/space/0.1.x/Settings/Plugins';
import SpaceInfo from '@/pages/space/0.1.x/Settings/SpaceInfo';
import UpgradeVersion from '@/pages/space/0.1.x/Settings/UpgradeVersion';
import { useSpaceContext } from '@/pages/space/0.1.x/SpaceProvider';

export default function Settings() {
  const { isOwner } = useSpaceContext();

  return (
    <Box>
      <Flex gap={2}>
        <Text fontSize='xl' fontWeight='semibold'>
          Settings
        </Text>
      </Flex>
      <SpaceInfo />
      <Membership />
      <Plugins />
      <UpgradeVersion />
      {isOwner && <DangerZone />}
    </Box>
  );
}
