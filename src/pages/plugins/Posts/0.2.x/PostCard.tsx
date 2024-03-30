import { Box, Flex, IconButton, Link, Menu, MenuButton, MenuList, SkeletonText, Text } from '@chakra-ui/react';
import { Identicon } from '@polkadot/react-identicon';
import { useEffect, useState } from 'react';
import { RiMore2Fill } from 'react-icons/ri';
import { toast } from 'react-toastify';
import { useAsync } from 'react-use';
import useContractState from '@/hooks/useContractState';
import CommentsView from '@/pages/plugins/Posts/0.2.x/CommentsView';
import { usePostsContext } from '@/pages/plugins/Posts/0.2.x/PostsProvider';
import { useSpaceContext } from '@/pages/space/0.1.x/SpaceProvider';
import { useWalletContext } from '@/providers/WalletProvider';
import { MemberInfo, MemberStatus, PostContent, PostRecord, Props } from '@/types';
import { fromNow } from '@/utils/date';
import { getData } from '@/utils/ipfs';
import { renderMd } from '@/utils/mdrenderer';
import { shortenAddress } from '@/utils/string';
import PinPostButton from './actions/PinPostButton';
import UnpinPostButton from './actions/UnpinPostButton';
import UpdatePostButton from './actions/UpdatePostButton';

interface PostCardProps extends Props {
  postRecord: PostRecord;
  isPinned?: boolean;
  onPostUpdated: (content: any, postId: number) => void;
}

export default function PostCard({ postRecord: { post, postId }, onPostUpdated, isPinned }: PostCardProps) {
  const { contract: postContract } = usePostsContext();
  const { contract, memberStatus, isOwner } = useSpaceContext();
  const { state: authorInfo } = useContractState<MemberInfo>(contract, 'memberInfo', [post.author]);
  const [content, setContent] = useState<string>('');
  const { selectedAccount } = useWalletContext();
  const { state: comments } = useContractState<PostRecord[]>(postContract, 'commentsByPost', [postId]);
  const [showMore, setShowMore] = useState(false);
  const postContentType = PostContent.IpfsCid in post.content ? PostContent.IpfsCid : PostContent.Raw;

  useEffect(() => {
    if (content.length > 500) {
      setShowMore(true);
    }
  }, [content]);

  useAsync(async () => {
    setContent('');

    switch (postContentType) {
      case 'IpfsCid':
        try {
          const content = await getData((post.content as { [PostContent.IpfsCid]: string }).IpfsCid);
          return setContent(content);
        } catch (e) {
          return toast.error((e as Error).message);
        }
      case 'Raw':
        return setContent((post.content as { [PostContent.Raw]: string }).Raw);
    }
  }, [post.content]);

  // We have not supported PostContent.IpfsCid yet
  if (!authorInfo) {
    return null;
  }

  const canEditPost = isOwner || post.author === selectedAccount?.address;
  const isActiveMember = memberStatus === MemberStatus.Active;

  return (
    <>
      <Box key={postId} border='1px' borderColor='chakra-border-color' p={4} pb={2} borderRadius={4} mb={2}>
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
            {isActiveMember && canEditPost && (
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
                  <UpdatePostButton
                    key={content}
                    postRecord={{ post, postId }}
                    defaultValue={content}
                    onPostUpdated={onPostUpdated}
                  />
                  {isOwner && (isPinned ? <UnpinPostButton postId={postId} /> : <PinPostButton postId={postId} />)}
                </MenuList>
              </Menu>
            )}
          </Box>
        </Flex>
        {content ? (
          <>
            <Box
              className='post-content'
              mt={2}
              dangerouslySetInnerHTML={{
                __html: showMore ? renderMd(`${content.slice(0, 500)}...`) : renderMd(content),
              }}></Box>
            {showMore && (
              <Link fontSize='small' color='primary.500' onClick={() => setShowMore(false)}>
                Show more
              </Link>
            )}
          </>
        ) : (
          <SkeletonText p={4} />
        )}
        {comments && <CommentsView comments={comments.toReversed()} postId={postId} />}
      </Box>
    </>
  );
}
