// tokenMinting.js

const { Connection, PublicKey, Keypair, LAMPORTS_PER_SOL, Transaction, SystemProgram, sendAndConfirmTransaction, clusterApiUrl, Token, TOKEN_PROGRAM_ID } = require('@solana/web3.js');

// Constants
const DEVNET = 'https://api.devnet.solana.com';
const MAINNET = 'https://api.mainnet-beta.solana.com';
const NETWORK = process.env.NODE_ENV === 'production' ? MAINNET : DEVNET;
const connection = new Connection(NETWORK, 'confirmed');

// Create a new keypair
const createKeypair = () => Keypair.generate();

// Airdrop SOL to a wallet (only for devnet)
const airdropSOL = async (publicKey) => {
    if (NETWORK === DEVNET) {
        console.log(`Requesting airdrop of 1 SOL to ${publicKey.toBase58()}...`);
        const signature = await connection.requestAirdrop(publicKey, LAMPORTS_PER_SOL);
        await connection.confirmTransaction(signature);
        console.log('Airdrop successful!');
    } else {
        console.log('Airdrop is only available on devnet.');
    }
};

// Create a new mint
const createMint = async (payer) => {
    const mint = await Token.createMint(connection, payer, payer.publicKey, null, 9, TOKEN_PROGRAM_ID);
    console.log(`Mint created: ${mint.publicKey.toBase58()}`);
    return mint;
};

// Create a token account
const createTokenAccount = async (mint, owner) => {
    const tokenAccount = await mint.getOrCreateAssociatedAccountInfo(owner);
    console.log(`Token account created: ${tokenAccount.toBase58()}`);
    return tokenAccount;
};

// Mint tokens
const mintTokens = async (mint, owner, amount) => {
    await mint.mintTo(owner, owner.publicKey, [], amount);
    console.log(`${amount} tokens minted to ${owner.toBase58()}`);
};

// Main function to run the minting process
const main = async () => {
    const payer = createKeypair();
    await airdropSOL(payer.publicKey);

    const mint = await createMint(payer);
    const tokenAccount = await createTokenAccount(mint, payer.publicKey);

    const amountToMint = 1000; // Specify the amount to mint
    await mintTokens(mint, tokenAccount, amountToMint);
};

main().catch(err => {
    console.error(err);
});
