import {
  Box,
  Button,
  Flex,
  IconButton,
  Link,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  SkeletonText,
  Text,
  Textarea,
} from '@chakra-ui/react';
import { Identicon } from '@polkadot/react-identicon';
import { useEffect, useState } from 'react';
import { RiMore2Fill } from 'react-icons/ri';
import { toast } from 'react-toastify';
import { useAsync } from 'react-use';
import useCurrentFreeBalance from '@/hooks/space/useCurrentFreeBalance';
import useContractState from '@/hooks/useContractState';
import { useTx } from '@/hooks/useink/useTx';
import { usePostsContext } from '@/pages/plugins/Posts/0.2.x/PostsProvider';
import { useSpaceContext } from '@/pages/space/0.1.x/SpaceProvider';
import { useWalletContext } from '@/providers/WalletProvider';
import { MemberInfo, MemberStatus, PostContent, PostRecord, Props } from '@/types';
import { fromNow } from '@/utils/date';
import { getData, pinData, unpinData } from '@/utils/ipfs';
import { renderMd } from '@/utils/mdrenderer';
import { messages } from '@/utils/messages';
import { shortenAddress } from '@/utils/string';
import { DeleteIcon, EditIcon } from '@chakra-ui/icons';
import { shouldDisableStrict } from 'useink/utils';

interface CommentCardProps extends Props {
  commentRecord: PostRecord;
}

export default function CommentCard({ commentRecord: { postId: commentId, post: comment } }: CommentCardProps) {
  const { contract: spaceContract } = useSpaceContext();
  const { isOwner, memberStatus } = useSpaceContext();
  const { contract } = usePostsContext();
  const { state: authorInfo } = useContractState<MemberInfo>(spaceContract, 'memberInfo', [comment?.author]);
  const { selectedAccount } = useWalletContext();
  const [onEdit, setOnEdit] = useState<boolean>(false);
  const [commentContent, setCommentContent] = useState<string>('');
  const [editCommentContent, setEditCommentContent] = useState<string>('');
  const updateCommentTx = useTx(contract, 'updateComment');
  const deleteCommentTx = useTx(contract, 'deleteComment');
  const freeBalance = useCurrentFreeBalance();
  const commentContentType = PostContent.Raw in comment.content ? PostContent.Raw : PostContent.IpfsCid;
  const [onSubmitting, setOnSubmitting] = useState<boolean>(false);
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    if (commentContent.length > 500) {
      setShowMore(true);
    }
  }, [commentContent]);

  useAsync(async () => {
    setCommentContent('');

    switch (commentContentType) {
      case 'IpfsCid':
        const content = await getData((comment.content as { [PostContent.IpfsCid]: string }).IpfsCid);
        if (!content) {
          return toast.error('Error happen when fetching data from Ipfs');
        }

        return setCommentContent(content);
      case 'Raw':
        return setCommentContent((comment.content as { [PostContent.Raw]: string }).Raw);
    }
  }, [comment.content]);

  if (!authorInfo) {
    return null;
  }

  const canEditComment = selectedAccount?.address === comment.author || isOwner;
  const isActiveMember = memberStatus === MemberStatus.Active;

  const switchEdit = () => {
    setOnEdit((pre) => !pre);
    setEditCommentContent(commentContent);
  };

  const doChange = async () => {
    if (freeBalance === 0) {
      toast.error(messages.insufficientBalance);
      return;
    }

    if (editCommentContent === commentContent) {
      switchEdit();
      return;
    }

    setOnSubmitting(true);
    const oldCommentContent = comment.content;

    let content: any;
    switch (commentContentType) {
      case 'IpfsCid':
        const cid = await pinData(editCommentContent);
        if (!cid) {
          toast.error(messages.cannotPinData);
          return;
        }

        content = { IpfsCid: cid };
        break;
      case 'Raw':
        content = { Raw: editCommentContent };
        break;
    }

    updateCommentTx.signAndSend([commentId, content], {}, async (result) => {
      if (!result) {
        updateCommentTx.resetState();
        if (commentContentType === PostContent.IpfsCid) {
          await unpinData(content.IpfsCid);
        }

        return;
      }

      if (result.isInBlock) {
        if (result.dispatchError) {
          toast.error(messages.txError);
          updateCommentTx.resetState();
          if (commentContentType === PostContent.IpfsCid) {
            await unpinData(content.IpfsCid);
          }
        } else {
          updateCommentTx.resetState();
          toast.success('Comment updated');
          switchEdit();

          if (commentContentType === PostContent.IpfsCid) {
            await unpinData((oldCommentContent as { [PostContent.IpfsCid]: string }).IpfsCid);
          }
        }
      }
    });
    setOnSubmitting(false);
  };

  const doDelete = () => {
    if (freeBalance === 0) {
      toast.error(messages.insufficientBalance);
      return;
    }

    deleteCommentTx.signAndSend([commentId], {}, async (result) => {
      if (!result) {
        deleteCommentTx.resetState();
        return;
      }

      if (result.isInBlock) {
        if (result.dispatchError) {
          toast.error(messages.txError);
        } else {
          toast.success('Comment deleted');

          if (commentContentType === PostContent.IpfsCid) {
            await unpinData((comment.content as { [PostContent.IpfsCid]: string }).IpfsCid);
          }
        }
      }
    });
  };

  const updateProcessing = shouldDisableStrict(updateCommentTx) || onSubmitting;
  const deleteProcessing = shouldDisableStrict(deleteCommentTx) || onSubmitting;

  return (
    <Flex flexDir='column' w='100%'>
      <Flex justifyContent='space-between'>
        <Flex gap={2} mb={1} alignItems='start'>
          <Identicon value={comment.author} size={26} theme='polkadot' />
          <Flex direction='column'>
            <Flex
              align='center'
              gap={1}
              mb={1}
              color='gray.500'
              fontWeight='semibold'
              wrap='wrap'
              mt='-2px'
              fontSize='0.8rem'>
              <Text lineHeight={1}>{authorInfo.name || shortenAddress(comment.author)}</Text>
              {authorInfo.name && (
                <Text fontSize='sm' lineHeight={1} color='gray.500' mt='1px'>
                  - {shortenAddress(comment.author)}
                </Text>
              )}
            </Flex>
            <Flex gap={1}>
              <Text fontSize='0.8rem' color='gray.500' lineHeight={1}>
                {fromNow(comment.createdAt)}
              </Text>
              {comment.updatedAt && (
                <Text fontSize='0.8rem' color='gray.500' lineHeight={1}>
                  - edited
                </Text>
              )}
            </Flex>
          </Flex>
        </Flex>
        {isActiveMember && canEditComment && (
          <Menu placement='bottom'>
            <MenuButton as={IconButton} aria-label='Menu Button' icon={<RiMore2Fill />} size='sm' variant='ghost' />
            <MenuList py={0}>
              <MenuItem icon={<EditIcon />} onClick={switchEdit}>
                {onEdit ? 'Cancel' : 'Edit'}
              </MenuItem>
              <MenuItem icon={<DeleteIcon />} onClick={doDelete} isDisabled={deleteProcessing}>
                Delete
              </MenuItem>
            </MenuList>
          </Menu>
        )}
      </Flex>
      {onEdit ? (
        <Flex flexDir='column' gap={2} mt={2}>
          <Textarea value={editCommentContent} onChange={(e) => setEditCommentContent(e.target.value)} rows={1} />
          <Flex alignSelf='end' gap={2}>
            <Button onClick={switchEdit} size='sm' variant='ghost'>
              Cancel
            </Button>
            <Button
              onClick={doChange}
              size='sm'
              isDisabled={editCommentContent === commentContent || updateProcessing}
              colorScheme='primary'
              isLoading={updateProcessing}>
              Update
            </Button>
          </Flex>
        </Flex>
      ) : (
        <>
          {commentContent ? (
            <>
              <Box
                className='post-content'
                mt={2}
                dangerouslySetInnerHTML={{
                  __html: showMore ? renderMd(`${commentContent.slice(0, 500)}...`) : commentContent,
                }}></Box>
              {showMore && (
                <Link fontSize='small' color='gray.500' onClick={() => setShowMore(false)}>
                  Show more
                </Link>
              )}
            </>
          ) : (
            <SkeletonText px={4} pr={8} py={2} />
          )}
        </>
      )}
    </Flex>
  );
}
