import { Outlet } from "react-router";

import Header from "./components/client/header";
import Footer from "./components/client/footer";

const clientLayout = () => {
  return (
    <>
        <Header/>
        <Outlet />
        <Footer/>
    </>
  )
}

export default clientLayout