module.exports = class Trade {
	constructor(max_btc, binanceRest) {
		// The maximum amount of BTC to use in any trade. 
		this.max_btc = max_btc
		
		// Whether or not an order is active
		this.active_order = false
		this.active_order_id = null
	
		// The binance rest object used to place orders and check their status.
		this.binanceRest = binanceRest
	}

	place_test_order(
}
