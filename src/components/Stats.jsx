import React, { useState, useEffect } from "react";
import callAPI from "../utils";

const Stats = ({ upTrend, chartData }) => {
	// Set default width of block stat
	const blockWidth = { width: "130px" };
	const [rates, setRates] = useState({});
	const [balance, setBalance] = useState({});
	const [lowHigh, setLowHigh] = useState([]);
	const [latestPrice, setLatestPrice] = useState(0.0);
	const [percentageChange, setPercentageChange] = useState(0.0);
	const [velocity, setVelocity] = useState(0.0);
	const [portfolioValue, setPortfolioValue] = useState(0.0);

	const initInvestment = 75000000;
	const fixedPortfolio = 36222007;
	useEffect(async () => {
		// Update stats when chartData changed
		updateStat(chartData);
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
		if (balance.eth != 0) setPortfolioValue(parseFloat(balance.eth) * parseInt(String(rates.eth_bid).replaceAll(",", "")));
		else {
			setPortfolioValue(fixedPortfolio);
		}
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
		// Ignite effect to latest price div
		let lastPriceElm = document.querySelector("#latest-price");
		if (lastPriceElm) {
			lastPriceElm.classList.add("animate__fadeIn", "animate__slow");
			lastPriceElm.addEventListener("animationend", () => lastPriceElm.classList.remove("animate__fadeIn", "animate__slow"));
		}
		let priceChange = parseFloat(data.price[data.price.length - 1]) - data.price[data.price.length - 2];
		let percentageChange = (Math.abs(priceChange) / data.price[data.price.length - 2]) * 100;
		setPercentageChange(percentageChange);
		let tilteElm = document.querySelector("title");
		tilteElm.textContent = `${upTrend ? "🔼" : "🔽"} $${lastPrice.toFixed(2)} USD/ETH`;
	};

	return (
		<>
			{!portfolioValue ? (
				<h6 className='value animate__animated animate__flash animate__slow text-center mt-2 py-2'>updating ...</h6>
			) : (
				<>
					<div className='d-flex flex-wrap justify-content-left px-2 py-3'>
						<div className='me-3 border-start border-3 border-primary my-1' style={blockWidth}>
							<div className='card-body text-center'>
								<h5 className='card-title'>Price</h5>
								<h4 id='latest-price' className={"animate__animated " + (upTrend ? "text-success" : "text-danger")}>
									${latestPrice.toFixed(2)}
								</h4>
								<h6 className={upTrend ? "text-success" : "text-danger"}>{percentageChange.toFixed(2)} %</h6>
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
								<h5 className={portfolioValue > initInvestment ? "text-success" : "text-danger"}>
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
						<div className='me-3 border-start border-3 border-success my-1' style={blockWidth}>
							<div className='card-body text-center'>
								<h5 className='card-title'>High</h5>
								<h5 className='text-light-green'>${lowHigh[1].toFixed(2)}</h5>
								<h5 className='card-title'>Low</h5>
								<h5 className='text-light-red'>${lowHigh[0].toFixed(2)}</h5>
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
