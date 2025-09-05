use anchor_lang::prelude::*;

declare_id!("9VEMBenFkotjdBVsJXEBdsSLfc3Ao3fihsrL1TaqK5wu");

#[program]
pub mod trace {
    use super::*;
    pub fn init_trace(ctx: Context<InitTrace>, product_id: String) -> Result<()> {
        let trace_account = &mut ctx.accounts.trace_account;
        trace_account.product_id = product_id;
        trace_account.records = Vec::new();
        Ok(())
    }
    pub fn append_record(ctx: Context<AppendRecord>, description: String) -> Result<()> {
        let trace_account = &mut ctx.accounts.trace_account;
        let record = TraceRecord {
            ts: Clock::get()?.unix_timestamp,
            description,
        };
        trace_account.records.push(record);
        Ok(())
    }
    pub fn delete(ctx: Context<DeleteRecord>, index: u64) -> Result<()> {
        let trace_account = &mut ctx.accounts.trace_account;
        let idx = index as usize;
        if idx >= trace_account.records.len() {
            return Err(ErrorCode::InvalidIndex.into());
        }
        trace_account.records.remove(idx);
        Ok(())
    }

    pub fn clear(ctx: Context<ClearRecord>) -> Result<()> {
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

    pub user: Signer<'info>,
}

#[account]
pub struct TraceAccount {
    pub product_id: String,
    pub records: Vec<TraceRecord>,
}
impl TraceAccount {
    pub const MAX_SIZE: usize = 32 + (4 + 10 * TraceRecord::SIZE);
}
#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct TraceRecord {
    pub ts: i64,
    pub description: String,
}
impl TraceRecord {
    pub const SIZE: usize = 8 + (4 + 64);
}
#[error_code]
pub enum ErrorCode {
    #[msg("Invalid index")]
    InvalidIndex,
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
