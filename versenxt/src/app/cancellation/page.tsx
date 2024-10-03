import React from 'react';

const RefundPage = () => {
  return (
    <div className="container mx-auto px-4 py-8 text-justify">
      <h1 className="text-3xl font-bold mb-6 text-center">Refund and Cancellation Policy - Versetta</h1>
      

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Subscription Cancellation</h2>
        <p className="mb-4">
          You may cancel your subscription to Versetta&apos;s services at any time. To cancel your subscription, please follow these steps:
        </p>
        <ol className="list-decimal pl-8 mb-4">
          <li>Log into your Versetta account</li>
          <li>Navigate to the Account Settings or Subscription Management section</li>
          <li>Click on the &quot;Cancel Subscription&quot; button</li>
          <li>Follow the prompts to confirm your cancellation</li>
        </ol>
        <p className="mb-4">
          If you encounter any issues during the cancellation process, please contact our support team at support@versetta.com for assistance.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Effective Date of Cancellation</h2>
        <p className="mb-4">
          Upon cancellation, your subscription will remain active until the end of your current billing period. After this period, your subscription will not renew, and you will lose access to premium features. You will continue to have access to any data or content you have created or uploaded to the platform, subject to our data retention policies.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Refund Policy</h2>
        <p className="mb-4">
          Versetta operates on a no-refund policy for subscription fees. We do not provide refunds for:
        </p>
        <ul className="list-disc pl-8 mb-4">
          <li>Partial use of the service during a billing period</li>
          <li>Unused time on a subscription</li>
          <li>Subscription fees paid in advance</li>
        </ul>
        <p className="mb-4">
          This policy is in place because Versetta is a digital service that provides immediate access to our platform and features upon payment.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Exceptions to the No-Refund Policy</h2>
        <p className="mb-4">
          In certain exceptional circumstances, we may consider issuing a refund. These situations will be evaluated on a case-by-case basis and may include:
        </p>
        <ul className="list-disc pl-8 mb-4">
          <li>Technical issues on our end that have severely impacted your ability to use the service</li>
          <li>Erroneous charges or billing errors on our part</li>
        </ul>
        <p className="mb-4">
          If you believe you qualify for a refund under these exceptional circumstances, please contact our support team at support@versetta.com with a detailed explanation of your situation.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Refund Processing</h2>
        <p className="mb-4">In the event that a refund is approved:</p>
        <ul className="list-disc pl-8 mb-4">
          <li>The refund will be processed using the original method of payment</li>
          <li>Refunds may take 5-10 business days to appear on your statement, depending on your payment provider</li>
          <li>Any taxes or fees associated with the refund will be handled in accordance with applicable laws and regulations</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Changes to Subscription Plans</h2>
        <p className="mb-4">
          If you upgrade or downgrade your subscription plan, the changes will take effect at the start of your next billing cycle. We do not provide prorated refunds for downgrades mid-cycle.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Free Trials</h2>
        <p className="mb-4">
          If you signed up for a free trial and cancel before the trial period ends, you will not be charged. If you do not cancel before the trial period ends, you will be automatically enrolled in the paid subscription plan you selected at the time of sign-up.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Account Termination</h2>
        <p className="mb-4">
          Versetta reserves the right to terminate accounts in accordance with our Terms of Service. In the event of account termination due to violation of our terms, no refund will be issued.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Data Retention After Cancellation</h2>
        <p className="mb-4">Upon cancellation of your subscription:</p>
        <ul className="list-disc pl-8 mb-4">
          <li>We may retain certain data in accordance with legal requirements and our data retention policies</li>
          <li>You will have a limited time (typically 30 days) to export any data you wish to keep</li>
          <li>After this period, we may delete your data from our active systems</li>
        </ul>
        <p className="mb-4">
          For more information on data retention, please refer to our Privacy Policy.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Changes to This Policy</h2>
        <p className="mb-4">
          We reserve the right to modify this Refund and Cancellation Policy at any time. Changes will be effective immediately upon posting to our website. We encourage you to review this policy periodically.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
        <p className="mb-4">
          If you have any questions about this Refund and Cancellation Policy, please contact us at:
        </p>
        <p className="mb-4">
          Versetta<br />
          [Your Company Address]<br />
          Email: billing@versetta.com<br />
          Phone: [Your Phone Number]
        </p>
      </section>

      <p className="mb-4">
        By using our services, you acknowledge that you have read, understood, and agree to be bound by this Refund and Cancellation Policy.
      </p>
      <p className="text-sm text-gray-600 mb-8">Last Updated: October 3, 2024</p>
    </div>
  );
};

export default RefundPage;