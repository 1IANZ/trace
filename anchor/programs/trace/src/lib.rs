use anchor_lang::prelude::*;

declare_id!("6gfJUBVCHqY1JRPx9g8mJnSXJFoDwWwbsMWwRg7uNjdQ");
const ADMIN_PUBKEY_STRING: &str = "BYRNpGvSx1UKJ24z79gBpRYBNTGvBqZBPx2Cbw2GLKAa";
#[program]
pub mod trace {
    use super::*;
    pub fn init_whitelist(ctx: Context<InitWhitelist>) -> Result<()> {
        let whitelist_account = &mut ctx.accounts.whitelist_account;
        whitelist_account.whitelisted_users = Vec::new();
        Ok(())
    }

    pub fn add_user_to_whitelist(ctx: Context<ManageWhitelist>, user_to_add: Pubkey) -> Result<()> {
        require!(
            ctx.accounts.admin.key().to_string() == ADMIN_PUBKEY_STRING,
            ErrorCode::UnauthorizedAdmin
        );

        let whitelist_account = &mut ctx.accounts.whitelist_account;
        if !whitelist_account.whitelisted_users.contains(&user_to_add) {
            whitelist_account.whitelisted_users.push(user_to_add);
        }
        Ok(())
    }

    pub fn remove_user_from_whitelist(
        ctx: Context<ManageWhitelist>,
        user_to_remove: Pubkey,
    ) -> Result<()> {
        require!(
            ctx.accounts.admin.key().to_string() == ADMIN_PUBKEY_STRING,
            ErrorCode::UnauthorizedAdmin
        );

        let whitelist_account = &mut ctx.accounts.whitelist_account;
        whitelist_account
            .whitelisted_users
            .retain(|&x| x != user_to_remove);
        Ok(())
    }
    pub fn init_trace(ctx: Context<InitTrace>, product_id: String) -> Result<()> {
        require!(
            ctx.accounts
                .whitelist_account
                .whitelisted_users
                .contains(&ctx.accounts.user.key()),
            ErrorCode::UnauthorizedUser
        );

        let trace_account = &mut ctx.accounts.trace_account;
        trace_account.product_id = product_id;
        trace_account.records = Vec::new();
        Ok(())
    }
    pub fn append_record(ctx: Context<AppendRecord>, description: String) -> Result<()> {
        require!(
            ctx.accounts
                .whitelist_account
                .whitelisted_users
                .contains(&ctx.accounts.user.key()),
            ErrorCode::UnauthorizedUser
        );

        let trace_account = &mut ctx.accounts.trace_account;
        let step = (trace_account.records.len() + 1).to_string();
        let actor = ctx.accounts.user.key().to_string();

        let record = TraceRecord {
            ts: Clock::get()?.unix_timestamp,
            step,
            actor,
            description,
        };
        trace_account.records.push(record);
        Ok(())
    }

    pub fn update_record(
        ctx: Context<UpdateRecord>,
        index: u64,
        new_description: String,
    ) -> Result<()> {
        require!(
            ctx.accounts
                .whitelist_account
                .whitelisted_users
                .contains(&ctx.accounts.user.key()),
            ErrorCode::UnauthorizedUser
        );

        let trace_account = &mut ctx.accounts.trace_account;
        let idx = index as usize;

        if idx >= trace_account.records.len() {
            return Err(ErrorCode::InvalidIndex.into());
        }

        let record = &mut trace_account.records[idx];
        record.actor = ctx.accounts.user.key().to_string();
        record.description = new_description;
        record.ts = Clock::get()?.unix_timestamp;

        Ok(())
    }
    pub fn delete(ctx: Context<DeleteRecord>, index: u64) -> Result<()> {
        require!(
            ctx.accounts
                .whitelist_account
                .whitelisted_users
                .contains(&ctx.accounts.user.key()),
            ErrorCode::UnauthorizedUser
        );
        let trace_account = &mut ctx.accounts.trace_account;
        let idx = index as usize;
        if idx >= trace_account.records.len() {
            return Err(ErrorCode::InvalidIndex.into());
        }
        trace_account.records.remove(idx);
        Ok(())
    }

    pub fn clear(ctx: Context<ClearRecord>) -> Result<()> {
        require!(
            ctx.accounts
                .whitelist_account
                .whitelisted_users
                .contains(&ctx.accounts.user.key()),
            ErrorCode::UnauthorizedUser
        );
        let trace_account = &mut ctx.accounts.trace_account;
        trace_account.records.clear();
        Ok(())
    }
    pub fn get_trace(ctx: Context<GetTrace>) -> Result<TraceInfo> {
        let trace_account = &ctx.accounts.trace_account;
        Ok(TraceInfo {
            product_id: trace_account.product_id.clone(),
            records: trace_account.records.clone(),
        })
    }
}

#[derive(Accounts)]
#[instruction(product_id: String)]
pub struct InitTrace<'info> {
    #[account(
        init,
        payer = user,
        space = 8 + TraceAccount::MAX_SIZE, 
        seeds = [b"trace", product_id.as_bytes()],
        bump
    )]
    pub trace_account: Account<'info, TraceAccount>,

    #[account(seeds = [b"whitelist"], bump)]
    pub whitelist_account: Account<'info, WhitelistAccount>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AppendRecord<'info> {
    #[account(
        mut,
        seeds = [b"trace", trace_account.product_id.as_bytes()],
        bump
    )]
    pub trace_account: Account<'info, TraceAccount>,
    #[account(seeds = [b"whitelist"], bump)]
    pub whitelist_account: Account<'info, WhitelistAccount>,
    pub user: Signer<'info>,
}

#[derive(Accounts)]
pub struct DeleteRecord<'info> {
    #[account(
        mut,
        seeds = [b"trace", trace_account.product_id.as_bytes()],
        bump
    )]
    pub trace_account: Account<'info, TraceAccount>,
    #[account(seeds = [b"whitelist"], bump)]
    pub whitelist_account: Account<'info, WhitelistAccount>,
    pub user: Signer<'info>,
}
#[derive(Accounts)]
pub struct ClearRecord<'info> {
    #[account(
        mut,
        seeds = [b"trace", trace_account.product_id.as_bytes()],
        bump
    )]
    pub trace_account: Account<'info, TraceAccount>,
    #[account(seeds = [b"whitelist"], bump)]
    pub whitelist_account: Account<'info, WhitelistAccount>,
    pub user: Signer<'info>,
}

#[account]
pub struct TraceAccount {
    pub product_id: String,
    pub records: Vec<TraceRecord>,
}
impl TraceAccount {
    pub const MAX_SIZE: usize = (4 + 32) + (4 + 20 * TraceRecord::SIZE);
}
#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct TraceRecord {
    pub ts: i64,
    pub step: String,
    pub actor: String,
    pub description: String,
}
impl TraceRecord {
    pub const SIZE: usize = 8  // ts: i64
        + (4 + 64)  // step: String
        + (4 + 64)  // actor: String
        + (4 + 128); // description: String
}
#[error_code]
pub enum ErrorCode {
    #[msg("Invalid index")]
    InvalidIndex,
    #[msg("Unauthorized user")]
    UnauthorizedUser,
    #[msg("Unauthorized admin")]
    UnauthorizedAdmin,
}

#[derive(Accounts)]
pub struct GetTrace<'info> {
    #[account(
        seeds = [b"trace", trace_account.product_id.as_bytes()],
        bump
    )]
    pub trace_account: Account<'info, TraceAccount>,
}
#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct TraceInfo {
    pub product_id: String,
    pub records: Vec<TraceRecord>,
}

#[derive(Accounts)]
pub struct InitWhitelist<'info> {
    #[account(
        init,
        payer = user,
        space = 8 + 4 + 32 * 10,
        seeds = [b"whitelist"],
        bump
    )]
    pub whitelist_account: Account<'info, WhitelistAccount>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ManageWhitelist<'info> {
    #[account(mut, seeds = [b"whitelist"], bump)]
    pub whitelist_account: Account<'info, WhitelistAccount>,

    #[account(mut)]
    pub admin: Signer<'info>,
}

#[account]
pub struct WhitelistAccount {
    pub whitelisted_users: Vec<Pubkey>,
}
impl WhitelistAccount {
    pub const MAX_SIZE: usize = 4 + (32 * 10);
}
#[derive(Accounts)]
pub struct UpdateRecord<'info> {
    #[account(
        mut,
        seeds = [b"trace", trace_account.product_id.as_bytes()],
        bump
    )]
    pub trace_account: Account<'info, TraceAccount>,
    #[account(seeds = [b"whitelist"], bump)]
    pub whitelist_account: Account<'info, WhitelistAccount>,
    pub user: Signer<'info>,
}
