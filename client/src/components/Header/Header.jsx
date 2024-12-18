import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import "./header.css"
import { images } from '../../constants';
import { XMarkIcon, BurgerIcon } from "../../constants/icons"
import axios from 'axios';
import LogoutButton from '../LogoutButton/LogoutButton';
const Header = () => {
    const [isNavbarOpen, setIsNavbarOpen] = useState(false);
    const [user, setUser] = useState(null);
    useEffect(() => {
        const verifyCookie = async () => {
            const { data } = await axios.post("/auth", {}, { withCredentials: true });
            setUser(data);
        };
        verifyCookie();
    }, []);
    const toggleNavbar = () => {
        setIsNavbarOpen(!isNavbarOpen);
    };
    return (
        <>
            <header className={`flex flex-wrap md:justify-start bg-black transition-all md:bg-bg-color md:flex-nowrap z-50 w-full text-sm py-3 md:py-0`}>
                <nav className="relative max-w-[100rem] w-full my-[1%] mx-auto px-4 md:flex md:items-center md:justify-between md:px-6 lg:px-8" aria-label="Global">
                    <div className="flex items-center justify-between">
                        <div className='flex gap-2 items-center'>
                            <Link to={"/"} className="flex-none text-xl font-semibold dark:text-white" aria-current="page">
                                <img src={images.logo} className='hidden md:block h-[40px] md:h-[60px]' alt="jmnid-logo" />
                            </Link>
                            <Link to={"/"} className="block md:hidden flex-none text-xl font-semibold dark:text-white" aria-current="page">
                                <img src={images.mobileLogo} className='h-[40px] md:h-[60px]' alt="jmnid-logo" />
                            </Link>
                        </div>
                        <div className="md:hidden">
                            <button type="button" className="size-9 flex justify-center items-center text-sm font-semibold rounded-lg border border-primary border-2 hover:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none dark:text-white dark:border-gray-700 dark:hover:bg-gray-700 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600" data-hs-collapse="#navbar-collapse-with-animation" aria-controls="navbar-collapse-with-animation" aria-label="Toggle navigation" onClick={toggleNavbar}>
                                {!isNavbarOpen ? <BurgerIcon className="fa-solid fa-bars text-primary" /> : <XMarkIcon className="fa-solid fa-xmark text-primary" />}
                            </button>
                        </div>
                    </div>
                    <div className={`${isNavbarOpen ? "h-full" : "hidden"} transition-all duration-300 basis-full grow md:block `}>
                        <div className="flex flex-col uppercase gap-y-4 gap-x-0 mt-5 md:flex-row md:items-center md:justify-end md:gap-y-0 md:gap-x-7 md:mt-0 md:ps-7">
                            <Link onClick={() => setIsNavbarOpen(!isNavbarOpen)} to={"/"} className="py-3 text-center md:text-xs lg:text-sm text-primary md:text-white md:font-semibold hover:opacity-75 md:focus:text-primary">Home</Link>
                            <Link onClick={() => setIsNavbarOpen(!isNavbarOpen)} to={"/services"} className="py-3 text-center md:text-xs lg:text-sm text-primary md:text-white md:font-semibold hover:opacity-75 md:focus:text-primary">Services</Link>
                            <Link onClick={() => setIsNavbarOpen(!isNavbarOpen)} to={"/gym"} className="py-3 text-center md:text-xs lg:text-sm text-primary md:text-white md:font-semibold hover:opacity-75 md:focus:text-primary">Gym</Link>
                            <Link onClick={() => setIsNavbarOpen(!isNavbarOpen)} to={"/about"} className="py-3 text-center md:text-xs lg:text-sm text-primary md:text-white md:font-semibold hover:opacity-75 md:focus:text-primary" >About Us</Link>
                            <div className='flex gap-2 items-center justify-center border-t md:border-none pt-4 md:pt-0'>
                                {user && user.status ? <LogoutButton /> : <>
                                    <Link onClick={() => setIsNavbarOpen(!isNavbarOpen)} to={"/sign-in"} className={`text-nowrap border-2 border-primary font-semibold text-white md:text-white md:font-semibold rounded-full transition-all hover:opacity-75 py-2 bg-primary-dark text-center px-[20px] md:flex md:items-center md:gap-2`} >Sign In </Link>
                                    <Link onClick={() => setIsNavbarOpen(!isNavbarOpen)} to={"/sign-up"} className={`text-nowrap border-2 border-primary font-semibold text-white md:text-white md:font-semibold rounded-full transition-all hover:opacity-75 py-2 bg-black text-center px-[20px] md:flex md:items-center md:gap-2`} >Sign Up</Link>
                                </>}
                            </div>
                        </div>
                    </div>
                </nav>
            </header>
        </>
    )
}

export default Header