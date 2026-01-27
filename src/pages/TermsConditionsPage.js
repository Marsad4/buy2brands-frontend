import React from 'react';
import { motion } from 'framer-motion';
import { FileText, AlertCircle, Scale, CheckCircle } from 'lucide-react';

const TermsConditionsPage = () => {
    const lastUpdated = 'January 26, 2026';

    const sections = [
        {
            icon: FileText,
            title: 'Agreement to Terms',
            content: [
                'By accessing our website Buy2Brands, you agree to be bound by these Terms and Conditions and agree that you are responsible for the agreement with any applicable local laws.',
                'If you disagree with any of these terms, you are prohibited from accessing this site.',
                'The materials contained in this Website are protected by copyright and trade mark law.'
            ]
        },
        {
            icon: Scale,
            title: 'Use License',
            content: [
                'Permission is granted to temporarily download one copy of the materials on Buy2Brands\'s Website for personal, non-commercial transitory viewing only.',
                'This is the grant of a license, not a transfer of title, and under this license you may not: modify or copy the materials; use the materials for any commercial purpose or for any public display.',
                'This license shall automatically terminate if you violate any of these restrictions and may be terminated by Buy2Brands at any time.'
            ]
        },
        {
            icon: AlertCircle,
            title: 'Disclaimer',
            content: [
                'All the materials on Buy2Brands\'s Website are provided "as is". Buy2Brands makes no warranties, may it be expressed or implied, therefore negates all other warranties.',
                'Furthermore, Buy2Brands does not make any representations concerning the accuracy or likely results of the use of the materials on its Website or otherwise relating to such materials or on any sites linked to this Website.'
            ]
        },
        {
            icon: CheckCircle,
            title: 'Limitations',
            content: [
                'Buy2Brands or its suppliers will not be hold accountable for any damages that will arise with the use or inability to use the materials on Buy2Brands\'s Website, even if Buy2Brands or an authorize representative of this Website has been notified, orally or written, of the possibility of such damage.',
                'Some jurisdiction does not allow limitations on implied warranties or limitations of liability for incidental damages, these limitations may not apply to you.'
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Section */}
            <section className="bg-uk-navy-500 text-white py-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-uk-navy-600 to-uk-navy-500 opacity-90 z-10" />
                <div
                    className="absolute inset-0 z-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"
                />

                <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-4xl md:text-5xl font-bold mb-6"
                    >
                        Terms & Conditions
                    </motion.h1>
                    <div className="w-24 h-1 bg-uk-red-500 mx-auto mb-6 rounded-full" />
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-xl text-gray-200"
                    >
                        Please read these terms carefully before using our service.
                    </motion.p>
                </div>
            </section>

            {/* Content Section */}
            <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 -mt-10 relative z-30">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden p-8 md:p-12">
                    <div className="text-sm text-gray-500 mb-8 text-center uppercase tracking-wide">
                        Last Updated: {lastUpdated}
                    </div>

                    <div className="prose prose-lg max-w-none text-gray-600">
                        <p className="lead text-lg mb-10 text-center">
                            These terms and conditions outline the rules and regulations for the use of Excelien Sparks's Website, located at Buy2Brands.
                        </p>

                        <div className="grid gap-12">
                            {sections.map((section, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="border-b border-gray-100 last:border-0 pb-8 last:pb-0"
                                >
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-10 h-10 rounded-full bg-uk-red-50 flex items-center justify-center">
                                            <section.icon className="w-5 h-5 text-uk-red-500" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-uk-navy-500 m-0">{section.title}</h2>
                                    </div>
                                    <ul className="space-y-3 list-disc pl-14">
                                        {section.content.map((item, i) => (
                                            <li key={i} className="text-gray-600">{item}</li>
                                        ))}
                                    </ul>
                                </motion.div>
                            ))}
                        </div>

                        <div className="mt-12 bg-gray-50 p-6 rounded-xl border border-gray-200">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Contact Us</h3>
                            <p className="text-gray-600 mb-4">
                                If you have any questions about these Terms and Conditions, please contact us.
                            </p>
                            <div className="text-uk-navy-600 font-medium">
                                Email: info@buy2brands.com
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default TermsConditionsPage;
