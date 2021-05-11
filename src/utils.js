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

const fadeIn = (elm) => {
	elm.classList.add("animate__fadeIn", "animate__slow");
	elm.addEventListener("animationend", () => elm.classList.remove("animate__fadeIn", "animate__slow"));
};

export { callAPI, fadeIn };
