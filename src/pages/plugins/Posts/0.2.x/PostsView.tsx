import { Box, Button, Flex, Link, Tag, Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useWindowScroll } from 'react-use';
import PostsCardSkeleton from '@/components/sketeton/PostsCardSkeleton';
import useContractState from '@/hooks/useContractState';
import usePagination from '@/hooks/usePagination';
import { PostRecord } from '@/types';
import { eventEmitter, EventName } from '@/utils/eventemitter';
import pluralize from 'pluralize';
import PostCard from './PostCard';
import { usePostsContext } from './PostsProvider';
import NewPostButton from './actions/NewPostButton';

const RECORD_PER_PAGE = 6;

function PostsContent() {
  const { contract, postsCount, canCreatePost, nonce, setNonce } = usePostsContext();
  const [recentPosts, setRecentPosts] = useState<PostRecord[]>();
  const { state: pinnedPosts } = useContractState<PostRecord[]>(contract, 'listPinnedPosts');
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

  useEffect(() => {
    setRecentPosts(posts?.filter((post) => !pinnedPosts?.some((pinnedPost) => pinnedPost.postId === post.postId)));
  }, [pinnedPosts, posts]);

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
  const numberOfPinnedPosts = pinnedPosts?.length || 0;
  const numberOfRecentPosts = numOfPost - numberOfPinnedPosts;

  return (
    <>
      <Box>
        <Flex justifyContent='space-between' align='center' mb={4} gap={2}>
          <Flex gap={2} align='center'>
            <Text fontSize='xl' fontWeight='semibold'>
              Posts
            </Text>
          </Flex>
          <Box>{canCreatePost && <NewPostButton onPostCreated={onPostCreated} />}</Box>
        </Flex>
      </Box>
      {numberOfPinnedPosts > 0 && (
        <Flex flexDir='column' mb={4} gap={2}>
          <Flex gap={2} align='center'>
            <Text color='gray' fontWeight='semibold'>
              Pinned
            </Text>
            <Box>
              <Tag>{numberOfPinnedPosts}</Tag>
            </Box>
          </Flex>
          <Box>
            {pinnedPosts?.map((postRecord) => (
              <PostCard key={postRecord.postId} postRecord={postRecord} onPostUpdated={onPostUpdated} isPinned />
            ))}
          </Box>
        </Flex>
      )}
      <Box>
        <Flex flexDir='column' mb={4} gap={2}>
          {numberOfRecentPosts > 0 && (
            <Flex gap={2} align='center'>
              <Text color='gray' fontWeight='semibold'>
                Recent
              </Text>
              <Box>
                <Tag>{numberOfRecentPosts}</Tag>
              </Box>
            </Flex>
          )}
          {newPostsCount > 0 && (
            <Button onClick={() => setNonce(postsCount!)} variant='outline' size='sm' width='full' mb={2}>
              View {newPostsCount.toString().padStart(2, '0')} New {pluralize('Post', newPostsCount)}
            </Button>
          )}
          {numOfPost === 0 &&
            newPostsCount === 0 &&
            numberOfPinnedPosts === 0 &&
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

          <Box>
            {recentPosts
              ? recentPosts.map((postRecord) => (
                  <PostCard key={postRecord.postId} postRecord={postRecord} onPostUpdated={onPostUpdated} />
                ))
              : [...Array(5)].map((_, idx) => <PostsCardSkeleton key={idx} />)}
          </Box>
        </Flex>
      </Box>
    </>
  );
}

export default function PostsView() {
  const { nonce } = usePostsContext();

  return <PostsContent key={nonce} />;
}
