import React, { useEffect, useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useNoteProgramPublic } from '@/hooks/useNoteProgram';
import { web3 } from '@coral-xyz/anchor'; // CHANGED HERE
import { PROGRAM_ID, NOTE_SEED } from '@/utils/constants';
import { Note } from '@/types/note';
import NoteCard from './notecard';

interface NoteListProps {
  userProfileExists: boolean;
  noteCount: number;
  refreshTrigger?: boolean;
}

export default function NoteList({
  userProfileExists,
  noteCount,
  refreshTrigger,
}: NoteListProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const { connection } = useConnection();
  const wallet = useWallet();
  const program = useNoteProgramPublic();

  useEffect(() => {
    async function fetchNotes() {
      if (!wallet.publicKey || !program || !userProfileExists) {
        setNotes([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');

      try {
        const noteAccounts: Note[] = [];

        for (let i = 1; i <= noteCount; i++) {
          try {
            const [notePda] = web3.PublicKey.findProgramAddressSync(
              [
                Buffer.from(NOTE_SEED),
                wallet.publicKey.toBuffer(),
                new Uint8Array(new Uint32Array([i]).buffer),
              ],
              PROGRAM_ID
            );

            const noteAccount = await program.account.note.fetch(notePda);
            
            noteAccounts.push({
              publicKey: notePda,
              account: {
                authority: noteAccount.authority,
                id: noteAccount.id.toNumber(),
                title: noteAccount.title,
                content: noteAccount.content,
              },
            });
          } catch (err) {
            // Note might not exist, skip it
            console.log(`Note #${i} not found`);
          }
        }

        setNotes(noteAccounts);
      } catch (err: any) {
        console.error('Error fetching notes:', err);
        setError('Failed to fetch notes');
      } finally {
        setLoading(false);
      }
    }

    fetchNotes();
  }, [wallet.publicKey, program, userProfileExists, noteCount, refreshTrigger]);

  const refreshNotes = () => {
    // Trigger a refetch by updating state
    setNotes([...notes]);
  };

  if (!userProfileExists) {
    return null;
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        <p className="mt-2 text-gray-600">Loading notes...</p>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Your Notes</h2>
        <span className="text-gray-600">
          {notes.length} of {noteCount} notes
        </span>
      </div>

      {notes.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No notes found. Create your first note!</p>
        </div>
      ) : (
        <div>
          {notes.map((note) => (
            <NoteCard
              key={note.publicKey.toString()}
              note={note}
              onUpdate={refreshNotes}
              onDelete={refreshNotes}
            />
          ))}
        </div>
      )}
    </div>
  );
}