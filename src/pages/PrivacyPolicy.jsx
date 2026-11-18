
import React from "react";
import "./PrivacyPolicy.css";

const PrivacyPolicy = () => {
  return (
    <div className="privacy-page">
      <div className="privacy-hero">
        <span className="privacy-label">THE VEDIKA</span>
        <h1>Privacy Policy</h1>
        <p>
          Your privacy matters to us. Learn how TheVedika collects,
          uses, and protects your information.
        </p>
      </div>

      <div className="privacy-container">
        <p className="privacy-updated">
          Last Updated: November 17, 2026
        </p>

        <section>
          <h2>1. Introduction</h2>
          <p>
            Welcome to TheVedika. We respect your privacy and are
            committed to protecting your personal information when
            you use our website, mobile application, and farmhouse
            booking services.
          </p>
          <p>
            This Privacy Policy explains what information we collect,
            how we use it, when we share it, and the choices available
            to you.
          </p>
        </section>

        <section>
          <h2>2. Information We Collect</h2>
          <p>Depending on how you use our services, we may collect:</p>

          <h3>Personal Information</h3>
          <ul>
            <li>Name and contact details.</li>
            <li>Mobile phone number used for OTP verification.</li>
            <li>Email address, if provided.</li>
          </ul>

          <h3>Booking Information</h3>
          <ul>
            <li>Selected farmhouse and booking dates.</li>
            <li>Check-in and check-out details.</li>
            <li>Number of guests.</li>
            <li>Booking preferences and additional services selected.</li>
            <li>Booking and payment status.</li>
          </ul>

          <h3>Technical Information</h3>
          <ul>
            <li>IP address and browser information.</li>
            <li>Device type and operating system.</li>
            <li>Website or application usage information.</li>
            <li>Diagnostic logs and technical error information.</li>
          </ul>
        </section>

        <section>
          <h2>3. How We Use Your Information</h2>
          <p>We use collected information to:</p>
          <ul>
            <li>Create and manage customer accounts.</li>
            <li>Verify your mobile number using OTP.</li>
            <li>Process farmhouse bookings and reservations.</li>
            <li>Manage payments, refunds, and booking confirmations.</li>
            <li>Communicate booking updates and customer support information.</li>
            <li>Improve our website, application, and services.</li>
            <li>Prevent fraud and protect our platform.</li>
            <li>Comply with applicable legal obligations.</li>
          </ul>
        </section>

        <section>
          <h2>4. Payments and Payment Security</h2>
          <p>
            Payments made through TheVedika may be processed by
            third-party payment providers such as Razorpay.
          </p>
          <p>
            Payment transactions are subject to the payment
            provider's privacy policy and security practices.
            We may receive transaction references, payment status,
            and related booking information to manage your reservation.
          </p>
          <p>
            We do not intend to collect or store your full card
            number, UPI PIN, or banking passwords on our servers.
          </p>
        </section>

        <section>
          <h2>5. Sharing of Information</h2>
          <p>
            We do not sell your personal information. We may share
            relevant information with trusted service providers
            when necessary to operate our services, including:
          </p>
          <ul>
            <li>Payment providers for processing transactions.</li>
            <li>OTP and messaging providers for account verification.</li>
            <li>Hosting and infrastructure providers.</li>
            <li>Farmhouse operators when necessary to fulfil bookings.</li>
            <li>Government or legal authorities when required by law.</li>
          </ul>
          <p>
            Such sharing is limited to what is reasonably necessary
            for the relevant purpose.
          </p>
        </section>

        <section>
          <h2>6. Data Storage and Security</h2>
          <p>
            We use reasonable technical and organisational measures
            to protect your personal information against unauthorised
            access, alteration, disclosure, or destruction.
          </p>
          <p>
            However, no online platform or electronic transmission
            can be guaranteed to be completely secure.
          </p>
        </section>

        <section>
          <h2>7. Data Retention</h2>
          <p>
            We retain personal and booking information for as long
            as necessary to provide our services, maintain booking
            records, resolve disputes, meet legal requirements, and
            enforce our agreements.
          </p>
          <p>
            When information is no longer required, we take
            reasonable steps to delete or anonymise it, subject
            to applicable legal obligations.
          </p>
        </section>

        <section>
          <h2>8. Cookies and Similar Technologies</h2>
          <p>
            Our website may use cookies or similar technologies
            to maintain sessions, remember preferences, improve
            functionality, and understand website usage.
          </p>
          <p>
            You can manage or disable cookies through your browser
            settings. Some website features may not work properly
            if cookies are disabled.
          </p>
        </section>

        <section>
          <h2>9. Your Privacy Rights</h2>
          <p>
            Subject to applicable laws, you may request to:
          </p>
          <ul>
            <li>Access the personal information we hold about you.</li>
            <li>Correct inaccurate or incomplete information.</li>
            <li>Request deletion of your personal information.</li>
            <li>Withdraw consent where processing is based on consent.</li>
            <li>Raise concerns or complaints about data handling.</li>
          </ul>
          <p>
            Some information may need to be retained where required
            by law or for legitimate business purposes.
          </p>
        </section>

        <section>
          <h2>10. Children's Privacy</h2>
          <p>
            TheVedika is not intended to be used independently by
            children without appropriate parental or guardian
            involvement. We do not knowingly collect children's
            personal information without appropriate authorisation.
          </p>
          <p>
            If you believe a child has provided personal information
            without appropriate consent, please contact us.
          </p>
        </section>

        <section>
          <h2>11. Third-Party Services</h2>
          <p>
            Our website or application may use third-party services
            for payments, OTP verification, hosting, and other
            operational purposes.
          </p>
          <p>
            These services have their own privacy policies and
            practices. We encourage users to review those policies
            before using their services.
          </p>
        </section>

        <section>
          <h2>12. Changes to This Privacy Policy</h2>
          <p>
            We may update this Privacy Policy from time to time
            to reflect changes in our services, technology, or
            applicable laws.
          </p>
          <p>
            Any updated version will be published on this page
            with a revised Last Updated date.
          </p>
        </section>

        <section>
          <h2>13. Contact Us</h2>
          <p>
            If you have questions, concerns, or requests regarding
            this Privacy Policy or your personal information,
            please contact us:
          </p>

          <div className="privacy-contact">
            <h3>TheVedika</h3>
            <p>
              Email: <a href="mailto:thevedika@gmail.com">
                thevedika@gmail.com
              </a>
            </p>
            <p>Website: https://thevedika.com</p>
          </div>
        </section>

        <div className="privacy-footer">
          <p>© {new Date().getFullYear()} TheVedika. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
