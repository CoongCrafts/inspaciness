import { Box, Flex, Tag, Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useWindowScroll } from 'react-use';
import usePagination from '@/hooks/usePagination';
import PostCard from '@/pages/plugins/Posts/PostCard';
import PostsProvider, { usePostsContext } from '@/pages/plugins/Posts/PostsProvider';
import NewPostButton from '@/pages/plugins/Posts/action/NewPostButton';
import { useSpaceContext } from '@/providers/SpaceProvider';
import { MemberStatus, Ordering, PostRecord } from '@/types';
import { PLUGIN_POSTS } from '@/utils/plugins';

const RECORD_PER_PAGE = 5;

function PostsContent() {
  const { memberStatus } = useSpaceContext();
  const { contract } = usePostsContext();
  const [onLoad, setOnLoad] = useState(true);
  const [storage, setStorage] = useState<PostRecord[]>([]);
  const {
    items,
    pageIndex,
    setPageIndex,
    hasNextPage,
    total: numOfPost,
  } = usePagination<PostRecord>(contract, 'listPosts', RECORD_PER_PAGE);
  const { y } = useWindowScroll();

  console.log(items);

  useEffect(() => {
    if (items && onLoad) {
      setOnLoad(false);
      setStorage((prevState) => [...prevState, ...items]);
    }
  }, [items]);

  useEffect(() => {
    if (onLoad || !hasNextPage) return;

    // When the current view bottom -> the bottom of web <= 50 pixel
    if (document.body.offsetHeight - y - innerHeight <= 50) {
      setOnLoad(true);
      setPageIndex(pageIndex + 1);
    }
  }, [onLoad, y]);

  return (
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
        <Flex gap={2}>{memberStatus === MemberStatus.Active && <NewPostButton />}</Flex>
      </Flex>

      <Box>
        {storage?.map((postRecord) => (
          <PostCard key={postRecord.postId} postRecord={postRecord} />
        ))}
      </Box>
    </Box>
  );
}

export default function Posts() {
  const { plugins } = useSpaceContext();
  const postPlugin = plugins?.find((p) => p.id === PLUGIN_POSTS);
  if (!postPlugin) {
    return null;
  }

  if (postPlugin.disabled) {
    return (
      <Box>
        <Text>This feature is disabled</Text>
      </Box>
    );
  }

  return (
    <PostsProvider info={postPlugin}>
      <PostsContent />
    </PostsProvider>
  );
}
