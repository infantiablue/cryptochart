const callAPI = async (url) => {
	let response = await fetch(url, {
		headers: {
			"Content-Type": "application/json",
		},
	});
	if (!response.ok) {
		const message = `An error has occured: ${response.status}`;
		throw new Error(message);
	}
	return response.json();
};

export { callAPI };
