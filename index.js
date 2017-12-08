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
		Adds the latest price object to the queue
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
	push_price(new_price) {
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
	// Open WS fopr high_pair
	binanceWS.onAggTrade(high_pair.get_binance_name(), (new_price) => {
		high_pair.push_price(new_price)
	})
}
// Start monitoring pairs
let high_pair = new Pair("MANA/BTC")
monitor(high_pair, "BTC/ETH", "ENJ/ETH");

// Print out pair prices every 1 second.
function print_prices() {
	let high_price = high_pair.get_price();
	let common_price = common_pair.get_price();
	let low_price = low_pair.get_price();
	
	if(high_price == null) {
		console.log("High Pair -- No Data")
	} else {
		console.log("HP: " + high_price.symbol + " Last Price: " + high_price.price)
	}
}

setInterval(print_prices, 1000)


