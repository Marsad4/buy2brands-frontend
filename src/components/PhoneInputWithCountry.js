import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Common country codes
const countries = [
    { code: 'GB', name: 'United Kingdom', dial_code: '+44', flag: '🇬🇧' },
    { code: 'US', name: 'United States', dial_code: '+1', flag: '🇺🇸' },
    { code: 'PK', name: 'Pakistan', dial_code: '+92', flag: '🇵🇰' },
    { code: 'IN', name: 'India', dial_code: '+91', flag: '🇮🇳' },
    { code: 'CA', name: 'Canada', dial_code: '+1', flag: '🇨🇦' },
    { code: 'AU', name: 'Australia', dial_code: '+61', flag: '🇦🇺' },
    { code: 'DE', name: 'Germany', dial_code: '+49', flag: '🇩🇪' },
    { code: 'FR', name: 'France', dial_code: '+33', flag: '🇫🇷' },
    { code: 'IT', name: 'Italy', dial_code: '+39', flag: '🇮🇹' },
    { code: 'ES', name: 'Spain', dial_code: '+34', flag: '🇪🇸' },
    { code: 'NL', name: 'Netherlands', dial_code: '+31', flag: '🇳🇱' },
    { code: 'AE', name: 'United Arab Emirates', dial_code: '+971', flag: '🇦🇪' },
    { code: 'SA', name: 'Saudi Arabia', dial_code: '+966', flag: '🇸🇦' },
    { code: 'CN', name: 'China', dial_code: '+86', flag: '🇨🇳' },
    { code: 'JP', name: 'Japan', dial_code: '+81', flag: '🇯🇵' },
    { code: 'BR', name: 'Brazil', dial_code: '+55', flag: '🇧🇷' },
    { code: 'MX', name: 'Mexico', dial_code: '+52', flag: '🇲🇽' },
    { code: 'ZA', name: 'South Africa', dial_code: '+27', flag: '🇿🇦' },
    { code: 'TR', name: 'Turkey', dial_code: '+90', flag: '🇹🇷' },
    // Add more as needed
].sort((a, b) => a.name.localeCompare(b.name));

const PhoneInputWithCountry = ({
    name,
    value,
    onChange,
    label = "Phone Number",
    required = false,
    placeholder = "123 456 7890",
    error
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState(countries[0]);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const dropdownRef = useRef(null);

    // Initialize from prop value if provided
    useEffect(() => {
        if (value) {
            // Try to detect country code
            const country = countries.find(c => value.startsWith(c.dial_code));
            if (country) {
                setSelectedCountry(country);
                // Remove dial code and trim
                setPhoneNumber(value.slice(country.dial_code.length).trim());
            } else {
                // Determine if value looks like a number without code or just use defaults
                setPhoneNumber(value);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only runs on mount

    const triggerChange = (newCountry, newNumber) => {
        const fullNumber = `${newCountry.dial_code} ${newNumber}`;
        const event = {
            target: {
                name,
                value: newNumber ? fullNumber : ''
            }
        };
        onChange(event);
    };

    const handleCountryChange = (country) => {
        setSelectedCountry(country);
        triggerChange(country, phoneNumber);
    };

    const handleNumberChange = (e) => {
        const val = e.target.value.replace(/[^\d\s-]/g, '');
        setPhoneNumber(val);
        triggerChange(selectedCountry, val);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredCountries = countries.filter(country =>
        country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        country.dial_code.includes(searchQuery) ||
        country.code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="relative">
            {label && (
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}

            <div className="flex relative">
                {/* Country Code Selector */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        type="button"
                        onClick={() => setIsOpen(!isOpen)}
                        className={`flex items-center gap-2 px-3 py-3 border-2 border-r-0 rounded-l-xl bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors ${error ? 'border-red-300' : 'border-gray-200'}`}
                    >
                        <span className="text-lg">{selectedCountry.flag}</span>
                        <span className="text-sm font-semibold">{selectedCountry.dial_code}</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                        {isOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute top-full left-0 mt-1 w-72 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden"
                            >
                                {/* Search */}
                                <div className="p-2 border-b border-gray-100 bg-gray-50 sticky top-0">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Search country..."
                                            className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                {/* List */}
                                <div className="max-h-60 overflow-y-auto">
                                    {filteredCountries.length > 0 ? (
                                        filteredCountries.map((country) => (
                                            <button
                                                type="button"
                                                key={country.code}
                                                onClick={() => {
                                                    handleCountryChange(country);
                                                    setIsOpen(false);
                                                    setSearchQuery('');
                                                }}
                                                className={`w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-blue-50 transition-colors ${selectedCountry.code === country.code ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                                                    }`}
                                            >
                                                <span className="text-xl">{country.flag}</span>
                                                <span className="flex-1 text-sm">{country.name}</span>
                                                <span className="text-sm text-gray-400 font-mono">{country.dial_code}</span>
                                            </button>
                                        ))
                                    ) : (
                                        <div className="p-4 text-center text-sm text-gray-500">
                                            No countries found
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Phone Input */}
                <input
                    type="tel"
                    name={name}
                    value={phoneNumber}
                    onChange={handleNumberChange}
                    className={`flex-1 min-w-0 px-4 py-3 border-2 rounded-r-xl focus:ring-2 focus:ring-uk-navy-500 focus:border-uk-navy-500 transition-all ${error ? 'border-red-300' : 'border-gray-200'
                        }`}
                    placeholder={placeholder}
                    required={required}
                />
            </div>
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>
    );
};

export default PhoneInputWithCountry;
