import React from 'react';

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center z-50">
      <div className="text-center">
        {/* Logo Container with Animation */}
        <div className="mb-6 flex justify-center">
          <div className="relative">
            {/* Animated Circle Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full opacity-20 animate-pulse"></div>
            
            {/* Logo */}
            <div className="relative bg-white rounded-full p-8 shadow-2xl">
              <img 
                src="/logo.png" 
                alt="Yükleniyor" 
                className="w-24 h-24 object-contain"
                onError={(e) => {
                  // Logo yüklenemezse fallback icon göster
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
              <div className="hidden items-center justify-center w-24 h-24 bg-blue-600 rounded-full text-white text-4xl font-bold">
                E
              </div>
            </div>

            {/* Rotating Ring */}
            <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        </div>

        {/* Company Name */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            ESF YAPI & İNŞAAT
          </h1>
          
          {/* Loading Dots */}
          <div className="flex justify-center space-x-2 mt-4">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;