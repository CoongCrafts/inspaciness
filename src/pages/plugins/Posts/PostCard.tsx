import { Box, Flex, IconButton, Menu, MenuButton, MenuItem, MenuList, Text } from '@chakra-ui/react';
import { Identicon } from '@polkadot/react-identicon';
import { RiMore2Fill } from 'react-icons/ri';
import useContractState from '@/hooks/useContractState';
import UpdatePostButton from '@/pages/plugins/Posts/action/UpdatePostButton';
import { useSpaceContext } from '@/providers/SpaceProvider';
import { useWalletContext } from '@/providers/WalletProvider';
import { MemberInfo, PostContent, PostRecord, Props } from '@/types';
import { fromNow } from '@/utils/date';
import { renderMd } from '@/utils/mdrenderer';
import { shortenAddress } from '@/utils/string';

interface PostCardProps extends Props {
  postRecord: PostRecord;
}

export default function PostCard({ postRecord: { post, postId } }: PostCardProps) {
  const { contract } = useSpaceContext();
  const { state: authorInfo } = useContractState<MemberInfo>(contract, 'memberInfo', [post.author]);
  const { selectedAccount } = useWalletContext();

  if (!authorInfo || !(PostContent.Raw in post.content)) {
    return null;
  }

  const isAuthor = post.author === selectedAccount?.address;

  return (
    <>
      <Box key={postId} border='1px' borderColor='gray.200' px={4} py={2} borderRadius={4} mb={4}>
        <Flex justifyContent='space-between'>
          <Flex gap={2} mb={1} alignItems='center'>
            <Identicon value={post.author} size={24} theme='polkadot' />
            <Flex flexDir='column'>
              <Text fontWeight='semibold' color='gray.600'>
                {authorInfo.name || shortenAddress(post.author)}
              </Text>
              <Flex gap={1}>
                <Text fontSize='sm' color='gray.500'>
                  {fromNow(post.createdAt)}
                </Text>
                {post.updatedAt && (
                  <Text fontSize='sm' color='gray.500'>
                    - edited
                  </Text>
                )}
              </Flex>
            </Flex>
          </Flex>
          <Menu placement='left'>
            <MenuButton
              as={IconButton}
              aria-label='Menu Button'
              icon={<RiMore2Fill />}
              size='sm'
              variant='ghost'
              mr={-2}
            />
            <MenuList>
              <MenuItem>{isAuthor && <UpdatePostButton postId={postId} post={post} />}</MenuItem>
            </MenuList>
          </Menu>
        </Flex>
        <Box
          className='post-content'
          mt={3}
          dangerouslySetInnerHTML={{ __html: renderMd(post.content.Raw || '') }}></Box>
      </Box>
    </>
  );
}
