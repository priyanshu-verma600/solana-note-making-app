import React, { useEffect, useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useNoteProgramPublic } from '@/hooks/useNoteProgram';
import { web3 } from '@coral-xyz/anchor'; // CHANGED HERE
import { PROGRAM_ID, USER_PROFILE_SEED } from '@/utils/constants';
import { UserProfile } from '@/types/note';
import CreateUser from './createuser';
import CreateNote from './createnote';
import NoteList from './notelist';

export default function Dashboard() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(false);

  const { connection } = useConnection();
  const wallet = useWallet();
  const program = useNoteProgramPublic();

  useEffect(() => {
    async function fetchUserProfile() {
      if (!wallet.publicKey || !program) {
        setUserProfile(null);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const [userProfilePda] = web3.PublicKey.findProgramAddressSync(
          [Buffer.from(USER_PROFILE_SEED), wallet.publicKey.toBuffer()],
          PROGRAM_ID
        );

        const profile = await program.account.userProfile.fetch(userProfilePda);
        
        setUserProfile({
          authority: profile.authority,
          username: profile.username,
          noteCount: profile.noteCount.toNumber(),
        });
      } catch (err) {
        // User profile doesn't exist yet
        setUserProfile(null);
      } finally {
        setLoading(false);
      }
    }

    fetchUserProfile();
  }, [wallet.publicKey, program, refreshTrigger]);

  const refreshData = () => {
    setRefreshTrigger(!refreshTrigger);
  };

  if (!wallet.connected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Solana Notes
            </h1>
            <p className="text-gray-600">
              A decentralized note-taking application on Solana
            </p>
          </div>
          
          <div className="flex justify-center">
            <WalletMultiButton className="!bg-gradient-to-r !from-blue-500 !to-purple-600 !rounded-full !px-6 !py-3 !font-semibold" />
          </div>
          
          <p className="text-center text-gray-500 mt-6 text-sm">
            Connect your Solana wallet to get started
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Solana Notes</h1>
              {userProfile && (
                <p className="text-gray-600">
                  Welcome, {userProfile.username}!
                </p>
              )}
            </div>
            <div className="flex items-center space-x-4">
              {userProfile && (
                <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full">
                  <span className="font-semibold">{userProfile.noteCount}</span> notes
                </div>
              )}
              <WalletMultiButton />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!userProfile ? (
          <div className="max-w-md mx-auto">
            <CreateUser onSuccess={refreshData} />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <NoteList
                userProfileExists={!!userProfile}
                noteCount={userProfile.noteCount}
                refreshTrigger={refreshTrigger}
              />
            </div>
            <div>
              <div className="sticky top-8">
                <CreateNote
                  onSuccess={refreshData}
                  userProfileExists={!!userProfile}
                  noteCount={userProfile.noteCount}
                />
                
                <div className="mt-8 bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">About</h3>
                  <p className="text-gray-600">
                    This is a decentralized note-taking application built on Solana.
                    All your notes are stored on the blockchain and are only
                    accessible by you.
                  </p>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-500">
                      Wallet: {wallet.publicKey?.toString().slice(0, 8)}...
                      {wallet.publicKey?.toString().slice(-8)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}