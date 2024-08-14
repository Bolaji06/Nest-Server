import mjml from "mjml";

export function sendWelcomeEmail(emailToken) {
  const mjmlTemplate = `
<mjml>
  <mj-body background-color="#f0f0f0">
    <mj-section background-color="#ffffff" padding="20px">
      <mj-column>
        <mj-image
          width="200px"
          src="https://firebasestorage.googleapis.com/v0/b/nest-773db.appspot.com/o/public%2Fnest-logo.png?alt=media&token=7b74767c-62c5-4512-871a-f29d8b8a2577"
          alt="Company Logo"
        ></mj-image>
        <mj-text font-size="20px" font-weight="bold" color="#333333">
          Welcome to Our Platform, Nest!
        </mj-text>
        <mj-text font-size="16px" line-height="1.8rem" color="#555555">
          We're thrilled to have you with us. Explore our services and make the most out of your experience. 
          We're here to support you every step of the way.
        </mj-text>

        <mj-text font-size="16px" color="#555555">
          Kindly verify your email 
        </mj-text>


        <mj-button
          href="http://localhost:3000/verify-email?token=${emailToken}"
          background-color="#1d0af0"
          color="#ffffff"
          font-size="18px"
          padding="15px 25px"
          border-radius: "5px"
        >
          Verify Email
        </mj-button>
        <mj-text font-size="14px" color="#999999" padding-top="20px">
          If you have any questions, feel free to reach out to our support team.
        </mj-text>
      </mj-column>
    </mj-section>

    <mj-section background-color="#f0f0f0" padding="10px">
      <mj-column>
        <mj-text font-size="14px" color="#999999">
          © 2024 Our Company. All rights reserved.
        </mj-text>
        <mj-text font-size="14px" color="#999999">
          You are receiving this email because you signed up for our services.
        </mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>
`;

  const welcomeEmailHtml = mjml(mjmlTemplate).html;
  return welcomeEmailHtml;
}
