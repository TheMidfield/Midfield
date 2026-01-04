import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Privacy Policy | Midfield",
    description: "How Midfield collects, uses, and protects your information.",
};

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-neutral-900 pt-32 pb-24">
            <div className="rounded-md" style={{ width: '100%', maxWidth: '720px', margin: '0 auto', padding: '0 24px' }}>

                {/* Header */}
                <div className="mb-10 pb-6 border-b border-slate-200 dark:border-neutral-800">
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-neutral-100 mb-3 font-display tracking-tight">
                        Privacy Policy
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-neutral-500">
                        Last Updated: January 4, 2026
                    </p>
                </div>

                {/* Content */}
                <div className="space-y-8 text-slate-600 dark:text-neutral-400 leading-relaxed">

                    <p>
                        This Privacy Policy describes how Midfield ("we", "us", or "our") collects, uses, and shares information when you use our website and services (the "Service"). By using the Service, you agree to the collection and use of information in accordance with this policy.
                    </p>

                    {/* Section 1 */}
                    <section>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-neutral-100 mb-3">1. Information We Collect</h2>

                        <h3 className="font-medium text-slate-800 dark:text-neutral-200 mt-4 mb-2">Information You Provide</h3>
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong>Account Information:</strong> When you create an account, we collect your email address and any profile information you choose to provide (such as username and profile picture).</li>
                            <li><strong>Content:</strong> We collect the content you post on the Service, including text, images, and any other materials you submit.</li>
                            <li><strong>Communications:</strong> If you contact us, we may keep a record of that correspondence.</li>
                        </ul>

                        <h3 className="font-medium text-slate-800 dark:text-neutral-200 mt-4 mb-2">Information Collected Automatically</h3>
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong>Log Data:</strong> When you use the Service, our servers automatically record information including your IP address, browser type, operating system, referring URLs, and timestamps.</li>
                            <li><strong>Usage Data:</strong> We collect information about how you interact with the Service, such as pages visited and features used.</li>
                            <li><strong>Cookies:</strong> We use cookies and similar technologies to maintain sessions and remember your preferences. You can disable cookies in your browser settings, but some features of the Service may not function properly.</li>
                        </ul>
                    </section>

                    {/* Section 2 */}
                    <section>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-neutral-100 mb-3">2. How We Use Your Information</h2>
                        <p className="mb-3">We use the information we collect to:</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Provide, maintain, and improve the Service.</li>
                            <li>Create and manage your account.</li>
                            <li>Process and display your content.</li>
                            <li>Respond to your inquiries and provide customer support.</li>
                            <li>Monitor and analyze usage patterns to improve user experience.</li>
                            <li>Detect, prevent, and address technical issues, fraud, and abuse.</li>
                            <li>Send you technical notices and security alerts.</li>
                        </ul>
                    </section>

                    {/* Section 3 */}
                    <section>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-neutral-100 mb-3">3. Information Sharing</h2>
                        <p className="mb-3">We do not sell your personal information. We may share your information in the following circumstances:</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong>Public Content:</strong> Content you post on the Service is public and visible to other users and visitors.</li>
                            <li><strong>Service Providers:</strong> We may share information with third-party service providers who perform services on our behalf, such as hosting, analytics, and authentication.</li>
                            <li><strong>Legal Requirements:</strong> We may disclose information if required to do so by law or in response to valid requests by public authorities.</li>
                            <li><strong>Business Transfers:</strong> If we are involved in a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction.</li>
                        </ul>
                    </section>

                    {/* Section 4 */}
                    <section>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-neutral-100 mb-3">4. Third-Party Services</h2>
                        <p>
                            We use third-party services to help operate the Service. These include hosting providers, authentication services, and data providers. These third parties have access to your information only to perform specific tasks on our behalf and are obligated to protect it. Sports data displayed on the Service is provided by third-party sources and is subject to their terms of service.
                        </p>
                    </section>

                    {/* Section 5 */}
                    <section>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-neutral-100 mb-3">5. Data Security</h2>
                        <p>
                            We implement reasonable security measures to protect your information from unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
                        </p>
                    </section>

                    {/* Section 6 */}
                    <section>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-neutral-100 mb-3">6. Your Rights and Choices</h2>
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong>Access and Update:</strong> You can access and update your account information through your profile settings.</li>
                            <li><strong>Delete Content:</strong> You can delete content you have posted on the Service.</li>
                            <li><strong>Account Deletion:</strong> You may request deletion of your account by contacting us. Note that some information may be retained as required by law or for legitimate business purposes.</li>
                        </ul>
                    </section>

                    {/* Section 7 */}
                    <section>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-neutral-100 mb-3">7. Children's Privacy</h2>
                        <p>
                            The Service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If we become aware that we have collected personal information from a child under 13, we will take steps to delete such information.
                        </p>
                    </section>

                    {/* Section 8 */}
                    <section>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-neutral-100 mb-3">8. International Data Transfers</h2>
                        <p>
                            Your information may be transferred to and processed in countries other than your country of residence. These countries may have data protection laws that are different from the laws of your country.
                        </p>
                    </section>

                    {/* Section 9 */}
                    <section>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-neutral-100 mb-3">9. Changes to This Policy</h2>
                        <p>
                            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. Your continued use of the Service after any changes indicates your acceptance of the updated policy.
                        </p>
                    </section>

                    {/* Contact */}
                    <div className="pt-8 mt-8 border-t border-slate-200 dark:border-neutral-800">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-neutral-100 mb-3">10. Contact Us</h2>
                        <p>
                            If you have any questions about this Privacy Policy, please contact us at{" "}
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
