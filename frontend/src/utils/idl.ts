import { Idl } from "@coral-xyz/anchor"; // CHANGED HERE
import { PROGRAM_ID } from "./constants";

export const NOTE_PROGRAM_IDL: Idl = {
  version: "0.1.0",
  name: "note_app",
  instructions: [
    {
      name: "createUser",
      accounts: [
        { name: "userProfile", isMut: true, isSigner: false },
        { name: "signer", isMut: true, isSigner: true },
        { name: "systemProgram", isMut: false, isSigner: false },
      ],
      args: [
        { name: "username", type: "string" },
      ],
    },
    {
      name: "createNote",
      accounts: [
        { name: "userProfile", isMut: true, isSigner: false },
        { name: "note", isMut: true, isSigner: false },
        { name: "signer", isMut: true, isSigner: true },
        { name: "authority", isMut: false, isSigner: false },
        { name: "systemProgram", isMut: false, isSigner: false },
      ],
      args: [
        { name: "title", type: "string" },
        { name: "content", type: "string" },
      ],
    },
    {
      name: "updateNote",
      accounts: [
        { name: "note", isMut: true, isSigner: false },
        { name: "signer", isMut: true, isSigner: true },
        { name: "authority", isMut: false, isSigner: false },
      ],
      args: [
        { name: "noteId", type: "u64" },
        { name: "newContent", type: "string" },
      ],
    },
    {
      name: "deleteNote",
      accounts: [
        { name: "note", isMut: true, isSigner: false },
        { name: "signer", isMut: true, isSigner: true },
        { name: "authority", isMut: false, isSigner: false },
      ],
      args: [
        { name: "noteId", type: "u64" },
      ],
    },
  ],
  accounts: [
    {
      name: "UserProfile",
      type: {
        kind: "struct",
        fields: [
          { name: "authority", type: "publicKey" },
          { name: "username", type: "string" },
          { name: "noteCount", type: "u64" },
        ],
      },
    },
    {
      name: "Note",
      type: {
        kind: "struct",
        fields: [
          { name: "authority", type: "publicKey" },
          { name: "id", type: "u64" },
          { name: "title", type: "string" },
          { name: "content", type: "string" },
        ],
      },
    },
  ],
  errors: [
    {
      code: 6000,
      name: "UnauthorizedAccess",
      msg: "You are not authorized to perform this action",
    },
  ],
};