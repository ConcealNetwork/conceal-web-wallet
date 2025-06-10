# Conceal Web Wallet User Guide

## Table of Contents
1. [Getting Started](#getting-started)
2. [Wallet Import Methods](#wallet-import-methods)
3. [Wallet Features](#wallet-features)
4. [FAQ](#faq)

## Getting Started

The Conceal Web Wallet is a secure, browser-based wallet for managing your Conceal (CCX) cryptocurrency. This guide will help you understand all the features and how to use them effectively.

## Wallet Import Methods

There are four ways to import your wallet:

1. **Private Key Import** 🔑
   - Enter your private spend and view keys
   - Set a new password for the wallet
   - Optionally specify a creation height (synchronizing will be reduce accordingly)

2. **QR Code Import** 📱
   - Scan a QR code containing your wallet information
   - This can be from a paper wallet or another device
   - Set a new password for the wallet

3. **File Import** 📁
   - Import an encrypted wallet file (.json)
   - Enter the password associated with the file
   - The wallet will be loaded into your browser

4. **Mnemonic Import** 📝
   - Enter your mnemonic seed phrase
   - Set a new password for the wallet
   - The wallet will be reconstructed from the seed

## Wallet Features

### Account Page 📊
- View all your transactions in chronological order
- Click the 🔍 (magnifying glass) icon to see transaction details
- Look for the ✉️ (envelope) icon to identify transactions with messages
- See your current balance and transaction history
- Monitor pending transactions in the mempool

### Send Page 💸
- Send CCX to any Conceal address
- Input methods:
  - Manual address entry or paste
  - QR code scanning
- Optional features:
  - Payment ID
  - Transaction message

### Receive Page 📥
- Get your public address for receiving funds
- Copy address to clipboard
- Generate QR codes:
  - Basic address QR
  - Custom amount QR for easy mobile payments

### Messages Page 💬
- View received messages
- Send new messages

### Deposit Page 🏦
- View all your deposits
- Create new deposits:
  - Select amount
  - Choose term length
  - Confirm interest rate
- Withdraw from unlocked deposits
- Monitor deposit status:
  - Locked
  - Unlocked
  - Pending withdrawal

### Export Page 📤
Multiple export options:
1. **PDF Export** 📄
   - Generates QR codes for easy import
   - Includes public and private keys
   - Printable paper wallet format

2. **Private Key Export** 🔐
   - Export spend and view keys
   - Secure storage recommended

3. **Mnemonic Export** 📝
   - Generate a seed phrase
   - Backup for wallet recovery

4. **Encrypted File Export** 📁
   - Save encrypted wallet file
   - Use for backup or wallet switching

### Settings Page ⚙️
- **Language Selection** 🌍
  - Choose your preferred interface language

- **Ticker Settings** 💱
  - Toggle between full/short ticker

- **Optimization** ��
  - Run optimization

- **Node Configuration** 🌐
  - Select custom node
  - Set node URL

- **Wallet Management** 🔧
  - Change password
  - Reset and rescan (needed if web wallet version changed)
  - Delete local wallet
  - Set scan height

### Donate Page 💝
- Support the project
- View donation addresses

### Network Status 📡
- View current network status
- Check node connection
- Monitor blockchain height

### Disconnect 🔌
- Clean exit
  - halt background progress
  - ensure no sensitive data remains in memory 
- Return to login screen

## FAQ

### Login System
**Q: Why is there no username? Should I use my wallet address?**  
A: The Conceal Web Wallet operates entirely client-side in a serverless environment. This means:
- Your wallet data is stored and encrypted locally in your browser
- There is no server-side login system
- Your wallet address is not used as a username
- The password is used solely to decrypt your local wallet data
- This architecture provides enhanced privacy and security as your data never leaves your device

⚠️ **Important Warning**: Since your wallet is stored in your browser's local storage, clearing your browser local storage will delete your wallet data. Always ensure you have a backup of your wallet (using the Export feature) before clearing browser data. If you need to clear your browser data, export your wallet first using one of the export methods (PDF, encrypted file, or private keys).

### Multiple Wallets
**Q: Can I switch between multiple wallets?**  
A: Yes! You can manage multiple wallets using the export/import file feature. Remember that the last wallet imported will be the one stored in your browser's local storage.

### Wallet Passwords
**Q: Can I use different passwords for different wallets?**  
A: Yes, and it's recommended for security. However, be cautious with browser password managers as they store passwords based on URLs, not local storage files. This means they might not correctly associate passwords with specific wallets.

### Optimization Issues
**Q: Why doesn't optimization work when the system suggests it?**  
A: While the system may detect that optimization is mathematically possible, the actual optimization process involves random UTXO selection. Sometimes, this selection might not meet the requirements for creating an optimization transaction. This is normal and you can try again later.

### Transaction Failures
**Q: What does a "{status | failed}" message mean?**  
A: This indicates that your transaction was submitted to the network but rejected. Common causes include:
- Some decoy inputs were already spent
- Insufficient funds
- Network congestion

**Solutions:**
1. Try resubmitting the transaction
2. Consider running optimization
3. Wait for network confirmation of pending transactions
4. Check your balance and available funds



### What is the difference between the Web Wallet and the Desktop Wallet?

**Desktop Wallet**
- Can run its own node or connect directly to a node using RPC.
- Stores your wallet data locally on your computer as a `.wallet` file (encrypted or not).
- Offers more advanced features and direct blockchain interaction.

**Web Wallet**
- Runs entirely in your web browser (no installation needed).
- Your wallet data is encrypted and stored locally in your browser, or can be exported as an encrypted `.json` file.
- Connects to Conceal nodes via HTTPS to scan the blockchain and submit transactions.
- Provides a convenient, serverless interface—your private data never leaves your device.
- The web wallet at `https://wallet.conceal.network` acts as an online tool provider, not a data host.

#### Visual Comparison

```
+-------------------+                          +-------------------+
|   Desktop Wallet  | <----------------------> |   Conceal Nodes   |\
|  (.wallet file)   |                          +-------------------+ \
+-------------------+                              |       +-------------------+
                                                   |       |   Conceal Nodes   |
                                                   |       +-------------------+
+-------------------+                    +-------------------+ /        |
|   Web Wallet      | <----------------> |   Conceal Nodes   |/         |
| (in-browser/.json)|                    +-------------------+          |
+-------------------+                                    \ +-------------------+
        ^                                                 \|   Conceal Nodes   |
        |  (uses)                                          +-------------------+
        v
+-------------------------------------------------+
| https://wallet.conceal.network (as a tool box)  |
+-------------------------------------------------+

[No user data is stored on the online tool]
```
### Security Tips
- Always backup your wallet using multiple methods
- Never share your private keys or mnemonic phrase
- Use strong, unique passwords for each wallet
- Regularly export and backup your wallet file
- Keep your browser and system updated
- Consider using a dedicated browser for crypto transactions

### Best Practices
- Regularly check for wallet updates
- Keep your backup methods secure and up to date
- Monitor your deposits and transactions
- Use the optimization feature when suggested
- Keep your node connection stable
- Report any issues to the development team