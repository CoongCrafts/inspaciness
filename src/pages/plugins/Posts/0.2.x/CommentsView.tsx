import { Box, Button, Collapse, Flex, Text, Textarea } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import useCurrentFreeBalance from '@/hooks/space/useCurrentFreeBalance';
import { useTx } from '@/hooks/useink/useTx';
import CommentCard from '@/pages/plugins/Posts/0.2.x/CommentCard';
import { usePostsContext } from '@/pages/plugins/Posts/0.2.x/PostsProvider';
import { useSpaceContext } from '@/pages/space/0.1.x/SpaceProvider';
import { MemberStatus, Props } from '@/types';
import { messages } from '@/utils/messages';
import { notifyTxStatus } from '@/utils/notifications';
import pluralize from 'pluralize';
import { shouldDisableStrict } from 'useink/utils';

interface CommentsViewProps extends Props {
  comments: number[];
  postId: number;
}

export default function CommentsView({ comments, postId }: CommentsViewProps) {
  const { memberStatus } = useSpaceContext();
  const { contract } = usePostsContext();
  const newCommentTx = useTx(contract, 'newComment');
  const freeBalance = useCurrentFreeBalance();
  const [comment, setComment] = useState<string>('');
  const [isOpenComment, setIsOpenComment] = useState<boolean>(false);
  const [viewingComments, setViewingComments] = useState<number[]>([]);

  useEffect(() => {
    setViewingComments((prevState) => [...new Set([...comments.slice(0, 5), ...prevState])]);
  }, [comments]);

  const numberOfComments = comments.length;
  const isActiveMember = memberStatus === MemberStatus.Active;

  const doComment = () => {
    if (!comment) return;

    if (freeBalance === 0) {
      toast.error(messages.insufficientBalance);
      return;
    }

    const commentContentRaw = { Raw: comment };

    newCommentTx.signAndSend([postId, commentContentRaw], {}, (result) => {
      if (!result) {
        newCommentTx.resetState();
        return;
      }

      notifyTxStatus(result);

      if (result?.isInBlock) {
        if (result.dispatchError) {
          toast.error(messages.txError);
        } else {
          toast.success('Commented');
          setComment('');
          newCommentTx.resetState();
        }
      }
    });
  };

  const processing = shouldDisableStrict(newCommentTx);
  const viewingCommentsCount = viewingComments.length;

  const loadMore = () => {
    setViewingComments((prevState) => [
      ...new Set([...prevState, ...comments.slice(viewingCommentsCount, viewingCommentsCount + 5)]),
    ]);
  };

  return (
    <Flex flexDir='column' gap={2} width='100%' mt={4}>
      <Text
        onClick={() => setIsOpenComment((pre) => !pre)}
        alignSelf='end'
        _hover={{ textDecoration: 'underline' }}
        userSelect='none'
        cursor='pointer'
        fontWeight='semibold'
        fontSize='0.9rem'
        color='gray.500'>
        {numberOfComments} {pluralize('comments', numberOfComments)}
      </Text>
      <Collapse in={isOpenComment} animateOpacity>
        <Box p={1}>
          {isActiveMember && (
            <Flex gap={2}>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder='Write a comment'
                rows={1}
              />
              <Button
                onClick={doComment}
                colorScheme={'primary'}
                isLoading={processing}
                isDisabled={!comment || processing}
                fontSize='sm'>
                Comment
              </Button>
            </Flex>
          )}
          <Flex flexDir='column' gap={8} mt={4}>
            {viewingComments.map((commentId) => (
              <CommentCard key={commentId} commentId={commentId} />
            ))}
          </Flex>
          {viewingCommentsCount < numberOfComments && (
            <Button onClick={loadMore} mt={4} variant='outline' size='sm' width='full'>
              Load more
            </Button>
          )}
        </Box>
      </Collapse>
    </Flex>
  );
}
