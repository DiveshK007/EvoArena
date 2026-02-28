# EvoArena — Verification Walkthrough

> **URL**: http://localhost:3000 | **Network**: BSC Testnet (Chain 97)
> Start: `cd frontend && npm run dev`

---

## Step 1 — Connect Wallet
1. Open http://localhost:3000
2. Click **"Connect Wallet"** in navbar → approve in MetaMask
3. Verify: your address shows as `0x3E77…B6` with a copy icon

## Step 2 — Pool Dashboard (`/`)
4. You're on the home page — check 4 stat cards load (Reserve0, Reserve1, Price, Trades)
5. Check 3 parameter cards load (Fee bps, Curve Beta, Curve Mode with color)
6. Scroll down — verify Fee & Beta History chart, Reserve chart, Mode Timeline chart render
7. Wait 10 seconds — stats should auto-refresh (watch trade count or reserves flicker)

## Step 3 — Theme Toggle
8. Click the **☀️/🌙** button in navbar → page switches to light mode
9. Click again → back to dark mode
10. Refresh → theme persists

## Step 4 — Swap (`/swap`)
11. Click **"Swap"** in navbar — verify it highlights gold
12. Type **`100`** in input → estimated output appears, trade details panel shows (price impact, min received, fee, route)
13. Click **direction toggle** (⇄ button) → arrow rotates, switches to EVOB→EVOA
14. Toggle back to EVOA→EVOB
15. Click **0.5%** slippage → button highlights, min received updates
16. Click **MAX** button → input fills with your full balance
17. Clear input, type **`100`**
18. Click **"🔄 Swap"** → confirmation modal appears showing amounts
19. Click **"Swap Now"** → watch toast: Preparing → Approving → Executing → Confirming
20. Approve + confirm in MetaMask
21. Verify: green "✅ Swap successful!" toast with BscScan link appears
22. Click the **BscScan link** on the toast → verify TX on testnet.bscscan.com
23. Input field is cleared, balance updated

## Step 5 — Verify Swap on Dashboard
24. Go back to **`/`** → reserves changed, trade count incremented by 1

## Step 6 — Add Liquidity (`/liquidity`)
25. Click **"Liquidity"** in navbar
26. Check pool info section shows reserves + LP supply (real numbers)
27. Type **`500`** in EVOA input, **`500`** in EVOB input
28. Click **"💧 Add Liquidity"** → confirmation modal appears
29. Click **"Add Liquidity"** in modal → approve Token A → approve Token B → add TX
30. Confirm all MetaMask popups
31. Verify: "✅ Liquidity added!" toast
32. Check **"Your LP Balance"** now shows a value
33. Check **"Your Position Value"** shows EVOA share, EVOB share, Pool share %

## Step 7 — Remove Liquidity
34. Click **"➖ Remove Liquidity"** tab
35. Click the **"Max: X.XXXXXX"** link → input fills
36. Change to half the amount
37. Click **"🔥 Remove Liquidity"** → confirm modal → confirm in MetaMask
38. Verify: "✅ Liquidity removed!" toast, LP balance decreased

## Step 8 — Register Agent (`/agents`)
39. Click **"Agents"** in navbar
40. Check **"Register as Agent"** card at top with bond input
41. Enter **`0.01`** BNB, click **"Register Agent"**
42. Confirm in MetaMask
43. Wait 15 seconds — your agent appears in the list
44. Verify: green dot, your address (clickable BscScan link), copy icon, golden **"You"** badge
45. Click the **copy icon** → "✓ Copied" appears
46. Scroll down — check APS Leaderboard table and APS chart section exist

## Step 9 — Submit Parameter Update (`/settings`)
47. Click **"Settings"** in navbar
48. Verify **"Agent Status"** shows your bond + "✓ Ready"
49. Change Fee to **`45`**, change Mode to **"Defensive"**
50. Click **"Submit Update"**
51. Confirm in MetaMask
52. Verify: BscScan TX link appears, then Greenfield upload toast (success or info — both OK)
53. **Current Pool State** section updates to new values
54. Try clicking **"Submit Update"** again → button disabled, shows countdown timer (e.g. "2m 30s")
55. Watch countdown tick for a few seconds

## Step 10 — Verify Update on Dashboard
56. Go to **`/`** → Fee and Curve Mode changed to your submitted values

## Step 11 — Audit Trail (`/audit`)
57. Click **"Audit"** in navbar
58. Check Greenfield info banner (bucket name, SP link, Explorer link)
59. If logs exist: click a log entry → expands with Action, Fee, TX link, "Raw JSON" toggle
60. Click **"Raw JSON"** → shows formatted JSON
61. If no logs: verify "📭 No audit logs found yet" empty state
62. Type gibberish in filter → "No logs match your filter"
63. Clear filter

## Step 12 — History (`/history`)
64. Click **"History"** in navbar
65. Verify events load: your swap (💱), liquidity add (💧), remove (🔥), parameter update (⚙️), agent registration (🤖)
66. Click **"💱 Swap"** filter → only swaps shown
67. Click **"🤖 AgentRegistered"** filter → only registration events
68. Click **"All"** → all events
69. Click any **"TX ↗"** link → opens correct TX on BscScan
70. Change block range to **"Last 10K blocks"** → more events may load

## Step 13 — Demo Panel (`/demo`)
71. Click **"Demo"** in navbar
72. Check pool state card (Fee, Beta, Mode, Trades, Epochs Run)
73. Check bar chart + radar chart render
74. Click **"⚡ Run Demo Epoch"** → watch log output
75. Check result in log (live TX or read-only state)

## Step 14 — Mobile Responsive
76. Resize browser to phone width (< 768px)
77. Hamburger ☰ appears — click it → nav dropdown opens
78. Click any link → navigates, menu closes
79. Resize back to desktop

## Step 15 — Keyboard Shortcuts
80. Press **Cmd+1** → goes to Pool `/`
81. Press **Cmd+3** → goes to Swap `/swap`
82. Press **Cmd+5** → goes to Audit `/audit`
83. On Swap page, press **Cmd+K** → input field focuses

## Step 16 — Onboarding Tour
84. Open DevTools → Application → Local Storage → delete **`evo-tour-completed`**
85. Refresh page → tour tooltip appears after ~1.5s
86. Click **Next** through all 5 steps → click **Done**
87. Refresh → tour does NOT reappear

## Step 17 — Edge Cases
88. On Swap: type **`0`** → swap button disabled
89. On Swap: enter **`999999999`** → swap → TX reverts, "❌ Swap failed" toast
90. Disconnect wallet → swap button shows "Connect wallet in navbar"
91. Reconnect wallet → refresh page → auto-reconnects without clicking

## Step 18 — Light Mode Full Check
92. Switch to light mode
93. Visit `/settings` → all inputs, dropdowns, stat values readable (no white-on-white)
94. Visit `/swap` → all text visible
95. Switch back to dark mode

## Step 19 — BscScan Contract Verification
96. Open https://testnet.bscscan.com/address/0xAe6A9CaF9739C661e593979386580d3d14abB502#code → ✅ verified
97. Open https://testnet.bscscan.com/address/0x36Fda9F9F17ea5c07C0CDE540B220fC0697bBcE3#code → ✅ verified
98. Open https://testnet.bscscan.com/address/0x163f03E4633B86fBB5C82c6e6a6aCbD1452bEe7c#code → ✅ verified
99. Open https://testnet.bscscan.com/address/0xab07a553a7237c39fBbf74b7FcC003013D0618D3#code → ✅ verified

## Step 20 — Hardhat Tests
100. Run in terminal: `cd /Users/bond/EvoArena && npx hardhat test`
101. Verify: **152 tests passing**, 0 failures

---

**Done! If any step fails, note the step number and what happened.**
