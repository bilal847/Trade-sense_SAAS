import React from 'react';

const Hero3D = () => {
    return (
        <div className="w-full h-full absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
            <div className="w-full h-full absolute inset-0 bg-gradient-to-br from-blue-900/10 to-purple-900/10" />

            {/* Animated Glow Effects */}
            <div className="animate-pulse-glow absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl opacity-50" />
            <div className="animate-pulse-glow absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl opacity-50" style={{ animationDelay: '1s' }} />

            {/* Decorative Grid/Lines (CSS only) */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        </div>
    );
};

export default Hero3D;
