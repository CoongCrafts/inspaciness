import { Box, Button, Flex, IconButton, Menu, MenuButton, MenuItem, MenuList, Text, Textarea } from '@chakra-ui/react';
import { Identicon } from '@polkadot/react-identicon';
import { useState } from 'react';
import { RiMore2Fill } from 'react-icons/ri';
import { toast } from 'react-toastify';
import useCurrentFreeBalance from '@/hooks/space/useCurrentFreeBalance';
import useContractState from '@/hooks/useContractState';
import { useTx } from '@/hooks/useink/useTx';
import { usePostsContext } from '@/pages/plugins/Posts/PostsProvider';
import { useSpaceContext } from '@/providers/SpaceProvider';
import { useWalletContext } from '@/providers/WalletProvider';
import { Comment, MemberInfo, MemberStatus, Props } from '@/types';
import { fromNow } from '@/utils/date';
import { renderMd } from '@/utils/mdrenderer';
import { messages } from '@/utils/messages';
import { shortenAddress } from '@/utils/string';
import { DeleteIcon, EditIcon } from '@chakra-ui/icons';
import { shouldDisableStrict } from 'useink/utils';

interface CommentCardProps extends Props {
  commentId: number;
}

export default function CommentCard({ commentId }: CommentCardProps) {
  const { contract: spaceContract } = useSpaceContext();
  const { isOwner, memberStatus } = useSpaceContext();
  const { contract } = usePostsContext();
  const { state: comment } = useContractState<Comment>(contract, 'commentById', [commentId]);
  const { state: authorInfo } = useContractState<MemberInfo>(spaceContract, 'memberInfo', [comment?.author]);
  const { selectedAccount } = useWalletContext();
  const [onEdit, setOnEdit] = useState<boolean>(false);
  const [commentContent, setCommentContent] = useState<string>('');
  const updateCommentTx = useTx(contract, 'updateComment');
  const deleteCommentTx = useTx(contract, 'deleteComment');
  const freeBalance = useCurrentFreeBalance();

  if (!authorInfo || !comment) {
    return null;
  }

  const canEditComment = selectedAccount?.address === comment.author || isOwner;
  const isActiveMember = memberStatus === MemberStatus.Active;

  const switchEdit = () => {
    setOnEdit((pre) => !pre);
    setCommentContent(comment.content || '');
  };

  const doChange = () => {
    if (freeBalance === 0) {
      toast.error(messages.insufficientBalance);
      return;
    }

    if (commentContent === comment.content) {
      switchEdit();
      return;
    }

    updateCommentTx.signAndSend([commentId, commentContent], {}, (result) => {
      if (!result) {
        updateCommentTx.resetState();
        return;
      }

      if (result.isInBlock) {
        if (result.dispatchError) {
          toast.error(messages.txError);
        } else {
          toast.success('Comment updated');
          switchEdit();
        }
      }
    });
  };

  const doDelete = () => {
    if (freeBalance === 0) {
      toast.error(messages.insufficientBalance);
      return;
    }

    deleteCommentTx.signAndSend([commentId], {}, (result) => {
      if (!result) {
        deleteCommentTx.resetState();
        return;
      }

      if (result.isInBlock) {
        if (result.dispatchError) {
          toast.error(messages.txError);
        } else {
          toast.success('Comment deleted');
        }
      }
    });
  };

  const updateProcessing = shouldDisableStrict(updateCommentTx);
  const deleteProcessing = shouldDisableStrict(deleteCommentTx);

  return (
    <Flex flexDir='column' w='100%'>
      <Flex justifyContent='space-between'>
        <Flex gap={2} mb={1} alignItems='start'>
          <Identicon value={comment.author} size={25} theme='polkadot' />
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
                  {shortenAddress(comment.author)}
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
          <Textarea value={commentContent} onChange={(e) => setCommentContent(e.target.value)} rows={1} />
          <Flex alignSelf='end' gap={2}>
            <Button onClick={switchEdit} size='sm' variant='ghost'>
              Cancel
            </Button>
            <Button
              onClick={doChange}
              size='sm'
              isDisabled={commentContent === comment.content || updateProcessing}
              colorScheme='primary'
              isLoading={updateProcessing}>
              Update
            </Button>
          </Flex>
        </Flex>
      ) : (
        <Box
          className='post-content'
          mt={2}
          dangerouslySetInnerHTML={{ __html: renderMd(comment.content || '') }}></Box>
      )}
    </Flex>
  );
}
