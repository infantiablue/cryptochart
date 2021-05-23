import React, { useState, useEffect } from "react";
import { callAPI } from "../utils";
import { fadeIn } from "vanjs-toolkit";

const Stats = ({ upTrend, chartData, sendErrMsg }) => {
	// Set default width of block stat
	const [rates, setRates] = useState({});
	const [balance, setBalance] = useState({});
	const [lowHigh, setLowHigh] = useState([]);
	const [latestPrice, setLatestPrice] = useState(0.0);
	const [percentageChange, setPercentageChange] = useState(0.0);
	const [volatility, setVolatility] = useState(0.0);
	const [portfolioValue, setPortfolioValue] = useState(null);
	const [loading, setLoading] = useState(true);
	const initInvestment = 180000000;
	const fixedPortfolio = 36222007;
	useEffect(async () => {
		// Update stats when chartData changed
		updateStat(chartData);
		let resp = await callAPI("https://us-central1-techika.cloudfunctions.net/balance");
		let balance = {},
			rates = {};
		if (!("error" in resp.balance)) {
			for (const [key, value] of Object.entries(resp.rates)) rates[key] = value.toLocaleString("us-Us", { maximumFractionDigits: 0 });
			setRates(rates);
		} else {
			console.error(resp.blance.error);
			setRates(null);
		}

		if (!("error" in resp.rates)) {
			for (const [key, value] of Object.entries(resp.balance)) balance[key] = parseFloat(value);
			setBalance(balance);
			if (balance.eth != 0) setPortfolioValue(parseFloat(balance.eth) * parseInt(String(rates.eth_bid).replaceAll(",", "")));
			else setPortfolioValue(fixedPortfolio);
		} else {
			console.error(resp.rates.error);
			setBalance(null);
			setPortfolioValue(null);
		}

		setLoading(false);
	}, [chartData]);

	const updateStat = (data) => {
		let min = Math.min.apply(Math, data.price);
		let max = Math.max.apply(Math, data.price);
		setLowHigh([min, max]);
		data.price.indexOf(max) > data.price.indexOf(min) ? setVolatility((((max - min) / min) * 100).toFixed(2)) : setVolatility((((min - max) / max) * 100).toFixed(2));

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
			{loading ? (
				<h6 className='value animate__animated animate__flash animate__slow text-center mt-2 py-2'>updating ...</h6>
			) : (
				<>
					<div className='d-flex flex-wrap justify-content-start py-2'>
						<div className='stats border-3 border-primary my-1'>
							<div className='card-body text-center'>
								<div className='d-flex'>
									<h5 className='card-title flex-grow-1'>Price</h5>
									<span className={upTrend ? "text-success" : "text-danger"}>{percentageChange.toFixed(2)} %</span>
								</div>
								<h4 id='latest-price' className={upTrend ? "text-success" : "text-danger"}>
									${latestPrice}
								</h4>
								<h5 className='card-title'>Volatility</h5>
								<h4 className={volatility > 0 ? "text-success" : "text-danger"}>{volatility} %</h4>
							</div>
						</div>
						<div className='stats border-3 border-success my-1'>
							<div className='card-body text-center'>
								<h5 className='card-title'>High</h5>
								<h5 className='text-light-green'>${lowHigh[1].toFixed(2)}</h5>
								<h5 className='card-title'>Low</h5>
								<h5 className='text-light-red'>${lowHigh[0].toFixed(2)}</h5>
							</div>
						</div>

						{balance && (
							<div className='stats border-3 border-purple my-1'>
								<div className='card-body text-center'>
									<h5 className='card-title'>ETH</h5>
									<h5 className='text-primary'>{balance.eth}</h5>
									<h5 className='card-title'>Avg. Price</h5>
									<h5 className='text-primary'>
										{(initInvestment / balance.eth).toLocaleString("us-Us", {
											maximumFractionDigits: 0,
										})}
									</h5>
								</div>
							</div>
						)}
						{portfolioValue && !Number.isNaN(portfolioValue) && balance ? (
							<div className='stats border-3 border-warning my-1'>
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
										})}
										%
									</p>
								</div>
							</div>
						) : null}
						{rates && (
							<div className='stats border-3 border-danger my-1'>
								<div className='card-body text-center'>
									<h5 className='card-title'>Ask</h5>
									<h5 className='text-light-green '>{rates.eth_ask}</h5>
									<h5 className='card-title'>Bid</h5>
									<h5 className='text-light-red'>{rates.eth_bid}</h5>
								</div>
							</div>
						)}
					</div>
					{}
				</>
			)}
		</>
	);
};
export default Stats;
