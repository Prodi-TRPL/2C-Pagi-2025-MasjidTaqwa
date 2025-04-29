import React from "react";

function HomeContentContact() {
    return (
        <section className="flex flex-col md:flex-row items-center justify-center gap-10 p-6 md:p-16 bg-white">
        {/* Image section with overlapping elements */}
        <div className="relative w-full md:w-1/2 flex justify-center items-center">
            {/* Base image */}
            <img
            src="/img/contact-image.jpg"
            alt="Elderly Man"
            className="w-72 h-auto rounded-md shadow-md"
            />

            {/* Overlapping layout with devices */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-8 w-52 md:w-60">
            <img
                src="/img/devices.png"
                alt="Devices"
                className="w-full h-auto"
            />
            </div>
        </div>

        {/* Text and contact info section */}
        <div className="w-full md:w-1/2 space-y-6">
            <h2 className="text-green-600 font-bold text-sm">SIDONTAQ</h2>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Dukung Pembangunan Masjid
            <br />
            Dengan Donasi Mudah Dan Transparan
            </h1>
            <ul className="space-y-2 text-gray-700">
            <li>✅ Salurkan donasi dengan aman dan real-time.</li>
            <li>✅ Pantau perkembangan pembangunan secara langsung.</li>
            <li>✅ Donasi mudah melalui aplikasi, di mana pun dan kapan pun.</li>
            <li>✅ Investasi kebaikan yang terus mengalir bagi umat.</li>
            </ul>
            <div className="flex items-center text-green-600 text-xl font-semibold mt-4">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
            >
                <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 5h2l3.6 7.59-1.35 2.44a11.05 11.05 0 005.4 5.4l2.44-1.35L19 19v2a2 2 0 01-2 2H5a2 2 0 01-2-2V5z"
                />
            </svg>
            +62 895-3712-88838
            </div>
        </div>
        </section>
    );
}

export default HomeContentContact;
