import React from "react";
import { Metadata } from "next";
import { Mail } from "lucide-react";

export const metadata: Metadata = {
    title: "Contact | Midfield",
    description: "Get in touch with the Midfield team.",
};

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-neutral-900 pt-32 pb-24">
            <div className="rounded-md" style={{ width: '100%', maxWidth: '480px', margin: '0 auto', padding: '0 24px' }}>

                <div className="text-center mb-12">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-neutral-100 mb-3 font-display">
                        Contact Us
                    </h1>
                    <p className="text-slate-600 dark:text-neutral-400">
                        Questions, bugs, or feedback?
                    </p>
                </div>

                <div className="bg-slate-50 dark:bg-neutral-800 rounded-lg border border-slate-200 dark:border-neutral-700 p-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
                        <Mail className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <a
                        href="mailto:team.midfield@gmail.com"
                        className="text-lg font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
                    >
                        team.midfield@gmail.com
                    </a>
                    <p className="text-sm text-slate-500 dark:text-neutral-500 mt-3">
                        We usually reply within 24 hours.
                    </p>
                </div>

            </div>
        </div>
    );
}
