import { PublicKey } from '@solana/web3.js';

// Program ID
export const PROGRAM_ID = new PublicKey(
  "9rcPBrXV5e8NC5vPSWs4XXoTeq3FAy4k349pRYsyH8v1"
);

// Network configuration
export const NETWORK = "devnet";
export const RPC_ENDPOINT = process.env.NEXT_PUBLIC_RPC_ENDPOINT || 
  `https://api.${NETWORK}.solana.com`;

// PDA seeds
export const USER_PROFILE_SEED = "user_profile";
export const NOTE_SEED = "note";

// Max lengths from your Rust program
export const MAX_USERNAME_LENGTH = 50;
export const MAX_TITLE_LENGTH = 100;
export const MAX_CONTENT_LENGTH = 500;