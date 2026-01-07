import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { NoteApp } from "../target/types/note_app";
import { expect } from "chai";

describe("note_app", () => {
  // Configure the client to use the local cluster.

  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.NoteApp as Program<NoteApp>;
  const wallet = provider.wallet as anchor.Wallet;

  // derive PDA for userprofile.
  
  const [userprofilePda] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("user_profile"), wallet.publicKey.toBuffer()],
    program.programId
  );

  it("creates a user Profile", async ()=> {
    const username = "testuser";

    const tx = await program.methods
    .createUser(username)
    .accounts({
      userProfile : userprofilePda,
      signer : wallet.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .rpc();

    console.log("user created ! Transaction signature", tx);

    // fetch the account

    const userProfile = await program.account.userProfile.fetch(userprofilePda);

    expect(userProfile.username).to.equal(username);
    expect(userProfile.noteCount.toNumber()).to.equal(0);

    console.log("user profile", userProfile);
  });

  it("creates a note", async ()=>{

    const title = "My first note";
    const content = "This is the content of my first note!";

    // fetch current note count.

    const userProfile = await program.account.userProfile.fetch(userprofilePda);
    const nextNoteId = userProfile.noteCount.toNumber()+1;

    // Derive PDA for the note

    const [notePda] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("note"),
        wallet.publicKey.toBuffer(),
        new anchor.BN(nextNoteId).toArrayLike(Buffer, "le", 8),
      ],

      program.programId
    );

    const tx = await program.methods
    .createNote(title, content)
    .accounts({
      userProfile:userprofilePda,
      note: notePda,
      signer : wallet.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .rpc();

    console.log("note created! Transaction signature", tx);

    // fetch the note.

    const note = await program.account.note.fetch(notePda);

    expect(note.title).to.equal(title);
    expect(note.content).to.equal(content);
    expect(note.id.toNumber()).to.equal(1);
    console.log("Note", note);
  });

  it("updates the note", async()=>{
    const noteId = 1;
    const newContent = "This is the updated content";

    const [notePda] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("note"),
        wallet.publicKey.toBuffer(),
        new anchor.BN(noteId).toArrayLike(Buffer, "le", 8),

      ],
      program.programId
    );

    const tx = await program.methods
    .updateNote(new anchor.BN(noteId), newContent)
    .accounts({
      note: notePda,
      signer: wallet.publicKey,
      authority:wallet.publicKey,
    })
    .rpc();

    console.log("Note updated! Transaction signature:", tx);

    const note = await program.account.note.fetch(notePda);
    expect(note.content).to.equal(newContent);
    console.log("updated note:", note);
  });

  it("delete a note", async()=>{

    const noteId = 1;

    const [notePda] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("note"),
        wallet.publicKey.toBuffer(),
        new anchor.BN(noteId).toArrayLike(Buffer, "le", 8),
      ],

      program.programId
    );

    const tx = await program.methods
    .deleteNote(new anchor.BN(noteId))
    .accounts({
       note:notePda,
       signer: wallet.publicKey,
       authority:wallet.publicKey,
    })
    .rpc();

    console.log("Note deleted! Transaction signature:", tx);

    // Try to fetch- should fail.

    try{
      await program.account.note.fetch(notePda);
      expect.fail("Note should be deleted");
    }
    catch(error){
      expect(error.message).to.include("Account does not exist");
      console.log("Note deleted successfully");
    }
  });

});
