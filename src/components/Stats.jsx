import React, { useState, useEffect } from "react";
import callAPI from "../utils";

const Stats = ({ upTrend, latestPrice, fluctuation }) => {
	const [rates, setRates] = useState({});
	const [balance, setBalance] = useState({});
	const [portfolioValue, setPortfolioValue] = useState(0);

	const initInvestment = 35000000;
	const fixedPortfolio = 36222007;
	useEffect(async () => {
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
	}, [latestPrice, portfolioValue]);
	return (
		<>
			{!portfolioValue ? (
				<h6 className='value animate__animated animate__flash animate__slow text-center mt-2'>updating ...</h6>
			) : (
				<>
					<div className='d-flex flex-wrap justify-content-left px-2 py-3'>
						<div id='latest' className='me-3 border-start border-3 border-primary my-1' style={{ width: "130px" }}>
							<div className='card-body text-center'>
								<h5 className='card-title'>Price</h5>
								<h4 className={upTrend ? "text-success" : "text-danger"}>${latestPrice.toFixed(2)}</h4>
							</div>
						</div>
						<div id='fluctuation' className='me-3 border-start border-3 border-info my-1' style={{ width: "130px" }}>
							<div className='card-body text-center'>
								<h5 className='card-title'>Velocity</h5>
								<h4 className='text-primary '>{fluctuation} %</h4>
							</div>
						</div>
						<div className='me-3 border-start border-3 border-success my-1' style={{ width: "130px" }}>
							<div className='card-body text-center'>
								<h5 className='card-title'>ETH </h5>
								<h5 className='text-primary '>{balance.eth}</h5>
							</div>
						</div>
						<div className='me-3 border-start border-3 border-primary my-1' style={{ width: "130px" }}>
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
						<div className='me-3 border-start border-3 border-warning my-1' style={{ width: "130px" }}>
							<div className='card-body text-center'>
								<h5 className='card-title'>Ask</h5>
								<h5 className='text-primary '>{rates.eth_ask}</h5>
							</div>
						</div>
						<div className='me-3 border-start border-3 border-danger my-1' style={{ width: "130px" }}>
							<div className='card-body text-center'>
								<h5 className='card-title'>Bid</h5>
								<h5 className='text-primary '>{rates.eth_bid}</h5>
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
