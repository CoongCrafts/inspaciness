import { createContext, useContext } from 'react';
import usePostsContract from '@/hooks/contracts/plugins/usePostsContract';
import useContractState from '@/hooks/useContractState';
import { useSpaceContext } from '@/providers/SpaceProvider';
import { MemberStatus, PluginInfo, PostPerm, Props } from '@/types';
import { stringToNum } from '@/utils/number';
import { ChainContract } from 'useink';

interface PostsContextProps {
  info: PluginInfo;
  contract?: ChainContract;
  postsCount?: number;
  postPerm?: PostPerm;
  canCreatePost: boolean;
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
  const contract = usePostsContract(info);
  const { isOwner, memberStatus } = useSpaceContext();
  const { state: postsCountStr } = useContractState<string>(contract, 'postsCount');
  const { state: postPerm } = useContractState<PostPerm>(contract, 'postPerm');

  let canCreatePost = false;
  if (postPerm === PostPerm.SpaceOwner) {
    canCreatePost = isOwner;
  } else if (postPerm === PostPerm.ActiveMember) {
    canCreatePost = memberStatus === MemberStatus.Active;
  }

  if (!postsCountStr) {
    return null;
  }

  return (
    <PostsContext.Provider value={{ info, postsCount: stringToNum(postsCountStr), contract, postPerm, canCreatePost }}>
      {children}
    </PostsContext.Provider>
  );
}
