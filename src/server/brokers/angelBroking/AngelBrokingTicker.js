/*
  Author: JAVS
*/

import _ from 'lodash';
import logger from '../../logger/logger.js';
import AngelBroking from './AngelBroking';

//let AngelBroking = null;

class AngelBrokingTicker {

  constructor() {

    /*if (Zerodha === null) {
      Zerodha = require('./Zerodha.js');
    }*/

    this.smartConnect  = AngelBroking.getsmartConnect ();

    this.symbols = [];
    this.listeners = [];

    this.onConnected = this.onConnected.bind(this);
    this.onDisConnected = this.onDisConnected.bind(this);
    this.onTick = this.onTick.bind(this);
  }

  registerListener(listener) {
    if (_.isEmpty(listener) === false) {
      this.listeners.push(listener);
    }
  }

  unregisterListener(listener) {
    if (_.isEmpty(listener) === false) {
      this.listeners = _.filter(this.listeners, l => l !== listener);
    }
  }

  registerSymbols(data) { // input can be a string or an array of strings
    logger.info(`AngelBrokingTicker: registerSymbols = ${JSON.stringify(data)}`);
    const tokens = [];
    if (_.isArray(data)) {
      _.each(data, symbol => {
        tokens.push(symbol); // here the token itself is a symbol unlike zerodha case

        if (_.some(this.symbols, s => s === symbol) === false) {
          this.symbols.push(symbol);
        }
      });
    } else {
      const symbol = data;
      tokens.push(symbol);

      if (_.some(this.symbols, s => s === symbol) === false) {
        this.symbols.push(symbol);
      }
    }

    if (this.connected) {
      this.subscribe(tokens);
    }
  }

  unregisterSymbols(data) {
    logger.info(`AngelBrokingTicker: unregisterSymbols = ${JSON.stringify(data)}`);
    const tokens = [];
    if (_.isArray(data)) {
      _.each(data, symbol => {
        tokens.push(symbol);

        _.remove(this.symbols, s => s === symbol);

      });
    } else {
      const symbol = data;
      tokens.push(symbol);

      _.remove(this.symbols, s => s === symbol);
    }

    if (this.connected) {
      this.unsubscribe(tokens);
    }
  }

  connect() {
    if (this.smartConnect ) {
      this.smartConnect .connectSocket().then(() => {
        this.onConnected();

        this.smartConnect .on('orderUpdate', (msg) => {

        });

        this.smartConnect .on('positionUpdate', (msg) => {

        });

        this.smartConnect .on('tradeUpdate', (msg) => {

        });

        this.smartConnect .on('liveFeed', (msg) => {
          this.onTick(msg);
        });

        this.smartConnect .on('disconnected', (msg) => {
          logger.error(`AngelBroking ticker disconnected msg. ${JSON.stringify(msg)}`);
          this.onDisConnected();
        });

        this.smartConnect .on('error', (msg) => {
          logger.error(`AngelBroking ticker error msg. ${JSON.stringify(msg)}`);
          //this.onDisConnected(); //TODO need to check
        });

      }).catch(err => {
        logger.error(`Upstock ticker connect socket failed with err ${JSON.stringify(err)}`);
        this.onDisConnected();
      });
    } else {
      logger.error(`[ALERT] AngelBroking connect is null`);
    }
  }

  disconnect() {
    logger.info(`Upstock ticker disconnect request receievd..`);
    if (this.smartConnect ) {
      this.smartConnect .closeSocket();
      this.onDisConnected();
    }
  }

  onConnected() {
    logger.info('AngelBroking ticker connected...');
    this.connected = true;

    this.subscribe(this.symbols);

    // inform all listeners
    _.each(this.listeners, listener => {
      if (_.isFunction(listener.onConnected)) {
        listener.onConnected();
      }
    });
  }

  onDisConnected() {
    logger.error('[ALERT] AngelBroking ticker disconnected...');
    this.connected = false;

    // inform all listeners
    _.each(this.listeners, listener => {
      if (_.isFunction(listener.onDisConnected)) {
        listener.onDisConnected();
      }
    });
  }

  isConnected() {
    return this.connected;
  }

  subscribe(tokens) {
    const tokensStr = tokens.join(',');
    if (_.isEmpty(tokensStr)) {
      logger.warn(`AngelBrokingTicker: subscribe() no tokens received`);
      return;
    }
    logger.debug('AngelBrokingTicker: subscribing tokens = ' + tokensStr);

    this.smartConnect .subscribeFeed({
      exchange: 'NSE_EQ',
      symbol: tokensStr,
      type: 'full'
    }).then(() => {
      logger.debug('AngelBrokingTicker: subscribed tokens = ' + tokensStr);
    }).catch(err => {
      logger.error('AngelBrokingTicker: unable to subscribe token = ' + tokensStr + '. ' + JSON.stringify(err));
    });
  }

  unsubscribe(tokens) {
    const tokensStr = tokens.join(',');
    if (_.isEmpty(tokensStr)) {
      logger.warn(`AngelBrokingTicker: unsubscribe() no tokens received`);
      return;
    }
    logger.debug('AngelBrokingTicker: unsubscribing tokens = ' + tokensStr);

    this.smartConnect .unsubscribeFeed({
      exchange: 'NSE_EQ',
      symbol: tokensStr,
      type: 'full'
    }).then(() => {
      logger.debug('AngelBrokingTicker: unsubscribed tokens = ' + tokensStr);
    }).catch(err => {
      logger.error('AngelBrokingTicker: unable to unsubscribe token = ' + tokensStr + '. ' + JSON.stringify(err));
    });
  }

  onTick(Tick) {
    _.each(Tick, tick => {
      const liveQuote = {
        tradingSymbol: _.toUpper(tick.symbol),
        cmp: parseFloat(tick.ltp),
        open: parseFloat(tick.open),
        close: parseFloat(tick.close),
        high: parseFloat(tick.high),
        low: parseFloat(tick.low)
      };

      _.each(this.listeners, listener => {
        if (_.isFunction(listener.onTick)) {
          listener.onTick(liveQuote);
        }
      });
    });
  }
}

module.exports = AngelBrokingTicker;
