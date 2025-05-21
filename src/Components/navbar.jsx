import React, { useContext, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import assets from '../assets/assets.js';
import { ShopContext } from "../Context/shopcontext";
import { useAuth } from '../Context/AuthContext';

const Navbar = () => {

const [visible, setVisible] = useState(false);
const {setShowsearch ,getCartCount} = useContext(ShopContext);
const { user, logout } = useAuth();

  return (
    < >
    <div className='flex z-50  items-center justify-between py-5 font-semibold text-md ' 
 >
     <Link to="/"> <img src={assets.logo} alt="Logo" className="w-36" /> </Link>
      <ul className='hidden sm:flex gap-10 text-sm text-gray-700 '>
        <NavLink to='/'>
            <p>Home</p>
            <hr className='bg-gray-700 w-full border-none h-[1.5px] hidden' />
        </NavLink>
        <NavLink to='/collection'>
            <p>Collection</p>
            <hr className='bg-gray-700 w-full border-none h-[1.5px] hidden' />
        </NavLink>
        <NavLink to='/about'>
            <p>About</p>
            <hr className='bg-gray-700 w-full border-none h-[1.5px] hidden' />
        </NavLink>
        <NavLink to='/blog'>
            <p>Blog</p>
            <hr className='bg-gray-700 w-full border-none h-[1.5px] hidden' />
        </NavLink>
        <NavLink to='/contact'>
            <p>Contact</p>
            <hr className='bg-gray-700 w-full border-none h-[1.5px] hidden' />
        </NavLink>
       
      </ul>
      <div className="flex items-center gap-5">
        <img src={assets.search_icon} alt="search" className='w-5 transition-all cursor-pointer' onClick={()=>{setShowsearch(true)}} />
        <div className="relative group">
          <Link to={'/profile'} className='flex items-center gap-2'>
          
<img src={assets.profile_icon} alt="" className='w-5 cursor-pointer'  />
          </Link>
<div className='group-hover:block hidden absolute dropdown-menu right-0 pt-4'>
<div className="flex flex-col gap-2 w-36 py-3 px-5 bg-slate-100 text-grey-500">
  {user ? (
    <>
      <NavLink to={'/profile'} className="flex items-center gap-2 hover:text-black">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
        </svg>
        <p className="cursor-pointer">My Profile</p>
      </NavLink>
      <NavLink to={'/orders'} className="flex items-center gap-2 hover:text-black">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
        </svg>
        <p className="cursor-pointer">Orders</p>
      </NavLink>
      <button
        onClick={logout}
        className="flex items-center gap-2 hover:text-black text-left w-full"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
        </svg>
        <p className="cursor-pointer">Logout</p>
      </button>
    </>
  ) : (
    <>
      <NavLink to={'/register'} className="flex items-center gap-2 hover:text-black">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
        </svg>
        <p className="cursor-pointer">Register</p>
      </NavLink>
      <NavLink to={'/login'} className="flex items-center gap-2 hover:text-black">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        <p className="cursor-pointer">Login</p>
      </NavLink>
    </>
  )}
</div>

</div>
        </div>
<Link to='/cart'>
<img src={assets.cart_icon} alt="Cart Icon"  className=' top-[10px] relative w-5'/>
<p className=' relative bottom-[2px] left-2  text-center leading-4 bg-black text-white items-center aspect-square rounded-full text-[10px]'> <span className=' relative top-[2px]' >
   
   {getCartCount()}
  </span>
    </p>
</Link>


      {/*side Menu For the smaller screen  */}
<img onClick={() => setVisible(true)} src={assets.menu_icon} alt="" className='sm:hidden w-5 cursor-pointer' />
      </div>
      <div className={`absolute top-0 right-0  bottom-0 overflow-hidden bg-white  transition-all ${visible ? 'w-full' : 'w-0'}`}>
       <div className="flex flex-col text-gray-600">
        <div  onClick={() => setVisible(false)} className='flex  items-center gap-4 p-3'>
            <img src={assets.dropdown_icon} alt="Logo" className=" h-4 rotate-180 curser-pointer" style={{cursor: 'pointer'}} />
            <p className='curser-pointer' style={{cursor : 'pointer'}}>Back</p>
        </div>
       </div>
       <div>
        
       </div>
       <div className='flex flex-col'>


       <NavLink onClick={()=>setVisible(false)} className='py-3 pl-6 border uppercase' to='/'>
          Home
        </NavLink>
        <NavLink onClick={()=>setVisible(false)} className='py-3 pl-6 border uppercase' to='/collection'>
          Collection
        </NavLink>
        <NavLink onClick={()=>setVisible(false)} className='py-3 pl-6 border uppercase' to='/About'>
          About
        </NavLink>
        <NavLink onClick={()=>setVisible(false)} className='py-3 pl-6 border uppercase' to='/contact'>
          Contact
        </NavLink>
        {!user && (
          <>
            <NavLink onClick={() => setVisible(false)} className='py-3 pl-6 border uppercase' to='/login'>
              Login
            </NavLink>
            <NavLink onClick={() => setVisible(false)} className='py-3 pl-6 border uppercase' to='/register'>
              Register
            </NavLink>
          </>
        )}
       </div>
      </div>



      </div>
    </>
  );
};

export default Navbar;
