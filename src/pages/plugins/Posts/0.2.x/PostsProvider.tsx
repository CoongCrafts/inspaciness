import { createContext, useContext, useEffect, useState } from 'react';
import usePostsContract from '@/hooks/contracts/plugins/usePostsContract';
import useContractState from '@/hooks/useContractState';
import { useSpaceContext } from '@/pages/space/0.1.x/SpaceProvider';
import { MemberStatus, PluginInfo, PostPerm, Props } from '@/types';
import { stringToNum } from '@/utils/number';
import { ChainContract } from 'useink';

interface PostsContextProps {
  info: PluginInfo;
  contract?: ChainContract;
  postsCount?: number;
  postPerm?: PostPerm;
  canCreatePost: boolean;
  nonce: number;
  setNonce: (nonce: number) => void;

  // >= v0.2.0
  shouldCreatePendingPost: boolean;
}

export const PostsContext = createContext<PostsContextProps>(null!);

export const usePostsContext = () => {
  const context = useContext(PostsContext);
  if (!context) {
    throw new Error('PostsProvider is missing!');
  }

  return context;
};

interface PostsProviderProps extends Props {
  info: PluginInfo;
}

export default function PostsProvider({ info, children }: PostsProviderProps) {
  const { contract } = usePostsContract(info);
  const { isOwner, memberStatus } = useSpaceContext();
  const { state: postsCountStr } = useContractState<string>(contract, 'postsCount');
  const { state: postPerm } = useContractState<PostPerm>(contract, 'postPerm');
  const [nonce, setNonce] = useState<number>(0);

  const postsCount = stringToNum(postsCountStr) || 0;
  useEffect(() => {
    setNonce(postsCount);
  }, [postsCount]);

  let canCreatePost = false;
  if (postPerm === PostPerm.SpaceOwner) {
    canCreatePost = isOwner;
  } else if (postPerm === PostPerm.ActiveMember || postPerm === PostPerm.ActiveMemberWithApproval) {
    canCreatePost = memberStatus == MemberStatus.Active;
  }

  let shouldCreatePendingPost = postPerm === PostPerm.ActiveMemberWithApproval && canCreatePost && !isOwner;

  if (!postsCountStr) {
    return null;
  }

  return (
    <PostsContext.Provider
      value={{
        info,
        postsCount,
        contract,
        postPerm,
        canCreatePost,
        shouldCreatePendingPost,
        nonce,
        setNonce,
      }}>
      {children}
    </PostsContext.Provider>
  );
}
