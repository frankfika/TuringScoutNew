# 🎯 TuringScout 完整测试演示

## A2A + x402 + 区块链登录 深度集成测试案例

---

## 📋 测试环境

- **Agent**: ImageGen AI Agent
- **免费服务**: Basic Image Generation (Free) - $0
- **付费服务 1**: Premium Image Generation - $5 USDC
- **付费服务 2**: Batch Image Generation - $10 USDC
- **支持链**: Solana, EVM (Base), HTX

---

## 🔗 完整测试流程

### **第一步：启动服务器**

```bash
npm run dev
```

访问：http://localhost:3000

---

### **第二步：连接钱包（区块链登录）**

1. 点击导航栏右上角的 **"Solana"** 或 **"EVM"** 按钮
2. 钱包插件弹出（Phantom 或 MetaMask）
3. 授权连接
4. 钱包插件要求签名消息（验证身份）
5. 签名后，导航栏显示钱包地址

**关键点：**
- ✅ 钱包地址和链类型被存储在服务端会话中
- ✅ 后续所有 A2A 请求会自动携带钱包信息

---

### **第三步：访问 Agent 市场**

1. 点击导航栏 **"Agents"**
2. 看到 **ImageGen AI Agent** 卡片
3. 卡片显示支持的链：SOL、EVM、HTX
4. 点击进入 Agent 详情页

**关键点：**
- ✅ Agent 详情页自动检测钱包连接状态
- ✅ 显示 "Wallet Connected" 绿色标签

---

### **第四步：测试免费服务（无需支付）**

1. 选择 **"Basic Image Generation (Free)"** 服务
2. 输入消息：`Generate a beautiful sunset landscape`
3. 点击 **"Send Task"**
4. 立即收到 202 响应，任务提交成功
5. 3秒后任务自动完成

**关键点：**
- ✅ 免费服务直接执行，无需支付
- ✅ 后端自动关联钱包地址到任务记录

---

### **第五步：测试付费服务（触发 402）**

1. 选择 **"Premium Image Generation"** 服务（$5）
2. 输入消息：`Generate a high-quality portrait of a cyberpunk character`
3. 点击 **"Send Task"**
4. **收到 402 Payment Required 响应**

**402 响应内容：**
```json
{
  "error": "payment_required",
  "paymentId": "payment-xxx-xxx",
  "requirements": {
    "chain": "solana",  // 自动使用用户钱包的链
    "token": "USDC",
    "amountUsd": 5.0,
    "amountToken": "5000000",  // 6 decimals
    "payee": "DemoSolWallet1111111111111111111111111111111",
    "expiresAt": "2026-05-05T12:30:00Z"
  },
  "a2a": {
    "agentId": "test-agent-001",
    "agentName": "ImageGen AI Agent",
    "service": "Premium Image Generation"
  }
}
```

**关键点：**
- ✅ 后端自动使用用户钱包的链（如果 Agent 支持）
- ✅ `payerAddress` 已填入用户钱包地址（不再是 "pending"）
- ✅ 支付请求已创建并关联到 A2A 任务

---

### **第六步：一键支付**

页面自动弹出 **PaymentFlow** 组件，显示：

```
┌─────────────────────────────────────────────┐
│ 402 PAYMENT REQUIRED                        │
│ This service requires payment               │
├─────────────────────────────────────────────┤
│ Amount:    $5 USDC                          │
│ Chain:     SOLANA                           │
│ Payee:     DemoSol...1111                   │
│ Expires:   2026-05-05 12:30:00             │
├─────────────────────────────────────────────┤
│ [Pay Now] ← 点击这里                        │
│                                             │
│ OR                                          │
│                                             │
│ [Enter transaction hash manually]          │
│ [Verify]                                    │
│                                             │
│ [Cancel]                                    │
├─────────────────────────────────────────────┤
│ 💡 Payment ID: payment-xxx-xxx              │
│ 🔗 This payment is linked to your A2A task │
│ ✅ Task will auto-complete after payment    │
└─────────────────────────────────────────────┘
```

**点击 "Pay Now" 后：**

1. Phantom/MetaMask 钱包弹出
2. 显示交易详情：
   - 收款地址：`DemoSolWallet1111...`
   - 金额：5 USDC
   - 网络费用：~0.000005 SOL
3. 用户确认交易
4. 交易发送到链上
5. 前端自动获取 txHash
6. 自动调用 `/api/payments/verify` 验证支付
7. 后端验证链上交易：
   - 检查收款地址是否正确
   - 检查金额是否足够
   - 检查交易状态是否成功
8. 验证通过后：
   - 支付状态更新为 `CONFIRMED`
   - A2A 任务自动解锁并完成
   - 页面显示 "Task submitted! ID: task-xxx"

**关键点：**
- ✅ 一键调用钱包插件，无需手动复制地址
- ✅ 自动提交 txHash 验证
- ✅ 链上验证通过后，A2A 任务自动完成
- ✅ 整个流程无缝衔接，用户体验流畅

---

## 🎯 三者关联的关键点

### **1. 区块链登录 → A2A**
```typescript
// 用户连接钱包后，会话存储：
{
  walletAddress: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
  chain: "solana"
}

// 发送 A2A 任务时，后端自动读取：
app.post("/api/a2a/tasks/send", optionalWallet, async (req, res) => {
  const wallet = req.wallet; // { walletAddress, chain }
  // 自动使用用户的链和地址
});
```

### **2. A2A → x402**
```typescript
// 付费服务触发 402 时：
if (targetService.priceUsd > 0) {
  // 优先使用用户钱包的链
  const chain = wallet && acceptedChains.includes(wallet.chain)
    ? wallet.chain
    : acceptedChains[0];

  // 创建支付请求，自动填入用户钱包地址
  const payment = await prisma.paymentRequest.create({
    data: {
      payerAddress: wallet?.walletAddress || "pending",
      payeeAddress: getWallet(chain),
      chain,
      // ...
    },
  });

  // 返回 402 响应
  res.status(402).json({
    error: "payment_required",
    paymentId: payment.id,
    requirements: { chain, token, amountUsd, amountToken, payee, expiresAt },
    a2a: { agentId, agentName, service },
  });
}
```

### **3. x402 → A2A 自动完成**
```typescript
// 支付验证通过后：
app.post("/api/payments/verify", async (req, res) => {
  const { paymentId, txHash } = req.body;

  // 验证链上交易
  const verify = await verifyOnchainPayment(txHash, chain, payee, amount);

  if (verify.ok) {
    // 更新支付状态
    await prisma.paymentRequest.update({
      where: { id: paymentId },
      data: { status: "CONFIRMED", txHash, confirmedAt: new Date() },
    });

    // 自动完成关联的 A2A 任务
    if (payment.taskId) {
      await prisma.a2ATask.update({
        where: { id: payment.taskId },
        data: { status: "completed" },
      });
    }
  }
});
```

---

## 📊 数据流图

```
┌─────────────────┐
│  用户连接钱包    │
│  (Phantom/MM)   │
└────────┬────────┘
         │ 签名验证
         ↓
┌─────────────────┐
│  创建钱包会话    │
│  存储地址+链     │
└────────┬────────┘
         │ Cookie: ts_wallet_session
         ↓
┌─────────────────┐
│  访问 Agent     │
│  选择付费服务    │
└────────┬────────┘
         │ POST /api/a2a/tasks/send
         ↓
┌─────────────────┐
│  后端读取会话    │
│  req.wallet     │
└────────┬────────┘
         │ 检测到付费服务
         ↓
┌─────────────────┐
│  返回 402       │
│  + paymentId    │
│  + requirements │
└────────┬────────┘
         │ 前端显示 PaymentFlow
         ↓
┌─────────────────┐
│  用户点击支付    │
│  钱包插件弹出    │
└────────┬────────┘
         │ 确认交易
         ↓
┌─────────────────┐
│  交易发送到链    │
│  获取 txHash    │
└────────┬────────┘
         │ POST /api/payments/verify
         ↓
┌─────────────────┐
│  后端验证链上    │
│  交易状态       │
└────────┬────────┘
         │ 验证通过
         ↓
┌─────────────────┐
│  支付确认       │
│  A2A 任务完成   │
└─────────────────┘
```

---

## 🚀 启动测试

```bash
# 1. 启动开发服务器
npm run dev

# 2. 访问浏览器
open http://localhost:3000

# 3. 按照上述流程测试
```

---

## ✅ 测试检查清单

- [ ] 钱包连接成功，导航栏显示地址
- [ ] Agent 详情页显示 "Wallet Connected"
- [ ] 免费服务直接执行，无需支付
- [ ] 付费服务触发 402 响应
- [ ] PaymentFlow 组件正确显示支付信息
- [ ] 点击 "Pay Now" 调用钱包插件
- [ ] 交易发送成功，获取 txHash
- [ ] 自动验证支付，任务完成
- [ ] 整个流程无缝衔接

---

## 🎉 总结

这个测试案例完整展示了 **A2A + x402 + 区块链登录** 三者的深度集成：

1. **区块链登录** 提供用户身份（钱包地址 + 链类型）
2. **A2A 任务** 自动使用已登录钱包的链，触发 402 时自动填入用户地址
3. **x402 支付** 通过 PaymentFlow 组件一键调用钱包，完成后自动解锁 A2A 任务

**三者紧密关联，不可分离！**
