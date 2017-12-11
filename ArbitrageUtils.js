module.exports = class ArbitrageUtils {

	static gain_percentage(sell_qty, buy_qty) {
		let gain = Number(((buy_qty - sell_qty)/sell_qty)*100).toPrecision(4)
		return gain
	}

	/**
		Based on the quantity available of each asset this function
		figures out which asset is the "smallest" relative to the others.
		
		This smallest asset is then used to calculate the quantity to buy/sell
		of the other two assets.
	*/
	static find_limiting_pair(sell, common, buy) {
		
		// compare common pair with sell pair and buy pair
		let common_sell_size = 0;
		let common_buy_size = 0;
		let sell_common_size = 0;
		let sell_buy_size = 0;
		let buy_common_size = 0;
		let buy_sell_size = 0;
		let limiting_pair = "unknown";

		// Calculate size of each pair in the units of the other two pairs
		if(sell.denominator == common.denominator) {
			common_sell_size = common.ask_price * common.ask_qty
			sell_common_size = sell.bid_price * sell.bid_qty;
		} else {
			common_sell_size = (1 / common.ask_price) * common.ask_qty
			sell_common_size = sell.bid_price * sell.bid_qty;
		}
		
		if(buy.denominator == common.denominator) {
			common_buy_size = common.ask_price * common.ask_qty
			buy_common_size = buy.ask_price * buy.ask_qty
		} else {
			common_buy_size = (1 / common.ask_price) * common.ask_qty
			buy_common_size = buy.ask_price * buy.ask_qty
		}

		sell_buy_size = sell.bid_qty;
		buy_sell_size = buy.ask_qty;

		if(common_sell_size <= sell_common_size && common_buy_size <= buy_common_size) {
			limiting_pair = "common"			
		} else if(sell_common_size <= common_sell_size && sell_buy_size <= buy_sell_size) {
			limiting_pair = "sell"
		} else if(buy_common_size <= common_buy_size && buy_sell_size <= sell_buy_size) {
			limiting_pair = "buy"
		} else {
			limiting_pair = "unknown"
		}

		return limiting_pair;
	}

	static buy_sell_amounts(limiting_pair, sell, common, buy) {
		let result = {
			limiting_pair: limiting_pair,
			sell: {
				pair: sell.numerator + "/" + sell.denominator,
				price: sell.bid_price,
				qty: 0
			},
			common: {
				pair: common.numerator + "/" + common.denominator,
				price: common.ask_price,
				qty: 0
			},
			buy: {
				pair: buy.numerator + "/" + buy.denominator,
				price: buy.ask_price,
				qty: 0
			}
		}

		if(limiting_pair == "sell") {
			result.sell.qty = sell.bid_qty 
			if(sell.denominator == common.denominator) {
				result.common.qty = (result.sell.qty * result.sell.price) / result.common.price
				result.buy.qty = result.common.qty / result.buy.price
			} else if(buy.denominator == common.denominator) {
				result.common.qty = (result.sell.qty * result.sell.price)
				result.buy.qty = (result.common.qty * result.common.price) / result.buy.price
			}

		} else if(limiting_pair == "common") {
			result.common.qty = common.ask_qty
			if(sell.denominator == common.denominator) {
				result.sell.qty = (result.common.qty * result.common.price) / result.sell.price
				result.buy.qty = result.common.qty / result.buy.price
			} else if(buy.denominator == common.denominator) {
				result.buy.qty = (result.common.qty * result.common.price) / result.buy.price
				result.sell.qty = result.common.qty / result.sell.price
			}

		} else if(limiting_pair == "buy") {
			result.buy.qty = buy.ask_qty
			if(sell.denominator == common.denominator) {
				result.common.qty = (result.buy.qty * result.buy.price)
				result.sell.qty = (result.common.qty * result.common.price) / result.sell.price
			} else if(buy.denominator == common.denominator) {
				result.common.qty = (result.buy.qty * result.buy.price) / result.common.price
				result.sell.qty = result.common.qty / result.sell.price
			}
		}

		result.sell.qty = Number(result.sell.qty).toFixed(sell.precision);
		result.common.qty = Number(result.common.qty).toFixed(3);
		result.buy.qty = Number(result.buy.qty).toFixed(buy.precision);

		return result
	}
	
	static opportunity(sell, common, buy) {
		//let arb_gain = 1; //this.gain_percentage(sell, common, buy);
		let limiting_pair = this.find_limiting_pair(sell, common, buy);
	        let pair_trades = this.buy_sell_amounts(limiting_pair, sell, common, buy);
		let arb_gain = this.gain_percentage(pair_trades.sell.qty, pair_trades.buy.qty)
		return {
			gain: arb_gain,
			limiting_pair: limiting_pair,
			sell: pair_trades.sell,
			common: pair_trades.common,
			buy: pair_trades.buy
		}
	}
}
