const AU = require('./ArbitrageUtils.js')

const api = require("binance");
const binanceRest = new api.BinanceRest({
	key: "K7wn1ozcmM3CaiSBpdZcsx7dulXCvUMNZleCkPdmjMaELm8tUt0BjXizxP7Epqe5",
	secret: "D2P9dfQMPYh0dQAdfcTK5Xk0Ip3RhbHLpoNgGPe6CSNgedzDGrwdD05EwtfrZlBu",
	timeout: 15000,
	recvWindow: 5000,
	disableBeautification: true
});


const binanceWS = new api.BinanceWS();


class Util {
	static all_book_tickers_index(pair_string) {
		switch (pair_string) {
			case "ENJBTC":
				return 97
			case "ETHBTC":
				return 0
			case "ENJETH":
				return 98
		}
	}
}

class Pair {
	constructor(pair_string, all_book_tickers_index, precision) {
		this.numerator = pair_string.split("/")[0]
		this.denominator = pair_string.split("/")[1]
		this.binance_name = this.numerator + this.denominator
		this.all_book_tickers_index = Util.all_book_tickers_index(this.binance_name);
		this.bid_price = null;
		this.bid_qty = null;
		this.ask_price = null;
		this.ask_qty = null;
		this.precision = precision
	}

	update_bid(bid_price, bid_qty) {
		this.bid_price = bid_price;
		this.bid_qty = bid_qty ? Number(bid_qty).toFixed(this.precision) : bid_qty;
	}
	
	get_bid() {
		return {
			price: this.bid_price,
			total: this.bid_qty
		}
	}

	update_ask(ask_price, ask_qty) {
		this.ask_price = ask_price;
		this.ask_qty = ask_qty ? Number(ask_qty).toFixed(this.precision) : ask_qty;
	}

	get_ask() {
		return {
			price: this.ask_price,
			total: this.ask_qty
		}
	}

	get_binance_name() {
		return this.binance_name;
	}

	get_all_book_tickers_index() {
		return this.all_book_tickers_index;
	}

	get_data() {
		return {
			numerator: this.numerator,
			denominator: this.denominator,
			bid_price: this.bid_price,
			bid_qty: this.bid_qty,
			ask_price: this.ask_price,
			ask_qty: this.ask_qty
		}
	}
}

let sell_pair_string = process.argv[2]
let common_pair_string = process.argv[3]
let buy_pair_string = process.argv[4]
let sell_pair = new Pair(sell_pair_string, 0)
let common_pair = new Pair(common_pair_string, 3)
let buy_pair = new Pair(buy_pair_string, 0)

function update_depth() {
	binanceRest.allBookTickers((err, data) => {
		if(err) {
			console.error(err)
			sell_pair.update_bid(null, null)
			sell_pair.update_ask(null, null)
			common_pair.update_bid(null, null)
			common_pair.update_ask(null, null)
		} else if (data) {
			sell_pair_index = sell_pair.get_all_book_tickers_index();
			sell_pair_data = data[sell_pair_index];
			if(sell_pair_data && sell_pair_data.symbol == sell_pair.get_binance_name()) {
				sell_pair.update_bid(sell_pair_data.bidPrice, sell_pair_data.bidQty)
				sell_pair.update_ask(sell_pair_data.askPrice, sell_pair_data.askQty)
			} else {
				sell_pair.update_bid(null, null)
				sell_pair.update_ask(null, null)
			}

			common_pair_index = common_pair.get_all_book_tickers_index();
			common_pair_data = data[common_pair_index]
			if(common_pair_data && common_pair_data.symbol == common_pair.get_binance_name()) {
				common_pair.update_bid(common_pair_data.bidPrice, common_pair_data.bidQty)
				common_pair.update_ask(common_pair_data.askPrice, common_pair_data.askQty)
			} else {
				common_pair.update_bid(null, null)
				common_pair.update_ask(null, null)
			}

			buy_pair_index = buy_pair.get_all_book_tickers_index();
			buy_pair_data = data[buy_pair_index]
			if(buy_pair_data && buy_pair_data.symbol == buy_pair.get_binance_name()) {
				buy_pair.update_bid(buy_pair_data.bidPrice, buy_pair_data.bidQty)
				buy_pair.update_ask(buy_pair_data.askPrice, buy_pair_data.askQty)
			} else {
				buy_pair.update_bid(null, null)
				buy_pair.update_ask(null, null)
			}
		} else {
			sell_pair.update_bid(null, null)
			sell_pair.update_ask(null, null)
		}
	});
}

function print_depth() {
	let sell = sell_pair.get_data()
	let common = common_pair.get_data()
	let buy = buy_pair.get_data()
	let arb_gain = AU.gain_percentage(AU.find_gain(sell, common, buy))
	let limiting_pair = AU.find_limiting_pair(sell, common, buy);
	console.log(JSON.stringify({
		gain: arb_gain,
		limiting_pair: limiting_pair,
		pairs: [sell_pair.get_binance_name(), common_pair.get_binance_name(), buy_pair.get_binance_name()]
	}, null, "\t"));
}

setInterval(update_depth, 500)
setInterval(print_depth, 500)
