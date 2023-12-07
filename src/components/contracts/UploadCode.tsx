import {
  Alert,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  ListItem,
  Text,
  UnorderedList,
} from '@chakra-ui/react';
import { useState } from 'react';
import '@polkadot/api-augment';
import { Abi } from '@polkadot/api-contract';
import { formatBalance, u8aToHex } from '@polkadot/util';
import NetworkSelection from '@/components/shared/NetworkSelection';
import { useWalletContext } from '@/providers/WalletProvider';
import { NetworkInfo } from '@/types';
import { useApi, useBalance } from 'useink';

const utf8decoder = new TextDecoder();

export default function UploadCode() {
  const [network, setNetwork] = useState<NetworkInfo>();
  const { selectedAccount, injectedApi } = useWalletContext();
  const [abis, setAbis] = useState<Abi[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);
  const { api } = useApi(network?.id) || {};
  const [message, setMessage] = useState<string>();
  const [uploadedAbis, setUploadedAbis] = useState<Abi[]>([]);
  const balance = useBalance(selectedAccount, network?.id);
  const freeBalance =
    network && balance
      ? formatBalance(balance.freeBalance.toBigInt(), {
          decimals: network.decimals,
          withUnit: false,
          forceUnit: network.symbol,
        })
      : '0';

  const onPickFile = async (e: any) => {
    const files = Array.from(e.target?.files) as File[];
    const contracts = files.filter((one) => one.name.endsWith('.contract'));

    if (contracts.length === 0) {
      throw new Error('No contracts found!');
    }

    const abis: Abi[] = [];
    for (const contract of contracts) {
      abis.push(new Abi(JSON.parse(utf8decoder.decode(await contract.arrayBuffer()))));
    }

    setAbis(abis);
    setMessage(`${abis.length} contract files selected: ${contracts.map((file) => file.name).join(', ')}`);
  };

  const doUpload = async () => {
    setUploading(true);
    setMessage(`Uploading ${abis.length} contracts...`);

    const txs = abis.map((abi) => api!.tx.contracts.uploadCode(u8aToHex(abi.info.source.wasm!), null, 'Enforced'));

    const unsub = await api!.tx.utility
      .batch(txs)
      .signAndSend(selectedAccount?.address!, { signer: injectedApi?.signer }, (result: any) => {
        if (result.isInBlock || result.isFinalized) {
          if (result.isError || result.dispatchError) {
            let message = 'Transaction failed';

            if (result.dispatchError?.isModule) {
              const decoded = api?.registry.findMetaError(result.dispatchError.asModule);
              message = `${decoded?.section.toUpperCase()}.${decoded?.method}: ${decoded?.docs}`;
            }

            throw new Error(message);
          }

          setUploading(false);
          setMessage(`${abis.length} contracts has been uploaded successfully!`);
          setUploadedAbis((prev) => [...prev, ...abis]);
          unsub();
        }
      });
  };

  return (
    <Box>
      <FormControl mb={4}>
        <FormLabel>Network to deploy</FormLabel>
        <NetworkSelection checkMotherAddress={false} onSelect={setNetwork} />

        {network && (
          <Flex mt={2}>
            Free balance: {freeBalance} {network.symbol}
          </Flex>
        )}
      </FormControl>
      <FormControl>
        <FormLabel>Pick .contract files</FormLabel>
        <Input type='file' size='sm' onChange={onPickFile} multiple />
        <FormHelperText>{message || ' '}</FormHelperText>
        <Button
          colorScheme='primary'
          size='md'
          mt={4}
          isDisabled={!abis || !abis.length || uploading || freeBalance == '0'}
          onClick={doUpload}>
          Upload
        </Button>
        {network && freeBalance == '0' && (
          <Alert status='error' mt={4}>
            <AlertIcon />
            <AlertTitle>Insufficient free balance to pay transaction fee</AlertTitle>
          </Alert>
        )}
      </FormControl>
      {uploadedAbis.length > 0 && (
        <>
          <Text fontSize='sm' fontWeight='semibold' mt={4}>
            Uploaded contracts
          </Text>
          <UnorderedList fontSize='sm'>
            {uploadedAbis.map((abi, index) => (
              <ListItem key={index} mb={2}>
                <span>
                  Name: <b>{abi.info.contract.name}</b>
                </span>
                <br />
                <span>
                  Code Hash:{' '}
                  <Text as='b' fontWeight='semibold' fontSize='xs'>
                    {abi.info.source.wasmHash.toHex()}
                  </Text>
                </span>
              </ListItem>
            ))}
          </UnorderedList>
        </>
      )}
    </Box>
  );
}
