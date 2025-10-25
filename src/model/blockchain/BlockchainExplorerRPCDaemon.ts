/*
 * Copyright (c) 2018 Gnock
 * Copyright (c) 2018-2019 The Masari Project
 * Copyright (c) 2018-2020 The Karbo developers
 * Copyright (c) 2018-2025 Conceal Community, Conceal.Network & Conceal Devs
 *
 * Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
 *
 * 3. Neither the name of the copyright holder nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import {BlockchainExplorer, NetworkInfo, RawDaemon_Transaction, RawDaemon_Out, RemoteNodeInformation} from "./BlockchainExplorer";
import {Wallet} from "../Wallet";
import {Storage} from "../Storage";
import {MathUtil} from "../MathUtil";
import {CnTransactions, CnUtils} from "../Cn";
import {Transaction} from "../Transaction";
import {WalletWatchdog} from "../WalletWatchdog";

export type NodeInfo = {
  "url": string,
  "requests": number,
  "errors": number,
  "allErrors": number,
  "status": number
}

class NodeWorker {
  readonly timeout= 10 * 1000;
  readonly maxTempErrors = 3;
  readonly maxAllErrors = 100;
  private _url: string;
  private _errors: number;
  private _allErrors: number;
  private _requests: number;
  private _isWorking: boolean;
  private errorInterval: NodeJS.Timer;

  constructor(url: string) {
    this._url = url;
    this._errors = 0;
    this._allErrors = 0;
    this._requests = 0;
    this._isWorking = false;

    // reduce error count each minute
    this.errorInterval = setInterval(() => {
      this._errors = Math.max(this._errors - 1, 0);
    }, 60 * 1000);
  }

  makeRequest = (
    method: "GET" | "POST",
    path: string,
    body: any = undefined
  ): Promise<any> => {
    this._isWorking = true;
    ++this._requests;

    return new Promise<any>(async (resolve, reject) => {
      try {
        const url = this._url + path;
        const requestBody =
          typeof body === "string" ? body : JSON.stringify(body);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        const response = await fetch(url, {
          method: method,
          headers: {
            "Content-Type": "application/json",
          },
          body: method === "POST" ? requestBody : undefined,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        this._isWorking = false;

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        resolve(data);
      } catch (error: any) {
        this._isWorking = false;
        this.increaseErrors();

        if (error.name === "AbortError") {
          console.error(
            `Node ${this._url} makeRequest timeout after ${this.timeout}ms (errors: ${this._errors + 1})`
          );
          reject(new Error("Request timeout"));
        } else {
          console.error(
            `Node ${this._url} makeRequest failed: %s (errors: ${this._errors + 1})`,
            error.message
          );
          reject(error);
        }
      }
    });
  };

  makeRpcRequest = (method: string, params: any = {}): Promise<any> => {
    this._isWorking = true;
    ++this._requests;

    return new Promise<any>(async (resolve, reject) => {
      try {
        const url = this._url + "json_rpc";
        const requestBody = JSON.stringify({
          jsonrpc: "2.0",
          method: method,
          params: params,
          id: 0,
        });

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: requestBody,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        this._isWorking = false;

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const raw = await response.json();

        // Validate RPC response format
        if (
          typeof raw.id === "undefined" ||
          typeof raw.jsonrpc === "undefined" ||
          raw.jsonrpc !== "2.0" ||
          typeof raw.result !== "object"
        ) {
          this.increaseErrors();
          reject(new Error("Daemon response is not properly formatted"));
        } else {
          resolve(raw.result);
        }
      } catch (error: any) {
        this._isWorking = false;
        this.increaseErrors();

        if (error.name === "AbortError") {
          console.error(
            `Node ${this._url} makeRpcRequest timeout after ${this.timeout}ms (errors: ${this._errors + 1})`
          );
          reject(new Error("Request timeout"));
        } else {
          console.error(
            `Node ${this._url} makeRpcRequest failed: %s (errors: ${this._errors + 1})`,
            error.message
          );
          reject(error);
        }
      }
    });
  };

  get isWorking(): boolean {
    return this._isWorking;
  }

  get url(): string {
    return this._url;
  }

  get errors(): number {
    return this._errors;
  }

  get allErrors(): number {
    return this._allErrors;
  }

  get requests(): number {
    return this._requests;
  }

  increaseErrors = () => {
    ++this._errors;  
    ++this._allErrors;
  }

  hasToManyErrors = () => {
    return ((this._errors >= this.maxTempErrors) || (this._allErrors >= this.maxAllErrors));
  }

  getStatus = (): number => {
    if ((this._errors < this.maxTempErrors) && (this._allErrors < this.maxAllErrors)) {
      return 0;
    } else if ((this._errors >= this.maxTempErrors) && (this._allErrors < this.maxAllErrors)) {
      return 1;
    } else if (this._allErrors >= this.maxAllErrors) {
      return 2;
    } else {
      return 3;
    }
  }
}

class NodeWorkersList {
  private nodes: NodeWorker[];
  private sessionNode: NodeWorker | null = null;
  private sessionStartTime: number = 0;
  private readonly sessionDuration = 30 * 60 * 1000; // 30 minutes
  private readonly maxSessionErrors = 3;
  private sessionErrorCount: number = 0;
  private usedNodeUrls: Set<string> = new Set(); // Track used nodes to avoid re-picking

  constructor() {
    this.nodes = [];
  }

  initializeSession(): void {
    // Pick a random node for the session
    this.sessionNode = this.pickRandomNode();
    this.sessionStartTime = Date.now();
    this.sessionErrorCount = 0;
    if (this.sessionNode) {
      this.usedNodeUrls.add(this.sessionNode.url);
    }
  }

  cleanupSession(): void {
    // Clean up the session when wallet closes
    this.sessionNode = null;
    this.sessionStartTime = 0;
    this.sessionErrorCount = 0;
    this.usedNodeUrls.clear(); // Clear used nodes to allow fresh random selection
  }

  private isSessionExpired(): boolean {
    return (Date.now() - this.sessionStartTime) > this.sessionDuration;
  }

  private pickRandomNode(): NodeWorker | null {
    let availableNodes = this.nodes.filter(node => 
      !node.hasToManyErrors() && !this.usedNodeUrls.has(node.url)
    );

    if (availableNodes.length === 0) {
      // If all nodes have been used, reset and try again
      this.usedNodeUrls.clear();
      availableNodes = this.nodes.filter(node => !node.hasToManyErrors());
      
      if (availableNodes.length === 0) {
        // Last resort: try any node, even if it has errors
        availableNodes = this.nodes;
        if (availableNodes.length === 0) {
          console.error(`pickRandomNode: No nodes at all!`);
          return null; // No nodes at all
        }
        
        // Filter out nodes with excessive errors even in last resort
        const lastResortNodes = availableNodes.filter(node => node.allErrors < node.maxAllErrors);
        if (lastResortNodes.length > 0) {
          availableNodes = lastResortNodes;
        }
      }
    }
    
    // Shuffle the available nodes for better randomization
    const shuffledNodes = [...availableNodes].sort(() => Math.random() - 0.5);
    const selectedNode = shuffledNodes[0];
    if (selectedNode) {
      this.usedNodeUrls.add(selectedNode.url);
    } else {
      console.error(`pickRandomNode: No node selected from ${availableNodes.length} available nodes`);
    }
    return selectedNode;
  }

  private getSessionNode(): NodeWorker | null {
    if (!this.sessionNode || this.isSessionExpired() || this.sessionErrorCount >= this.maxSessionErrors) {
      // Need to pick a new node
      this.sessionNode = this.pickRandomNode();
      this.sessionStartTime = Date.now();
      this.sessionErrorCount = 0;
      if (this.sessionNode) {
        console.log(`New session node selected: ${this.sessionNode.url}`);
      } else {
        console.log('No available nodes found');
      }
    }
    return this.sessionNode;
  }

  // Get the current session node's fee address
  getSessionNodeFeeAddress(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      // Use the session failover system instead of direct node calls
      this.executeWithSessionFailover(async (sessionNode) => {
        try {
          const response = await sessionNode.makeRequest('GET', 'feeaddress');
          if (response.status !== 'OK') {
            throw new Error('Invalid fee address response');
          }
          return response.fee_address || '';
        } catch (error) {
          console.warn(`Fee address endpoint failed for node ${sessionNode.url}:`, error);
          // If feeaddress endpoint fails, try getinfo as fallback
          try {
            const info = await sessionNode.makeRequest('GET', 'getinfo');
            return info.fee_address || '';
          } catch (fallbackError) {
            console.warn(`Getinfo fallback also failed for node ${sessionNode.url}:`, fallbackError);
            // If both fail, return empty string (will use donation address)
            return '';
          }
        }
      }).then(resolve).catch(reject);
    });
  }

  makeRequest = (method: 'GET' | 'POST', path: string, body: any = undefined): Promise<any> => {
    return this.executeWithSessionFailover((node) => node.makeRequest(method, path, body));
  }

  private executeWithSessionFailover = async <T>(operation: (node: NodeWorker) => Promise<T>): Promise<T> => {
    let lastError: any;
    
    for (let attempts = 0; attempts < 3; attempts++) {
      try {
        const sessionNode = this.getSessionNode();
        if (!sessionNode) {
          throw new Error('No available nodes');
        }
        return await operation(sessionNode);
      } catch (error) {
        lastError = error;
        this.sessionErrorCount++;
        
        // If we've reached max session errors, reset the session to pick a new node
        if (this.sessionErrorCount >= this.maxSessionErrors) {
          this.sessionNode = null;
          this.sessionErrorCount = 0;
          
          // Only clear used nodes if we've used most of the available nodes
          // This prevents immediately re-selecting the same failed node
          if (this.usedNodeUrls.size >= Math.max(1, this.nodes.length - 1)) {
            this.usedNodeUrls.clear();
          } else {
            console.log(`Keeping used nodes list (${this.usedNodeUrls.size}/${this.nodes.length} used)`);
          }
        }
      }
    }
    
    throw lastError;
  }

  makeRpcRequest = (method: string, params: any = {}): Promise<any> => {
    return this.executeWithSessionFailover((node) => node.makeRpcRequest(method, params));
  }

  getNodes = () => {
    return this.nodes;      
  }

  start = (nodes: string[]) => {
    console.log(`NodeWorkersList.start: Initializing ${nodes.length} nodes`);
    for (let i = 0; i < nodes.length; i++) {
      this.nodes.push(new NodeWorker(nodes[i]));      
    }
    // Initialize session when nodes are available
    this.initializeSession();
  }

  stop = () => {
    this.nodes = [];
  }
}

export type DaemonResponseGetInfo = {
  "already_generated_coins": number,
  "block_major_version": number,
  "contact": string,
  "cumulative_difficulty": number,
  "difficulty": number,
  "fee_address": string,
  "grey_peerlist_size": number,
  "height": number,
  "height_without_bootstrap": number,
  "is_synchronized": boolean,
  "incoming_connections_count": number,
  "outgoing_connections_count": number,
  "last_known_block_index": number,
  "min_fee": number,
  "next_reward": number,
  "rpc_connections_count": number,
  "start_time": number,
  "status": "OK" | string,
  "target": number,
  "top_block_hash": string,
  "transactions_count": number,
  "transactions_pool_size": number,
  "white_peerlist_size": number
}

export type DaemonResponseGetNodeFeeInfo = {
  fee_address: string,
  fee_amount: number,
  status: "OK" | string
}

export class BlockchainExplorerRpcDaemon implements BlockchainExplorer {
  private nodeWorkers: NodeWorkersList;
  private initialized: boolean = false;
  private lastTimeRetrieveHeight = 0;
  private lastTimeRetrieveInfo = 0;
  private scannedHeight: number = 0;
  private cacheHeight: number = 0;  
  private cacheInfo: any = null;


  constructor() {
    console.log('BlockchainExplorerRpcDaemon');
    this.nodeWorkers = new NodeWorkersList();
  }

  getInfo = (): Promise<DaemonResponseGetInfo> => {
    if (((Date.now() - this.lastTimeRetrieveInfo) < 20 * 1000) && (this.cacheInfo !== null)) {
      return Promise.resolve(this.cacheInfo);
    }

    this.lastTimeRetrieveInfo = Date.now();
    return this.nodeWorkers.makeRequest('GET', 'getinfo').then((data: DaemonResponseGetInfo) => {
      this.cacheInfo = data;
      return data;
    });
  }

  getHeight = (): Promise<number> => {
    if (((Date.now() - this.lastTimeRetrieveHeight) < 20 * 1000) && (this.cacheHeight !== 0)) {
      return Promise.resolve(this.cacheHeight);
    }

    this.lastTimeRetrieveHeight = Date.now();
    return this.nodeWorkers.makeRequest('GET', 'getheight').then((data: any) => {
      let height = parseInt(data.height);
      this.cacheHeight = height;
      return height;
    });
  }

  getScannedHeight = (): number => {
    return this.scannedHeight;
  }

  resetNodes = (): Promise<void> => {
    return Storage.getItem('customNodeUrl', null).then(customNodeUrl => {
      // Clean up current session before changing nodes
      this.nodeWorkers.cleanupSession();
      this.nodeWorkers.stop();

      function shuffle(array: any) {
        let currentIndex = array.length;
      
        // While there remain elements to shuffle...
        while (currentIndex != 0) {
      
          // Pick a remaining element...
          let randomIndex = Math.floor(Math.random() * currentIndex);
          currentIndex--;
      
          // And swap it with the current element.
          [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
        }
      }    
      
      // Ensure we have nodes to work with
      if (!config || !config.nodeList || config.nodeList.length === 0) {
        throw new Error('No nodes available in configuration');
      }
      
      if (customNodeUrl) {
        this.nodeWorkers.start([customNodeUrl]);
      } else {
        // Shuffle the node list for random selection
        shuffle(config.nodeList);
        this.nodeWorkers.start(config.nodeList);
      }
      
      // Note: initializeSession() is already called in NodeWorkersList.start()     
      // Verify that nodes are actually available before proceeding
      if (this.nodeWorkers.getNodes().length === 0) {
        throw new Error('Failed to initialize nodes');
      }
    }).catch(err => {
      console.error("resetNodes failed", err);
      throw err;
    });
  }
  
  isInitialized = (): boolean => {
    return this.initialized;
  }

  initialize = async (): Promise<boolean> => {     
    const doesMatch = (toCheck: string) => {
      return (element: string) => {
          return element.toLowerCase() === toCheck.toLowerCase();
      }
    }


    if (this.initialized) {
      return true;
    }

    try {
      if (config.publicNodes) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10 * 1000);

          const response = await fetch(config.publicNodes + "/list?hasSSL=true", {
            method: "GET",
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const result = await response.json();

          if (result.success && result.list.length > 0) {
            for (let i = 0; i < result.list.length; ++i) {
              let finalUrl = "https://" + result.list[i].url.host + "/";
  
              if (config.nodeList.findIndex(doesMatch(finalUrl)) == -1) {
                config.nodeList.push(finalUrl);
              }
            }
          }
        } catch (error) {
          console.warn('Failed to fetch public nodes, using config nodes only:', error);
        }
      }
      
      this.initialized = true;
      
      // Wait for resetNodes to complete before returning
      await this.resetNodes();
      
      // Double-check that nodes are ready
      if (this.nodeWorkers.getNodes().length === 0) {
        throw new Error('Node initialization failed - no nodes available');
      }
      
      console.log(`Initialized with ${this.nodeWorkers.getNodes().length} nodes`);
      return true;
      
    } catch (error) {
      console.error('Node initialization failed:', error);
      throw error;
    }
  }

  start = (wallet: Wallet): WalletWatchdog => {
    let watchdog = new WalletWatchdog(wallet, this);
    watchdog.start();
    return watchdog;    
  }

  /**
   * Returns an array containing all numbers like [start;end]
   * @param start
   * @param end
   */
  range(start: number, end: number) {
      let numbers: number[] = [];
      for (let i = start; i <= end; ++i) {
          numbers.push(i);
      }

      return numbers;
  }

  getTransactionsForBlocks(startBlock: number, endBlock: number, includeMinerTxs: boolean): Promise<RawDaemon_Transaction[]> {
    let tempStartBlock: number;
    if (startBlock === 0) {
      tempStartBlock = 1;
    } else {
      tempStartBlock = startBlock;
    }

    return this.nodeWorkers.makeRequest('POST', 'get_raw_transactions_by_heights', {
      heights: [tempStartBlock, endBlock],
      include_miner_txs: includeMinerTxs,
      range: true
    }).then((response: {
      status: 'OK' | 'string',
      transactions: { transaction: any, timestamp: number, output_indexes: number[], height: number, block_hash: string, hash: string, fee: number }[]
    }) => {
      let formatted: RawDaemon_Transaction[] = [];

      if (response.status !== 'OK') {
        throw 'invalid_transaction_answer';
      }

      if (response.transactions.length > 0) {
        for (let rawTx of response.transactions) {
          let tx: RawDaemon_Transaction | null = null;

          if (rawTx && rawTx.transaction) {
            tx = rawTx.transaction;

            if (tx !== null) {
              tx.ts = rawTx.timestamp;
              tx.height = rawTx.height;
              tx.hash = rawTx.hash;
              tx.fee = rawTx.fee;
              if (rawTx.output_indexes.length > 0)
                tx.global_index_start = rawTx.output_indexes[0];
              tx.output_indexes = rawTx.output_indexes;
              formatted.push(tx);
            }
          }
        }
      }

      return formatted;
    });
  }

  getTransactionPool(): Promise<RawDaemon_Transaction[]> {
    return this.nodeWorkers.makeRequest('GET', 'getrawtransactionspool').then(
      (response: {
        status: 'OK' | 'string',
        transactions: { transaction: any, timestamp: number, output_indexes: number[], height: number, block_hash: string, hash: string, fee: number }[]
      }) => {
        let formatted: RawDaemon_Transaction[] = [];

        for (let rawTx of response.transactions) {
          let tx: RawDaemon_Transaction | null = null;

          if (rawTx && rawTx.transaction) {
            tx = rawTx.transaction;

            if (tx !== null) {
              tx.ts = rawTx.timestamp;
              tx.height = rawTx.height;
              tx.hash = rawTx.hash;
              if (rawTx.output_indexes.length > 0) {
                tx.global_index_start = rawTx.output_indexes[0];
                tx.output_indexes = rawTx.output_indexes;
              }
              formatted.push(tx);
            }
          }
        }

        return formatted;
    });
  }

  getRandomOuts(amounts: number[], nbOutsNeeded: number): Promise<RawDaemon_Out[]> {
    return this.nodeWorkers.makeRequest('POST', 'getrandom_outs', {
      amounts: amounts,
      outs_count: nbOutsNeeded
    }).then((response: {
      status: 'OK' | 'string',
      outs: { global_index: number, public_key: string }[]
    }) => {
      if (response.status !== 'OK') throw 'invalid_getrandom_outs_answer';
      // if (response.outs.length > 0) {
      //   logDebugMsg(response.outs);
      // }

      return response.outs;
    });
  }

  sendRawTx(rawTx: string) {
    return this.nodeWorkers.makeRequest('POST', 'sendrawtransaction', {
      tx_as_hex: rawTx,
      do_not_relay: false
    }).then((transactions: any) => {
      if (!transactions.status || transactions.status !== 'OK') {
        // Create a meaningful error message from the status
        let errorMessage = 'Failed to send raw transaction';
        
        if (transactions.status) {
          errorMessage += `: ${transactions.status}`;
        }
        
        // Create and throw a proper Error object
        const error = new Error(errorMessage);
        // Attach the original response for debugging if needed
        (error as any).originalResponse = transactions;
        throw error;
      }
      
      return transactions;
    });
  }

  resolveOpenAlias(domain: string): Promise<{ address: string, name: string | null }> {
      return this.nodeWorkers.makeRpcRequest('resolve_open_alias', {url: domain}).then(function (response: {
        addresses?: string[],
        status: 'OK' | string
      }) {
        if (response.addresses && response.addresses.length > 0)
          return {address: response.addresses[0], name: null};
        throw 'not_found';
      });
  }

  getNetworkInfo(): Promise<any> {
      return this.nodeWorkers.makeRpcRequest('getlastblockheader').then((raw: any) => {
        let nodeList: NodeWorker[] = this.nodeWorkers.getNodes();
        let usedNodes: NodeInfo[] = [];

        for (let i = 0; i < nodeList.length; i++) {
          usedNodes.push({
            'url': nodeList[i].url,
            'requests': nodeList[i].requests,
            'errors': nodeList[i].errors,
            'allErrors': nodeList[i].allErrors,
            'status': nodeList[i].getStatus()
          });
        }

        return {
          'nodes': usedNodes,
          'major_version': raw.block_header['major_version'],
          'hash': raw.block_header['hash'],
          'reward': raw.block_header['reward'],
          'height': raw.block_header['height'],
          'timestamp': raw.block_header['timestamp'],
          'difficulty': raw.block_header['difficulty']
        }
      });
  }

  getRemoteNodeInformation(): Promise<RemoteNodeInformation> {
    // TODO change to /feeaddress
    return this.getInfo().then((info: DaemonResponseGetInfo) => {
      return {
        'fee_address': info['fee_address'],
        'status': info['status']
      }
    });
  }

  // Session management methods
  initializeSession(): void {
    // Initialize the node session when wallet opens
    this.nodeWorkers.initializeSession();
  }

  cleanupSession(): void {
    // Clean up the node session when wallet closes
    this.nodeWorkers.cleanupSession();
  }

  // Get the current session node's fee address
  getSessionNodeFeeAddress(): Promise<string> {
    return this.nodeWorkers.getSessionNodeFeeAddress();
  }
}

