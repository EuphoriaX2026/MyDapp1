import type { Config } from 'wagmi';
import { readContractQueryOptions } from '@wagmi/core/query';
import { TITAN_CONTRACTS } from '../config/my-titan-contracts';
import RegisterABI from '../abis/Register-titan.json';

export const REGISTER_READ_ABI = RegisterABI.abi;
export const REGISTER_CONTRACT_ADDRESS = TITAN_CONTRACTS.Register as `0x${string}`;
export const IS_USER_REGISTERED_FN = 'isUserAddressRegistered' as const;

export function normalizeWalletAddress(address: string): `0x${string}` {
  return address.toLowerCase() as `0x${string}`;
}

export function buildIsUserRegisteredReadParams(walletAddress: string) {
  return {
    address: REGISTER_CONTRACT_ADDRESS,
    abi: REGISTER_READ_ABI,
    functionName: IS_USER_REGISTERED_FN,
    args: [normalizeWalletAddress(walletAddress)] as const,
  };
}

export function buildIsUserRegisteredQueryOptions(config: Config, walletAddress: string) {
  return readContractQueryOptions(config, buildIsUserRegisteredReadParams(walletAddress));
}
