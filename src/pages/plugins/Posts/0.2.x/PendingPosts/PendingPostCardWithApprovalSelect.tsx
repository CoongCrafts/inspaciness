import { Box, Flex, IconButton, Text, Tooltip } from '@chakra-ui/react';
import { Identicon } from '@polkadot/react-identicon';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useAsync } from 'react-use';
import useContractState from '@/hooks/useContractState';
import { useSpaceContext } from '@/pages/space/0.1.x/SpaceProvider';
import { MemberInfo, PendingPostApproval, PostContent, PostRecord, Props } from '@/types';
import { fromNow } from '@/utils/date';
import { getData } from '@/utils/ipfs';
import { renderMd } from '@/utils/mdrenderer';
import { shortenAddress } from '@/utils/string';
import { CheckIcon, CloseIcon } from '@chakra-ui/icons';

interface PendingPostCardProps extends Props {
  postRecord: PostRecord;
  approval?: PendingPostApproval;
  handleSelect: (arg: [number, boolean]) => void;
}

export default function PendingPostCardWithApprovalSelect({
  postRecord: { post, postId },
  approval,
  handleSelect,
}: PendingPostCardProps) {
  const { contract } = useSpaceContext();
  const { state: authorInfo } = useContractState<MemberInfo>(contract, 'memberInfo', [post.author]);
  const [content, setContent] = useState('');
  const postContentType = PostContent.IpfsCid in post.content ? PostContent.IpfsCid : PostContent.Raw;

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

  if (!authorInfo) {
    return null;
  }

  return (
    <Box key={postId} border='1px' borderColor='chakra-border-color' p={4} borderRadius={4} mb={2}>
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
        <Flex gap={4} px={1}>
          <Tooltip label={`Approve this post`} placement='top'>
            <IconButton
              onClick={() => handleSelect([postId, true])}
              colorScheme={approval && approval[1] ? 'green' : 'gray'}
              aria-label={'Approve'}
              icon={<CheckIcon />}
              isRound={true}
            />
          </Tooltip>

          <Tooltip label={`Reject this post`} placement='top'>
            <IconButton
              onClick={() => handleSelect([postId, false])}
              colorScheme={approval && !approval[1] ? 'red' : 'gray'}
              aria-label={'Reject'}
              icon={<CloseIcon />}
              isRound={true}
            />
          </Tooltip>
        </Flex>
      </Flex>
      <Box className='post-content' mt={2} dangerouslySetInnerHTML={{ __html: renderMd(content) }}></Box>
    </Box>
  );
}
