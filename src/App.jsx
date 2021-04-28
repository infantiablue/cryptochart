import { render } from "react-dom";
import React, { useState, useEffect } from "react";
import "./style/index.css";
import Stats from "./components/Stats";
import callAPI from "./utils";

const App = () => {
	const [count, setCount] = useState(0);
	const [chartData, setChartData] = useState({});
	const [loading, setLoading] = useState(true);
	const [isOnline, setIsOnline] = useState(true);
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
		/*
		 * TODO:
		 * Try https://itnext.io/how-to-work-with-intervals-in-react-hooks-f29892d650f2
		 */
		const timerID = setInterval(() => {
			setCount(count + 1);
		}, 1000 * 30);
		if (count == 0) {
			fetchData().then((result) => {
				setLoading(false);
				initChart(result);
			});
		} else {
			fetchData().then((result) => {
				updateChart(result);
			});
		}
		return () => {
			clearInterval(timerID);
		};
	}, [count]);

	const fetchData = async () => {
		let data = { index: [], price: [], volumes: [] };
		let result = await callAPI("https://api.coingecko.com/api/v3/coins/ethereum/market_chart?vs_currency=usd&days=1&interval=1m");
		for (const item of result.prices) {
			data.index.push(item[0]);
			data.price.push(item[1]);
		}
		for (const item of result.total_volumes) data.volumes.push(item[1]);
		// Convert to JS Date Object
		data.index = data.index.map((t) => new Date(t));

		// Set Up/Down Trend
		let priceChange = parseFloat(data.price[data.price.length - 1]) - data.price[data.price.length - 2];
		let isUpTrend;
		if (priceChange != 0) isUpTrend = priceChange >= 0 ? true : false;
		setUpTrend(isUpTrend);

		setChartData(data);
		return data;
	};

	const initChart = (data) => {
		let trace_price = {
			name: "Price ($)",
			x: data.index,
			y: data.price,
			xaxis: "x",
			yaxis: "y1",
			type: "scatter",
			mode: "lines+markers",
			marker: { color: "blue", size: 3 },
		};
		let trace_volumes = {
			name: "Volumne ($B)",
			x: data.index,
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
				r: 20,
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

	const updateChart = (data) => {
		document.querySelector("#latest-price").classList.remove("animate__fadeIn");
		let trace_price = {
			x: [data.index],
			y: [data.price],
		};
		let trace_volumes = {
			x: [data.index],
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
		document.querySelector("#latest-price").classList.add("animate__fadeIn");
	};

	return (
		<>
			<nav className='navbar navbar-expand-lg navbar-light bg-light'>
				<span className='text-capitalize ps-3'>
					<a className='navbar-brand text-primary fw-bold' href='/'>
						<img src='/ico/eth-logo.png' /> ETH Chart
					</a>
					<i
						className={
							"bi bi-broadcast animate__animated  animate__slower animate__infinite " + (isOnline ? "animate__flash text-success" : " text-danger")
						}
					></i>
				</span>
			</nav>
			<div className='px-3'>
				{loading ? (
					<h6 className='value animate__animated animate__flash animate__slow text-center mt-2 py-2'> initializing ...</h6>
				) : (
					<>
						<div className='row align-items-start'>
							{/* <div className='cold-sm-6 col-md-9'> */}
							<Stats upTrend={upTrend} chartData={chartData} />
							<div id='chart' className='p-0 m-0'></div>
							{/* </div> */}
							{/* <div className='col-sm-6 col-md-3'>
								<div className='animate__animated animate__fadeIn me-3 border-0'>
									<div className='card-body'>
										<h4 className='card-title text-info'>News</h4>
										<News latestPrice={latestPrice} />
									</div>
								</div>
							</div> */}
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

render(
	<React.StrictMode>
		<App />
	</React.StrictMode>,
	document.getElementById("root")
);
