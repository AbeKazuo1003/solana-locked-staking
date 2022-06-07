use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount};

// declare_id!("GSA6YFJHtnPFKZUXjVH9uAQdJaPt3bWADDfbeduq9edJ"); // for main
declare_id!("AVauy78yvW2K6QUfUSfPtcxPEaT3V6W1xwGEQQSFDAPC"); // for dev net

pub mod constants {
    // pub const STEP_TOKEN_MINT_PUBKEY: &str = "cxxShYRVcepDudXhe7U62QHvw8uBJoKFifmzggGKVC2";
    // pub const STEP_TOKEN_MINT_PUBKEY: &str = "2D1ZMuKu7QaM3kSqjHT8UDWXVVWq1p59ZSzMwVnwHoNg"; // for dev net
    pub const STAKING_PDA_SEED_V2: &[u8] = b"staking_v2";
    pub const STAKING_PDA_SEED_V3: &[u8] = b"staking_v3";
    pub const USER_STAKING_PDA_SEED_V3: &[u8] = b"user_staking_v3";
}

#[program]
pub mod chicks_staking_locked {
    use anchor_lang::AccountsClose;
    use super::*;

    /// ---------------------------------------------------
    // pub fn test_initialize(
    //     ctx: Context<TestInit>,
    //     _nonce_vault: u8,
    //     _nonce_staking_v2: u8,
    //     pool_handle: String,
    //     lock_time: u64,
    // ) -> Result<()> {
    //     msg!("initialize - pool_handle {}", pool_handle);
    //     ctx.accounts.staking_account_v2.initializer_key = *ctx.accounts.initializer.key;
    //     ctx.accounts.staking_account_v2.lock_time = lock_time;
    //     ctx.accounts.staking_account_v2.total_token = 200;
    //
    //     Ok(())
    // }
    //
    // pub fn test_user_staking(
    //     ctx: Context<TestStaking>,
    //     _nonce_user_staking_v2: u8,
    //     _handle: String,
    //     amount: u64,
    // ) -> Result<()> {
    //     msg!("test user staking");
    //     let now_ts = Clock::get().unwrap().unix_timestamp;
    //     let user_staking_account_v2 = &mut ctx.accounts.user_staking_account_v2;
    //     user_staking_account_v2.start_time = now_ts as u64;
    //     user_staking_account_v2.amount = amount;
    //     Ok(())
    // }

    /// ---------------------------------------------------

    pub fn initialize(
        ctx: Context<Initialize>,
        _nonce_vault: u8,
        _nonce_staking_v3: u8,
        pool_handle: String,
        reward_rate: u64,
        lock_time: u64,
        unlock_interval: u64,
    ) -> Result<()> {
        msg!("initialize - pool_handle {}", pool_handle);
        let staking_account_v3 = &mut ctx.accounts.staking_account_v3;
        staking_account_v3.initializer_key = ctx.accounts.initializer.key();
        staking_account_v3.token_address = ctx.accounts.token_mint.key();
        staking_account_v3.lock_time = lock_time;
        staking_account_v3.total_staked_amount = 0;
        staking_account_v3.remain_reward_amount = 0;
        staking_account_v3.unlock_interval = unlock_interval;
        staking_account_v3.reward_rate = reward_rate;

        Ok(())
    }

    pub fn migrate_v3(
        ctx: Context<MigrateV3>,
        _nonce_staking_v2: u8,
        _nonce_staking_v3: u8,
        pool_handle: String,
        reward_rate: u64,
        unlock_interval: u64,
    ) -> Result<()> {
        msg!("migrate - pool_handle {}", pool_handle);
        let staking_account_v2 = &mut ctx.accounts.staking_account_v2;
        let staking_account_v3 = &mut ctx.accounts.staking_account_v3;
        staking_account_v3.initializer_key = ctx.accounts.initializer.key();
        staking_account_v3.token_address = ctx.accounts.token_mint.key();
        staking_account_v3.lock_time = staking_account_v2.lock_time;
        staking_account_v3.total_staked_amount = staking_account_v2.total_token;
        staking_account_v3.unlock_interval = unlock_interval;
        staking_account_v3.reward_rate = reward_rate;
        staking_account_v3.remain_reward_amount = get_reward_amount(staking_account_v3.total_staked_amount, reward_rate);

        Ok(())
    }

    pub fn update_config(
        ctx: Context<UpdateConfig>,
        _nonce_staking_v3: u8,
        pool_handle: String,
        new_lock_time: u64,
        new_unlock_interval: u64,
        new_reward_rate: u64,
    ) -> Result<()> {
        msg!("update_config - pool_handle {}", pool_handle);
        let staking_account_v3 = &mut ctx.accounts.staking_account_v3;
        staking_account_v3.lock_time = new_lock_time;
        staking_account_v3.unlock_interval = new_unlock_interval;
        staking_account_v3.reward_rate = new_reward_rate;
        Ok(())
    }

    pub fn toggle_freeze_program(
        ctx: Context<UpdateConfig>,
        _nonce_staking_v3: u8,
        pool_handle: String,
    ) -> Result<()> {
        msg!("toggle_freeze_program - pool_handle {}", pool_handle);
        let staking_account_v3 = &mut ctx.accounts.staking_account_v3;
        staking_account_v3.freeze_program = !staking_account_v3.freeze_program;
        Ok(())
    }

    #[access_control(freeze_program(& ctx.accounts.staking_account_v3))]
    pub fn deposit_reward(
        ctx: Context<DepositReward>,
        _nonce_vault: u8,
        _nonce_staking_v3: u8,
        pool_handle: String,
        amount: u64,
    ) -> Result<()> {
        msg!("deposit_reward - pool_handle {}, amount {}", pool_handle, amount);
        //transfer the users tokens to the vault
        let cpi_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            token::Transfer {
                from: ctx.accounts.token_from.to_account_info(),
                to: ctx.accounts.token_vault.to_account_info(),
                authority: ctx.accounts.token_from_authority.to_account_info(),
            },
        );
        token::transfer(cpi_ctx, amount)?;

        let staking_account_v3 = &mut ctx.accounts.staking_account_v3;
        staking_account_v3.remain_reward_amount = (staking_account_v3.remain_reward_amount as u128)
            .checked_sub(amount as u128)
            .unwrap()
            .try_into()
            .unwrap();
        Ok(())
    }

    #[access_control(freeze_program(& ctx.accounts.staking_account_v3))]
    pub fn init_user_stake(
        ctx: Context<InitUserStake>,
        _nonce_staking_v3: u8,
        _pool_handle: String,
        _handle: String,
    ) -> Result<()> {
        msg!("INIT USER STAKE");
        Ok(())
    }

    #[access_control(freeze_program(& ctx.accounts.staking_account_v3))]
    pub fn stake(
        ctx: Context<Stake>,
        _nonce_vault: u8,
        _nonce_staking_v3: u8,
        _nonce_user_staking_v3: u8,
        pool_handle: String,
        handle: String,
        amount: u64,
    ) -> Result<()> {
        msg!("stake - pool_handle {} - handle {} amount {}", pool_handle, handle, amount);
        let now_ts = Clock::get().unwrap().unix_timestamp;
        let user_staking_account_v3 = &mut ctx.accounts.user_staking_account_v3;
        let staking_account_v3 = &mut ctx.accounts.staking_account_v3;

        //transfer the users tokens to the vault
        let cpi_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            token::Transfer {
                from: ctx.accounts.token_from.to_account_info(),
                to: ctx.accounts.token_vault.to_account_info(),
                authority: ctx.accounts.token_from_authority.to_account_info(),
            },
        );
        token::transfer(cpi_ctx, amount)?;

        user_staking_account_v3.start_time = now_ts as u64;
        user_staking_account_v3.staked_amount = amount;
        user_staking_account_v3.reward_amount = get_reward_amount(amount, staking_account_v3.reward_rate);
        user_staking_account_v3.claimed_amount = 0;

        // plus total token amount
        staking_account_v3.total_staked_amount = (staking_account_v3.total_staked_amount as u128)
            .checked_add(amount as u128)
            .unwrap()
            .try_into()
            .unwrap();

        staking_account_v3.remain_reward_amount = (staking_account_v3.remain_reward_amount as u128)
            .checked_add(user_staking_account_v3.reward_amount as u128)
            .unwrap()
            .try_into()
            .unwrap();

        Ok(())
    }

    #[access_control(freeze_program(& ctx.accounts.staking_account_v3))]
    pub fn convert_user_stake_account(
        ctx: Context<Convert>,
        _nonce_staking_v3: u8,
        _nonce_user_staking_v2: u8,
        _nonce_user_staking_v3: u8,
        pool_handle: String,
        handle: String,
    ) -> Result<()> {
        msg!("convert - pool_handle {} - handle {}", pool_handle, handle);
        let staking_account_v3 = &mut ctx.accounts.staking_account_v3;
        let user_staking_account_v2 = &mut ctx.accounts.user_staking_account_v2;
        let user_staking_account_v3 = &mut ctx.accounts.user_staking_account_v3;

        user_staking_account_v3.staked_amount = user_staking_account_v2.amount;
        user_staking_account_v3.start_time = user_staking_account_v2.start_time;
        user_staking_account_v3.claimed_amount = 0;

        user_staking_account_v3.reward_amount = get_reward_amount(
            user_staking_account_v3.staked_amount,
            staking_account_v3.reward_rate
        );

        Ok(())
    }

    #[access_control(withdraw_available(& ctx.accounts.staking_account_v3, & ctx.accounts.user_staking_account_v3))]
    pub fn withdraw(
        ctx: Context<WithDraw>,
        _nonce_vault: u8,
        _nonce_staking_v3: u8,
        _nonce_user_staking_v3: u8,
        pool_handle: String,
        handle: String,
    ) -> Result<()> {
        let user_staking_account_v3 = &mut ctx.accounts.user_staking_account_v3;
        let staking_account_v3 = &mut ctx.accounts.staking_account_v3;
        let staked_amount: u64 = user_staking_account_v3.staked_amount;
        let reward_amount: u64 = user_staking_account_v3.reward_amount;
        let claimed_amount: u64 = user_staking_account_v3.claimed_amount;

        let claimable_amount = get_claimable_amount(&staking_account_v3, &user_staking_account_v3);

        msg!("withdraw - pool_handle {} - handle {}, claimable_amount: {}", pool_handle, handle, claimable_amount);

        if claimable_amount == 0 {
            return Err(ErrorCode::InvalidRequest.into());
        }
        //compute vault signer seeds
        let token_mint_key = ctx.accounts.token_mint.key();
        let seeds = &[token_mint_key.as_ref(), name_seed(&pool_handle), &[_nonce_vault]];
        let signer = &[&seeds[..]];

        //transfer from vault to user
        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            token::Transfer {
                from: ctx.accounts.token_vault.to_account_info(),
                to: ctx.accounts.token_to.to_account_info(),
                authority: ctx.accounts.token_vault.to_account_info(),
            },
            signer,
        );
        // transfer only original amount to user
        token::transfer(cpi_ctx, claimable_amount)?;

        user_staking_account_v3.claimed_amount = (claimed_amount as u128)
            .checked_add(claimable_amount as u128)
            .unwrap()
            .try_into()
            .unwrap();

        if user_staking_account_v3.claimed_amount >= (staked_amount + reward_amount) {
            //update stake_account total_amount
            staking_account_v3.total_staked_amount = (staking_account_v3.total_staked_amount as u128)
                .checked_sub(staked_amount as u128)
                .unwrap()
                .try_into()
                .unwrap();

            user_staking_account_v3.close(ctx.accounts.token_to_authority.to_account_info())?;
        }

        Ok(())
    }
}

fn name_seed(name: &str) -> &[u8] {
    let b = name.as_bytes();
    if b.len() > 32 {
        &b[0..32]
    } else {
        b
    }
}

/// ---------------------------------------------------
// #[derive(Accounts)]
// #[instruction(_nonce_vault: u8, _nonce_staking_v2: u8, pool_handle: String)]
// pub struct TestInit<'info> {
//     #[account(
//     address = constants::STEP_TOKEN_MINT_PUBKEY.parse::< Pubkey > ().unwrap(),
//     )]
//     pub token_mint: Box<Account<'info, Mint>>,
//
//     #[account(mut)]
//     ///pays rent on the initializing accounts
//     pub initializer: Signer<'info>,
//
//     #[account(
//     init,
//     payer = initializer,
//     token::mint = token_mint,
//     token::authority = token_vault, //the PDA address is both the vault account and the authority (and event the mint authority)
//     seeds = [ constants::STEP_TOKEN_MINT_PUBKEY.parse::< Pubkey > ().unwrap().as_ref(), name_seed(& pool_handle) ],
//     bump,
//     )]
//     ///the not-yet-created, derived token vault pubkey
//     pub token_vault: Box<Account<'info, TokenAccount>>,
//
//     #[account(
//     init,
//     payer = initializer,
//     seeds = [ constants::STAKING_PDA_SEED_V2.as_ref(), name_seed(& pool_handle)],
//     bump,
//     space = 8 + StakingAccount::LEN
//     )]
//     pub staking_account_v2: Account<'info, StakingAccount>,
//
//     ///used by anchor for init of the token
//     pub system_program: Program<'info, System>,
//     pub token_program: Program<'info, Token>,
//     pub rent: Sysvar<'info, Rent>,
// }
//
// #[derive(Accounts)]
// #[instruction(_nonce_user_staking_v2: u8, _handle: String)]
// pub struct TestStaking<'info>{
//     // User Accounts
//     #[account(mut)]
//     pub user_authority: Signer<'info>,
//
//     #[account(
//     init,
//     payer = user_authority,
//     seeds = [user_authority.key().as_ref(), name_seed(& _handle)],
//     bump,
//     space = UserStakingAccount::LEN + 8
//     )]
//     pub user_staking_account_v2: Account<'info, UserStakingAccount>,
//
//     ///used by anchor for init of the token
//     pub system_program: Program<'info, System>,
//     pub token_program: Program<'info, Token>,
//     pub rent: Sysvar<'info, Rent>,
// }

/// ---------------------------------------------------
#[derive(Accounts)]
#[instruction(_nonce_vault: u8, _nonce_staking_v3: u8, pool_handle: String)]
pub struct Initialize<'info> {
    #[account(mut)]
    ///pays rent on the initializing accounts
    pub initializer: Signer<'info>,

    pub token_mint: Box<Account<'info, Mint>>,

    #[account(
    init,
    payer = initializer,
    token::mint = token_mint,
    token::authority = token_vault, //the PDA address is both the vault account and the authority (and event the mint authority)
    seeds = [ token_mint.key().as_ref(), name_seed(& pool_handle) ],
    bump,
    )]
    pub token_vault: Box<Account<'info, TokenAccount>>,

    #[account(
    init,
    payer = initializer,
    seeds = [ token_mint.key().as_ref(), constants::STAKING_PDA_SEED_V3.as_ref(), name_seed(& pool_handle)],
    bump,
    space = 8 + StakingAccountV3::LEN
    )]
    pub staking_account_v3: Account<'info, StakingAccountV3>,

    ///used by anchor for init of the token
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
#[instruction(_nonce_staking_v2: u8, _nonce_staking_v3: u8, pool_handle: String)]
pub struct MigrateV3<'info> {
    #[account(mut)]
    ///pays rent on the initializing accounts
    pub initializer: Signer<'info>,

    pub token_mint: Box<Account<'info, Mint>>,

    #[account(
    mut,
    close = initializer,
    seeds = [ constants::STAKING_PDA_SEED_V2.as_ref(), name_seed(& pool_handle)],
    bump,
    constraint = staking_account_v2.initializer_key == initializer.key() @ ErrorCode::PermissionError,
    )]
    pub staking_account_v2: Account<'info, StakingAccount>,

    #[account(
    init,
    payer = initializer,
    seeds = [ token_mint.key().as_ref(), constants::STAKING_PDA_SEED_V3.as_ref(), name_seed(& pool_handle)],
    bump,
    space = 8 + StakingAccountV3::LEN
    )]
    pub staking_account_v3: Account<'info, StakingAccountV3>,

    ///used by anchor for init of the token
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
#[instruction(_nonce_staking_v3: u8, pool_handle: String)]
pub struct UpdateConfig<'info> {
    #[account(mut)]
    pub initializer: Signer<'info>,

    pub token_mint: Box<Account<'info, Mint>>,
    #[account(
    mut,
    seeds = [ token_mint.key().as_ref(), constants::STAKING_PDA_SEED_V3.as_ref(), name_seed(& pool_handle)],
    bump,
    constraint = staking_account_v3.initializer_key == initializer.key() @ ErrorCode::PermissionError,
    )]
    pub staking_account_v3: Account<'info, StakingAccountV3>,
}

#[derive(Accounts)]
#[instruction(_nonce_vault: u8, _nonce_staking_v3: u8, pool_handle: String)]
pub struct DepositReward<'info> {
    #[account(mut)]
    //the authority allowed to transfer from token_from
    pub token_from_authority: Signer<'info>,

    #[account(
    address = staking_account_v3.token_address.key(),
    )]
    pub token_mint: Box<Account<'info, Mint>>,

    #[account(mut)]
    //the token account to withdraw from
    pub token_from: Box<Account<'info, TokenAccount>>,

    #[account(
    mut,
    seeds = [ token_mint.key().as_ref(), name_seed(& pool_handle) ],
    bump
    )]
    pub token_vault: Box<Account<'info, TokenAccount>>,

    #[account(
    mut,
    seeds = [ token_mint.key().as_ref(), constants::STAKING_PDA_SEED_V3.as_ref(), name_seed(& pool_handle)],
    bump
    )]
    pub staking_account_v3: Account<'info, StakingAccountV3>,

    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
#[instruction(_nonce_staking_v3: u8, _pool_handle: String, _handle: String)]
pub struct InitUserStake<'info> {
    // User Accounts
    #[account(mut)]
    pub user_authority: Signer<'info>,

    pub token_mint: Box<Account<'info, Mint>>,

    #[account(
    init,
    payer = user_authority,
    seeds = [
    token_mint.key().as_ref(),
    user_authority.key().as_ref(),
    name_seed(& _handle),
    constants::USER_STAKING_PDA_SEED_V3.as_ref(),
    ],
    bump,
    space = UserStakingAccountV3::LEN + 8
    )]
    pub user_staking_account_v3: Account<'info, UserStakingAccountV3>,

    #[account(
    seeds = [ token_mint.key().as_ref(), constants::STAKING_PDA_SEED_V3.as_ref(), name_seed(& _pool_handle)],
    bump,
    )]
    pub staking_account_v3: Account<'info, StakingAccountV3>,

    // Programs and Sysvars
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
#[instruction(_nonce_vault: u8, _nonce_staking_v3: u8, _nonce_user_staking_v3: u8, pool_handle: String, handle: String)]
pub struct Stake<'info> {
    #[account(mut)]
    //the authority allowed to transfer from token_from
    pub token_from_authority: Signer<'info>,

    #[account(
    address = staking_account_v3.token_address.key(),
    )]
    pub token_mint: Box<Account<'info, Mint>>,

    #[account(mut)]
    //the token account to withdraw from
    pub token_from: Box<Account<'info, TokenAccount>>,

    #[account(
    mut,
    seeds = [ token_mint.key().as_ref(), name_seed(& pool_handle) ],
    bump
    )]
    pub token_vault: Box<Account<'info, TokenAccount>>,

    #[account(
    mut,
    seeds = [ token_mint.key().as_ref(), constants::STAKING_PDA_SEED_V3.as_ref(), name_seed(& pool_handle)],
    bump
    )]
    pub staking_account_v3: Account<'info, StakingAccountV3>,

    #[account(
    mut,
    seeds = [
    token_mint.key().as_ref(),
    token_from_authority.key().as_ref(),
    name_seed(& handle),
    constants::USER_STAKING_PDA_SEED_V3.as_ref(),
    ],
    bump
    )]
    pub user_staking_account_v3: Account<'info, UserStakingAccountV3>,

    // Programs and Sysvars
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
#[instruction(_nonce_staking_v3: u8, _nonce_user_staking_v2: u8, _nonce_user_staking_v3: u8, pool_handle: String, handle: String)]
pub struct Convert<'info> {
    #[account(mut)]
    pub user_authority: Signer<'info>,

    pub token_mint: Box<Account<'info, Mint>>,
    #[account(
    mut,
    seeds = [ token_mint.key().as_ref(), constants::STAKING_PDA_SEED_V3.as_ref(), name_seed(& pool_handle)],
    bump
    )]
    pub staking_account_v3: Account<'info, StakingAccountV3>,

    #[account(
    mut,
    seeds = [user_authority.key().as_ref(), name_seed(& handle)],
    bump,
    close = user_authority,
    )]
    pub user_staking_account_v2: Account<'info, UserStakingAccount>,

    #[account(
    init,
    payer = user_authority,
    seeds = [
    token_mint.key().as_ref(),
    user_authority.key().as_ref(),
    name_seed(& handle),
    constants::USER_STAKING_PDA_SEED_V3.as_ref(),
    ],
    bump,
    space = UserStakingAccountV3::LEN + 8
    )]
    pub user_staking_account_v3: Account<'info, UserStakingAccountV3>,
    // Programs and Sysvars
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
#[instruction(_nonce_vault: u8, _nonce_staking_v3: u8, _nonce_user_staking_v3: u8, pool_handle: String, handle: String)]
pub struct WithDraw<'info> {
    #[account(mut)]
    //the authority allowed to transfer from x_token_from
    pub token_to_authority: Signer<'info>,

    #[account(
    address = staking_account_v3.token_address.key(),
    )]
    pub token_mint: Box<Account<'info, Mint>>,

    #[account(
    mut,
    seeds = [ token_mint.key().as_ref(), name_seed(& pool_handle) ],
    bump
    )]
    pub token_vault: Box<Account<'info, TokenAccount>>,

    #[account(
    mut,
    seeds = [ token_mint.key().as_ref(), constants::STAKING_PDA_SEED_V3.as_ref(), name_seed(& pool_handle)],
    bump
    )]
    pub staking_account_v3: Account<'info, StakingAccountV3>,

    #[account(
    mut,
    seeds = [
    token_mint.key().as_ref(),
    token_to_authority.key().as_ref(),
    name_seed(& handle),
    constants::USER_STAKING_PDA_SEED_V3.as_ref(),
    ],
    bump
    )]
    pub user_staking_account_v3: Account<'info, UserStakingAccountV3>,

    #[account(mut)]
    //the token account to send token
    pub token_to: Box<Account<'info, TokenAccount>>,

    pub token_program: Program<'info, Token>,
}

fn get_reward_amount(amount: u64, reward_rate: u64) -> u64 {
    (amount as u128)
        .checked_mul(reward_rate as u128)
        .unwrap()
        .checked_div(10000)
        .unwrap()
        .try_into()
        .unwrap()
}

fn get_claimable_amount<'info>(
    staking_account: &Account<'info, StakingAccountV3>,
    user_staking_account: &Account<'info, UserStakingAccountV3>,
) -> u64 {
    let now_ts = Clock::get().unwrap().unix_timestamp;
    let lock_time = staking_account.lock_time;
    let unlock_interval = staking_account.unlock_interval;
    let start_time = user_staking_account.start_time;

    let staked_amount = user_staking_account.staked_amount;
    let claimed_amount = user_staking_account.claimed_amount;
    let reward = user_staking_account.reward_amount;

    if staked_amount == 0 {
        return 0;
    }
    if claimed_amount >= (staked_amount + reward) {
        return 0;
    }
    if (now_ts as u64) < (start_time + lock_time) {
        return 0;
    }

    let mut unlock_reward: u64;

    if (now_ts as u64) < (start_time + lock_time * 2) {
        let period_days: u128 = (lock_time as u128)
            .checked_div(unlock_interval as u128)
            .unwrap()
            .try_into()
            .unwrap();

        let days: u128 = (now_ts as u128)
            .checked_sub(start_time as u128)
            .unwrap()
            .checked_sub(lock_time as u128)
            .unwrap()
            .checked_div(unlock_interval as u128)
            .unwrap()
            .try_into()
            .unwrap();
        unlock_reward = (reward as u128)
            .checked_div(period_days as u128)
            .unwrap()
            .checked_mul(days as u128)
            .unwrap()
            .try_into()
            .unwrap();
        if unlock_reward > reward {
            unlock_reward = reward;
        }
    } else {
        unlock_reward = reward;
    }

    (staked_amount as u128)
        .checked_add(unlock_reward as u128)
        .unwrap()
        .checked_sub(claimed_amount as u128)
        .unwrap()
        .try_into()
        .unwrap()
}

#[account]
#[derive(Default)]
pub struct StakingAccount {
    pub initializer_key: Pubkey,
    pub lock_time: u64,
    pub total_token: u64,
    pub total_x_token: u64,
    pub freeze_program: bool,
}

impl StakingAccount {
    pub const LEN: usize = 32 + 8 + 8 + 8 + 1;
}

#[account]
#[derive(Default)]
pub struct StakingAccountV3 {
    pub initializer_key: Pubkey,
    pub token_address: Pubkey,
    pub lock_time: u64,
    pub unlock_interval: u64,
    pub total_staked_amount: u64,
    pub remain_reward_amount: u64, // Remaining reward amount to deposit
    pub reward_rate: u64,  // 10_000 means 100%,
    pub freeze_program: bool,
}

impl StakingAccountV3 {
    pub const LEN: usize = 32 + 32 + 8 + 8 + 8 + 8 + 8 + 1;
}

#[account]
#[derive(Default)]
pub struct UserStakingAccount {
    pub amount: u64,
    pub start_time: u64,
    pub x_token_amount: u64,
    pub rewards: u64,
}

impl UserStakingAccount {
    pub const LEN: usize = 8 + 8 + 8 + 8;
}

#[account]
#[derive(Default)]
pub struct UserStakingAccountV3 {
    pub start_time: u64,
    pub staked_amount: u64,
    pub reward_amount: u64,
    pub claimed_amount: u64,
}

impl UserStakingAccountV3 {
    pub const LEN: usize = 8 + 8 + 8 + 8;
}

#[event]
pub struct Reward {
    pub deposit: u64,
    pub reward: u64,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Not exceed lock end date")]
    NotExceedLockEndDate,
    #[msg("Invalid request")]
    InvalidRequest,
    #[msg("Invalid action")]
    PermissionError,
    #[msg("Internal error")]
    InternalError,
}

// Access control modifiers
fn freeze_program(staking_account_v3: &StakingAccountV3) -> Result<()> {
    if staking_account_v3.freeze_program {
        return err!(ErrorCode::InvalidRequest);
    }
    Ok(())
}

fn withdraw_available(staking_account_v3: &StakingAccountV3, user_staking_account_v3: &UserStakingAccountV3) -> Result<()> {
    if staking_account_v3.freeze_program {
        return err!(ErrorCode::InvalidRequest);
    }
    let now_ts = Clock::get().unwrap().unix_timestamp;
    let lock_time = staking_account_v3.lock_time;
    let start_time = user_staking_account_v3.start_time;
    let amount: u64 = user_staking_account_v3.staked_amount;
    if amount == 0 {
        return err!(ErrorCode::InvalidRequest);
    }
    if (now_ts as u64) < (start_time + lock_time) {
        return err!(ErrorCode::NotExceedLockEndDate);
    }

    Ok(())
}
