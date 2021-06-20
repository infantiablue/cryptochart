import React, { useState, useEffect } from "react";
import { callAPI } from "./utils";
import "./style/index.scss";
import Navbar from "./components/Navbar";
import Stats from "./components/Stats";
import Chart from "./components/Chart";
import Footer from "./components/Footer";
import Error from "./components/Error";

const App = () => {
	const TIMER = 30;
	const [counter, setCounter] = useState(TIMER);
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
						setCounter(TIMER);
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
		let data = {};
		try {
			result = await callAPI("https://www.bitstamp.net/api/v2/ohlc/ethusd/?step=180&limit=480");
		} catch (err) {
			console.log(err.message);
			setErrMsg("Unable to fetch resources.");
			setIsOnline(false);
		}
		for (const item of result.data.ohlc) {
			for (const prop in item) {
				data[prop] = data[prop] || [];
				data[prop].push(item[prop]);
			}
		}
		// Convert to JS Date Object
		data.index = data.timestamp.map((t) => new Date(parseInt(t) * 1000));
		// Adjust to legacy components
		data.price = data.close.map((p) => parseFloat(p));
		// Set Up/Down Trend
		let priceChange = parseFloat(data.price[data.price.length - 1]) - data.price[data.price.length - 2];
		let isUpTrend;
		if (priceChange != 0) isUpTrend = priceChange >= 0 ? true : false;
		setUpTrend(isUpTrend);
		setChartData(data);
		return data;
	};

	const initChart = (data) => {
		let high = Math.max.apply(Math, data.price);
		let highIndex = data.price.indexOf(high);
		let highMarker, lowMarker;
		let low = Math.min.apply(Math, data.price);
		let lowIndex = data.price.indexOf(low);

		// High marker
		if (highIndex == 0) highMarker = data.index[highIndex - 1];
		else if (highIndex == data.index.length - 1) highMarker = data.index[highIndex + 1];
		else highMarker = data.index[highIndex];

		// Low marker
		if (lowIndex == 0) lowMarker = data.index[lowIndex - 1];
		else if (lowIndex == data.index.length - 1) lowMarker = data.index[lowIndex + 1];
		else lowMarker = data.index[lowIndex];

		let trace_price = {
			name: "Price ($)",
			x: data.index,
			close: data.close,
			high: data.high,
			low: data.low,
			open: data.open,
			increasing: { line: { color: "#34a0a4" } },
			decreasing: { line: { color: "#ef476f" } },
			line: { color: "#78c6f7" },
			type: "candlestick",
			xaxis: "x",
			yaxis: "y",
		};
		let trace_volumes = {
			name: "Volumne (Eth)",
			x: data.index,
			y: data.volume,
			xaxis: "x",
			yaxis: "y2",
			type: "bar",
			barmode: "relative",
			marker: {
				color: "#0077b6",
				opacity: 0.7,
			},
		};
		let layout = {
			dragmode: "zoom",
			autosize: true,
			margin: {
				l: 50,
				r: 20,
				t: 35,
				b: 40,
				pad: 3,
			},
			showlegend: false,
			xaxis: {
				autorange: true,
				domain: [1, 1],
				anchor: "y2",
				rangeslider: {
					visible: false,
				},
				type: "date",
			},
			yaxis: {
				autorange: true,
				type: "linear",
				domain: [0.25, 1],
				anchor: "x",
			},
			yaxis2: {
				showticklabels: true,
				domain: [0, 0.25],
				anchor: "x",
			},
			grid: {
				roworder: "bottom to top",
			},

			annotations: [
				{
					x: data.index[highIndex],
					y: 1,
					xref: "x",
					yref: "paper",
					text: "High",
					font: { color: "#34a0a4" },
					showarrow: true,
					xanchor: "right",
					ax: -15,
					ay: 0,
				},
				{
					x: data.index[lowIndex],
					y: 0.3,
					xref: "x",
					yref: "paper",
					text: "Low",
					font: { color: "#ef476f" },
					showarrow: true,
					xanchor: "right",
					ax: -15,
					ay: 0,
				},
			],
			shapes: [
				{
					type: "rect",
					xref: "x",
					yref: "paper",
					x0: highMarker,
					y0: 0.9,
					x1: data.index[highIndex + 1],
					y1: 1,
					fillcolor: "#EDE342",
					opacity: 0.7,
					line: {
						width: 0,
					},
				},
				{
					type: "rect",
					xref: "x",
					yref: "paper",
					x0: data.index[lowIndex - 1],
					y0: 0.3,
					x1: lowMarker,
					y1: 0.4,
					fillcolor: "#EDE342",
					opacity: 0.7,
					line: {
						width: 0,
					},
				},
			],
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
							<Stats upTrend={upTrend} chartData={chartData} sendErrMsg={setErrMsg} />
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
