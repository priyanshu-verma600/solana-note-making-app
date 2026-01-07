import { PublicKey } from '@solana/web3.js';

export interface UserProfile {
  authority: PublicKey;
  username: string;
  noteCount: number;
}

export interface Note {
  publicKey: PublicKey;
  account: {
    authority: PublicKey;
    id: number;
    title: string;
    content: string;
  };
}

export interface NoteFormData {
  title: string;
  content: string;
}

export interface UserFormData {
  username: string;
}