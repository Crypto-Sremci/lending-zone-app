import React from 'react';

const Header = () => {
    return (
        <header className="bg-gray-900">
            <div className="container mx-auto flex items-center">
                <img src="logo.png" alt="Logo" className="h-20 w-20 mr-2 my-1 border border-black" />
                <h1 className="text-white text-xl">Lending Zone</h1>
            </div>
        </header>
    );
};

export default Header;
