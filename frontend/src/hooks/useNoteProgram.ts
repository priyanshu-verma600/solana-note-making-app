import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Program, AnchorProvider, web3 } from '@coral-xyz/anchor';
import { useMemo } from 'react';
import { NOTE_PROGRAM_IDL } from '@/utils/idl';
import { PROGRAM_ID } from '@/utils/constants';

export function useNoteProgram() {
  const { connection } = useConnection();
  const wallet = useWallet();

  const program = useMemo(() => {
    if (!wallet.publicKey || !connection || !wallet.signTransaction) return null;

    const provider = new AnchorProvider(
      connection,
      wallet,
      { commitment: 'confirmed' }
    );

    return new Program(
      NOTE_PROGRAM_IDL,
      PROGRAM_ID,
      provider
    );
  }, [connection, wallet]);

  return program;
}

export function useNoteProgramPublic() {
  const { connection } = useConnection();
  
  const program = useMemo(() => {
    if (!connection) return null;

    // Use SystemProgram as a dummy public key
    const dummyWallet = {
      publicKey: web3.SystemProgram.programId,
      signTransaction: async () => {
        throw new Error('Read-only wallet');
      },
      signAllTransactions: async () => {
        throw new Error('Read-only wallet');
      },
    };

    const provider = new AnchorProvider(
      connection,
      dummyWallet as any,
      { commitment: 'confirmed' }
    );

    return new Program(
      NOTE_PROGRAM_IDL,
      PROGRAM_ID,
      provider
    );
  }, [connection]);

  return program;
}