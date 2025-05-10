import React from "react";
import NavbarBaru from '../components/LandingPage/NavbarBaru'; 
import HubungiContentReminder from "../components/LandingPage/HubungiContentReminder";
import HeroSectionHubungi from "../components/LandingPage/HeroSectionHubungi";
import ContactSectionForm from "../components/LandingPage/ContactSectionForm";
import { SimpleFooter } from "../components/LandingPage/SimpleFooter";

function Hubungi() {
    return (
        <div className="pt-16 relative">
            <div className="relative z-20">
                <NavbarBaru />
            </div>
            <div className="relative z-10">
                <HeroSectionHubungi />             
            </div>
            <div className="relative z-10">
                <ContactSectionForm />
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