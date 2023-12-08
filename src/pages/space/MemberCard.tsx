import { Badge, Box, Flex, Text } from '@chakra-ui/react';
import { Identicon } from '@polkadot/react-identicon';
import { MemberRecord, MemberStatus, Props } from '@/types';
import { fromNow } from '@/utils/date';
import { toMemberStatus } from '@/utils/members';
import { shortenAddress } from '@/utils/string';
import clsx from 'clsx';

interface MemberCardProps extends Props {
  memberRecord: MemberRecord;
}

function MemberCard({ memberRecord }: MemberCardProps) {
  const { info } = memberRecord;
  const memberStatus = toMemberStatus(info.nextRenewalAt);

  return (
    <Flex
      borderRadius={4}
      p={2}
      gap={2}
      border={1}
      borderStyle='solid'
      borderColor='chakra-border-color'
      alignItems='center'>
      <Flex px={2} gap={2} alignItems='center'>
        <Identicon value={memberRecord.accountId} size={30} theme='polkadot' />
      </Flex>
      <Box>
        <Flex align='center' gap={2}>
          <Text noOfLines={1} fontSize='1rem' fontWeight='semibold' wordBreak='break-word'>
            {info.name || shortenAddress(memberRecord.accountId)}
          </Text>
          <Box>
            <Badge
              fontSize='0.60rem'
              mb={1}
              variant='solid'
              colorScheme={clsx({
                green: memberStatus == MemberStatus.Active,
                red: memberStatus == MemberStatus.Inactive,
                gray: memberStatus == MemberStatus.Left,
              })}>
              {memberStatus}
            </Badge>
          </Box>
        </Flex>
        <Flex gap={2} color='dimgray' fontSize='sm'>
          {info.name && (
            <>
              <Text fontWeight='semibold'>{shortenAddress(memberRecord.accountId)}</Text>
              <Text>•</Text>
            </>
          )}
          <Text>{`Joined ${fromNow(info.joinedAt.toString())}`}</Text>
        </Flex>
      </Box>
    </Flex>
  );
}

export default MemberCard;
