import React from "react";
import NavbarBaru from '../components/NavbarBaru'; 
import HubungiContentReminder from "../components/HubungiContentReminder";
import { SimpleFooter } from "../components/SimpleFooter";

function Hubungi() {
    return (
        <div className="relative">
            <div className="relative z-20">
                <NavbarBaru />
            </div>
            <div className="relative z-10">
                <HubungiContentReminder />
            </div>
            <div className="relative z-10">
                <SimpleFooter />
            </div>
        </div>
    )
}

export default Hubungi;