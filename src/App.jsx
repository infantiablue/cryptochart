import ReactDOM, { render } from "react-dom";
import React, { useState, useEffect } from "react";
import "./style/index.css";
import Stats from "./components/Stats";
import News from "./components/News";
import callAPI from "./utils";

const App = () => {
	const [count, setCount] = useState(0);
	const [latestPrice, setLatestPrice] = useState(null);
	const [fluctuation, setFluctuation] = useState(null);
	const [loading, setLoading] = useState(true);
	const [isOnline, setIsOnline] = useState(false);
	const [upTrend, setUpTrend] = useState(null);

	useEffect(() => {
		fetch("https://api.coingecko.com/api/v3/ping", {
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
			},
		})
			.then((response) => {
				if (response.status == 200) setIsOnline(true);
				else setIsOnline(false);
			})
			.catch((err) => {
				console.log(err.message);
				setIsOnline(false);
			});
		console.log("ping");
		const timerID = setInterval(() => {
			setCount(count + 1);
		}, 1000 * 30);
		if (count == 0) {
			fetchData().then((result) => {
				setLoading(false);
				initChart(result);
				updateInfo(result);
			});
		} else {
			fetchData().then((result) => {
				let priceChange = parseFloat(result.price[result.price.length - 1]) - result.price[result.price.length - 2];
				let upTrend;
				if (priceChange != 0) upTrend = priceChange > 0 ? true : false;
				setUpTrend(upTrend);
				updateChart(result, upTrend);
				updateInfo(result);
			});
		}
		return () => {
			clearInterval(timerID);
		};
	}, [count]);

	const fetchData = async () => {
		let data = { index: [], price: [], volumes: [] };
		let result = await callAPI("https://api.coingecko.com/api/v3/coins/ethereum/market_chart?vs_currency=usd&days=1&interval=1m");
		// let result = await callAPI("https://us-central1-techika.cloudfunctions.net/crypto");
		for (const item of result.prices) {
			data.index.push(item[0]);
			data.price.push(item[1]);
		}
		for (const item of result.total_volumes) data.volumes.push(item[1]);

		return data;
	};

	const initChart = (data) => {
		let trace_price = {
			name: "Price ($)",
			x: data.index.map((t) => new Date(t)),
			y: data.price,
			xaxis: "x",
			yaxis: "y1",
			type: "scatter",
			mode: "lines+markers",
			marker: { color: "blue", size: 3 },
		};
		let trace_volumes = {
			name: "Volumne ($B)",
			x: data.index.map((t) => new Date(t)),
			y: data.volumes,
			xaxis: "x",
			yaxis: "y2",
			type: "bar",
			barmode: "relative",
			marker: {
				color: "rgb(49,130,189)",
				opacity: 0.7,
			},
		};
		let layout = {
			// title: "ETH/USD",
			autosize: true,
			height: "100%",
			margin: {
				l: 50,
				r: 0,
				t: 35,
				pad: 3,
			},
			showlegend: false,
			xaxis: {
				domain: [1, 1],
				anchor: "y2",
			},
			yaxis: {
				domain: [0.1, 1],
				anchor: "x",
			},
			yaxis2: {
				showticklabels: false,
				domain: [0, 0.1],
				anchor: "x",
			},
			grid: {
				roworder: "bottom to top",
			},
		};
		let config = { responsive: true };
		let series = [trace_price, trace_volumes];
		Plotly.newPlot("chart", series, layout, config);
	};

	const updateInfo = (data) => {
		let priceValues = [];
		data.price.forEach((p) => {
			priceValues.push(parseFloat(p));
		});
		let min = Math.min.apply(Math, priceValues);
		let max = Math.max.apply(Math, priceValues);
		setFluctuation((((max - min) / min) * 100).toFixed(2));
		setLatestPrice(parseFloat(data.price[data.price.length - 1]));
	};

	const updateChart = (data, upTrend) => {
		let trace_price = {
			x: [data.index.map((t) => new Date(t))],
			y: [data.price],
		};
		let trace_volumes = {
			x: [data.index.map((t) => new Date(t))],
			y: [data.volumes],
		};
		/**
		 ** The returned Promise [array] object may not be resolved  so we need to explicitly resolve them
		 ** Source: https://stackoverflow.com/a/56851570/183846
		 */
		let style = {
			marker: { color: upTrend ? "green" : "pink", size: 3 },
		};
		Plotly.update("chart", trace_price, {}, 0);
		Plotly.update("chart", trace_volumes, {}, 1);
		Plotly.restyle("chart", style, [0, 1]);
	};

	return (
		<>
			<nav className='navbar navbar-expand-lg navbar-light bg-light'>
				<span className='text-capitalize ps-3'>
					<a className='navbar-brand text-primary fw-bold' href='/'>
						<img src='/src/ico/eth-logo.png' /> ETH Chart
					</a>
					<i
						className={
							"bi bi-broadcast animate__animated  animate__slower animate__infinite " + (isOnline ? "animate__flash text-success" : " text-danger")
						}
					></i>
				</span>
			</nav>
			<div className='mx-3'>
				{loading ? (
					<h6 className='value animate__animated animate__flash animate__slow text-center'> loading ...</h6>
				) : (
					<>
						<div className='row align-items-start'>
							<div className='cold-sm-6 col-md-9'>
								<Stats upTrend={upTrend} fluctuation={fluctuation} latestPrice={latestPrice} />
								<div id='chart' className='p-0 m-0'></div>
							</div>
							<div className='col-sm-6 col-md-3'>
								<div className='animate__animated animate__fadeIn me-3 border-0'>
									<div className='card-body'>
										<h4 className='card-title text-info'>News</h4>
										<News latestPrice={latestPrice} />
									</div>
								</div>
							</div>
						</div>
					</>
				)}
			</div>
			<footer className='footer'>
				<div className='container'>
					<span className='text-muted'>
						<p className='text-center'>
							2021 Made with 🧡&nbsp; by <a href='https://twitter.com/infantiablue'>Truong Phan</a>.
						</p>
					</span>
				</div>
			</footer>
		</>
	);
};

ReactDOM.render(
	<React.StrictMode>
		<App />
	</React.StrictMode>,
	document.getElementById("root")
);
