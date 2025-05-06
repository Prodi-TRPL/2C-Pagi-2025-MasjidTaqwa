import React from "react";
import NavbarBaru from '../components/NavbarBaru'; 
import HubungiContentReminder from "../components/HubungiContentReminder";
import HeroSectionHubungi from "../components/HeroSectionHubungi";
import ContactSectionForm from "../components/ContactSectionForm";
import { SimpleFooter } from "../components/SimpleFooter";

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