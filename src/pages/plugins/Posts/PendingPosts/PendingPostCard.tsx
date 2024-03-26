import { Box, Flex, IconButton, Menu, MenuButton, MenuList, Text } from '@chakra-ui/react';
import { Identicon } from '@polkadot/react-identicon';
import { RiMore2Fill } from 'react-icons/ri';
import useContractState from '@/hooks/useContractState';
import CancelPendingPostButton from '@/pages/plugins/Posts/PendingPosts/CancelPendingPostButton';
import UpdatePendingPostButton from '@/pages/plugins/Posts/PendingPosts/UpdatePendingPostButton';
import { useSpaceContext } from '@/providers/SpaceProvider';
import { MemberInfo, PostContent, PostRecord, Props } from '@/types';
import { fromNow } from '@/utils/date';
import { renderMd } from '@/utils/mdrenderer';
import { shortenAddress } from '@/utils/string';

interface PendingPostCardProps extends Props {
  postRecord: PostRecord;
}

export default function PendingPostCard({ postRecord: { post, postId } }: PendingPostCardProps) {
  const { contract } = useSpaceContext();
  const { state: authorInfo } = useContractState<MemberInfo>(contract, 'memberInfo', [post.author]);

  if (!authorInfo || !(PostContent.Raw in post.content)) {
    return null;
  }

  return (
    <Box key={postId} border='1px' borderColor='chakra-border-color' p={4} borderRadius={4} mb={2}>
      <Flex justifyContent='space-between' alignItems='center'>
        <Flex gap={2} mb={1} alignItems='start'>
          <Identicon value={post.author} size={30} theme='polkadot' />
          <Flex direction='column'>
            <Flex align='center' gap={1} mb={1} fontWeight='semibold' wrap='wrap' mt='-2px'>
              <Text lineHeight={1}>{authorInfo.name || shortenAddress(post.author)}</Text>
              {authorInfo.name && (
                <Text fontSize='sm' lineHeight={1} color='gray.500' mt='1px'>
                  {shortenAddress(post.author)}
                </Text>
              )}
            </Flex>
            <Flex gap={1}>
              <Text fontSize='sm' color='gray.500' lineHeight={1}>
                {fromNow(post.createdAt)}
              </Text>
              {post.updatedAt && (
                <Text fontSize='sm' color='gray.500' lineHeight={1}>
                  - edited
                </Text>
              )}
            </Flex>
          </Flex>
        </Flex>
        <Box>
          <Menu placement='bottom'>
            <MenuButton
              as={IconButton}
              aria-label='Menu Button'
              icon={<RiMore2Fill />}
              size='sm'
              variant='ghost'
              mr={-2}
            />
            <MenuList py={0}>
              <UpdatePendingPostButton key={post.content.Raw} postId={postId} defaultValue={post.content.Raw} />
              <CancelPendingPostButton postId={postId} />
            </MenuList>
          </Menu>
        </Box>
      </Flex>
      <Box className='post-content' mt={2} dangerouslySetInnerHTML={{ __html: renderMd(post.content.Raw || '') }}></Box>
    </Box>
  );
}
