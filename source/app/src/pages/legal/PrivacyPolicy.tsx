import LegalLayout from "@/pages/legal/LegalLayout";

export default function PrivacyPolicy() {
    return (
        <LegalLayout title="Privacy Policy" lastUpdated="June 23, 2026">
            <section>
                <p>
                    The Sanctuary ("the App") is operated by Koptisk Ortodoxa Kyrkan S:t Mina
                    Församling ("we", "us", "our"), Nyköpingsvägen 24, 151 32 Södertälje, Sweden.
                    This Privacy Policy explains how we collect, use, and protect information when
                    you use the App.
                </p>
            </section>

            <section>
                <h2>Who Uses This App</h2>
                <p>
                    The App is an internal administrative tool used by authorized church youth
                    ministry staff and volunteers ("Admins") to manage attendance, member records,
                    and follow-up activities for youth programs. It is not intended for use by the
                    general public or by minors directly.
                </p>
            </section>

            <section>
                <h2>Information We Collect</h2>
                <p>When an Admin signs in and uses the App, we collect:</p>
                <ul>
                    <li>
                        <strong>Account information:</strong> When you sign in with Google, we
                        receive your name, email address, and profile photo to authenticate your
                        identity and authorize your access as an Admin.
                    </li>
                    <li>
                        <strong>Google Sheets access:</strong> With your authorization, the App
                        reads and writes data to Google Sheets that you and your organization
                        control, in order to store and manage member records, attendance, and
                        follow-up notes. The App only accesses the specific spreadsheets configured
                        for this purpose and does not access any other files in your Google
                        Drive.
                    </li>
                    <li>
                        <strong>Member information:</strong> Admins may enter personal information
                        about youth members and their families into the App, including names,
                        contact details, attendance history, and follow-up notes. This information
                        is provided and controlled by the church organization, not collected
                        directly from members through the App.
                    </li>
                </ul>
            </section>

            <section>
                <h2>How We Use Information</h2>
                <ul>
                    <li>To authenticate Admins and restrict access to authorized personnel only.</li>
                    <li>
                        To store, retrieve, and update attendance, membership, and follow-up
                        records on behalf of the organization, via Google Sheets.
                    </li>
                    <li>To operate, maintain, and improve the App's functionality.</li>
                </ul>
                <p>
                    We do not use this information for advertising, and the App does not contain
                    third-party advertising or analytics tracking.
                </p>
            </section>

            <section>
                <h2>Data Storage and Sharing</h2>
                <p>
                    Data managed through the App is stored in Google Sheets and Google Firebase
                    services controlled by the organization. We do not sell or share personal
                    information with third parties, except as necessary to provide the App's
                    core functionality (such as Google's services, which are governed by{" "}
                    <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer">
                        Google's Privacy Policy
                    </a>
                    ) or as required by law.
                </p>
                <p>
                    The App's use of information received from Google APIs adheres to the{" "}
                    <a
                        href="https://developers.google.com/terms/api-services-user-data-policy"
                        target="_blank"
                        rel="noreferrer"
                    >
                        Google API Services User Data Policy
                    </a>
                    , including the Limited Use requirements.
                </p>
            </section>

            <section>
                <h2>Data Retention and Deletion</h2>
                <p>
                    Account and member data is retained for as long as needed to support the
                    organization's youth ministry activities, or until an Admin or the
                    organization requests deletion. To request deletion of your Admin account
                    access or any data associated with it, contact us using the details below.
                </p>
            </section>

            <section>
                <h2>Security</h2>
                <p>
                    We use industry-standard services (Google Firebase Authentication and Google
                    Sheets) to protect data, and access to member records is restricted to
                    authorized Admins.
                </p>
            </section>

            <section>
                <h2>Children's Privacy</h2>
                <p>
                    The App is intended solely for use by adult Admins and is not directed at
                    children. Information about minors may be entered by Admins as part of normal
                    church youth ministry record-keeping, with appropriate organizational
                    oversight.
                </p>
            </section>

            <section>
                <h2>Changes to This Policy</h2>
                <p>
                    We may update this Privacy Policy from time to time. Changes will be posted on
                    this page with an updated "Last updated" date.
                </p>
            </section>

            <section>
                <h2>Contact Us</h2>
                <p>
                    If you have questions about this Privacy Policy or wish to request data
                    deletion, contact us at{" "}
                    <a href="mailto:info@st-mina-gym-app.web.app">info@st-mina-gym-app.web.app</a>.
                </p>
            </section>
        </LegalLayout>
    );
}
