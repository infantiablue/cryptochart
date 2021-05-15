import React, { useState, useEffect } from "react";
import { callAPI } from "../utils";
import { fadeIn } from "vanjs-toolkit";
import Error from "./Error";

// var placeholder = document.querySelector("#trades_placeholder"),
// 	child = null,
// 	i = 0;

// /**
//  * This var is an example of subscription message. By changing its event property to: "bts:unsubscribe"
//  * you can delete your subscription and stop receiving events.
//  */
// var subscribeMsg = {
// 	event: "bts:subscribe",
// 	data: {
// 		channel: "live_trades_btcusd",
// 	},
// };
// /**
//  * Execute a websocket handshake by sending an HTTP upgrade header.
//  */
// var ws;

// /**
//  * Serializes a trade when it's received.
//  */
// function serializeTrade(data) {
// 	if (i === 0) {
// 		placeholder.innerHTML = "";
// 	}
// 	child = document.createElement("div");
// 	child.innerHTML = "(" + data.timestamp + ") " + data.id + ": " + data.amount + " BTC @ " + data.price + " USD " + data.type;
// 	placeholder.appendChild(child);
// 	i++;
// }

// function initWebsocket() {
// 	ws = new WebSocket("wss://ws.bitstamp.net");

// 	ws.onopen = function () {
// 		ws.send(JSON.stringify(subscribeMsg));
// 	};

// 	ws.onmessage = function (evt) {
// 		let response = JSON.parse(evt.data);
// 		console.log(response);
// 		/**
// 		 * This switch statement handles message logic. It processes data in case of trade event
// 		 * and it reconnects if the server requires.
// 		 */
// 		switch (response.event) {
// 			case "trade": {
// 				serializeTrade(response.data);
// 				break;
// 			}
// 			case "bts:request_reconnect": {
// 				initWebsocket();
// 				break;
// 			}
// 		}
// 	};
// 	/**
// 	 * In case of unexpected close event, try to reconnect.
// 	 */
// 	ws.onclose = function () {
// 		console.log("Websocket connection closed");
// 		initWebsocket();
// 	};
// }

const Stats = ({ upTrend, chartData }) => {
	// Set default width of block stat
	const blockWidth = { width: "130px" };
	const [errMsg, setErrMsg] = useState(null);
	const [rates, setRates] = useState({});
	const [balance, setBalance] = useState({});
	const [lowHigh, setLowHigh] = useState([]);
	const [latestPrice, setLatestPrice] = useState(0.0);
	const [percentageChange, setPercentageChange] = useState(0.0);
	const [velocity, setVelocity] = useState(0.0);
	const [portfolioValue, setPortfolioValue] = useState(0.0);

	const initInvestment = 100000000;
	const fixedPortfolio = 36222007;
	useEffect(async () => {
		// Update stats when chartData changed
		updateStat(chartData);

		try {
			let ratesResult = await callAPI("https://us-central1-techika.cloudfunctions.net/rates");
			let rates = {};

			for (const [key, value] of Object.entries(ratesResult)) {
				rates[key] = value.toLocaleString("us-Us", { maximumFractionDigits: 0 });
			}
			setRates(rates);
			let balanceResult = await callAPI("https://us-central1-techika.cloudfunctions.net/balance");
			let balance = {};
			for (const [key, value] of Object.entries(balanceResult)) {
				balance[key] = parseFloat(value);
			}
			setBalance(balance);
		} catch (err) {
			setErrMsg("Unable to fetch resources.");
			console.log(err);
			setPortfolioValue(null);
		}
		if (balance.eth != 0) setPortfolioValue(parseFloat(balance.eth) * parseInt(String(rates.eth_bid).replaceAll(",", "")));
		else {
			setPortfolioValue(fixedPortfolio);
		}
		// initWebsocket();
	}, [chartData]);

	const updateStat = (data) => {
		let priceValues = [];
		data.price.forEach((p) => {
			priceValues.push(parseFloat(p));
		});
		let min = Math.min.apply(Math, priceValues);
		let max = Math.max.apply(Math, priceValues);
		setLowHigh([min, max]);
		setVelocity((((max - min) / min) * 100).toFixed(2));
		let lastPrice = data.price[data.price.length - 1];
		setLatestPrice(parseFloat(lastPrice));
		// Ignite fade in effect
		let lastPriceElm = document.querySelector("#latest-price");
		let portfolioValueElm = document.querySelector("#portfolio-value");
		portfolioValueElm && fadeIn(portfolioValueElm);
		lastPriceElm && fadeIn(lastPriceElm);
		let priceChange = parseFloat(data.price[data.price.length - 1]) - data.price[data.price.length - 2];
		let percentageChange = (priceChange / data.price[data.price.length - 2]) * 100;
		setPercentageChange(percentageChange);
		let tilteElm = document.querySelector("title");
		tilteElm.textContent = `${upTrend ? "🔼" : "🔽"} $${lastPrice} USD/ETH`;
	};

	return (
		<>
			{errMsg ? (
				<Error message={errMsg} />
			) : !portfolioValue ? (
				<h6 className='value animate__animated animate__flash animate__slow text-center mt-2 py-2'>updating ...</h6>
			) : (
				<>
					<div className='d-flex flex-wrap justify-content-left px-2 py-3'>
						<div className='me-3 border-start border-3 border-primary my-1' style={blockWidth}>
							<div className='card-body text-center'>
								<h5 className='card-title'>Price</h5>
								<h4 id='latest-price' className={upTrend ? "text-success" : "text-danger"}>
									${latestPrice}
								</h4>
								<h6 className={upTrend ? "text-success" : "text-danger"}>{percentageChange.toFixed(2)} %</h6>
							</div>
						</div>
						<div className='me-3 border-start border-3 border-success my-1' style={blockWidth}>
							<div className='card-body text-center'>
								<h5 className='card-title'>High</h5>
								<h5 className='text-light-green'>${lowHigh[1].toFixed(2)}</h5>
								<h5 className='card-title'>Low</h5>
								<h5 className='text-light-red'>${lowHigh[0].toFixed(2)}</h5>
							</div>
						</div>
						<div className='me-3 border-start border-3 border-info my-1' style={blockWidth}>
							<div className='card-body text-center'>
								<h5 className='card-title'>Velocity</h5>
								<h4 className='text-primary '>{velocity} %</h4>
							</div>
						</div>
						<div className='me-3 border-start border-3 border-purple my-1' style={blockWidth}>
							<div className='card-body text-center'>
								<h5 className='card-title'>ETH </h5>
								<h5 className='text-primary '>{balance.eth}</h5>
							</div>
						</div>
						<div className='me-3 border-start border-3 border-warning my-1' style={blockWidth}>
							<div className='card-body text-center'>
								<h5 className='card-title'>Value</h5>
								<h5 id='portfolio-value' className={portfolioValue > initInvestment ? "text-success" : "text-danger"}>
									{portfolioValue.toLocaleString("us-Us", { maximumFractionDigits: 0 })}
								</h5>
								<p className='text-muted'>
									{(portfolioValue - initInvestment).toLocaleString("us-Us", { maximumFractionDigits: 0 })}
									<br />
									{(((portfolioValue - initInvestment) / initInvestment) * 100).toLocaleString("us-Us", {
										maximumFractionDigits: 2,
									})}{" "}
									%
								</p>
							</div>
						</div>
						<div className='me-3 border-start border-3 border-danger my-1' style={blockWidth}>
							<div className='card-body text-center'>
								<h5 className='card-title'>Ask</h5>
								<h5 className='text-light-green '>{rates.eth_ask}</h5>
								<h5 className='card-title'>Bid</h5>
								<h5 className='text-light-red'>{rates.eth_bid}</h5>
							</div>
						</div>
					</div>
					{}
				</>
			)}
		</>
	);
};
export default Stats;
