import { toast } from 'react-toastify';
import { ContractSubmittableResult } from 'useink/core';

const STATUSES: string[] = [
  'Ready',
  'Broadcast',
  // , 'InBlock'
];
export const notifyTxStatus = (result: ContractSubmittableResult) => {
  if (STATUSES.includes(result.status.type)) {
    toast.info(`Transaction Status: ${result.status.type}`);
  }
};
