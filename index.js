const AU = require('./ArbitrageUtils.js')
const Util = require('./Utils.js')
const Pair = require('./Pair.js')
const api = require("binance");
const binanceRest = new api.BinanceRest({
	key: "K7wn1ozcmM3CaiSBpdZcsx7dulXCvUMNZleCkPdmjMaELm8tUt0BjXizxP7Epqe5",
	secret: "D2P9dfQMPYh0dQAdfcTK5Xk0Ip3RhbHLpoNgGPe6CSNgedzDGrwdD05EwtfrZlBu",
	timeout: 15000,
	recvWindow: 5000,
	disableBeautification: true
});
const binanceWS = new api.BinanceWS();

// CLI Input
let sell_pair_string = process.argv[2]
let common_pair_string = process.argv[3]
let buy_pair_string = process.argv[4]
let sell_pair = new Pair(sell_pair_string, 0)
let common_pair = new Pair(common_pair_string, 3)
let buy_pair = new Pair(buy_pair_string, 0)

// Misc CLI commands
function build_index() {
	binanceRest.allBookTickers((err, data) => {
		Util.build_index(err, data)
	});
}

// Arbitrage monitoring and action commands
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
			buy_pair.update_bid(null, null)
			buy_pair.update_ask(null, null)
			common_pair.update_bid(null, null)
			common_pair.update_ask(null, null)
		}
	});
}

function decision_engine() {
	let header_replace_every = 10
	let lines_printed = 0
	let sell = sell_pair.get_data()
	let common = common_pair.get_data()
	let buy = buy_pair.get_data()
	let arb = AU.opportunity(sell, common, buy)
	let timestamp = Math.round((new Date()).getTime())
	if(arb.limiting_pair != "unknown") {
		if((lines_printed % header_replace_every) == 0) {
			console.log("Timestamp\tTrade\tLimiting\tGain\tSell Pair\tComm Pair\tBuy Pair")
		}
		if((arb.gain - 0.3) > 0 && arb.sell.qty > 0 && arb.common.qty > 0 && arb.buy.qty > 0) {
			console.log(
				timestamp
				+ "\tTrue"
				+ "\t" + arb.limiting_pair
				+ "\t" + (arb.gain - 0.3)
				+ "\t" + arb.sell_pair+"(" + arb.sell.qty + ", " + arb.sell.price + ")"
				+ "\t" + arb.common.pair + "(" + arb.common.qty + ", " + arb.common.price + ")"
				+ "\t" + arb.buy.pair + "(" + arb.buy.qty + ", " + arb.buy.price + ")"
			);
		} else {
			console.log(
				timestamp
				+ "\tFalse"
				+ "\t" + arb.limiting_pair
				+ "\t" + (arb.gain - 0.3)
				+ "\t" + arb.sell.pair+"(" + arb.sell.qty + ", " + arb.sell.price + ")"
				+ "\t" + arb.common.pair + "(" + arb.common.qty + ", " + arb.common.price + ")"
				+ "\t" + arb.buy.pair + "(" + arb.buy.qty + ", " + arb.buy.price + ")"
			);
		}
		lines_printed += 1;
	}
}

setInterval(update_depth, 400)
setInterval(decision_engine, 400)
