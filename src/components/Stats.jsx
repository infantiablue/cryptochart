import React, { useState, useEffect } from "react";
import callAPI from "../utils";

const Stats = ({ upTrend, latestPrice, fluctuation }) => {
	const [rates, setRates] = useState({});
	const [balance, setBalance] = useState({});
	const [portfolioValue, setPortfolioValue] = useState(0);
	const initInvestment = 35000000;
	useEffect(() => {
		callAPI("https://us-central1-techika.cloudfunctions.net/rates").then((result) => {
			let rates = {};
			for (const [key, value] of Object.entries(result)) {
				rates[key] = value.toLocaleString("us-Us", { maximumFractionDigits: 0 });
			}
			setRates(rates);
		});
		callAPI("https://us-central1-techika.cloudfunctions.net/balance").then((result) => {
			let balance = {};
			for (const [key, value] of Object.entries(result)) {
				balance[key] = parseFloat(value);
			}
			setBalance(balance);
			setPortfolioValue(parseFloat(balance.eth) * parseInt(String(rates.eth_bid).replaceAll(",", "")));
		});
	}, [latestPrice]);
	return (
		<>
			<div className='d-flex flex-wrap justify-content-left px-2 py-3'>
				<div id='latest' className='me-3 border-start border-3 border-primary my-1' style={{ width: "130px" }}>
					<div className='card-body text-center'>
						<h5 className='card-title'>Price</h5>
						<h4 className={upTrend ? "text-success" : "text-danger"}>${latestPrice}</h4>
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
	);
};
export default Stats;
