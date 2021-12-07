/*
  Author: JAVS
*/
import _ from 'lodash';
import AngelBroking from './AngelBroking';
import { formatDateToDDMMYYYY } from '../../utils/utils.js';

class AngelBrokingHistoryAPIs {

  constructor() {
    this.smartConnect = AngelBroking.getSmartConnect();
  }

  fetchHistory(tradingSymbol, interval, from, to) {

    const params = {
      exchange: 'NSE_EQ',
      symbol: tradingSymbol,
      start_date: formatDateToDDMMYYYY(from),
      end_date: formatDateToDDMMYYYY(to),
      format: 'json',
      interval: _.isString(interval) ? `1${_.toUpper(interval)}` : `${interval}MINUTE` // for days/weeks its like 1DAY, 1WEEK
    };

    if (this.smartConnect) {
      return this.smartConnect.getCandleData(params).then(resp => {
        const candles = resp.data || [];
        _.each(candles, candle => {
          candle.timestamp = new Date(parseInt(candle.timestamp));
          candle.open = parseFloat(candle.open);
          candle.high = parseFloat(candle.high);
          candle.low = parseFloat(candle.low);
          candle.close = parseFloat(candle.close);
          candle.volume = parseInt(candle.volume);
        });
        return candles;
      });
    } else {
      return Promise.reject(`AngelBrokingHistoryAPIs: cannot fetch history as SmartConnect is null`);
    }
  }

}

module.exports = new AngelBrokingHistoryAPIs(); // singleton class


