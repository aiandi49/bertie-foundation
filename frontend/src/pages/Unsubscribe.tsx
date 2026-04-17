import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { useParams, useLocation } from 'react-router-dom';

const UnsubscribePage = () => {
    const { status } = useParams();
    const location = useLocation();
    const query = new URLSearchParams(location.search);
    const message = query.get('message') || 'You have been successfully unsubscribed.';

    const isSuccess = status === 'success';

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 p-4">
            <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg text-center">
                {isSuccess ? (
                    <CheckCircle className="w-16 h-16 mx-auto text-green-500" />
                ) : (
                    <XCircle className="w-16 h-16 mx-auto text-red-500" />
                )}
                <h1 className={`text-3xl font-bold ${isSuccess ? 'text-green-600' : 'text-red-600'}`}>
                    {isSuccess ? 'Unsubscribed!' : 'An Error Occurred'}
                </h1>
                <p className="text-lg">
                    {message}
                </p>
                <a
                    href="/"
                    className="inline-block px-6 py-3 mt-4 text-lg font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
                >
                    Return to Home
                </a>
            </div>
        </div>
    );
};

export default UnsubscribePage;
