'use client';

import Link from 'next/link';
import { Twitter, Github, Disc, Linkedin } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="border-t border-gray-200 bg-white pt-20 pb-10">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    {/* Brand */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center text-white font-bold text-xl">
                                B
                            </div>
                            <span className="font-display font-bold text-xl tracking-tight text-black">
                                BrowUser.ai
                            </span>
                        </div>
                        <p className="text-gray-500 text-sm leading-relaxed">
                            The Neural Browser Engine that automates your web tasks with live visual transparency.
                        </p>
                        <div className="flex gap-4">
                            {[Twitter, Github, Disc, Linkedin].map((Icon, i) => (
                                <a
                                    key={i}
                                    href="#"
                                    className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-cyan-electric hover:bg-cyan-electric/10 transition-all"
                                >
                                    <Icon size={18} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Product */}
                    <div>
                        <h4 className="font-bold mb-6 text-black">Product</h4>
                        <ul className="space-y-4 text-sm text-gray-500">
                            <li><a href="#" className="hover:text-cyan-electric transition-colors">Features</a></li>
                            <li><a href="#" className="hover:text-cyan-electric transition-colors">Pricing</a></li>
                            <li><a href="#" className="hover:text-cyan-electric transition-colors">Roadmap</a></li>
                            <li><a href="#" className="hover:text-cyan-electric transition-colors">Changelog</a></li>
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h4 className="font-bold mb-6 text-black">Company</h4>
                        <ul className="space-y-4 text-sm text-gray-500">
                            <li><a href="#" className="hover:text-cyan-electric transition-colors">About</a></li>
                            <li><a href="#" className="hover:text-cyan-electric transition-colors">Blog</a></li>
                            <li><a href="#" className="hover:text-cyan-electric transition-colors">Careers</a></li>
                            <li><a href="#" className="hover:text-cyan-electric transition-colors">Contact</a></li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h4 className="font-bold mb-6 text-black">Legal</h4>
                        <ul className="space-y-4 text-sm text-gray-500">
                            <li><a href="#" className="hover:text-cyan-electric transition-colors">Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-cyan-electric transition-colors">Terms of Service</a></li>
                            <li><a href="#" className="hover:text-cyan-electric transition-colors">Security</a></li>
                            <li><a href="#" className="hover:text-cyan-electric transition-colors">Cookie Policy</a></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
                    <p>© 2025 BrowUser.ai. All rights reserved.</p>
                    <p>Made with ❤️ by Antigravity</p>
                </div>
            </div>
        </footer>
    );
}
