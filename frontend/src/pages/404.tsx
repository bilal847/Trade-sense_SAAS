import Link from 'next/link';

export default function Custom404() {
    return (
        <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center px-4 text-center">
            <h1 className="text-9xl font-extrabold text-gray-800 tracking-widest relative">
                404
                <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                    <span className="text-2xl text-blue-500 font-mono">PAGE_NOT_FOUND</span>
                </div>
            </h1>

            <div className="mt-8 bg-[#FF6A3D] px-2 text-sm rounded rotate-12 absolute">
                Page Not Found
            </div>

            <p className="mt-12 text-gray-400 max-w-lg">
                The market data for this page doesn't exist. It might have been delisted, moved, or never existed in the first place.
            </p>

            <div className="mt-8">
                <Link href="/" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors">
                    Return Home
                </Link>
            </div>
        </div>
    );
}
