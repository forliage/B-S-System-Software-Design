import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import ThemeContext from '../context/ThemeContext';
import { Upload, LogOut, User, Search, Home as HomeIcon } from 'lucide-react';
import ThemeSettings from './ThemeSettings';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const { themeColor, getGlassClasses } = useContext(ThemeContext);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/?keyword=${searchTerm}`);
        } else {
            navigate('/');
        }
    };

    return (
        <nav className={`transition-all duration-300 ${getGlassClasses()} sticky top-0 z-50`}>
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center py-4">
                    <Link to="/" className={`text-2xl font-bold text-${themeColor}-600 dark:text-${themeColor}-400 flex items-center gap-2`}>
                        <HomeIcon /> PhotoSite
                    </Link>

                    <form onSubmit={handleSearch} className="flex-1 max-w-md mx-4">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search photos..."
                                className="w-full pl-10 pr-4 py-2 border rounded-full bg-gray-100 dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
                        </div>
                    </form>

                    <div className="flex items-center gap-4">
                        {user ? (
                            <>
                                <Link to="/upload" className="flex items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-blue-500">
                                    <Upload className="w-5 h-5" /> <span className="hidden md:inline">Upload</span>
                                </Link>
                                <Link to="/profile" className="flex items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-blue-500">
                                    <User className="w-5 h-5" /> <span className="hidden md:inline">Profile</span>
                                </Link>
                                <button onClick={logout} className="flex items-center gap-1 text-red-500 hover:text-red-600">
                                    <LogOut className="w-5 h-5" /> <span className="hidden md:inline">Exit</span>
                                </button>
                            </>
                        ) : (
                            <div className="flex gap-4">
                                <Link to="/login" className="text-gray-600 dark:text-gray-300 hover:text-blue-500">Login</Link>
                                <Link to="/register" className={`bg-${themeColor}-500 hover:bg-${themeColor}-600 text-white px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all`}>Register</Link>
                            </div>
                        )}
                        <ThemeSettings />
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
