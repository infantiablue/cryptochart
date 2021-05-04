import React, { useEffect } from "react";

const Error = ({ message }) => {
	useEffect(() => {}, []);
	return (
		<div className='alert alert-danger' role='alert'>
			{message}
			<br />
			Please try to <a href='/'>reload this page.</a>
		</div>
	);
};

export default Error;
