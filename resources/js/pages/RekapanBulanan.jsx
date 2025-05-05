import React from "react";
import NavbarBaru from '../components/NavbarBaru'; 
import { SimpleFooter } from "../components/SimpleFooter";

function RekapanBulanan() {
    return (
        <div className="relative">
            <div className="relative z-20">
                <NavbarBaru />
            </div>
            <div className="relative z-10">
                <SimpleFooter />
            </div>
        </div>
    )
}

export default RekapanBulanan;