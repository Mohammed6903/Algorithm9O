"use client";

import React, { useState } from 'react';
import Class from './Class';

const ButtonComponent: React.FC = () => {
    const [isUploadFormVisible, setIsUploadFormVisible] = useState<boolean>(false);
    
    const toggleUploadForm = (): void => {
        setIsUploadFormVisible(!isUploadFormVisible);
    };
    
    return (
        <div className='flex flex-col max-w-sm'> {/* Reduced max width */}
            <header className="flex justify-between items-center py-0.5 px-2 bg-gray-800 text-white h-8 rounded">
                <h1 className="text-xs font-medium">To upload a file</h1>
                <button
                    onClick={toggleUploadForm}
                    className="bg-blue-500 hover:bg-blue-600 text-white text-xs py-0.5 px-2 rounded-sm transition-colors"
                >
                    Upload File
                </button>
            </header>
            
            {isUploadFormVisible && (
                <div className="mt-1">
                    <Class />
                </div>
            )}
        </div>
    );
};

export default ButtonComponent;