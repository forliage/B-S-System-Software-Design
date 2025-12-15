import React, { useContext, useState } from 'react';
import ThemeContext from '../context/ThemeContext';
import { Settings, X, Palette, Droplets } from 'lucide-react';

const ThemeSettings = () => {
    const { themeColor, changeThemeColor, isGlass, toggleGlass } = useContext(ThemeContext);
    const [isOpen, setIsOpen] = useState(false);

    const colors = [
        { name: 'blue', value: 'bg-blue-500', label: 'Ocean Blue' },
        { name: 'purple', value: 'bg-purple-500', label: 'Royal Purple' },
        { name: 'rose', value: 'bg-rose-500', label: 'Sunset Rose' },
        { name: 'emerald', value: 'bg-emerald-500', label: 'Forest Green' },
        { name: 'amber', value: 'bg-amber-500', label: 'Warm Amber' },
        { name: 'cyan', value: 'bg-cyan-500', label: 'Electric Cyan' },
    ];

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-2 rounded-full transition-all duration-300 ${isGlass ? 'bg-white/50 text-gray-800' : 'text-gray-600 hover:bg-gray-100'}`}
                title="Theme Settings"
            >
                <Settings className={`w-6 h-6 ${isOpen ? 'rotate-90' : ''} transition-transform`} />
            </button>

            {isOpen && (
                <div className={`absolute right-0 mt-2 w-72 p-4 rounded-2xl z-50 ${isGlass
                        ? 'backdrop-blur-xl bg-white/80 border border-white/40 shadow-2xl'
                        : 'bg-white shadow-xl border border-gray-100'
                    }`}>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                            <Palette className="w-4 h-4" /> Theme Style
                        </h3>
                        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Color Picker */}
                    <div className="mb-6">
                        <p className="text-sm text-gray-500 mb-3 font-medium">Primary Color</p>
                        <div className="grid grid-cols-6 gap-2">
                            {colors.map((c) => (
                                <button
                                    key={c.name}
                                    onClick={() => changeThemeColor(c.name)}
                                    title={c.label}
                                    className={`w-8 h-8 rounded-full ${c.value} transition-transform hover:scale-110 flex items-center justify-center ${themeColor === c.name ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''
                                        }`}
                                >
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Liquid Glass Toggle */}
                    <div className="mb-2">
                        <p className="text-sm text-gray-500 mb-3 font-medium flex items-center gap-2">
                            <Droplets className="w-4 h-4" /> Effects
                        </p>
                        <label className="flex items-center justify-between cursor-pointer group">
                            <span className="text-gray-700 font-medium">Liquid Glass</span>
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    className="sr-only"
                                    checked={isGlass}
                                    onChange={toggleGlass}
                                />
                                <div className={`block w-14 h-8 rounded-full transition-colors duration-300 ${isGlass ? `bg-${themeColor}-500` : 'bg-gray-200'
                                    }`}></div>
                                <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform duration-300 ${isGlass ? 'transform translate-x-6' : ''
                                    }`}></div>
                            </div>
                        </label>
                        <p className="text-xs text-gray-400 mt-2">
                            Enables translucent iOS-style glassmorphism effects.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ThemeSettings;
