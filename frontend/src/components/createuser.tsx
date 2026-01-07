import React, { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useNoteProgram } from '@/hooks/useNoteProgram';
import { web3 } from '@coral-xyz/anchor'; // CHANGED HERE
import { PROGRAM_ID, USER_PROFILE_SEED } from '@/utils/constants';
import { UserFormData } from '@/types/note';

interface CreateUserProps {
  onSuccess?: () => void;
}

export default function CreateUser({ onSuccess }: CreateUserProps) {
  const [formData, setFormData] = useState<UserFormData>({
    username: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const { connection } = useConnection();
  const wallet = useWallet();
  const program = useNoteProgram();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!wallet.publicKey || !program) {
      setError('Please connect wallet first');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const [userProfilePda] = web3.PublicKey.findProgramAddressSync(
        [Buffer.from(USER_PROFILE_SEED), wallet.publicKey.toBuffer()],
        PROGRAM_ID
      );

      const tx = await program.methods
        .createUser(formData.username)
        .accounts({
          userProfile: userProfilePda,
          signer: wallet.publicKey,
          systemProgram: web3.SystemProgram.programId,
        })
        .rpc();

      await connection.confirmTransaction(tx);

      setFormData({ username: '' });
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error('Error creating user:', err);
      setError(err.message || 'Failed to create user profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Create Profile</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Username
          </label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={(e) => setFormData({ username: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your username"
            required
            maxLength={50}
          />
        </div>

        <button
          type="submit"
          disabled={loading || !wallet.connected}
          className="w-full bg-green-500 text-white font-bold py-2 px-4 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating...' : 'Create Profile'}
        </button>

        {!wallet.connected && (
          <p className="mt-2 text-sm text-gray-500 text-center">
            Please connect your wallet to create a profile
          </p>
        )}
      </form>
    </div>
  );
}