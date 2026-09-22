// src/app/privacy/page.tsx (PART 1 - FRAMEWORK & KEY SUMMARY DATA)
import { getCurrentUser } from "@/app/actions/auth";
import GlobalHeader from "@/components/GlobalHeader";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dollspace | Privacy Notice",
  description: "Learn more about how and why we protect your secure platform directory records.",
};

export default async function PrivacyPage() {
  const currentUser = await getCurrentUser();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans pb-16 selection:bg-rose-200">
      {/* Global Interactive Navigation Link */}
      <GlobalHeader currentUser={currentUser || { id: "", status: "OFFLINE", role: "USER" }} />

      <div className="max-w-4xl mx-auto px-6 mt-12 animate-scale-up">
        
        {/* Top Branding Section Bracket */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black tracking-tight text-gray-950 mb-2">
            Privacy <span className="text-rose-500">Notice</span> 🔒
          </h1>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Last updated: September 14, 2026
          </p>
        </div>

        {/* Core Layout Card */}
        <div className="bg-white border border-rose-100/60 rounded-3xl shadow-xl p-8 sm:p-12 text-left space-y-8 leading-relaxed text-sm font-medium text-gray-600">
          
          <p className="text-base text-gray-700 font-semibold border-b border-gray-100 pb-4">
            This Privacy Notice for <strong className="text-gray-900">Dollspace.app</strong> ("we", "us", or "our") describes how and why we might access, collect, store, or share ("process") your data records when you visit our network lounge.
          </p>

          {/* Quick Informational Banner */}
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-xs">
            <span className="font-black text-gray-900 uppercase block tracking-wider mb-1">Questions or concerns?</span>
            <p>
              Reading this Notice helps you understand your choices. If you do not agree with our policies, please do not use our Services. For lingering questions, contact support directly at{" "}
              <a href="mailto:help@dollspace.app" className="text-rose-500 font-bold hover:underline">help@dollspace.app</a>.
            </p>
          </div>

          {/* Key Summary Highlight Grid */}
          <section className="space-y-4 bg-rose-50/20 border border-rose-100/50 rounded-2xl p-6 sm:p-8">
            <h2 id="summary" className="text-base font-black uppercase tracking-wider text-rose-600 mb-2">
              📌 Summary of Key Points
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-relaxed">
              <div className="space-y-1">
                <strong className="text-gray-900 block font-bold">What personal data do we process?</strong>
                <p>We process data you voluntarily disclose depending on how you use Dollspace (e.g. username, email, passwords) [11].</p>
              </div>
              <div className="space-y-1">
                <strong className="text-gray-900 block font-bold">Sensitive Information?</strong>
                <p>We do not process sensitive or special regulatory categories of data on our clusters [11].</p>
              </div>
              <div className="space-y-1">
                <strong className="text-gray-900 block font-bold">Third-Party Data?</strong>
                <p>We do not receive or pull any personal profile records from external third-party sources [11].</p>
              </div>
              <div className="space-y-1">
                <strong className="text-gray-900 block font-bold">How do we preserve safety?</strong>
                <p>We maintain comprehensive technical and physical boundaries to prevent network data breaches [11].</p>
              </div>
            </div>
          </section>

          {/* Section 1 */}
          <section className="space-y-3">
            <h2 id="infocollect" className="text-lg font-black tracking-tight text-gray-900 flex items-center gap-2">
              <span className="text-rose-400 text-sm">✦</span> 1. What Information Do We Collect?
            </h2>
            <p>
              We compile personal information that you voluntarily submit to us when creating a profile slot or checking logs inside the live rooms.
            </p>
            
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 space-y-2 text-xs">
              <strong className="text-gray-900 block font-bold">Explicitly Provided Account Variables Include:</strong>
              <ul className="list-disc pl-5 space-y-1 text-gray-600 font-semibold">
                <li>Secure Platform Login Passwords [11]</li>
                <li>Email Addresses (Used for resend automated verification pipelines) [11]</li>
                <li>Unique Account Usernames and Selected Display Names [11]</li>
              </ul>
            </div>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 id="infouse" className="text-lg font-black tracking-tight text-gray-900 flex items-center gap-2">
              <span className="text-rose-400 text-sm">✦</span> 2. How Do We Process Your Information?
            </h2>
            <p>
              We route your metrics to maintain security rules, provide custom UI features, and protect profiles from external harm.
            </p>
            
            <ul className="space-y-2 pl-1 text-xs">
              <li>• <strong className="text-gray-900 font-bold">Account Management:</strong> Keeping session cookies operating smoothly [11].</li>
              <li>• <strong className="text-gray-900 font-bold">User Communication:</strong> Delivering system broadcasts and direct chat messages [11].</li>
              <li>• <strong className="text-gray-900 font-bold">Vital Protections:</strong> Enforcing administrative blocks to prevent community safety code violations [11].</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 id="legalbases" className="text-lg font-black tracking-tight text-gray-900 flex items-center gap-2">
              <span className="text-rose-400 text-sm">✦</span> 3. What Legal Bases Do We Rely On?
            </h2>
            <p>
              We process data records only under valid contractual requirements, explicit user-given consent indicators, or compliance parameters required by law.
            </p>
          </section>


// src/app/privacy/page.tsx (PART 2 - CLOSING DATA STRUCTURES)

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 id="whoshare" className="text-lg font-black tracking-tight text-gray-900 flex items-center gap-2">
              <span className="text-rose-400 text-sm">✦</span> 4. When and With Whom Do We Share Data?
            </h2>
            <p>
              We do not sell or share personal profile records to third parties for commercial gain. We may disclose data records in connection with written infrastructure contracts or during corporate asset negotiations (e.g. platform transfers).
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 id="3pwebsites" className="text-lg font-black tracking-tight text-gray-900 flex items-center gap-2">
              <span className="text-rose-400 text-sm">✦</span> 5. Stance on Third-Party Websites
            </h2>
            <p>
              Dollspace might contain hyperlinks to external sites or custom profiles. We do not endorse or assume liability for the data safety policies of any un-affiliated third-party service slots you choose to click onto.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 id="cookies" className="text-lg font-black tracking-tight text-gray-900 flex items-center gap-2">
              <span className="text-rose-400 text-sm">✦</span> 6. Cookies and Tracking Technologies
            </h2>
            <p>
              We deploy HTTP cookies and analytics tags (like Vercel Web Analytics) to fix layout bugs, prevent edge crashes, maintain login authorization tokens, and capture general system runtime metrics.
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-3">
            <h2 id="inforetain" className="text-lg font-black tracking-tight text-gray-900 flex items-center gap-2">
              <span className="text-rose-400 text-sm">✦</span> 7. How Long Do We Keep Your Data?
            </h2>
            <p>
              We preserve your profile information inside Neon PostgreSQL tables for as long as your user account remains active in our system directory. Upon termination requests, rows are deactivated and anonymised from active instances.
            </p>
          </section>

          {/* Section 8 */}
          <section className="space-y-3">
            <h2 id="infosafe" className="text-lg font-black tracking-tight text-gray-900 flex items-center gap-2">
              <span className="text-rose-400 text-sm">✦</span> 8. How Do We Keep Your Information Safe?
            </h2>
            <p>
              We route records over secure SSL connections and hash credential data (using bcrypt) to maintain optimal defense. However, no data channel over the internet is completely unbreakable—transmission is ultimately at your own risk.
            </p>
          </section>

          {/* Section 9 */}
          <section className="space-y-3">
            <h2 id="infominors" className="text-lg font-black tracking-tight text-gray-900 flex items-center gap-2">
              <span className="text-rose-400 text-sm">✦</span> 9. Collection from Minors
            </h2>
            <p>
              Dollspace is an adult networking lounge. We do not market to or knowingly collect data records from anyone under 18 years of age. Flagged accounts found violating age restrictions are deactivated instantly.
            </p>
          </section>

          {/* Section 10 */}
          <section className="space-y-3">
            <h2 id="privacyrights" className="text-lg font-black tracking-tight text-gray-900 flex items-center gap-2">
              <span className="text-rose-400 text-sm">✦</span> 10. Privacy Rights & US State Disclosures
            </h2>
            <p>
              Depending on your location, data protection statutes (including EEA, UK, Canada, or select US states) grant you clear access to request a copy of, modify, or erase your personal information.
            </p>
            
            {/* California Identifiers Table */}
            <div className="overflow-x-auto border border-gray-100 rounded-2xl mt-4">
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-50 text-gray-700 font-bold uppercase tracking-wider border-b border-gray-100">
                  <tr>
                    <th className="p-3">Category Collected</th>
                    <th className="p-3">Examples</th>
                    <th className="p-3 text-center">Active Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  <tr>
                    <td className="p-3 font-bold text-gray-900">A. Identifiers</td>
                    <td className="p-3">Username, Display Name, Email address</td>
                    <td className="p-3 text-center text-rose-500 font-black">YES</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-gray-900">C. Classification Data</td>
                    <td className="p-3">Gender identity values, Age parameters, Birthday date</td>
                    <td className="p-3 text-center text-rose-500 font-black">YES</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-gray-900">G. Geolocation Data</td>
                    <td className="p-3">Voluntarily set town / city name listings</td>
                    <td className="p-3 text-center text-rose-500 font-black">YES</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 11 */}
          <section className="space-y-3">
            <h2 id="otherlaws" className="text-lg font-black tracking-tight text-gray-900 flex items-center gap-2">
              <span className="text-rose-400 text-sm">✦</span> 11. Australia & New Zealand Mandates
            </h2>
            <p>
              We process and map personal entries according to your local conditions defined in the <strong className="text-gray-900 font-bold">Australian Privacy Act 1988</strong> and the <strong className="text-gray-900 font-bold">New Zealand Privacy Act 2020</strong>. You maintain complete entitlement to invoke structural correction requests on our databases at any time.
            </p>
          </section>

          {/* Section 12 */}
          <section className="space-y-3 border-t border-gray-100 pt-6">
            <h2 id="contact" className="text-lg font-black tracking-tight text-gray-900 flex items-center gap-2">
              <span className="text-rose-400 text-sm">✦</span> 12. Contact & Data Access Inquiries
            </h2>
            <p>
              To challenge, review, update, or completely purge your personal history information from our servers, you may send a formal data access inquiry directly to our support desk:
            </p>
            
            <div className="bg-rose-50/30 border border-rose-100 rounded-2xl p-4 text-center">
              <span className="text-[10px] font-bold text-gray-400 uppercase block tracking-wider mb-1">Privacy Support Mailbox</span>
              <a href="mailto:help@dollspace.app" className="text-sm font-black text-rose-500 hover:text-rose-600 transition underline">
                help@dollspace.app
              </a>
              <span className="text-[9px] text-gray-400 block mt-2 uppercase font-bold tracking-widest">
                Brisbane, Queensland, 4000, Australia
              </span>
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
