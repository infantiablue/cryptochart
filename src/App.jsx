import ReactDOM, { render } from "react-dom";
import React, { useState, useEffect } from "react";
import "./style/index.css";
import Stats from "./components/Stats";
import callAPI from "./utils";

const App = () => {
	const [count, setCount] = useState(0);
	const [latestPrice, setLatestPrice] = useState(null);
	const [fluctuation, setFluctuation] = useState(null);
	const [loading, setLoading] = useState(true);
	const [upTrend, setUpTrend] = useState(null);

	useEffect(() => {
		const timerID = setInterval(() => {
			setCount(count + 1);
		}, 1000 * 10);
		if (count == 0) {
			fetchData().then((result) => {
				setLoading(false);
				initChart(result);
				updateInfo(result);
			});
		} else {
			fetchData().then((result) => {
				let upTrend = parseFloat(result.price[result.price.length - 1].toFixed(2)) >= latestPrice ? true : false;
				setUpTrend(upTrend);
				updateChart(result, upTrend);
			});
		}
		return () => {
			clearInterval(timerID);
		};
	}, [count]);

	const fetchData = async () => callAPI("https://us-central1-techika.cloudfunctions.net/crypto");

	const initChart = (data) => {
		let trace = {
			x: data.index.map((t) => new Date(t)),
			y: data.price,
			type: "scatter",
			mode: "lines+markers",
			marker: { color: "blue", size: 3 },
		};
		let layout = {
			title: "ETH/USD",
			xaxis: {
				// title: "Time",
				showgrid: true,
			},
			yaxis: {
				// title: "USD",
				showline: true,
			},
		};
		let series = [trace];
		Plotly.plot("chart", series, layout);
	};

	const updateInfo = (data) => {
		let priceValues = [];
		data.price.forEach((p) => {
			priceValues.push(parseFloat(p));
		});
		let min = Math.min.apply(Math, priceValues);
		let max = Math.max.apply(Math, priceValues);
		setFluctuation((((max - min) / min) * 100).toFixed(2));
		setLatestPrice(parseFloat(data.price[data.price.length - 1]).toFixed(2));
	};

	const updateChart = (data, trend) => {
		/**
		 ** The returned Promise [array] object may not be resolved  so we need to explicitly resolve them
		 ** Source: https://stackoverflow.com/a/56851570/183846
		 */
		let style = {
			// Convert to client time
			x: [data.index.map((t) => new Date(t))],
			y: [data.price],
			marker: { color: trend ? "green" : "pink", size: 3 },
		};
		Plotly.restyle("chart", style);
		updateInfo(data);
	};

	return (
		<div className='App mx-3'>
			{loading ? (
				<h6 className='value animate__animated animate__flash animate__slow text-center'> loading ...</h6>
			) : (
				<>
					<div className='row align-items-start'>
						<div className='cold-sm-6 col-md-10'>
							<Stats upTrend={upTrend} fluctuation={fluctuation} latestPrice={latestPrice} />
							<div id='chart' className='p-0 m-0'></div>
						</div>
						<div className='col-sm-6 col-md-2'>
							<div className='animate__animated animate__fadeIn me-3 border-0'>
								<div className='card-body text-center'>
									<h4 className='card-title text-info'>News</h4>
								</div>
							</div>
						</div>
					</div>
				</>
			)}
		</div>
	);
};

// import App from "./App";

ReactDOM.render(
	<React.StrictMode>
		<App />
	</React.StrictMode>,
	document.getElementById("root")
);
