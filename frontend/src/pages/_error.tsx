import Link from 'next/link';

function Error({ statusCode }: { statusCode: number }) {
    return (
        <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center px-4 text-center">
            <h1 className="text-6xl font-extrabold text-red-500 mb-4">
                {statusCode ? `Error ${statusCode}` : 'Client Error'}
            </h1>
            <p className="text-2xl text-white mb-8">
                {statusCode
                    ? 'A server-side error occurred'
                    : 'An error occurred on client'}
            </p>

            <p className="text-gray-400 mb-8 max-w-md">
                Our systems have encountered an unexpected volatility interrupt. We are working to restore market access.
            </p>

            <Link href="/" className="px-6 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white rounded font-medium transition-colors">
                Back to Safety
            </Link>
        </div>
    );
}

Error.getInitialProps = ({ res, err }: any) => {
    const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
    return { statusCode };
};

export default Error;
