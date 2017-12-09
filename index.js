const api = require("binance");
const binanceRest = new api.BinanceRest({
	api: "K7wn1ozcmM3CaiSBpdZcsx7dulXCvUMNZleCkPdmjMaELm8tUt0BjXizxP7Epqe5",
	secret: "D2P9dfQMPYh0dQAdfcTK5Xk0Ip3RhbHLpoNgGPe6CSNgedzDGrwdD05EwtfrZlBu",
	timeout: 15000,
	recvWindow: 5000,
	disableBeautification: true
});


const binanceWS = new api.BinanceWS();

class Pair {
	constructor(pair_string) {
		let currencies = pair_string.split("/")
		this.numerator = currencies[0]
		this.denominator = currencies[1]
		this.name = pair_string
		this.binance_name = currencies[0] + currencies[1]
		this.price = null
	}

	/**
		Updates the latest price of the current pairing.
		{
			eventType
			eventTime
			symbol
			tradeId
			price
			quantity
			firstTradeId
			lastTradeId
			time
			maker
			ignored
		}	
	*/
	update_price(new_price) {
		this.price = new_price;
	}
	
	get_price() {
		return this.price;
	}

	get_binance_name() {
		return this.binance_name;
	}

	get_name() {
		return this.name;
	}
}

class Triangle {
	constructor(high_pair, common_pair, low_pair) {
		this.high_pair = high_pair
		this.common_pair = common_pair
		this.low_pair = low_pair
	}
}


function monitor(high_pair, common_pair, low_pair) {	
	// Open WS for high pair
	binanceWS.onAggTrade(high_pair.get_binance_name(), (new_price) => {
		high_pair.update_price(new_price)
	})

	// Open WS for common pair.
	binanceWS.onAggTrade(common_pair.get_binance_name(), (new_price) => {
		common_pair.update_price(new_price)
	})

	// Open WS for low pair.
	binanceWS.onAggTrade(low_pair.get_binance_name(), (new_price) => {
		low_pair.update_price(new_price)
	})
}

function calc_arb(high_price, common_price, low_price) {
	let high_value = 1;
	let common_value = high_value * high_price;
	let low_value = common_price / common_value;
	let completion_value = low_value * low_price;

	return {
		percent_gain: (((completion_value/high_value)*100)-100).toFixed(2),
		starting: high_value,
		completion: completion_value
	}
}

// Start monitoring pairs
let high_pair = new Pair("ENJ/BTC");
let common_pair = new Pair("ETH/BTC");
let low_pair = new Pair("ENJ/ETH");
monitor(high_pair, common_pair, low_pair);

num_arb = 1
cur_arb = 0

// Print out pair prices every 1 second.
function print_prices() {
	let high_price = high_pair.get_price();
	let common_price = common_pair.get_price();
	let low_price = low_pair.get_price();
	
	let price_string = "";

	if(high_price == null) {
		price_string += "HP: None ";
	} else {
		price_string += "HP: " + high_price.symbol + " - " + high_price.price + " ";
	}

	if(common_price == null) {
		price_string += "CP: None ";
	} else {
		price_string += "CP: " + common_price.symbol + " - " + common_price.price + " ";
	}

	if(low_price == null) {
		price_string += "LP: None ";
	} else {
		price_string += "LP: " + low_price.symbol + " - " + low_price.price + " ";
	}

	if(high_price && common_price && low_price) {
		arb_opp = calc_arb(high_price.price, common_price.price, low_price.price);
		price_string += "\n\tARB: " + JSON.stringify(arb_opp, null, "\t");
	}
	else {
		price_string += "\n\tARB: Not enough data";
	}

	console.log(price_string)

	// Do arb trade
	binanceRest.newOrder({

	})
}

setInterval(print_prices, 1000)


