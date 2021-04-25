import React, { useState, useEffect } from "react";
import callAPI from "../utils";

const News = ({ latestPrice }) => {
	const [tweets, setTweets] = useState([]);
	useEffect(async () => {
		let news = [];
		let result = await callAPI("https://us-central1-techika.cloudfunctions.net/news");

		for (const [key, value] of Object.entries(result.data)) {
			news.push(value.text);
		}
		setTweets(news);
	}, [latestPrice]);

	return (
		<ul className='list-group list-group-flush'>
			{tweets.map((value, index) => {
				return (
					<li className='list-group-item' key={index}>
						{value}
					</li>
				);
			})}
		</ul>
	);
};
export default News;
