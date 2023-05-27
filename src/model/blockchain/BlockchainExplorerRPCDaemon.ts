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
import {MathUtil} from "../MathUtil";
import {CnTransactions, CnUtils} from "../Cn";
import {Transaction} from "../Transaction";
import {WalletWatchdog} from "../WalletWatchdog";

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
    //daemonAddress = config.nodeList[Math.floor(Math.random() * Math.floor(config.nodeList.length))];
    daemonAddress = config.nodeUrl;
    phpProxy: boolean = false;

    constructor(daemonAddress: string | null = null) {
        if (daemonAddress !== null && daemonAddress.trim() !== '') {
            this.daemonAddress = daemonAddress;
        }
    }

    protected makeRpcRequest(method: string, params: any = {}): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            $.ajax({
                url: config.nodeUrl + 'json_rpc',
                method: 'POST',
                data: JSON.stringify({
                    jsonrpc: '2.0',
                    method: method,
                    params: params,
                    id: 0
                }),
                contentType: 'application/json'
            }).done(function (raw: any) {
                if (
                    typeof raw.id === 'undefined' ||
                    typeof raw.jsonrpc === 'undefined' ||
                    raw.jsonrpc !== '2.0' ||
                    typeof raw.result !== 'object'
                )
                    reject('Daemon response is not properly formatted');
                else
                    resolve(raw.result);
            }).fail(function (data: any) {
                reject(data);
            });
        });
    }

    protected makeRequest(method: 'GET' | 'POST', url: string, body: any = undefined): Promise<any> {
      return new Promise<any>((resolve, reject) => {
        $.ajax({
          url: config.nodeUrl + url,
          method: method,
          data: typeof body === 'string' ? body : JSON.stringify(body)
        }).done(function (raw: any) {
          resolve(raw);
        }).fail(function (data: any) {
          reject(data);
        });
      });
    }

    protected makeRequestByCustomNode(method: 'GET' | 'POST', baseUrl: string, apiName: string, body: any = undefined): Promise<any> {
      return new Promise<any>((resolve, reject) => {
        $.ajax({
          url: baseUrl + apiName,
          method: method,
          data: typeof body === 'string' ? body : JSON.stringify(body)
        }).done(function (raw: any) {
          resolve(raw);
        }).fail(function (data: any) {
          reject(data);
        });
      });
    }

    cacheInfo: any = null;
    cacheHeight: number = 0;
    lastTimeRetrieveInfo = 0;

    getInfo(): Promise<DaemonResponseGetInfo> {
      if (Date.now() - this.lastTimeRetrieveInfo < 20 * 1000 && this.cacheInfo !== null) {
        return Promise.resolve(this.cacheInfo);
      }

      this.lastTimeRetrieveInfo = Date.now();
      return this.makeRequest('GET', 'getinfo').then((data: DaemonResponseGetInfo) => {
        this.cacheInfo = data;
        return data;
      });
    }

    getHeight(): Promise<number> {
      if (Date.now() - this.lastTimeRetrieveInfo < 20 * 1000 && this.cacheHeight !== 0) {
        return Promise.resolve(this.cacheHeight);
      }

      this.lastTimeRetrieveInfo = Date.now();
      return this.makeRequest('GET', 'getheight').then((data: any) => {
        let height = parseInt(data.height);
        this.cacheHeight = height;
        return height;
      });
    }

    scannedHeight: number = 0;

    getScannedHeight(): number {
      return this.scannedHeight;
    }

    watchdog(wallet: Wallet): WalletWatchdog {
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

    getTransactionsForBlocks(startBlock: number, endBlock: number, includeMinerTxs: boolean): Promise<any> {
      return this.getTransactionsForBlocksEx(startBlock, endBlock, config.nodeUrl, includeMinerTxs);
    }

    getTransactionsForBlocksEx(startBlock: number, endBlock: number, url: string, includeMinerTxs: boolean): Promise<RawDaemon_Transaction[]> {
      let tempStartBlock: number;
      if (startBlock === 0) {
        tempStartBlock = 1;
      } else {
        tempStartBlock = startBlock;
      }

      return this.makeRequestByCustomNode('POST', url, 'get_raw_transactions_by_heights', {
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
      return this.makeRequest('GET', 'getrawtransactionspool').then(
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
        return this.makeRequest('POST', 'getrandom_outs', {
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
        return this.makeRequest('POST', 'sendrawtransaction', {
            tx_as_hex: rawTx,
            do_not_relay: false
        }).then((transactions: any) => {
            if (!transactions.status || transactions.status !== 'OK')
                throw transactions;
        });
    }

    resolveOpenAlias(domain: string): Promise<{ address: string, name: string | null }> {
        return this.makeRpcRequest('resolve_open_alias', {url: domain}).then(function (response: {
            addresses?: string[],
            status: 'OK' | string
        }) {
            if (response.addresses && response.addresses.length > 0)
                return {address: response.addresses[0], name: null};
            throw 'not_found';
        });
    }

    getNetworkInfo(): Promise<NetworkInfo> {
        return this.makeRpcRequest('getlastblockheader').then((raw: any) => {
            //logDebugMsg(raw);
            return {
                'node': config.nodeUrl,//.split(':')[1].replace(/[-[\]\/{}()*+?\\^$|#\s]/g, ''),
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
