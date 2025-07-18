import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';

const ProjectsSection = ({ proyeks, loading, formatCurrency, scrollRef }) => {
  return (
    <div className="bg-[#59B997] py-16">
      <div className="max-w-7xl mx-auto px-5 lg:px-15">
        <div className="mb-10 flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Proyek Pembangunan</h2>
            <p className="text-white">Proyek pembangunan masjid yang sedang berjalan</p>
          </div>
          <Link 
            to="/distribusi-dana-proyek" 
            className="text-white font-medium flex items-center group bg-[#3a9b7d] px-4 py-2 rounded-full border border-transparent transition-colors duration-300 hover:bg-white hover:border-[#59B997] hover:text-[#59B997]"
          >
            Lihat Semua
            <FontAwesomeIcon 
              icon={faArrowRight} 
              className="ml-2 transform group-hover:translate-x-1 transition-transform duration-300 group-hover:text-[#59B997]" 
            />
          </Link>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
          </div>
        ) : (
          <div className="relative">
            <div 
              ref={scrollRef}
              className="flex overflow-x-auto pb-6 custom-scrollbar snap-x snap-mandatory cursor-grab active:cursor-grabbing"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              {proyeks
                // Include all projects and sort by progress from highest to lowest
                .sort((a, b) => b.progress - a.progress)
                .slice(0, Math.min(5, proyeks.length))
                .map((proyek) => (
                  <div 
                    key={proyek.proyek_id} 
                    className="min-w-[300px] max-w-[300px] mr-6 flex-shrink-0 snap-start"
                    onContextMenu={(e) => e.preventDefault()} // Prevent right-click menu
                    style={{ userSelect: 'none' }} // Prevent text selection
                  >
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden h-full flex flex-col">
                      {/* Project Image */}
                      <div className="h-40 w-full overflow-hidden">
                        <img 
                          src={proyek.gambar ? `/storage/${proyek.gambar}` : '/img/logo-app.jpg'} 
                          alt={proyek.nama_item} 
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.target.src = '/img/logo-app.jpg';
                          }}
                          draggable="false" // Prevent image dragging
                          style={{ WebkitUserDrag: 'none', userSelect: 'none' }} // Additional protections
                        />
                      </div>
                      
                      {/* Project Details */}
                      <div className="p-5 flex-grow flex flex-col" style={{ userSelect: 'none' }}>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-1">{proyek.nama_item}</h3>
                        <p className="text-gray-600 mb-4 text-sm line-clamp-2 flex-grow">{proyek.deskripsi}</p>
                        
                        {/* Progress Bar */}
                        <div className="mt-auto">
                          <div className="flex justify-between text-xs text-gray-600 mb-1">
                            <span>Progress Pendanaan</span>
                            <span>{proyek.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                proyek.progress >= 100 ? 'bg-green-500' : 'bg-[#59B997]'
                              }`}
                              style={{ width: `${proyek.progress}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between mt-2 text-xs text-gray-500">
                            <span>Target: {formatCurrency(proyek.target_dana)}</span>
                            <span>Terkumpul: {formatCurrency(proyek.totalExpense)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              
             {/* "See More" card at the end */}
            <div
              className="min-w-[300px] max-w-[300px] mr-6 flex-shrink-0 snap-start rounded-xl shadow-sm overflow-hidden flex items-center justify-center bg-gradient-to-br from-[#59B997] to-[#3a9b7d] transition-all duration-300"
              style={{ userSelect: 'none' }}
              onContextMenu={(e) => e.preventDefault()}
            >
              <Link
                to="/distribusi-dana-proyek"
                className="p-8 text-center w-full h-full flex flex-col items-center justify-center group"
              >
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-4 group-hover:bg-white transition-all duration-300">
                  <FontAwesomeIcon
                    icon={faArrowRight}
                    className="text-white text-2xl group-hover:text-[#59B997] transition-all duration-300"
                  />
                </div>
                <h3 className="text-white font-bold text-xl mb-2 transition-all duration-300">
                  Lihat Selengkapnya
                </h3>
                <p className="text-white/80 text-sm transition-all duration-300">
                  Temukan lebih banyak proyek pembangunan masjid
                </p>
              </Link>
            </div>
            </div>
          </div>
        )}
        
        {/* Mobile "See More" button */}
        <div className="mt-8 text-center md:hidden">
          <Link 
            to="/distribusi-dana-proyek" 
            className="inline-block px-6 py-3 bg-[#3a9b7d] hover:bg-[#349272] text-white font-medium rounded-lg transition-colors"
          >
            Lihat Semua Proyek
          </Link>
        </div>
      </div>

      {/* Custom scrollbar styles */}
      <style jsx>{`
        /* Custom scrollbar for Webkit browsers (Chrome, Safari, newer Edge) */
        .custom-scrollbar::-webkit-scrollbar {
          height: 6px;
          width: auto;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.6);
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.8);
        }

        /* For Firefox */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.6) rgba(255, 255, 255, 0.2);
        }
        
        /* Non-selectable content */
        img {
          -webkit-user-drag: none;
          -khtml-user-drag: none;
          -moz-user-drag: none;
          -o-user-drag: none;
          user-drag: none;
        }
      `}</style>
    </div>
  );
};

export default ProjectsSection; 