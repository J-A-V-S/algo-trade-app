/*
  Author: JAVS
*/

import _ from 'lodash';
import ZerodhaHistoryAPIs from '../brokers/zerodha/ZerodhaHistoryAPIs.js';
import UpstoxHistoryAPIs from '../brokers/upstox/UpstoxHistoryAPIs.js';
import AngelBrokingHistoryAPIs from '../brokers/angelBroking/AngelBrokingHistoryAPIs.js';
import Zerodha from '../brokers/zerodha/Zerodha.js';
import Upstox from '../brokers/upstox/Upstox.js';
import AngelBroking from '../brokers/angelBroking/AngelBroking.js';
import { getConfig } from '../config.js';

const config = getConfig();

class HistoryAPIs {

  constructor() {

  }

  selectBroker() {
    let broker = null;
    if (Zerodha.isLoggedIn() && Upstox.isLoggedIn() && AngelBroking.isLoggedIn()) {
      broker = config.preferredBrokerForHistoryAPIs;
    } else if (Zerodha.isLoggedIn()) {
      broker = 'zerodha';
    } else if (Upstox.isLoggedIn) {
      broker = 'upstox';
    } else {
      broker = 'angelbroking';
    }

    return broker;
  }

  fetchHistory(tradingSymbol, interval, from, to) {

    const broker = this.selectBroker();

    if (_.isEmpty(broker)) {
      return Promise.reject(`HistoryAPIs: Cannot call fetch history APIs as no broker is selected`);
    }

    switch (broker) {
      case 'zerodha':
        return ZerodhaHistoryAPIs.fetchHistory(tradingSymbol, interval, from, to);

      case 'upstox':
        return UpstoxHistoryAPIs.fetchHistory(tradingSymbol, interval, from, to);

      case 'angelbroking':
        return AngelBrokingHistoryAPIs.fetchHistory(tradingSymbol, interval, from, to);

      default:
        return Promise.reject(`HistoryAPIs:fetchHistory() broker ${broker} not supported`);
    }
  }
}

module.exports = new HistoryAPIs();
