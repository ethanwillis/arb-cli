const Util = require('./Utils.js')

module.exports = class Pair {
	constructor(pair_string, all_book_tickers_index, precision) {
		this.numerator = pair_string.substring(0, pair_string.length-3)
		this.denominator = pair_string.substring(pair_string.length-3, pair_string.length)
		this.binance_name = this.numerator + this.denominator
		this.all_book_tickers_index = Util.all_book_tickers_index(this.binance_name);
		this.bid_price = null;
		this.bid_qty = null;
		this.ask_price = null;
		this.ask_qty = null;
		this.precision = precision
	}

	update_bid(bid_price, bid_qty) {
		this.bid_price = Number(bid_price).toPrecision(this.precision);
		this.bid_qty = bid_qty ? Number(bid_qty).toPrecision(this.precision) : Number(bid_qty).toPrecision(this.precision);
	}

	get_bid() {
		return {
			price: this.bid_price,
			total: this.bid_qty
		}
	}

	update_ask(ask_price, ask_qty) {
		this.ask_price = Number(ask_price).toPrecision(this.precision);
		this.ask_qty = ask_qty ? Number(ask_qty).toPrecision(this.precision) : Number(ask_qty).toPrecision(this.precision);
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
			ask_qty: this.ask_qty,
			precision: this.precision
		}
	}
}
