import React from 'react';
import Head from 'next/head';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

export default function Contact() {
    const { t } = useTranslation();

    return (
        <>
            <Head>
                <title>Contact Us - TradeSense Quant</title>
            </Head>

            <div className="min-h-screen pt-32 pb-20 px-6 container mx-auto">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-16">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                            Get in Touch
                        </h1>
                        <p className="text-xl text-slate-400">
                            Have questions about our Prop Firm challenges or Enterprise solutions?
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {/* Contact Info */}
                        <div className="space-y-8">
                            <div className="glass p-8 rounded-2xl">
                                <h3 className="text-xl font-bold mb-6 flex items-center">
                                    <Mail className="w-5 h-5 mr-3 text-blue-400" />
                                    Email Support
                                </h3>
                                <p className="text-slate-400 mb-2">General Inquiries</p>
                                <a href="mailto:support@tradesense.com" className="text-lg font-medium hover:text-blue-400 transition-colors">hello@tradesense.com</a>

                                <div className="h-px bg-slate-700/50 my-6" />

                                <p className="text-slate-400 mb-2">Enterprise Sales</p>
                                <a href="mailto:sales@tradesense.com" className="text-lg font-medium hover:text-blue-400 transition-colors">sales@tradesense.com</a>
                            </div>

                            <div className="glass p-8 rounded-2xl">
                                <h3 className="text-xl font-bold mb-6 flex items-center">
                                    <MapPin className="w-5 h-5 mr-3 text-purple-400" />
                                    Global HQs
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <span className="block font-bold text-white">Casablanca, Morocco</span>
                                        <span className="text-slate-400 text-sm">Technopark, Route de Nouaceur</span>
                                    </div>
                                    <div>
                                        <span className="block font-bold text-white">London, UK</span>
                                        <span className="text-slate-400 text-sm">Canary Wharf, Level 39</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="glass p-8 rounded-2xl border-t-4 border-blue-500">
                            <h2 className="text-2xl font-bold mb-6">Send us a message</h2>
                            <form className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">Full Name</label>
                                    <input type="text" className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors" placeholder="John Doe" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">Email Address</label>
                                    <input type="email" className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors" placeholder="john@example.com" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">Subject</label>
                                    <select className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors">
                                        <option>General Inquiry</option>
                                        <option>Prop Challenge Support</option>
                                        <option>Technical Issue</option>
                                        <option>Partnership</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">Message</label>
                                    <textarea rows={4} className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors" placeholder="How can we help you?" />
                                </div>
                                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center group">
                                    Send Message
                                    <Send className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
