import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Terms of Service | Midfield",
    description: "Terms of Service for using the Midfield platform.",
};

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-neutral-900 pt-32 pb-24">
            <div className="rounded-md" style={{ width: '100%', maxWidth: '720px', margin: '0 auto', padding: '0 24px' }}>

                {/* Header */}
                <div className="mb-10 pb-6 border-b border-slate-200 dark:border-neutral-800">
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-neutral-100 mb-3 font-display tracking-tight">
                        Terms of Service
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-neutral-500">
                        Last Updated: January 4, 2026
                    </p>
                </div>

                {/* Content */}
                <div className="space-y-8 text-slate-600 dark:text-neutral-400 leading-relaxed">

                    <p>
                        Welcome to Midfield. By accessing or using our website and services (the "Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use the Service.
                    </p>

                    {/* Section 1 */}
                    <section>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-neutral-100 mb-3">1. Acceptance of Terms</h2>
                        <p>
                            By creating an account or using the Service, you confirm that you accept these Terms and agree to comply with them. We may update these Terms from time to time. Your continued use of the Service after any changes indicates your acceptance of the updated Terms.
                        </p>
                    </section>

                    {/* Section 2 */}
                    <section>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-neutral-100 mb-3">2. Eligibility</h2>
                        <p>
                            You must be at least 13 years old to use the Service. If you are under 18, you represent that you have your parent or guardian's consent to use the Service. By using the Service, you represent and warrant that you meet these requirements.
                        </p>
                    </section>

                    {/* Section 3 */}
                    <section>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-neutral-100 mb-3">3. Your Account</h2>
                        <p className="mb-3">
                            You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
                        </p>
                        <p>
                            We reserve the right to suspend or terminate your account at any time, with or without cause, and with or without notice.
                        </p>
                    </section>

                    {/* Section 4 */}
                    <section>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-neutral-100 mb-3">4. User Content</h2>
                        <p className="mb-3">
                            You retain ownership of the content you post on the Service ("User Content"). By posting User Content, you grant us a worldwide, non-exclusive, royalty-free, transferable, and sublicensable license to use, reproduce, modify, adapt, publish, translate, distribute, and display such content in connection with operating and providing the Service.
                        </p>
                        <p className="mb-3">
                            This license includes the right to feature your content in curated or promotional sections of the Service, and to allow other users to share your public content using built-in sharing features.
                        </p>
                        <p>
                            You represent and warrant that you have all necessary rights to grant this license and that your User Content does not violate any third party's rights.
                        </p>
                    </section>

                    {/* Section 5 */}
                    <section>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-neutral-100 mb-3">5. Prohibited Conduct</h2>
                        <p className="mb-3">You agree not to:</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Post content that is unlawful, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, or otherwise objectionable.</li>
                            <li>Impersonate any person or entity, or falsely state or misrepresent your affiliation with a person or entity.</li>
                            <li>Post content that infringes any patent, trademark, trade secret, copyright, or other proprietary rights of any party.</li>
                            <li>Use the Service for any commercial purpose without our prior written consent.</li>
                            <li>Use automated scripts, bots, or other means to access the Service or collect data from it.</li>
                            <li>Interfere with or disrupt the Service or servers or networks connected to the Service.</li>
                            <li>Attempt to gain unauthorized access to any portion of the Service or any other systems or networks.</li>
                            <li>Use the Service to engage in any illegal activity.</li>
                        </ul>
                    </section>

                    {/* Section 6 */}
                    <section>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-neutral-100 mb-3">6. Intellectual Property</h2>
                        <p>
                            The Service and its original content (excluding User Content), features, and functionality are and will remain the exclusive property of Midfield and its licensors. You may not copy, modify, distribute, sell, or lease any part of our Service without our prior written consent.
                        </p>
                    </section>

                    {/* Section 7 */}
                    <section>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-neutral-100 mb-3">7. Third-Party Content and Services</h2>
                        <p>
                            The Service may display content from third-party sources, including sports statistics and data. We do not guarantee the accuracy, completeness, or timeliness of any third-party content. Such content is provided for informational purposes only and should not be relied upon for any financial or betting decisions.
                        </p>
                    </section>

                    {/* Section 8 */}
                    <section>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-neutral-100 mb-3">8. Disclaimer of Warranties</h2>
                        <p>
                            THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS. WE DISCLAIM ALL WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE.
                        </p>
                    </section>

                    {/* Section 9 */}
                    <section>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-neutral-100 mb-3">9. Limitation of Liability</h2>
                        <p>
                            TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL MIDFIELD, ITS AFFILIATES, DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM YOUR USE OF THE SERVICE.
                        </p>
                    </section>

                    {/* Section 10 */}
                    <section>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-neutral-100 mb-3">10. Indemnification</h2>
                        <p>
                            You agree to indemnify, defend, and hold harmless Midfield and its officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, and expenses, including reasonable attorneys' fees, arising out of or in any way connected with your access to or use of the Service, your violation of these Terms, or your violation of any rights of another.
                        </p>
                    </section>

                    {/* Section 11 */}
                    <section>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-neutral-100 mb-3">11. Termination</h2>
                        <p>
                            We may terminate or suspend your access to the Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach these Terms. Upon termination, your right to use the Service will immediately cease.
                        </p>
                    </section>

                    {/* Section 12 */}
                    <section>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-neutral-100 mb-3">12. Changes to These Terms</h2>
                        <p>
                            We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide reasonable notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
                        </p>
                    </section>

                    {/* Section 13 */}
                    <section>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-neutral-100 mb-3">13. Severability</h2>
                        <p>
                            If any provision of these Terms is held to be invalid or unenforceable, such provision shall be struck and the remaining provisions shall be enforced to the fullest extent under law.
                        </p>
                    </section>

                    {/* Section 14 */}
                    <section>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-neutral-100 mb-3">14. Entire Agreement</h2>
                        <p>
                            These Terms, together with our Privacy Policy, constitute the entire agreement between you and Midfield regarding the Service and supersede all prior agreements and understandings.
                        </p>
                    </section>

                    {/* Contact */}
                    <div className="pt-8 mt-8 border-t border-slate-200 dark:border-neutral-800">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-neutral-100 mb-3">15. Contact Us</h2>
                        <p>
                            If you have any questions about these Terms, please contact us at{" "}
                            <a href="mailto:team.midfield@gmail.com" className="text-emerald-600 dark:text-emerald-400 hover:underline">
                                team.midfield@gmail.com
                            </a>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
