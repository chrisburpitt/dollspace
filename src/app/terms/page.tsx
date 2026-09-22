// src/app/terms/page.tsx (PART 1 - INITIAL CONTENT SLOTS)
import { getCurrentUser } from "@/app/actions/auth";
import GlobalHeader from "@/components/GlobalHeader";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dollspace | Terms and Conditions",
  description: "Please read these terms and conditions carefully before using our platform service slots.",
};

export default async function TermsPage() {
  // Grab session user cleanly to provide a personalised header card layout state
  const currentUser = await getCurrentUser();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans pb-16 selection:bg-rose-200">
      {/* Dynamic Global Header Passthrough */}
      <GlobalHeader currentUser={currentUser || { id: "", status: "OFFLINE", role: "USER" }} />

      <div className="max-w-4xl mx-auto px-6 mt-12 animate-scale-up">
        
        {/* Top Header Card Bracket */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black tracking-tight text-gray-950 mb-2">
            Terms & <span className="text-rose-500">Conditions</span> 👑
          </h1>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Last updated: September 14, 2026
          </p>
        </div>

        {/* Core Content Container Card */}
        <div className="bg-white border border-rose-100/60 rounded-3xl shadow-xl p-8 sm:p-12 text-left space-y-8 leading-relaxed text-sm font-medium text-gray-600">
          
          <p className="text-base text-gray-700 font-semibold border-b border-gray-100 pb-4">
            Please read these terms and conditions carefully before using Our Service slots.
          </p>

          {/* Section 1 */}
          <section className="space-y-4">
            <h2 className="text-lg font-black tracking-tight text-gray-900 flex items-center gap-2">
              <span className="text-rose-400 text-sm">✦</span> Interpretation and Definitions
            </h2>
            
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-400">Interpretation</h3>
              <p>
                The words whose initial letters are capitalized have meanings defined under the following conditions. The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-400">Definitions</h3>
              <p>For the purposes of these Terms and Conditions:</p>
              
              <ul className="space-y-3 bg-gray-50/60 border border-gray-100 rounded-2xl p-5 text-xs text-gray-600">
                <li>
                  <strong className="text-gray-900 font-bold">Affiliate</strong> means an entity that controls, is controlled by, or is under common control with a party, where "control" means ownership of 50% or more of the shares, equity interest or other securities entitled to vote for election of directors or other managing authority.
                </li>
                <li>
                  <strong className="text-gray-900 font-bold">Country/State</strong> refers to: Queensland, Australia.
                </li>
                <li>
                  <strong className="text-gray-900 font-bold">Company</strong> (referred to as either "the Company", "We", "Us" or "Our" in these Terms) refers to Dollspace.
                </li>
                <li>
                  <strong className="text-gray-900 font-bold">Device</strong> means any device that can access the Service such as a computer, a cell phone or a digital tablet.
                </li>
                <li>
                  <strong className="text-gray-900 font-bold">Service</strong> refers to the Website.
                </li>
                <li>
                  <strong className="text-gray-900 font-bold">Terms and Conditions</strong> (also referred to as "Terms") means these Terms and Conditions, including any documents expressly incorporated by reference, which govern Your access to and use of the Service.
                </li>
                <li>
                  <strong className="text-gray-900 font-bold">Third-Party Social Media Service</strong> means any services or content provided by a third party that is displayed, included, or linked to through the Service.
                </li>
                <li>
                  <strong className="text-gray-900 font-bold">Website</strong> refers to Dollspace, accessible from{" "}
                  <a href="https://dollspace.app" target="_blank" rel="noopener noreferrer" className="text-rose-500 font-bold hover:underline">
                    https://dollspace.app
                  </a>
                </li>
                <li>
                  <strong className="text-gray-900 font-bold">You</strong> means the individual accessing or using the Service, or the company, or other legal entity on behalf of which such individual is accessing or using the Service.
                </li>
              </ul>
            </div>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-lg font-black tracking-tight text-gray-900 flex items-center gap-2">
              <span className="text-rose-400 text-sm">✦</span> Acknowledgment
            </h2>
            <p>
              These are the Terms and Conditions governing the use of this Service and the agreement between You and the Company. These Terms and Conditions set out the rights and obligations of all users regarding the use of the Service.
            </p>
            <p>
              Your access to and use of the Service is conditioned on Your acceptance of and compliance with these Terms and Conditions. These Terms apply to all visitors, users and others who access or use the Service.
            </p>
            <p className="p-3.5 bg-rose-50/50 border border-rose-100 rounded-xl font-bold text-xs text-rose-700 text-center uppercase tracking-wide">
              🔞 You represent that you are over the age of 18. The Company does not permit those under 18 to use the Service.
            </p>
            <p>
              Your access to and use of the Service is also subject to Our Privacy Policy, which describes how We collect, use, and disclose personal information. Please read Our Privacy Policy carefully before using Our Service.
            </p>
          </section>


          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-lg font-black tracking-tight text-gray-900 flex items-center gap-2">
              <span className="text-rose-400 text-sm">✦</span> Links to Other Websites
            </h2>
            <p>
              Our Service may contain links to third-party websites or services that are not owned or controlled by the Company.
            </p>
            <p>
              The Company has no control over, and assumes no responsibility for, the content, privacy policies, or practices of any third-party websites or services. You further acknowledge and agree that the Company shall not be responsible or liable, directly or indirectly, for any damage or loss caused or alleged to be caused by or in connection with the use of or reliance on any such content.
            </p>
            
            <div className="pt-2 space-y-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-400">Links from a Third-Party Social Media Service</h3>
              <p>
                The Service may display, include, make available, or link to content or services provided by a Third-Party Social Media Service. Your use of any Third-Party Social Media Service is governed by that specific service's terms and privacy policies.
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-lg font-black tracking-tight text-gray-900 flex items-center gap-2">
              <span className="text-rose-400 text-sm">✦</span> Termination
            </h2>
            <p>
              We may terminate or suspend Your access immediately, without prior notice or liability, for any reason whatsoever, including without limitation if You breach these Terms and Conditions.
            </p>
            <p>
              Upon termination, Your right to use the Service will cease immediately.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-lg font-black tracking-tight text-gray-900 flex items-center gap-2">
              <span className="text-rose-400 text-sm">✦</span> Limitation of Liability
            </h2>
            <p>
              Notwithstanding any damages that You might incur, the entire liability of the Company and any of its suppliers under any provision of these Terms and Your exclusive remedy for all of the foregoing shall be limited to the amount actually paid by You through the Service or 100 USD if You haven't purchased anything through the Service.
            </p>
            <p>
              To the maximum extent permitted by applicable law, in no event shall the Company or its suppliers be liable for any special, incidental, indirect, or consequential damages whatsoever (including loss of profits, loss of data, business interruption, or personal injury).
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-lg font-black tracking-tight text-gray-900 flex items-center gap-2">
              <span className="text-rose-400 text-sm">✦</span> "AS IS" and "AS AVAILABLE" Disclaimer
            </h2>
            <p>
              The Service is provided to You "AS IS" and "AS AVAILABLE" and with all faults and defects without warranty of any kind. To the maximum extent permitted under applicable law, the Company expressly disclaims all warranties, whether express, implied, statutory or otherwise.
            </p>
            <p>
              Without limiting the foregoing, neither the Company nor any provider makes any representation or warranty that the Service will be uninterrupted, error-free, free of viruses, scripts, trojan horses, malware, or other harmful data components.
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-3">
            <h2 className="text-lg font-black tracking-tight text-gray-900 flex items-center gap-2">
              <span className="text-rose-400 text-sm">✦</span> Governing Law & Dispute Resolution
            </h2>
            <p>
              The laws of Queensland, Australia, excluding its conflicts of law rules, shall govern these Terms and Your use of the Service. If You have any concern or dispute about the Service, You agree to first try to resolve the dispute informally by contacting the Company.
            </p>
          </section>

          {/* Section 8 */}
          <section className="space-y-3">
            <h2 className="text-lg font-black tracking-tight text-gray-900 flex items-center gap-2">
              <span className="text-rose-400 text-sm">✦</span> Changes to These Terms
            </h2>
            <p>
              We reserve the right, at Our sole discretion, to modify or replace these Terms at any time. If a revision is material We will make reasonable efforts to provide at least 30 days' notice prior to any new terms taking effect.
            </p>
          </section>

          {/* Section 9 */}
          <section className="space-y-3 border-t border-gray-100 pt-6">
            <h2 className="text-lg font-black tracking-tight text-gray-900 flex items-center gap-2">
              <span className="text-rose-400 text-sm">✦</span> Contact Us
            </h2>
            <p>If you have any questions about these Terms and Conditions, You can contact us securely:</p>
            
            <div className="bg-rose-50/30 border border-rose-100 rounded-2xl p-4 text-center">
              <span className="text-[10px] font-bold text-gray-400 uppercase block tracking-wider mb-1">Support Desk Inbox</span>
              <a href="mailto:help@dollspace.app" className="text-sm font-black text-rose-500 hover:text-rose-600 transition underline">
                help@dollspace.app
              </a>
            </div>
          </section>

        </div>

        {/* Footer Returns Hook */}
        <div className="mt-8 text-center">
          <Link href="/" className="text-xs font-black text-gray-400 hover:text-rose-500 tracking-wide transition uppercase">
            ✨ Return to Dollspace Feed
          </Link>
        </div>

      </div>
    </div>
  );
}
