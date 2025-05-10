export default function Sidebar() {
    return (
        <aside className="w-64 h-screen bg-white shadow-md p-6 fixed left-0 top-0">
            <div className="mb-8 font-bold text-lg">Eco Zense</div>
            <nav className="space-y-4">
            <a href="#" className="block text-gray-700">🏠 Beranda</a>
            <a href="#" className="block text-gray-700">📍 Alamat</a>
            <a href="#" className="block text-gray-700">🛒 Toko</a>
            <a href="#" className="block text-gray-700">📦 Pesanan</a>
            <a href="#" className="block text-gray-700">💎 Poin</a>
            </nav>
            <div className="absolute bottom-6 left-6 text-red-500">
            <button>Logout</button>
            </div>
        </aside>
        );
    }
