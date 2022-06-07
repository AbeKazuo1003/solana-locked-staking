import * as anchor from "@project-serum/anchor";
import {Program} from "@project-serum/anchor";
import {ChicksStakingLocked} from "../target/types/chicks_staking_locked";

const utils = require("./utils");
import {Token, TOKEN_PROGRAM_ID} from "@solana/spl-token";
import * as fs from "fs";
import * as assert from "assert";

const md5 = require("md5");

const provider: anchor.AnchorProvider = anchor.AnchorProvider.env();
anchor.setProvider(provider);
const program = anchor.workspace
  .ChicksStakingLocked as Program<ChicksStakingLocked>;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

describe("chicks_staking_locked", () => {
  const test_type: number = 1; //1 : normal test, 2: migrate test, 3: convert test
  const STAKING_PDA_SEED_V2: string = "staking_v2";
  const STAKING_PDA_SEED_V3: string = "staking_v3";
  const USER_STAKING_PDA_SEED_V3: string = "user_staking_v3";
  const pool_handle: string = "pool1";
  let lock_time: anchor.BN = new anchor.BN(10); // 10 seconds
  let lock_unit: anchor.BN = new anchor.BN(2); // 2 seconds
  let reward_rate: anchor.BN = new anchor.BN(3000); // 30%
  const handle1 = "test1";
  const key1 = md5(handle1);

  const E9 = 1_000_000_000;

  //hardcoded in program, read from test keys directory for testing
  let mintKey: anchor.web3.Keypair;
  let mintObject: Token;
  let mintPubkey: anchor.web3.PublicKey;

  //the program's vault for stored collateral against SolChick Coin minting
  let vaultPubKey: anchor.web3.PublicKey;
  let vaultBump: number;

  //the program's account for stored initializer key and lock end date
  let stakingV2Pubkey: anchor.web3.PublicKey;
  let stakingV2Bump: number;

  let stakingV3Pubkey: anchor.web3.PublicKey;
  let stakingV3Bump: number;

  //the user's staking account for stored deposit amount
  let userStakingV2PubKey: anchor.web3.PublicKey;
  let userStakingV2Bump: any;

  let userStakingV3PubKey: anchor.web3.PublicKey;
  let userStakingV3Bump: any;

  let walletTokenAccount: anchor.web3.PublicKey;

  it("Prepare", async () => {
    console.log("Program ID: ", program.programId.toString());
    // test step token hardcoded in program, mint authority is wallet for testing
    let keyPairFile = fs.readFileSync(
      "tests/keys/solchick.json",
      "utf-8"
    );
    let keyPairData = JSON.parse(keyPairFile);
    mintKey = anchor.web3.Keypair.fromSecretKey(new Uint8Array(keyPairData));
    mintObject = await utils.createMint(
      mintKey,
      provider,
      provider.wallet.publicKey,
      null,
      9,
      TOKEN_PROGRAM_ID
    );
    mintPubkey = mintObject.publicKey;
    console.log("Test SOL_CHICK_Token: " + mintPubkey.toString());

    [vaultPubKey, vaultBump] = await anchor.web3.PublicKey.findProgramAddress(
      [mintPubkey.toBuffer(), Buffer.from(pool_handle)],
      program.programId
    );

    [stakingV3Pubkey, stakingV3Bump] =
      await anchor.web3.PublicKey.findProgramAddress(
        [
          mintPubkey.toBuffer(),
          Buffer.from(STAKING_PDA_SEED_V3),
          Buffer.from(pool_handle)
        ],
        program.programId
      );

    [userStakingV3PubKey, userStakingV3Bump] =
      await anchor.web3.PublicKey.findProgramAddress(
        [
          mintPubkey.toBuffer(),
          provider.wallet.publicKey.toBuffer(),
          key1,
          Buffer.from(USER_STAKING_PDA_SEED_V3),
        ],
        program.programId
      );

    [stakingV2Pubkey, stakingV2Bump] =
      await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from(STAKING_PDA_SEED_V2), Buffer.from(pool_handle)],
        program.programId
      );

    [userStakingV2PubKey, userStakingV2Bump] =
      await anchor.web3.PublicKey.findProgramAddress(
        [provider.wallet.publicKey.toBuffer(), key1],
        program.programId
      );

    console.log("Vault PubKey: ", vaultPubKey.toString());
    console.log("Staking V3 PubKey: ", stakingV3Pubkey.toString());
    console.log(pool_handle);

    walletTokenAccount = await mintObject.createAssociatedTokenAccount(
      provider.wallet.publicKey
    );
    console.log("UserA wallet: ", walletTokenAccount.toString());
    await utils.mintToAccount(
      provider,
      mintPubkey,
      walletTokenAccount,
      1000 * E9
    );
    let balance: number = await utils.getTokenBalance(
      provider,
      walletTokenAccount
    );
    assert.strictEqual(balance, 1000 * E9);
  });

  const initialize = async () => {
    await program.methods
      .initialize(
        vaultBump,
        stakingV3Bump,
        pool_handle,
        reward_rate,
        lock_time,
        lock_unit
      )
      .accounts({
        tokenMint: mintPubkey,
        tokenVault: vaultPubKey,
        stakingAccountV3: stakingV3Pubkey,
        initializer: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .rpc();

    const stakingV3Account = await program.account.stakingAccountV3.fetch(
      stakingV3Pubkey
    );
    console.log("Initializer: ", stakingV3Account.initializerKey.toString());
    console.log("Lock Time: ", stakingV3Account.lockTime.toString());
    console.log("Lock Unit: ", stakingV3Account.unlockInterval.toString());
    console.log("Total staked amount: ", stakingV3Account.totalStakedAmount.toString());
    console.log("Freeze Status: ", stakingV3Account.freezeProgram);
    console.log("Reward Rate: ", stakingV3Account.rewardRate.toString());
  }

  const deposit = async (amount) => {
    let deposit_amount = new anchor.BN(amount);
    await program.methods
      .depositReward(vaultBump, stakingV3Bump, pool_handle, deposit_amount)
      .accounts({
        tokenMint: mintPubkey,
        tokenFrom: walletTokenAccount,
        tokenFromAuthority: provider.wallet.publicKey,
        tokenVault: vaultPubKey,
        stakingAccountV3: stakingV3Pubkey,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();
  }

  const stake = async (pool_handle, key1, amount) => {
    try {
      const ix = await program.methods
        .initUserStake(userStakingV3Bump, pool_handle, key1)
        .accounts({
          userAuthority: provider.wallet.publicKey,
          tokenMint: mintPubkey,
          userStakingAccountV3: userStakingV3PubKey,
          stakingAccountV3: stakingV3Pubkey,
          systemProgram: anchor.web3.SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        })
        .instruction();

      await program.methods
        .stake(
          vaultBump,
          stakingV3Bump,
          userStakingV3Bump,
          pool_handle,
          key1,
          new anchor.BN(amount)
        )
        .accounts({
          tokenMint: mintPubkey,
          tokenFrom: walletTokenAccount,
          tokenFromAuthority: provider.wallet.publicKey,
          tokenVault: vaultPubKey,
          stakingAccountV3: stakingV3Pubkey,
          userStakingAccountV3: userStakingV3PubKey,
          systemProgram: anchor.web3.SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        })
        .preInstructions([ix])
        .rpc();
    } catch (e) {
      console.log(e);
    }
  }

  const withdraw = async () => {
    await program.methods
      .withdraw(
        vaultBump,
        stakingV3Bump,
        userStakingV3Bump,
        pool_handle,
        key1
      )
      .accounts({
        tokenMint: mintPubkey,
        tokenToAuthority: provider.wallet.publicKey,
        tokenVault: vaultPubKey,
        stakingAccountV3: stakingV3Pubkey,
        userStakingAccountV3: userStakingV3PubKey,
        tokenTo: walletTokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      // @ts-ignore
      .signers([provider.wallet.payer])
      .rpc();
  }

  const migrate_v3 = async () => {
    await program.methods
      .migrateV3(
        stakingV2Bump,
        stakingV3Bump,
        pool_handle,
        reward_rate,
        lock_unit
      )
      .accounts({
        initializer: provider.wallet.publicKey,
        tokenMint: mintPubkey,
        stakingAccountV2: stakingV2Pubkey,
        stakingAccountV3: stakingV3Pubkey,
        systemProgram: anchor.web3.SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .rpc();
  }

  const initialize_v2 = async () => {
    // await program.methods
    //   .testInitialize(vaultBump, stakingV2Bump, pool_handle, lock_time)
    //   .accounts({
    //     tokenMint: mintPubkey,
    //     tokenVault: vaultPubKey,
    //     stakingAccountV2: stakingV2Pubkey,
    //     initializer: provider.wallet.publicKey,
    //     systemProgram: anchor.web3.SystemProgram.programId,
    //     tokenProgram: TOKEN_PROGRAM_ID,
    //     rent: anchor.web3.SYSVAR_RENT_PUBKEY,
    //   })
    //   // @ts-ignore
    //   .signers([provider.wallet.payer])
    //   .rpc();
  }

  const stake_v2 = async (amount) => {
    // let stake_amount = new anchor.BN(amount);
    // await program.methods
    //   .testUserStaking(userStakingV2Bump, key1, stake_amount)
    //   .accounts({
    //     userAuthority: provider.wallet.publicKey,
    //     userStakingAccountV2: userStakingV2PubKey,
    //     systemProgram: anchor.web3.SystemProgram.programId,
    //     tokenProgram: TOKEN_PROGRAM_ID,
    //     rent: anchor.web3.SYSVAR_RENT_PUBKEY,
    //   })
    //   // @ts-ignore
    //   .signers([provider.wallet.payer])
    //   .rpc();
  }

  const convert_user_stake_account = async () => {
    await program.methods
      .convertUserStakeAccount(
        stakingV3Bump,
        userStakingV2Bump,
        userStakingV3Bump,
        pool_handle,
        key1
      )
      .accounts({
        userAuthority: provider.wallet.publicKey,
        tokenMint: mintPubkey,
        stakingAccountV3: stakingV3Pubkey,
        userStakingAccountV2: userStakingV2PubKey,
        userStakingAccountV3: userStakingV3PubKey,
        systemProgram: anchor.web3.SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .rpc();
  }

  if (test_type == 1) {
    it("1-1.Prepare", async () => {
      await initialize();
    });

    it("1-2.Stake", async () => {
      let old_vault_balance: number = await utils.getTokenBalance(
        provider,
        vaultPubKey
      );
      const stake_amount = 100;
      console.log("Stack start");
      await stake(pool_handle, key1, stake_amount * E9);
      console.log("Stack end");
      let userStakingV3Account = await program.account.userStakingAccountV3.fetch(
        userStakingV3PubKey
      );
      console.log("Stack Amount: ", userStakingV3Account.stakedAmount.toString());
      console.log(
        "Start Time: ",
        new Date(
          userStakingV3Account.startTime.toNumber() * 1000
        ).toLocaleString()
      );
      console.log(
        "Reward Amount: ",
        userStakingV3Account.rewardAmount.toString()
      );
      console.log(
        "WithDraw Amount: ",
        userStakingV3Account.claimedAmount.toString()
      );
      let vault_balance: number = await utils.getTokenBalance(
        provider,
        vaultPubKey
      );
      console.log("Vault balance: ", vault_balance.toLocaleString());
      assert.strictEqual(vault_balance - old_vault_balance, stake_amount * E9);
    });

    it("1-3.Deposit", async () => {
      let old_vault_balance: number = await utils.getTokenBalance(
        provider,
        vaultPubKey
      );
      const deposit_amount = 30;
      await deposit(deposit_amount * E9);
      let vault_balance: number = await utils.getTokenBalance(
        provider,
        vaultPubKey
      );
      assert.strictEqual(vault_balance - old_vault_balance, deposit_amount * E9);
    });
    it("1-4.WithDraw reject before lock end time", async () => {
      console.log("Sleep 5 seconds...");
      await sleep(5000); //wait 5 seconds
      await assert.rejects(async () => {
        await withdraw();
      });
    });
    it("1-5.WithDraw First Request", async () => {
      console.log("Sleep 7 seconds...");
      await sleep(7000); //wait 7 seconds
      let old_userA_balance: number = await utils.getTokenBalance(
        provider,
        walletTokenAccount
      );
      await withdraw();

      let userStakeV3Account = await program.account.userStakingAccountV3.fetch(
        userStakingV3PubKey
      );
      console.log(
        "Claimed Amount: ",
        userStakeV3Account.claimedAmount.toString()
      );
      let userA_balance: number = await utils.getTokenBalance(
        provider,
        walletTokenAccount
      );
      console.log("UserA wallet balance: ", userA_balance.toLocaleString());
      assert.strictEqual(userA_balance - old_userA_balance, 106 * E9);
    });
    it("1-6.WithDraw Second Request", async () => {
      console.log("Sleep 8 seconds...");
      await sleep(8000); //wait 8 seconds
      let old_userA_balance: number = await utils.getTokenBalance(
        provider,
        walletTokenAccount
      );
      await withdraw();
      let userA_balance: number = await utils.getTokenBalance(
        provider,
        walletTokenAccount
      );
      console.log("UserA wallet balance: ", userA_balance.toLocaleString());
      assert.strictEqual(userA_balance - old_userA_balance, 24 * E9);
    });
    it("1-7. Closed User stake account", async () => {
      await assert.rejects(async () => {
        await program.account.userStakingAccountV3.fetch(userStakingV3PubKey);
      });
    });
  }

  if (test_type == 2) {
    it("2-1. Migration Step1: Test Initialize", async () => {
      await initialize_v2();
      const stakingV2Account = await program.account.stakingAccount.fetch(stakingV2Pubkey);
      console.log("Initializer: ", stakingV2Account.initializerKey.toString());
      console.log("Lock Time: ", stakingV2Account.lockTime.toString());
    });
    it("2-2. Migration Step 2: Convert Staking_Account to Staking_Account_v2", async () => {
      console.log("Migrate V3 Started");
      await migrate_v3();
      console.log("Migrate V3 Succeed");
      const stakingV3Account = await program.account.stakingAccountV3.fetch(
        stakingV3Pubkey
      );
      console.log("Initializer: ", stakingV3Account.initializerKey.toString());
      console.log("Lock Time: ", stakingV3Account.lockTime.toString());
      console.log("Lock Unit: ", stakingV3Account.unlockInterval.toString());
      console.log("Reward Rate: ", stakingV3Account.rewardRate.toString());
      console.log("Total Staked Amount: ", stakingV3Account.totalStakedAmount.toNumber().toLocaleString());
      console.log("Remaining Reward Amount: ", stakingV3Account.remainRewardAmount.toNumber().toLocaleString());

      await assert.rejects(async () => {
        await program.account.stakingAccount.fetch(stakingV2Pubkey);
      });
    });
  }

  if (test_type == 3) {
    it("3-1.Prepare", async () => {
      await initialize();

      const stakingV3Account = await program.account.stakingAccountV3.fetch(
        stakingV3Pubkey
      );
      console.log("Initializer: ", stakingV3Account.initializerKey.toString());
      console.log("Lock Time: ", stakingV3Account.lockTime.toString());
      console.log("Unlock interval: ", stakingV3Account.unlockInterval.toString());
      console.log("Total staked amount: ", stakingV3Account.totalStakedAmount.toNumber().toLocaleString());
      console.log("Freeze Status: ", stakingV3Account.freezeProgram);
      console.log("Reward Rate: ", stakingV3Account.rewardRate.toString());
    });
    it("3-2. Old User Stack Account", async () => {
      await stake_v2(100_000_000_000);

      const userStakingV2Account = await program.account.userStakingAccount.fetch(
        userStakingV2PubKey
      );
      console.log("Stack Amount: ", userStakingV2Account.amount.toNumber().toLocaleString());
      console.log(
        "Start Time: ",
        new Date(userStakingV2Account.startTime.toNumber() * 1000).toLocaleString()
      );
    });
    it("3-3. Convert Test", async () => {
      await convert_user_stake_account();
      const userStakeV3Account = await program.account.userStakingAccountV3.fetch(
        userStakingV3PubKey
      );
      console.log("New Stake Amount: ", userStakeV3Account.stakedAmount.toNumber().toLocaleString());
      console.log(
        "New Start Time: ",
        new Date(userStakeV3Account.startTime.toNumber() * 1000).toLocaleString()
      );
      console.log("New Reward Amount: ", userStakeV3Account.rewardAmount.toNumber().toLocaleString());
      console.log("New claimed Amount: ", userStakeV3Account.claimedAmount.toNumber().toLocaleString());
      await assert.rejects(async () => {
        await program.account.userStakingAccount.fetch(userStakingV2PubKey);
      });
    });
  }
});
