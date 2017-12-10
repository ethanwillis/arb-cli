module.exports = class ArbitrageUtils {

	/**
		Takes as input 3 pair objects and calculates the gain trading from
		the sell pair to the buy pair.

		A pair object has the following structure
		{
			numerator
			denominator
			bid_price
			bid_qty
			ask_price
			ask_qty
		}
	*/
	static find_gain(sell, common, buy) {
		// Make sure common pair is denominated in correct currency.
		if(sell.denominator != common.denominator) {
			common.bid_price = 1.0 /common.bid_price
			common.ask_price = 1.0 /common.ask_price
			common.numerator = common.denominator
			common.denominator = sell.denominator
		}

		let gain = (1.0 * sell.bid_price) / common.ask_price / buy.ask_price
	
		return gain
	}

	static gain_percentage(gain) {
		return (gain - 1) * 100	
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
}

// Buy Limiting
let sellpair1 = {
	numerator: "ENJ",
	denominator: "BTC",
	bid_price: .00000280,
	bid_qty: 252180
}

let commonpair1 = {
	numerator: "ETH",
	denominator: "BTC",
	ask_price: .031690,
	ask_qty: 3.815
}

let buypair1 = {
	numerator: "ENJ",
	denominator: "ETH",
	ask_price: .00008472,
	ask_qty: 4284
}

//console.log(ArbitrageUtils.find_limiting_pair(sellpair1, commonpair1, buypair1))

// Sell Limiting
let sellpair2 = {
	numerator: "ENJ",
	denominator: "BTC",
	bid_price: .00000280,
	bid_qty: 252180
}

let commonpair2 = {
	numerator: "ETH",
	denominator: "BTC",
	ask_price: .031690,
	ask_qty: 3.815
}

let buypair2 = {
	numerator: "ENJ",
	denominator: "ETH",
	ask_price: .00008472,
	ask_qty: 300000
}

//console.log(ArbitrageUtils.find_limiting_pair(sellpair2, commonpair2, buypair2))
//console.log(ArbitrageUtils.gain_percentage(ArbitrageUtils.find_gain(sellpair2, commonpair2, buypair2)))

