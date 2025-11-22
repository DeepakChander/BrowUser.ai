'use client';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/landing/Hero';
import ProblemSection from '@/components/landing/ProblemSection';
import SolutionSection from '@/components/landing/SolutionSection';
import HowItWorks from '@/components/landing/HowItWorks';
import UseCases from '@/components/landing/UseCases';
import Pricing from '@/components/landing/Pricing';
import Link from 'next/link';
import Button from '@/app/components/ui/Button';

export default function Home() {
    return (
        <main className="min-h-screen bg-white text-black selection:bg-cyan-electric/30">
            <Navbar />

            <Hero />
            <ProblemSection />
            <SolutionSection />
            <HowItWorks />
            <UseCases />
            <Pricing />

            {/* Final CTA */}
            <section className="py-32 relative overflow-hidden bg-white">
                <div className="absolute inset-0 bg-gradient-to-t from-cyan-electric/5 to-transparent -z-10" />
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-4xl md:text-6xl font-bold mb-6 text-black">
                        Ready to Automate Your Browser?
                    </h2>
                    <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
                        Join thousands of users saving hours every week.
                    </p>
                    <Link href="/login">
                        <Button variant="primary" size="lg" className="rounded-full px-12 text-lg shadow-xl shadow-cyan-electric/20">
                            Sign In with Google
                        </Button>
                    </Link>
                    <p className="mt-6 text-sm text-gray-400">
                        No credit card required • Free forever • Cancel anytime
                    </p>
                </div>
            </section>

            <Footer />
        </main>
    );
}
