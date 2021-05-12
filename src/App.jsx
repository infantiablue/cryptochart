import React, { useState, useEffect } from "react";
import { callAPI } from "./utils";
import "./style/index.scss";
import Navbar from "./components/Navbar";
import Stats from "./components/Stats";
import Chart from "./components/Chart";
import Footer from "./components/Footer";
import Error from "./components/Error";

const App = () => {
	const [counter, setCounter] = useState(30);
	const [chartData, setChartData] = useState({});
	const [loading, setLoading] = useState(true);
	const [errMsg, setErrMsg] = useState(null);
	const [isOnline, setIsOnline] = useState(true);
	const [upTrend, setUpTrend] = useState(null);

	useEffect(() => {
		/*
		 * Try https://itnext.io/how-to-work-with-intervals-in-react-hooks-f29892d650f2
		 */
		let counterID;
		fetchChartData().then((result) => {
			setIsOnline(true);
			setLoading(false);
			initChart(result);
			counterID = setInterval(() => {
				setCounter((counter) => {
					if (counter == 0) {
						setCounter(30);
						fetchChartData();
					}
					return counter - 1;
				});
			}, 1000);
		});

		return () => {
			clearInterval(counterID);
		};
	}, []);

	const fetchChartData = async () => {
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
	return (
		<>
			<Navbar isOnline={isOnline} counter={counter} errMsg={errMsg} />
			<div className='px-3'>
				{errMsg && <Error message={errMsg} />}
				{loading && !errMsg ? (
					<h6 className='value animate__animated animate__flash animate__slow text-center mt-2 py-2'> initializing ...</h6>
				) : (
					!errMsg && (
						<div className='row'>
							<Stats upTrend={upTrend} chartData={chartData} />
							<Chart chartData={chartData} />
						</div>
					)
				)}
			</div>
			<Footer />
		</>
	);
};

export default App;
