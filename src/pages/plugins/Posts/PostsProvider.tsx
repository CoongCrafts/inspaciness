import { createContext, useContext } from 'react';
import usePostsContract from '@/hooks/contracts/plugins/usePostsContract';
import useContractState from '@/hooks/useContractState';
import { PluginInfo, Props } from '@/types';
import { stringToNum } from '@/utils/number';
import { ChainContract } from 'useink';

interface PostsContextProps {
  info: PluginInfo;
  contract?: ChainContract;
  postsCount?: number;
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
  const { state: postsCountStr } = useContractState<string>(contract, 'postsCount');

  if (!postsCountStr) {
    return null;
  }

  return (
    <PostsContext.Provider value={{ info, postsCount: stringToNum(postsCountStr), contract }}>
      {children}
    </PostsContext.Provider>
  );
}
