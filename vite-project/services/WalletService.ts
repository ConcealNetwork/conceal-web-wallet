import { BlockchainExplorerProvider } from '../providers/BlockchainExplorerProvider';
import { Wallet } from '../model/Wallet';
import { WalletWatchdog } from '../model/WalletWatchdog';
import { DependencyInjectorInstance } from '../lib/numbersLab/DependencyInjector';
import { Mnemonic } from '../model/Mnemonic';
import { Cn } from '../model/Cn';
import { KeysRepository } from '../model/KeysRepository';
import { AppState } from '../model/AppState';
import { Constants } from '../model/Constants';

export class WalletService {
  static async importFromMnemonic(
    mnemonic: string,
    password: string,
    height: number = 0
  ): Promise<Wallet | null> {
    try {
      // Get blockchain explorer
      const blockchainExplorer = DependencyInjectorInstance().getInstance(Constants.BLOCKCHAIN_EXPLORER);
      if (!blockchainExplorer) {
        console.error('Blockchain explorer not found');
        return null;
      }

      // Initialize blockchain explorer
      await blockchainExplorer.initialize();

      // Process mnemonic
      const mnemonicTrimmed = mnemonic.trim();
      const currentLang = Mnemonic.detectLang(mnemonicTrimmed) || 'english';
      const mnemonicDecoded = Mnemonic.mn_decode(mnemonicTrimmed, currentLang);
      
      if (!mnemonicDecoded) {
        console.error('Invalid mnemonic');
        return null;
      }
      
      // Create keys from mnemonic
      const keys = Cn.create_address(mnemonicDecoded);
      
      // Create new wallet
      const wallet = new Wallet();
      wallet.keys = KeysRepository.fromPriv(keys.spend.sec, keys.view.sec);
      wallet.lastHeight = height;
      wallet.creationHeight = height;

      // Store password in a global variable or localStorage instead
      localStorage.setItem('walletPassword', password);

      // Or if there's an AppState instance method:
      const appState = DependencyInjectorInstance().getInstance(AppState.name);
      if (appState) {
        appState.walletPassword = password;
      }

      // Register wallet in dependency injector
      DependencyInjectorInstance().register(Wallet.name, wallet, 'default', true);

      // Create and register wallet watchdog
      const walletWatchdog = new WalletWatchdog(wallet, blockchainExplorer);
      DependencyInjectorInstance().register(WalletWatchdog.name, walletWatchdog, 'default', true);

      // Start watching for transactions
      walletWatchdog.start();

      return wallet;
    } catch (error) {
      console.error('Error importing wallet:', error);
      return null;
    }
  }

  static async checkOptimization(wallet: Wallet, blockchainExplorer: BlockchainExplorerProvider) {
    try {
      // Check if wallet has coinbase transactions
      const hasCoinbase = await wallet.hasBeenCoinbase();
      if (hasCoinbase) {
        return { isNeeded: false, numOutputs: 0 };
      }

      // Get blockchain height
      const height = await blockchainExplorer.getHeight();

      // Check transactions for coinbase inputs
      const transactions = wallet.getTransactionsCopy().reverse();
      for (const transaction of transactions) {
        if (transaction.isFullyChecked() && transaction.ins.length > 0) {
          let needDecoyCoinbase = false;
          for (let i = 0; i < transaction.ins.length; ++i) {
            if (transaction.ins[i].amount < 0) {
              needDecoyCoinbase = true;
              break;
            }
          }

          if (needDecoyCoinbase) {
            return { isNeeded: false, numOutputs: 0 };
          }
        }
      }

      // Check number of outputs
      const nbOuts = await wallet.getNbOuts();
      return { 
        isNeeded: nbOuts > config.optimizeThreshold, 
        numOutputs: nbOuts 
      };
    } catch (error) {
      console.error('Error checking optimization:', error);
      return { isNeeded: false, numOutputs: 0 };
    }
  }

  static async optimizeWallet(wallet: Wallet, blockchainExplorer: any, walletWatchdog: WalletWatchdog): Promise<boolean> {
    try {
      const blockchainHeight = await blockchainExplorer.getHeight();
      await wallet.optimize(
        blockchainHeight,
        10, // Threshold
        blockchainExplorer,
        function (amounts: number[], numberOuts: number) {
          return blockchainExplorer.getRandomOuts(amounts, numberOuts);
        }
      );
      
      // Force a mempool check
      walletWatchdog.checkMempool();
      return true;
    } catch (error) {
      console.error('Error optimizing wallet:', error);
      return false;
    }
  }
} 