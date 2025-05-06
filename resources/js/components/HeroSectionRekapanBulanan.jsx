import React from 'react';

const HeroSectionRekapanBulanan = ({
    title = 'Rekapan Bulanan',
}) => {
    return (
        <div className="bg-[#59B997]">
        <div className="mx-auto max-w-3xl px-3 py-6 text-center md:py-11">
            <h1 className="text-3xl font-semibold leading-tight text-white md:text-[40px]">
            {title}
            </h1>
        </div>
        </div>
    );
};

export default HeroSectionRekapanBulanan;
