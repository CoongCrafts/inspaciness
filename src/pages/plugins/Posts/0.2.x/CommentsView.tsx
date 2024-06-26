import { Box, Button, Collapse, Divider, Flex, Text, Textarea, Tooltip } from '@chakra-ui/react';
import { Identicon } from '@polkadot/react-identicon';
import { useEffect, useState } from 'react';
import ResizeTextarea from 'react-textarea-autosize';
import { toast } from 'react-toastify';
import useCurrentFreeBalance from '@/hooks/space/useCurrentFreeBalance';
import { useTx } from '@/hooks/useink/useTx';
import CommentCard from '@/pages/plugins/Posts/0.2.x/CommentCard';
import { usePostsContext } from '@/pages/plugins/Posts/0.2.x/PostsProvider';
import { useSpaceContext } from '@/pages/space/0.1.x/SpaceProvider';
import { useWalletContext } from '@/providers/WalletProvider';
import { MemberStatus, PostRecord, Props } from '@/types';
import { pinData, unpinData } from '@/utils/ipfs';
import { messages } from '@/utils/messages';
import { notifyTxStatus } from '@/utils/notifications';
import { shortenAddress } from '@/utils/string';
import pluralize from 'pluralize';
import { shouldDisableStrict } from 'useink/utils';

interface CommentsViewProps extends Props {
  comments: PostRecord[];
  postId: number;
}

export default function CommentsView({ comments, postId }: CommentsViewProps) {
  const { selectedAccount } = useWalletContext();
  const { memberStatus, memberInfo } = useSpaceContext();
  const { contract } = usePostsContext();
  const newCommentTx = useTx(contract, 'newComment');
  const freeBalance = useCurrentFreeBalance();
  const [comment, setComment] = useState<string>('');
  const [isOpenComment, setIsOpenComment] = useState<boolean>(false);
  const [viewingComments, setViewingComments] = useState<number[]>([]);
  const [onSubmitting, setOnSubmitting] = useState<boolean>(false);

  useEffect(() => {
    setViewingComments((prevState) => [...new Set([...comments.slice(0, 5).map((one) => one.postId), ...prevState])]);
  }, [comments]);

  const numberOfComments = comments.length;
  const isActiveMember = memberStatus === MemberStatus.Active;

  const doComment = async () => {
    if (!comment) return;

    if (freeBalance === 0) {
      toast.error(messages.insufficientBalance);
      return;
    }

    setOnSubmitting(true);

    try {
      const cid = await pinData(comment);
      const commentContent = { IpfsCid: cid };

      newCommentTx.signAndSend([postId, commentContent], {}, async (result) => {
        if (!result) {
          newCommentTx.resetState();
          await unpinData(cid);
          return;
        }

        notifyTxStatus(result);

        if (result?.isInBlock) {
          if (result.dispatchError) {
            toast.error(messages.txError);
            await unpinData(cid);
          } else {
            toast.success('Commented');
            setComment('');
            newCommentTx.resetState();
          }
        }
      });
    } catch (e) {
      toast.error((e as Error).message);
    }

    setOnSubmitting(false);
  };

  const processing = shouldDisableStrict(newCommentTx) || onSubmitting;
  const viewingCommentsCount = viewingComments.length;

  const loadMore = () => {
    setViewingComments((prevState) => [
      ...new Set([
        ...prevState,
        ...comments.slice(viewingCommentsCount, viewingCommentsCount + 5).map((one) => one.postId),
      ]),
    ]);
  };

  return (
    <Flex flexDir='column' gap={2} width='100%' mt={2}>
      <Text
        onClick={() => setIsOpenComment((pre) => !pre)}
        alignSelf='end'
        _hover={{ textDecoration: 'underline' }}
        userSelect='none'
        cursor='pointer'
        fontWeight='semibold'
        fontSize='xs'
        color='gray.500'>
        {numberOfComments} {pluralize('comments', numberOfComments)}
      </Text>
      <Collapse in={isOpenComment} animateOpacity>
        <Box p={1}>
          {isActiveMember && (
            <Flex gap={2} alignItems='center'>
              <Tooltip label={memberInfo?.name || shortenAddress(selectedAccount?.address)} placement='top'>
                <Box>
                  <Identicon value={selectedAccount?.address} size={22} theme='polkadot' />
                </Box>
              </Tooltip>
              <Textarea
                minH='unset'
                overflow='hidden'
                w='100%'
                resize='none'
                minRows={1}
                as={ResizeTextarea}
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
          {viewingComments.length == 0 && (
            <Box mt={4}>
              <Text fontSize='xs' color='gray.500' textAlign='center'>
                No comments
              </Text>
            </Box>
          )}

          {viewingComments.length > 0 && <Divider mb={4} mt={isActiveMember ? 4 : 0} />}
          <Flex flexDir='column' gap={5}>
            {viewingComments.map((commentId) => {
              const commentRecord = comments.find((one) => one.postId === commentId);

              if (!commentRecord) return;
              return <CommentCard commentRecord={commentRecord} key={commentId} />;
            })}
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
