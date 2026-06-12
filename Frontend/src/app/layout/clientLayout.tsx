import { Outlet } from "react-router";

import Header from "../layout/components/client/header";
import Footer from "../layout/components/client/footer";

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