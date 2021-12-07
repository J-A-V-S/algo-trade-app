/*
  Author: JAVS
*/
import _ from 'lodash';
import { SmartAPI } from 'smartapi-javascript';
import { getConfig } from '../../config.js';
import logger from '../../logger/logger.js';

const config = getConfig();

class AngelBroking {

  constructor() {
    const apiKey = this.getAPIKey();

    if (_.isEmpty(apiKey)) {
      logger.error('Angel Broking API key not configured..');
    }

    logger.info('Angel Broking API key  = ' + apiKey);

    this.smartConnect = new SmartAPI({
      api_key: apiKey
    });
  }

  getAPIKey() {
    return _.get(config, 'brokers.angelbroking.apiKey');
  }

  getAPISecret() {
    return _.get(config, 'brokers.angelbroking.apiSecret');
  }

  isLoggedIn() {
    return this.session ? true : false;
  }

  setSession(session) {
    this.session = session;
  }

  getSession() {
    return this.session;
  }

  getSmartConnect() {
    return this.smartConnect;
  }

  login(req, res) {
    const requestToken = _.get(req, 'query.request_token', null);

    if (_.isEmpty(requestToken) === false) {
      logger.info('Login successful...');
      // Now get the access token after successful login
      this.smartConnect.generateSession(requestToken, this.getAPISecret()).then(session => {
        this.setSession(session);
        res.redirect(302, '/?broker=angelbroking');
      }).catch(err => {
        logger.error('generateSession failed => ', err);
        res.status(500).send({
          error: 'Could not generate smart session',
          details: err
        });
      });
    } else {
      logger.info('login url => ' + this.smartConnect.getLoginURL());
      res.redirect(302, this.smartConnect.getLoginURL());
    }
  }

  
  logout(req, res) {
    if (!this.isLoggedIn()) {
      return res.status(400).send({
        error: 'Not logged in'
      });
    }

    this.smartConnect.logout();
    this.setSession(null);

    res.status(200).send({
      message: 'Logout successful'
    });
    logger.info('Successfully logged out from the session');
  }

  /*
    loadInstruments() {
      return this.kiteConnect.getInstruments("NSE").then(data => {
        Instruments.setInstruments(data);
        logger.info(`Zerodha: instruments loaded. count = ${data.length}`);
        return data;
  
      }).catch(err => {
        logger.error(`Zerodha: failed to load instruments.`, err);
        throw {
          error: 'Failed to load instruments data from Zerodha',
          details: err
        };
      });
    }*/

};

module.exports = new AngelBroking(); // singleton class (new Object())
