import { Abi, ContractPromise } from '@polkadot/api-contract';
import metadata from '../erc20/metadata.json';

const CONTRACT_ADDRESS = '5HoRXu5vGUjQARwNCD8Gpf8acxSgs1AWX1WBWTfFTU7GhsuJ';

export const gasLimit = 300000n * 1000000n;

export function apiContract(api) {
  const abi = new Abi(metadata);

  return new ContractPromise(api, abi, CONTRACT_ADDRESS);
};
