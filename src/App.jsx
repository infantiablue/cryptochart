import React, { useState, useEffect } from "react";
import "./style/index.scss";
import Stats from "./components/Stats";
import Error from "./components/Error";
import callAPI from "./utils";

const App = () => {
	const [counter, setCounter] = useState(30);
	const [chartData, setChartData] = useState({});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(false);
	const [errMsg, setErrMsg] = useState(null);
	const [isOnline, setIsOnline] = useState(true);
	const [upTrend, setUpTrend] = useState(null);

	useEffect(() => {
		/*
		 * TODO:
		 * Try https://itnext.io/how-to-work-with-intervals-in-react-hooks-f29892d650f2
		 */
		let counterID;
		fetchData().then((result) => {
			setIsOnline(true);
			setLoading(false);
			initChart(result);
			counterID = setInterval(() => {
				setCounter((counter) => {
					if (counter == 0) {
						setCounter(30);
						fetchData().then((result) => {
							updateChart(result);
						});
					}
					return counter - 1;
				});
			}, 1000);
		});

		return () => {
			clearInterval(counterID);
		};
	}, []);

	const fetchData = async () => {
		let result;
		let data = { index: [], price: [], volumes: [] };
		try {
			result = await callAPI("https://api.coingecko.com/api/v3/coins/ethereum/market_chart?vs_currency=usd&days=1&interval=1m");
		} catch (err) {
			console.log(err.message);
			setErrMsg("Unable to fetch resources.");
			setIsOnline(false);
		}
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
			marker: { color: "#78c6f7", size: 3 },
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
				color: "#fb8500",
				opacity: 0.7,
			},
		};
		let layout = {
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
				domain: [0.2, 1],
				anchor: "x",
			},
			yaxis2: {
				showticklabels: true,
				domain: [0, 0.2],
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
		let trace_price = {
			x: [data.index],
			y: [data.price],
		};
		let trace_volumes = {
			x: [data.index],
			y: [data.volumes],
		};
		Plotly.update("chart", trace_price, {}, 0);
		Plotly.update("chart", trace_volumes, {}, 1);
	};

	return (
		<>
			<nav className='navbar navbar-expand-lg navbar-light bg-light'>
				<span className='text-capitalize ps-3'>
					<a className='navbar-brand text-primary fw-bold' href='/'>
						<img src='/ico/eth-logo.png' />
						<span className='text-purple'>ETH Chart</span>
					</a>
					<span className='text-muted me-2'>00:{`${counter}`.padStart(2, "0")}</span>
					<i
						className={
							"bi bi-broadcast animate__animated  animate__slower animate__infinite " + (isOnline ? "animate__flash text-success" : " text-danger")
						}
					></i>
				</span>
			</nav>
			<div className='px-3'>
				{errMsg ? <Error message={errMsg} /> : <></>}
				{loading && !errMsg ? (
					<h6 className='value animate__animated animate__flash animate__slow text-center mt-2 py-2'> initializing ...</h6>
				) : !errMsg ? (
					<>
						<div className='row align-items-start'>
							<Stats upTrend={upTrend} chartData={chartData} />
							<div id='chart' className='p-0 m-0'></div>
						</div>
					</>
				) : (
					<></>
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

export default App;
