import React, { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useNoteProgram } from '@/hooks/useNoteProgram';
import { web3 } from '@coral-xyz/anchor'; // CHANGED HERE
import { PROGRAM_ID, NOTE_SEED } from '@/utils/constants';
import { Note } from '@/types/note';

interface NoteCardProps {
  note: Note;
  onUpdate?: () => void;
  onDelete?: () => void;
}

export default function NoteCard({ note, onUpdate, onDelete }: NoteCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newContent, setNewContent] = useState(note.account.content);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const { connection } = useConnection();
  const wallet = useWallet();
  const program = useNoteProgram();

  const handleUpdate = async () => {
    if (!wallet.publicKey || !program) {
      setError('Please connect wallet');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const [notePda] = web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from(NOTE_SEED),
          wallet.publicKey.toBuffer(),
          new Uint8Array(new Uint32Array([note.account.id]).buffer),
        ],
        PROGRAM_ID
      );

      const tx = await program.methods
        .updateNote(note.account.id, newContent)
        .accounts({
          note: notePda,
          signer: wallet.publicKey,
          authority: wallet.publicKey,
        })
        .rpc();

      await connection.confirmTransaction(tx);
      
      setIsEditing(false);
      if (onUpdate) onUpdate();
    } catch (err: any) {
      console.error('Error updating note:', err);
      setError(err.message || 'Failed to update note');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!wallet.publicKey || !program) {
      setError('Please connect wallet');
      return;
    }

    if (!confirm('Are you sure you want to delete this note?')) return;

    setLoading(true);
    setError('');

    try {
      const [notePda] = web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from(NOTE_SEED),
          wallet.publicKey.toBuffer(),
          new Uint8Array(new Uint32Array([note.account.id]).buffer),
        ],
        PROGRAM_ID
      );

      const tx = await program.methods
        .deleteNote(note.account.id)
        .accounts({
          note: notePda,
          signer: wallet.publicKey,
          authority: wallet.publicKey,
        })
        .rpc();

      await connection.confirmTransaction(tx);
      
      if (onDelete) onDelete();
    } catch (err: any) {
      console.error('Error deleting note:', err);
      setError(err.message || 'Failed to delete note');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4">
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-gray-800">
          #{note.account.id} - {note.account.title}
        </h3>
        <div className="flex space-x-2">
          {!isEditing && (
            <>
              <button
                onClick={() => setIsEditing(true)}
                disabled={loading || !wallet.connected}
                className="px-3 py-1 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 text-sm disabled:opacity-50"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                disabled={loading || !wallet.connected}
                className="px-3 py-1 bg-red-100 text-red-600 rounded-md hover:bg-red-200 text-sm disabled:opacity-50"
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      {isEditing ? (
        <div>
          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
            rows={4}
            maxLength={500}
          />
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => {
                setIsEditing(false);
                setNewContent(note.account.content);
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdate}
              disabled={loading || newContent === note.account.content}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      ) : (
        <p className="text-gray-600 whitespace-pre-wrap">{note.account.content}</p>
      )}
    </div>
  );
}