import React, { useEffect } from "react";

const Chart = ({ chartData }) => {
	useEffect(() => {
		updateChart(chartData);
	}, [chartData]);

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
	return <div id='chart' className='p-0 m-0'></div>;
};

export default Chart;
