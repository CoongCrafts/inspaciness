import React, { ReactNode } from 'react';
import { Chain, ChainId } from 'useink/chains';

export type MenuItemType = {
  name: string;
  path: string;
  icon?: React.ElementType;
};

export interface Props {
  className?: string;
  children?: ReactNode;

  [prop: string]: any;
}

export enum ChainEnvironment {
  Development = 'Development',
  Testnet = 'Testnet',
  Production = 'Production',
}

export const ChainEnvironments = Object.values(ChainEnvironment);

export interface NetworkInfo {
  id: ChainId;
  name: string;
  logo: string;
  prefix: number;
  symbol: string;
  decimals: number;
  chain: Chain;
  motherAddress?: string;
  disabled?: boolean;
}

export interface SpaceInfo {
  name: string;
  desc: string | null;
  logo: {
    Url?: string;
    IpfsCid?: string;
  } | null;
}

export enum RegistrationType {
  PayToJoin = 'PayToJoin',
  RequestToJoin = 'RequestToJoin',
  InviteOnly = 'InviteOnly',
}

export enum Pricing {
  Free = 'Free',
  OneTimePaid = 'OneTimePaid',
  Subscription = 'Subscription',
}

export interface SpaceConfig {
  registration: RegistrationType;
  pricing:
    | Pricing.Free
    | { [Pricing.OneTimePaid]: { price: string } }
    | { [Pricing.Subscription]: { price: string; duration: string } };
}

export interface OnChainSpace {
  address: string;
  chainId: ChainId;
}

export interface MemberRecord {
  index: string;
  accountId: string;
  info: MemberInfo;
}

export interface Pagination<Item> {
  items: Array<Item>;
  from: string;
  perPage: string;
  hasNextPage: boolean;
  total: string;
}

export enum MemberStatus {
  None = 'None',
  Active = 'Active',
  Inactive = 'Inactive',
  Left = 'Left',
}

export interface MemberInfo {
  name: string | null;
  nextRenewalAt: string | null;
  joinedAt: number;
}

export interface Plugin {
  id: string;
  name: string;
  description?: string;
}

export interface PluginInfo extends Plugin {
  address: string;
  chainId: ChainId;
  disabled: boolean;
}

export interface OnChainPluginInfo {
  id: string;
  address: string;
  disabled: boolean;
}

export interface PostRecord {
  postId: number;
  post: Post;
}

export enum PostContent {
  Raw = 'Raw',
  IpfsCid = 'IpfsCid',
}

export interface Post {
  author: string;
  content: { [PostContent.Raw]: string } | { [PostContent.IpfsCid]: string };
  createdAt: number;
  updatedAt: number | null;
}

export interface MembershipRequest {
  who: string;
  paid: number;
  requestedAt: number;
  approved?: boolean;
}

export type RequestApproval = [string, boolean];

export type SpaceId = string;

export enum Ordering {
  Ascending = 'Ascending',
  Descending = 'Descending',
}

export enum PostPerm {
  SpaceOwner = 'SpaceOwner',
  ActiveMember = 'ActiveMember',
}
