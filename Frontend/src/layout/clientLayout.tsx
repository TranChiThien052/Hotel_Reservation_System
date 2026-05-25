import { NavLink, Outlet } from "react-router";

import Header from "../components/header";

const clientLayout = () => {
  return (
    <>
        <Header/>
        <Outlet />
    </>
  )
}

export default clientLayout