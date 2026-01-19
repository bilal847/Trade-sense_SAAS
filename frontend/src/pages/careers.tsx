import React from 'react';
import Head from 'next/head';
import { Briefcase, Code, Terminal, TrendingUp, ArrowRight } from 'lucide-react';

const jobs = [
    {
        id: 1,
        title: 'Senior Quantitative Researcher',
        department: 'Quant Research',
        location: 'Casablanca (Remote Hybrid)',
        type: 'Full-time',
        icon: TrendingUp,
        color: 'purple'
    },
    {
        id: 2,
        title: 'Frontend Engineer (React/Next.js)',
        department: 'Technology',
        location: 'Remote',
        type: 'Contract',
        icon: Code,
        color: 'blue'
    },
    {
        id: 3,
        title: 'High-Frequency Systems Engineer',
        department: 'Technology',
        location: 'London, UK',
        type: 'Full-time',
        icon: Terminal,
        color: 'emerald'
    },
    {
        id: 4,
        title: 'Risk Manager',
        department: 'Operations',
        location: 'Casablanca',
        type: 'Full-time',
        icon: Briefcase,
        color: 'rose'
    }
];

export default function Careers() {
    return (
        <>
            <Head>
                <title>Careers - TradeSense Quant</title>
            </Head>

            <div className="min-h-screen pt-32 pb-20 px-6 container mx-auto">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <span className="text-blue-400 font-bold tracking-widest uppercase text-sm mb-4 block">Join the Revolution</span>
                    <h1 className="text-4xl md:text-6xl font-bold mb-6">
                        Build the Future of <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Algorithmic Trading</span>
                    </h1>
                    <p className="text-xl text-slate-400">
                        We are looking for world-class talent to solve hard problems in finance and technology.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
                    {jobs.map((job) => (
                        <div key={job.id} className="glass p-8 rounded-2xl hover:border-blue-500/50 transition-all group cursor-pointer hover:-translate-y-1">
                            <div className="flex justify-between items-start mb-6">
                                <div className={`w-12 h-12 rounded-xl bg-${job.color}-500/10 flex items-center justify-center text-${job.color}-400`}>
                                    <job.icon className="w-6 h-6" />
                                </div>
                                <span className="px-3 py-1 bg-slate-800 rounded-full text-xs font-bold text-slate-400 uppercase tracking-wide">
                                    {job.type}
                                </span>
                            </div>
                            <h3 className="text-xl font-bold mb-2 group-hover:text-blue-400 transition-colors">{job.title}</h3>
                            <div className="flex items-center text-slate-500 text-sm mb-6 space-x-4">
                                <span>{job.department}</span>
                                <span className="w-1 h-1 bg-slate-700 rounded-full" />
                                <span>{job.location}</span>
                            </div>
                            <div className="flex items-center text-blue-400 font-bold text-sm">
                                Apply Now
                                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-20 text-center">
                    <p className="text-slate-500">
                        Don't see your role? Email us at <a href="mailto:careers@tradesense.com" className="text-white hover:underline">careers@tradesense.com</a>
                    </p>
                </div>
            </div>
        </>
    );
}
