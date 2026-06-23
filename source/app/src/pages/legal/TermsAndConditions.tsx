import LegalLayout from "@/pages/legal/LegalLayout";

export default function TermsAndConditions() {
    return (
        <LegalLayout title="Terms & Conditions" lastUpdated="June 23, 2026">
            <section>
                <p>
                    These Terms & Conditions ("Terms") govern your use of The Sanctuary
                    application ("the App"), provided by Koptisk Ortodoxa Kyrkan S:t Mina
                    Församling ("we", "us", "our"), Nyköpingsvägen 24, 151 32 Södertälje, Sweden.
                    By accessing or using the App, you agree to these Terms.
                </p>
            </section>

            <section>
                <h2>Purpose of the App</h2>
                <p>
                    The App is an internal administrative tool for authorized church youth
                    ministry staff and volunteers ("Admins") to manage attendance, member
                    records, and follow-up activities. It is not a public-facing service and is
                    not intended for use by the general public.
                </p>
            </section>

            <section>
                <h2>Eligibility and Access</h2>
                <p>
                    Access to the App is limited to individuals authorized by the organization.
                    You must sign in with a Google account approved by an administrator to use
                    the App. You are responsible for maintaining the confidentiality of your
                    account credentials and for all activity that occurs under your account.
                </p>
            </section>

            <section>
                <h2>Acceptable Use</h2>
                <p>When using the App, you agree to:</p>
                <ul>
                    <li>Use the App only for legitimate youth ministry administrative purposes.</li>
                    <li>Enter and handle member information accurately and respectfully.</li>
                    <li>
                        Not attempt to access data, accounts, or spreadsheets you are not
                        authorized to access.
                    </li>
                    <li>Comply with applicable data protection laws when handling member data.</li>
                </ul>
            </section>

            <section>
                <h2>Data You Submit</h2>
                <p>
                    Any member or attendance data entered into the App remains the property of
                    the organization. The App acts as a tool to read and write this data to
                    Google Sheets under the organization's control; we do not claim ownership of
                    this data. You are responsible for ensuring you have appropriate permission
                    to enter personal information about members and their families.
                </p>
            </section>

            <section>
                <h2>Availability and Changes</h2>
                <p>
                    We aim to keep the App available and functioning correctly but do not
                    guarantee uninterrupted access. We may update, modify, or discontinue features
                    of the App at any time without prior notice.
                </p>
            </section>

            <section>
                <h2>Disclaimer of Warranties</h2>
                <p>
                    The App is provided "as is" and "as available" without warranties of any
                    kind, express or implied. We do not warrant that the App will be error-free
                    or uninterrupted.
                </p>
            </section>

            <section>
                <h2>Limitation of Liability</h2>
                <p>
                    To the fullest extent permitted by law, we shall not be liable for any
                    indirect, incidental, or consequential damages arising from your use of, or
                    inability to use, the App.
                </p>
            </section>

            <section>
                <h2>Termination</h2>
                <p>
                    We may suspend or terminate your access to the App at any time, particularly
                    if you violate these Terms or are no longer an authorized Admin of the
                    organization.
                </p>
            </section>

            <section>
                <h2>Governing Law</h2>
                <p>
                    These Terms are governed by the laws of Sweden, without regard to conflict of
                    law principles.
                </p>
            </section>

            <section>
                <h2>Changes to These Terms</h2>
                <p>
                    We may revise these Terms from time to time. Continued use of the App after
                    changes are posted constitutes acceptance of the revised Terms.
                </p>
            </section>

            <section>
                <h2>Contact Us</h2>
                <p>
                    If you have questions about these Terms, contact us at{" "}
                    <a href="mailto:info@st-mina-gym-app.web.app">info@st-mina-gym-app.web.app</a>.
                </p>
            </section>
        </LegalLayout>
    );
}
