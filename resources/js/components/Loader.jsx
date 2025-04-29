import { useEffect, useState } from 'react';

export default function loader() {
    const [fadeOut, setFadeOut] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
        setFadeOut(true);
        }, 3000); // 3 detik sebelum fade out

        return () => clearTimeout(timer);
    }, []);

    return (
        <div
        className={`fixed inset-0 bg-white flex items-center justify-center transition-opacity duration-1000 z-50 ${
            fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
        >
        <div className="flex flex-col items-center justify-center">
            <img
            src="/img/logo-app.jpg"
            alt="Logo"
            className="w-24 h-24 animate-pulse"
            />
            <div className="mt-4 text-gray-600 text-sm animate-fadeIn">
            Memuat...
            </div>
        </div>
        </div>
    );
}