// /api/create-token.js
import { Connection, Keypair, PublicKey, LAMPORTS_PER_SOL, clusterApiUrl, Transaction, SystemProgram } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, createMint, getOrCreateAssociatedTokenAccount, mintTo, setAuthority, AuthorityType } from "@solana/spl-token";

// Use environment variable for your wallet secret key (base58 or array)
const SECRET_KEY = process.env.LAUNCHPAD_WALLET_SECRET; 
const connection = new Connection(clusterApiUrl("mainnet-beta"), "confirmed");
const creatorKeypair = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(SECRET_KEY)));

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { name, symbol, supply, creator } = req.body;
  if (!name || !symbol || !supply || !creator) {
    res.status(400).json({ error: "Missing parameters" });
    return;
  }

  try {
    // 1. Create new mint
    const mint = await createMint(
      connection,
      creatorKeypair, // payer
      creatorKeypair.publicKey, // mint authority
      creatorKeypair.publicKey, // freeze authority
      0 // decimals
    );

    // 2. Create token account for creator
    const tokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      creatorKeypair,
      mint,
      new PublicKey(creator)
    );

    // 3. Mint all tokens to creator
    await mintTo(
      connection,
      creatorKeypair,
      mint,
      tokenAccount.address,
      creatorKeypair,
      Number(supply)
    );

    // 4. Revoke mint authority and freeze authority
    await setAuthority(
      connection,
      creatorKeypair,
      mint,
      creatorKeypair.publicKey,
      AuthorityType.MintTokens,
      null
    );
    await setAuthority(
      connection,
      creatorKeypair,
      mint,
      creatorKeypair.publicKey,
      AuthorityType.FreezeAccount,
      null
    );

    res.status(200).json({ mint: mint.toBase58(), account: tokenAccount.address.toBase58() });
  } catch (err) {
    console.error("Token creation failed:", err);
    res.status(500).json({ error: "Token creation failed", details: err.message });
  }
}
