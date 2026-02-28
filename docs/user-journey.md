# EvoArena — User Journey Documentation

## Overview

EvoArena serves three distinct user roles: **Traders**, **Liquidity Providers (LPs)**, and **AI Agents**. Each journey is designed to be intuitive, with progressive disclosure of complexity.

---

## 1. Trader Journey

```mermaid
flowchart TD
    T1[Visit EvoArena] --> T2[Connect MetaMask / WalletConnect]
    T2 --> T3{On BSC Testnet?}
    T3 -->|No| T4[Switch Network Prompt]
    T4 --> T3
    T3 -->|Yes| T5[View Pool Dashboard]
    T5 --> T6[Navigate to Swap Page]
    T6 --> T7[Select Token Pair EVOA ↔ EVOB]
    T7 --> T8[Enter Amount]
    T8 --> T9[Review Price Impact & Slippage]
    T9 --> T10[Approve Token Spending]
    T10 --> T11[Confirm Swap TX]
    T11 --> T12{TX Success?}
    T12 -->|Yes| T13[View Updated Balances]
    T12 -->|No| T14[Error Toast with Details]
    T13 --> T15[Check History Page for TX Record]
    T15 --> T6

    style T1 fill:#F5A623,color:#000
    style T13 fill:#7ED321,color:#000
    style T14 fill:#D0021B,color:#fff
```

### Trader UX Improvements vs Static AMMs
- **Dynamic fees** adjust automatically — lower fees in calm markets, higher in volatile
- **Whale protection** via Defensive curve mode — large trades incur quadratic penalty
- **Real-time price impact** shown before confirmation
- **Transaction history** page for full audit trail

---

## 2. Liquidity Provider Journey

```mermaid
flowchart TD
    L1[Visit EvoArena] --> L2[Connect Wallet]
    L2 --> L3[View Pool Dashboard]
    L3 --> L4[Check Pool Stats: TVL, Fee APR, Volume]
    L4 --> L5[Navigate to Liquidity Page]
    L5 --> L6{Add or Remove?}

    L6 -->|Add| L7[Enter EVOA Amount]
    L7 --> L8[Auto-calculate EVOB Required]
    L8 --> L9[Approve EVOA + EVOB]
    L9 --> L10[Confirm Add Liquidity TX]
    L10 --> L11[Receive LP Tokens ERC-20]
    L11 --> L12[LP Tokens Appear in Wallet]

    L6 -->|Remove| L13[Enter LP Amount to Burn]
    L13 --> L14[Preview EVOA + EVOB to Receive]
    L14 --> L15[Confirm Remove Liquidity TX]
    L15 --> L16[Receive EVOA + EVOB Back]

    L12 --> L17[Monitor Pool Performance on Dashboard]
    L16 --> L17
    L17 --> L18[Check Agent Leaderboard]
    L18 --> L19[View Which Agent Controls Pool Parameters]
    L19 --> L20[Audit Agent Decisions on /audit Page]

    style L1 fill:#F5A623,color:#000
    style L11 fill:#7ED321,color:#000
    style L12 fill:#7ED321,color:#000
    style L16 fill:#7ED321,color:#000
```

### LP UX Improvements vs Static AMMs
- **ERC-20 LP tokens** — fully composable, can be transferred or used in other DeFi
- **EIP-2612 Permit** — gasless approvals for add/remove liquidity
- **AI-optimized fees** — agents maximize fee revenue while minimizing impermanent loss
- **Emergency exit** — LPs can always withdraw even when pool is paused
- **Protocol fee transparency** — visible on-chain, capped at 20%

---

## 3. AI Agent Journey

```mermaid
flowchart TD
    A1[Set Up Agent Wallet] --> A2[Fund with tBNB on BSC Testnet]
    A2 --> A3[Connect to EvoArena Frontend]
    A3 --> A4[Navigate to Settings Page]
    A4 --> A5[Register as Agent]
    A5 --> A6[Post Bond ≥ 0.01 tBNB]
    A6 --> A7{Registration TX Success?}
    A7 -->|No| A8[Check Bond Amount / Gas]
    A8 --> A6
    A7 -->|Yes| A9[Agent Active on Leaderboard]

    A9 --> A10[Configure Strategy via Settings UI]
    A10 --> A11[Choose: Rule-Based or ML Mode]
    A11 --> A12[Set Fee Range & Beta Preferences]

    A12 --> A13[Agent Loop Starts]
    A13 --> A14[Poll Pool State: Reserves, Fee, Events]
    A14 --> A15[Compute Features: Volatility, Trade Velocity, Whale Detection]
    A15 --> A16[Strategy Engine Generates Proposal]
    A16 --> A17[Circuit Breaker Check]
    A17 -->|Blocked| A18[Log Alert & Skip Update]
    A17 -->|Clear| A19[Submit Parameter Update TX]

    A19 --> A20{On-Chain Validation}
    A20 -->|Rejected| A21[Delta Too Large / Cooldown Active]
    A20 -->|Accepted| A22[Pool Parameters Updated]

    A22 --> A23[Compute APS Score]
    A23 --> A24[Upload Decision Log to Greenfield]
    A24 --> A25[Wait for Next Epoch]
    A25 --> A13

    A18 --> A25

    style A1 fill:#F5A623,color:#000
    style A9 fill:#7ED321,color:#000
    style A22 fill:#7ED321,color:#000
    style A21 fill:#D0021B,color:#fff
    style A18 fill:#D0021B,color:#fff
```

### Agent Competitive Loop

```mermaid
sequenceDiagram
    participant Agent as AI Agent
    participant AC as AgentController
    participant Pool as EvoPool
    participant EM as EpochManager
    participant GF as Greenfield

    Agent->>Pool: poll reserves, fee, events
    Agent->>Agent: compute volatility, velocity, whale ratio
    Agent->>Agent: strategy engine → proposed params
    Agent->>Agent: circuit breaker check
    Agent->>AC: submitParameterUpdate(fee, beta, mode)
    AC->>AC: validate bounds, cooldown, bond
    AC->>Pool: updateParameters(fee, beta, mode)
    Pool-->>Agent: ParametersUpdated event
    Agent->>Agent: compute APS score
    Agent->>GF: upload decision log (JSON)

    Note over EM: Epoch ends after 1 hour
    EM->>AC: score agents by APS
    EM->>Agent: distribute epoch rewards
```

---

## 4. Full System Flow — All Roles

```mermaid
flowchart LR
    subgraph Users
        Trader[🔄 Trader]
        LP[💧 LP Provider]
    end

    subgraph Frontend ["Frontend (Next.js)"]
        Swap[Swap Page]
        Liq[Liquidity Page]
        Dash[Dashboard]
        Agents[Agent Leaderboard]
        Audit[Audit Page]
        History[History Page]
    end

    subgraph Chain ["BSC Testnet"]
        Pool[EvoPool.sol]
        Ctrl[AgentController.sol]
        Epoch[EpochManager.sol]
        TL[TimeLock.sol]
    end

    subgraph AI ["Off-Chain Agent"]
        Engine[Strategy Engine]
        ML[ML Model]
        CB[Circuit Breaker]
    end

    subgraph Storage ["BNB Greenfield"]
        Logs[Audit Logs]
    end

    Trader --> Swap --> Pool
    LP --> Liq --> Pool
    Trader --> History
    LP --> Dash

    Engine --> Ctrl --> Pool
    ML --> Engine
    CB --> Engine

    Epoch --> Ctrl
    TL -.-> Ctrl

    Engine --> Logs
    Audit --> Logs

    Agents --> Ctrl
    Dash --> Pool

    style Trader fill:#F5A623,color:#000
    style LP fill:#4A90D9,color:#fff
    style Engine fill:#7ED321,color:#000
```

---

## 5. UX Comparison: EvoArena vs Traditional AMMs

| Feature | Traditional AMM (e.g. Uniswap v2) | EvoArena |
|---------|-----------------------------------|----------|
| Fee Adjustment | Fixed forever at deploy time | AI agents adjust every epoch |
| Whale Protection | None — large trades cause massive slippage | Defensive curve mode with quadratic penalty |
| LP Tokens | Custom non-standard | Full ERC-20 with EIP-2612 Permit |
| Price Oracle | Basic TWAP | TWAP with cumulative price accumulators |
| Parameter Governance | DAO vote (slow, months) | Real-time agent competition (seconds) |
| Audit Trail | Etherscan only | Greenfield decentralized storage + on-chain |
| Emergency Controls | None or admin key | Pause + LP emergency exit + timelock |
| Market Adaptation | Manual redeployment | Automatic via ML + rule engine |
