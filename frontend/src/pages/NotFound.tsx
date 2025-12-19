
import { Link } from 'react-router-dom';
import { Home, AlertTriangle } from 'lucide-react';

const NotFound = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
            <div className="text-center space-y-6">
                <div className="flex justify-center">
                    <AlertTriangle className="h-24 w-24 text-indigo-500" />
                </div>
                <h1 className="text-9xl font-extrabold text-white tracking-widest">404</h1>
                <div className="bg-indigo-500 px-2 text-sm rounded rotate-12 absolute">
                    Page Not Found
                </div>
                <p className="text-2xl text-gray-300 font-semibold mt-4">Sorry, we couldn't find that page.</p>
                <div className="mt-8">
                    <Link
                        to="/"
                        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-all duration-200 transform hover:scale-105"
                    >
                        <Home className="w-5 h-5 mr-2" />
                        Go Home
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
