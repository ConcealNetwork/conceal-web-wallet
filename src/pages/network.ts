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

import {DestructableView} from "../lib/numbersLab/DestructableView";
import {VueVar, VueRequireFilter} from "../lib/numbersLab/VueAnnotate";
import {Constants} from "../model/Constants";
import {Wallet} from "../model/Wallet";
import {AppState} from "../model/AppState";
import {BlockchainExplorer, NetworkInfo} from "../model/blockchain/BlockchainExplorer";
import {BlockchainExplorerProvider} from "../providers/BlockchainExplorerProvider";
import {VueFilterHashrate} from "../filters/Filters";

AppState.enableLeftMenu();
let blockchainExplorer: BlockchainExplorer = BlockchainExplorerProvider.getInstance();

@VueRequireFilter('hashrate', VueFilterHashrate)

class NetworkView extends DestructableView {
	@VueVar(0) networkHashrate !: string;
	@VueVar(0) blockchainHeight !: number;
	@VueVar(0) networkDifficulty !: number;
	@VueVar(0) lastReward !: number;
	@VueVar(0) lastBlockFound !: number;
  @VueVar([]) nodeList !: string[];
	@VueVar(0) ticker !: string;

	private intervalRefreshStat = 0;

	constructor(container: string) {
		super(container);

		let self = this;
		this.intervalRefreshStat = <any>setInterval(function () {
			self.refreshStats();
		}, 30 * 1000);
		this.refreshStats();
	}

	destruct(): Promise<void> {
		clearInterval(this.intervalRefreshStat);
		return super.destruct();
	}

	refreshStats() {
    $("#appLoader").addClass("appLoaderVisible");

    blockchainExplorer.initialize().then((success : boolean) => {      
      blockchainExplorer.getNetworkInfo().then((info: NetworkInfo) => {
        this.nodeList = [...info.nodes];
        this.networkDifficulty = info.difficulty;
        this.networkHashrate = VueFilterHashrate(info.difficulty / config.avgBlockTime);
        this.blockchainHeight = info.height;
        this.lastReward = info.reward / Math.pow(10, config.coinUnitPlaces);
        this.ticker = config.coinSymbol;
        this.lastBlockFound = info.timestamp;

        $("#appLoader").removeClass("appLoaderVisible");
      }).catch((err: any) => {
        $("#appLoader").removeClass("appLoaderVisible");
      });
    });
	}
}

new NetworkView('#app');
