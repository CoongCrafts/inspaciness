import { Box, Button, Flex, Tag, Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useWindowScroll } from 'react-use';
import PostsCardSkeleton from '@/components/sketeton/PostsCardSkeleton';
import usePagination from '@/hooks/usePagination';
import PostCard from '@/pages/plugins/Posts/PostCard';
import { usePostsContext } from '@/pages/plugins/Posts/PostsProvider';
import NewPostButton from '@/pages/plugins/Posts/action/NewPostButton';
import { useSpaceContext } from '@/providers/SpaceProvider';
import { MemberStatus, PostRecord, Props } from '@/types';

const RECORD_PER_PAGE = 5;

interface PostsContentProps extends Props {
  nonce: number;
  setNonce: (nonce: number) => void;
}

function PostsContent({ nonce, setNonce }: PostsContentProps) {
  const { memberStatus } = useSpaceContext();
  const { contract, postsCount } = usePostsContext();

  const [storage, setStorage] = useState<PostRecord[]>([]);
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
      setStorage((prevState) => [...prevState, ...items]);
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

  const handlePostCreated = () => {
    // TODO: Get postId from result of newPostTx to set nonce
    setNonce(postsCount! + 1);
  };

  const handlePostUpdated = (content: any, postId: number) => {
    setStorage((prevState) => {
      const postIndex = prevState.findIndex((one) => one.postId === postId);
      const { post } = prevState[postIndex];
      post.content = content;
      post.updatedAt = Date.now();

      return prevState.toSpliced(postIndex, 1, { postId, post });
    });
  };

  const hasNewPost = postsCount! - nonce;

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
          <Flex gap={2}>
            {hasNewPost !== 0 && (
              <Button onClick={() => setNonce(postsCount!)} variant='outline' size='sm'>
                {`New posted (${hasNewPost})`}
              </Button>
            )}
            {memberStatus === MemberStatus.Active && <NewPostButton onPostCreated={handlePostCreated} />}
          </Flex>
        </Flex>
      </Box>
      <Box>
        {storage.length !== 0
          ? storage.map((postRecord) => (
              <PostCard key={postRecord.postId} postRecord={postRecord} handlePostUpdated={handlePostUpdated} />
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
