import React from "react";
import Navbar from '../components/Navbar'; 
import { SimpleFooter } from "../components/SimpleFooter";

function RekapanBulanan() {
    return (
        <div className="relative">
            <div className="relative z-20">
                <Navbar />
            </div>
            <div className="relative z-10">
                <SimpleFooter />
            </div>
        </div>
    )
}

export default RekapanBulanan;