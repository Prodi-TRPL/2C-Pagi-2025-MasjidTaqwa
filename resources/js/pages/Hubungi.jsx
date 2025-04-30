import React from "react";
import Navbar from '../components/Navbar'; 
import HubungiContentReminder from "../components/HubungiContentReminder";
import { SimpleFooter } from "../components/SimpleFooter";

function Hubungi() {
    return (
        <div className="relative">
            <div className="relative z-20">
                <Navbar />
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