/*
 * Copyright (c) 2018 Gnock
 * Copyright (c) 2018-2019 The Masari Project
 * Copyright (c) 2018-2020 The Karbo developers
 * Copyright (c) 2018-2023 Conceal Community, Conceal.Network & Conceal Devs
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
  readonly maxAllErrors = 30;
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

  makeRequest = (method: 'GET' | 'POST', path: string, body: any = undefined): Promise<any> => {
    this._isWorking = true;
    ++this._requests;

    return new Promise<any>((resolve, reject) => {
      $.ajax({
        url: this._url + path,
        method: method,
        timeout: this.timeout,
        data: typeof body === 'string' ? body : JSON.stringify(body)
      }).done((raw: any) => {
        this._isWorking = false;        
        resolve(raw);
      }).fail((data: any, textStatus: string) => {
        this._isWorking = false;        
        this.increaseErrors();
        reject(data);
      });
    });
  }

  makeRpcRequest = (method: string, params: any = {}): Promise<any> => {
    this._isWorking = true;
    ++this._requests;

    return new Promise<any>((resolve, reject) => {
      $.ajax({
        url: this._url + 'json_rpc',
        method: 'POST',
        timeout: this.timeout,
        data: JSON.stringify({
          jsonrpc: '2.0',
          method: method,
          params: params,
          id: 0
        }),
        contentType: 'application/json'
      }).done((raw: any) => {
        this._isWorking = false;
        if (typeof raw.id === 'undefined' || typeof raw.jsonrpc === 'undefined' || raw.jsonrpc !== '2.0' || typeof raw.result !== 'object') {
          this.increaseErrors();
          reject('Daemon response is not properly formatted');
        } else {
          resolve(raw.result);
        }
      }).fail((data: any) => {
        this._isWorking = false;
        this.increaseErrors();
        reject(data);
      });
    });
  }

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
    return this._errors;
  }

  get requests(): number {
    return this._requests;
  }

  increaseErrors = () => {
    ++this._errors;  
    ++this._allErrors;  
  }

  hasToManyErrors = () => {
    return ((this._errors >= this.maxTempErrors) && (this._allErrors >= this.maxAllErrors));
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

  constructor() {
    this.nodes = [];
  }

  private acquireWorker = (): NodeWorker | null => {
    const shuffledNodes: NodeWorker[] = [...this.nodes].sort((a, b) => 0.5 - Math.random());

    for (let i = 0; i < shuffledNodes.length; i++) {
      if (!shuffledNodes[i].isWorking && !shuffledNodes[i].hasToManyErrors()) {
        return shuffledNodes[i];
      }
    }

    return null;
  }

  makeRequest = (method: 'GET' | 'POST', path: string, body: any = undefined): Promise<any> => {
    return new Promise<any>((resolve, reject) => {
      (async function(self) {
        let currWorker: NodeWorker | null = self.acquireWorker();
        let resultData: any = null;
        let failed: boolean = false;
    
        while (currWorker) {
          try {
            let resultData = await currWorker.makeRequest(method, path, body);
            currWorker = null;
            failed = false;
    
            // return data
            resolve(resultData);
          } catch(data) {
            currWorker = self.acquireWorker();
            resultData = data;
            failed = true;
          }
        }
    
        // if we are here we failed
        if (!currWorker && failed) {
          reject(resultData);
        }
      })(this);    
    });
  } 

  makeRpcRequest = (method: string, params: any = {}): Promise<any> => {
    return new Promise<any>((resolve, reject) => {
      (async function(self) {
        let currWorker: NodeWorker | null = self.acquireWorker();
        let resultData: any = null;
        let failed: boolean = false;
    
        while (currWorker) {
          try {
            let resultData = await currWorker.makeRpcRequest(method, params);
            currWorker = null;
            failed = false;
    
            // return data
            resolve(resultData);
          } catch(data) {
            currWorker = self.acquireWorker();
            resultData = data;
            failed = true;
          }
        }
    
        // if we are here we failed
        if (!currWorker && failed) {
          reject(resultData);
        }
      })(this);    
    });
  }

  getNodes = () => {
    return this.nodes;      
  }


  start = (nodes: string[]) => {
    for (let i = 0; i < nodes.length; i++) {
      this.nodes.push(new NodeWorker(nodes[i]));      
    }
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
  private lastTimeRetrieveInfo = 0;
  private cacheHeight: number = 0;
  private cacheInfo: any = null;

  constructor() {
    this.nodeWorkers = new NodeWorkersList();
    this.resetNodes();
  }

  getInfo = (): Promise<DaemonResponseGetInfo> => {
    if (Date.now() - this.lastTimeRetrieveInfo < 20 * 1000 && this.cacheInfo !== null) {
      return Promise.resolve(this.cacheInfo);
    }

    this.lastTimeRetrieveInfo = Date.now();
    return this.nodeWorkers.makeRequest('GET', 'getinfo').then((data: DaemonResponseGetInfo) => {
      this.cacheInfo = data;
      return data;
    });
  }

  getHeight = (): Promise<number> => {
    if (Date.now() - this.lastTimeRetrieveInfo < 20 * 1000 && this.cacheHeight !== 0) {
      return Promise.resolve(this.cacheHeight);
    }

    this.lastTimeRetrieveInfo = Date.now();
    return this.nodeWorkers.makeRequest('GET', 'getheight').then((data: any) => {
      let height = parseInt(data.height);
      this.cacheHeight = height;
      return height;
    });
  }

  scannedHeight: number = 0;

  getScannedHeight = (): number => {
    return this.scannedHeight;
  }

  resetNodes = () => {
    Storage.getItem('customNodeUrl', null).then(customNodeUrl => {
      this.nodeWorkers.stop();

      if (customNodeUrl) {
        this.nodeWorkers.start([customNodeUrl]);
      } else {
        this.nodeWorkers.start(config.nodeList);
      }  
    });
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
      if (response.outs.length > 0) {
        logDebugMsg(response.outs);
      }

      return response.outs;
    });
  }

  sendRawTx(rawTx: string) {
    return this.nodeWorkers.makeRequest('POST', 'sendrawtransaction', {
      tx_as_hex: rawTx,
      do_not_relay: false
    }).then((transactions: any) => {
      if (!transactions.status || transactions.status !== 'OK')
        throw transactions;
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
}
