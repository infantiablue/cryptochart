import React from "react";
const Navbar = ({ isOnline, counter }) => (
	<nav className='navbar navbar-expand-lg navbar-light bg-light'>
		<span className='text-capitalize ps-3'>
			<a className='navbar-brand text-primary fw-bold' href='/'>
				<img src='/ico/eth-logo.png' />
			</a>
			<span className='text-muted me-2'>00:{`${counter}`.padStart(2, "0")}</span>
			<i
				className={
					"bi bi-broadcast animate__animated  animate__slower animate__infinite " + (isOnline ? "animate__flash text-success" : " text-danger")
				}
			></i>
		</span>
	</nav>
);

export default Navbar;
