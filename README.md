# Conceal Web Wallet
This web wallet is doing everything client-side to give the best privacy to users.
The server is currently only used to optimize the communication with the daemon and compress the blockchain.  

Note: This requirement may be removed in the future once daemons evolve and return enough data.  

# Security
**No keys, seeds, or sensitive data is sent to the server**  
If you find a potential security issue, please contact me so we/I can patch it as soon as possible.  
Encryption is done with a certified library, [Tweetnacl.Js.](https://github.com/dchest/tweetnacl-js)

# Features (non-exhaustive)
- Complete wallet sync without server side processing for security
- Receive/send history
- Mempool support to check incoming transfers
- Send coins - including QR code scanning and subaddress support
- Receive page to generate a custom QR code
- Import from private keys, mnemonic seed, or json file (exported by the wallet)
- Export private keys, mnemonic phrase, or json file (which include all the history)
- View only wallet
- Basic network stats

# Contributors and thanks
Developers:
- [gnock](https://github.com/gnock) (main)
- [cryptochangements](https://github.com/cryptochangements34)
- [DaveLong](https://github.com/DaveLong) (initial adaptation of PHP Api for Bytecoin based coins)
- [Aiwe](https://github.com/aivve) (adapted for Bytecoin/CryptoNote from Monero codebase)

# Translations:
- Chinese: [mainframer](https://github.com/mainframer), [Alex Nnian](https://github.com/nnian)
- English: too many people
- French: [gnock](https://github.com/gnock)
- German: [F0sching](https://github.com/F0sching)
- Greek: [GeraltOfTrivia](https://github.com/GeraltOfTrivia)
- Hungarian: [Gelesztaa](https://github.com/Gelesztaa)
- Italian: [Ph27182](https://github.com/Ph27182)
- Japanese: [Alex Nnian](https://github.com/nnian)
- Korean: [Xecute0101](https://github.com/Xecute0101)
- Persian: [Mahdi](https://github.com/m4hdi1995)
- Polish [ArqTras](https://github.com/ArqTras)
- Russian: [Aiwe](https://github.com/aivve)
- Serbian cyrillic: girugameshh
- Spanish: [Helg18](https://github.com/Helg18), [Guerreru](https://github.com/Guerreru)
- Ukrainian: [Aiwe](https://github.com/aivve)

# Contributing
- You can help Karbo by translation the wallet in your native language, it's really easy!  
Read [the translations guide](TRANSLATIONS.md) to get instructions on how to do that
- Report bugs & ideas to help us improve the web wallet by opening an issue 
- [Make a donation to Karbo](https://wallet.karbo.org/#!donate)

# Forks / Other Coins
We have been receiving multiple coin developers help to fork it. As the time required to develop this project is heavy, please consider giving a mention to this project if you fork it.

The code is readable, it should be enough for you to use it.


