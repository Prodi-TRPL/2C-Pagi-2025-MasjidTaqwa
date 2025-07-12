import { Home, Info, BarChart2, Phone, Star, Calendar, Users } from "lucide-react";

/* Menu data: Adapted from old Navbar.jsx for NavbarBaru.jsx with icons */
export const Menus = [
    {
        name: "Beranda",
        link: "/",
        icon: Home,
    },
    {
        name: "Informasi",
        icon: Info,
        subMenu: [
            {
                name: "Tentang",
                link: "/#tentang",
                icon: Info,
            },
            {
                name: "Keunggulan",
                link: "/#keunggulan",
                icon: Star,
            },
            {
                name: "Hubungi",
                link: "/#hubungi",
                icon: Phone,
            },
        ],
    },
    {
        name: "Transparansi",
        icon: BarChart2,
        subMenu: [
            {
                name: "Rekapan Bulanan",
                link: "/rekapanbulanan",
                icon: Calendar,
            },
            {
                name: "Rekapan Donatur",
                link: "/rekapandonatur",
                icon: Users,
            },
            {
                name: "Distribusi Dana dan Proyek",
                link: "/distribusi-dana-proyek",
                icon: BarChart2,
            },
        ],
    },
];
