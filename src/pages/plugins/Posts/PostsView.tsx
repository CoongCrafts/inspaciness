import { Box, Button, Flex, Link, Tag, Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useWindowScroll } from 'react-use';
import PostsCardSkeleton from '@/components/sketeton/PostsCardSkeleton';
import usePagination from '@/hooks/usePagination';
import PostCard from '@/pages/plugins/Posts/PostCard';
import { usePostsContext } from '@/pages/plugins/Posts/PostsProvider';
import NewPostButton from '@/pages/plugins/Posts/actions/NewPostButton';
import { useSpaceContext } from '@/providers/SpaceProvider';
import { MemberStatus, PostRecord, Props } from '@/types';
import { eventEmitter, EventName } from '@/utils/eventemitter';
import pluralize from 'pluralize';

const RECORD_PER_PAGE = 4;

interface PostsContentProps extends Props {
  nonce: number;
  setNonce: (nonce: number) => void;
}

function PostsContent({ nonce, setNonce }: PostsContentProps) {
  const { memberStatus } = useSpaceContext();
  const { contract, postsCount } = usePostsContext();

  const [posts, setPosts] = useState<PostRecord[]>();
  const [onLoad, setOnLoad] = useState(true);
  const {
    items,
    pageIndex,
    setPageIndex,
    hasNextPage,
    total: numOfPost,
  } = usePagination<PostRecord>(contract, 'listPosts', RECORD_PER_PAGE, true, nonce);
  const { y } = useWindowScroll();

  useEffect(() => {
    if (items && onLoad) {
      setOnLoad(false);
      setPosts((prevState = []) => [...prevState, ...items]);
    }
  }, [items]);

  useEffect(() => {
    if (onLoad || !hasNextPage) return;

    // When the current view bottom -> the bottom of web <= 50 pixel
    if (document.body.offsetHeight - y - innerHeight <= 100) {
      setOnLoad(true);
      setPageIndex(pageIndex + 1);
    }
  }, [onLoad, y]);

  const onPostCreated = () => {
    // TODO: Get postId from result of newPostTx to set nonce
    setNonce(postsCount! + 1);
  };

  const onPostUpdated = (content: any, postId: number) => {
    setPosts((prevState = []) => {
      const postIndex = prevState.findIndex((one) => one.postId === postId);
      const { post } = prevState[postIndex];
      post.content = content;
      post.updatedAt = Date.now();

      return prevState.toSpliced(postIndex, 1, { postId, post });
    });
  };

  const newPostsCount = postsCount! - nonce;
  const canCreatePost = memberStatus === MemberStatus.Active;

  return (
    <>
      <Box>
        <Flex justify='space-between' align='center' mb={4} gap={2}>
          <Flex gap={2} align='center'>
            <Text fontSize='xl' fontWeight='semibold'>
              Posts
            </Text>
            <Box>
              <Tag>{numOfPost}</Tag>
            </Box>
          </Flex>
          <Box>{canCreatePost && <NewPostButton onPostCreated={onPostCreated} />}</Box>
        </Flex>
      </Box>
      <Box>
        {newPostsCount > 0 && (
          <Button onClick={() => setNonce(postsCount!)} variant='outline' size='sm' width='full' mb={2}>
            View {newPostsCount.toString().padStart(2, '0')} New {pluralize('Post', newPostsCount)}
          </Button>
        )}
        {posts?.length === 0 &&
          newPostsCount === 0 &&
          (canCreatePost ? (
            <Text>
              There are no posts in this space,{' '}
              <Link onClick={() => eventEmitter.emit(EventName.SHOW_NEW_POST_POPUP)} color='primary.500'>
                create a new post
              </Link>{' '}
              now!
            </Text>
          ) : (
            <Text>There are no posts in this space, check back later.</Text>
          ))}
        {posts
          ? posts.map((postRecord) => (
              <PostCard key={postRecord.postId} postRecord={postRecord} onPostUpdated={onPostUpdated} />
            ))
          : [...Array(5)].map((_, idx) => <PostsCardSkeleton key={idx} />)}
      </Box>
    </>
  );
}

export default function PostsView() {
  const { postsCount } = usePostsContext();
  const [nonce, setNonce] = useState<number>(postsCount!);

  return <PostsContent key={nonce} nonce={nonce} setNonce={setNonce} />;
}
