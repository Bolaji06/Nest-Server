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
          We're thrilled to have you with us. Kindly explore our services and make the most out of your experience. 
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

/**
 *
 * @param {String} image
 * @param {String} message
 * @param {String} title
 * @param {String} id
 * @returns String
 * @description Share email template
 */

//src="https://firebasestorage.googleapis.com/v0/b/nest-773db.appspot.com/o/public%2Fnest-logo.png?alt=media&token=7b74767c-62c5-4512-871a-f29d8b8a2577"
export function sendListingEmail(image, id, sender, receiver, message, post) {
  const mjmlTemplate = `
<mjml>
  <mj-head>
    <mj-title>Exclusive House Listing: Shared by ${sender}</mj-title>
    <mj-font name="Roboto" href="https://fonts.googleapis.com/css?family=Roboto" />
    <mj-attributes>
      <mj-all font-family="Roboto, Helvetica, sans-serif" />
    </mj-attributes>
  </mj-head>

  <mj-text font-size="24px" color="#1a1a1a" align="center">
        ${message}
  </mj-text>

  
  <mj-body background-color="#f4f4f4">
    <mj-section background-color="#ffffff" padding-bottom="0px">
      <mj-column width="100%">
        <mj-image src="${image}" alt="Beautiful House" />
      </mj-column>
    </mj-section>

    <mj-section background-color="#ffffff">
      <mj-column>
        <mj-text font-size="24px" color="#1a1a1a" align="center">
          ${sender} thought you might be interested in this property!
        </mj-text>
        <mj-text font-size="16px" color="#555555">
          Dear ${receiver},
        </mj-text>
        <mj-text font-size="16px" color="#555555">
          Your friend ${sender} recently viewed this property and thought it might be perfect for you. Here are the details:
        </mj-text>
      </mj-column>
    </mj-section>

    <mj-section background-color="#ffffff">
      <mj-column>
        <mj-text font-size="20px" color="#1a1a1a">
          Property Highlights
        </mj-text>
        <mj-text font-size="16px" padding-bottom="4px" color="#555555">
          • ${post.bedroom} Bedrooms, ${post.bathroom} Bathrooms<br/>
          • ${(post.unitArea || 10, 233)} sq ft<br/>
          • Located in ${post.city}
        </mj-text>
      </mj-column>
    </mj-section>

    <mj-section background-color="#ffffff">
      <mj-column>     
        <mj-button background-color="#4CAF50" color="white" href="https://nest-black-five.vercel.app/home-details/${id}">
          View Full Listing
        </mj-button>
      </mj-column>
    </mj-section>

    <mj-section background-color="#ffffff">
      <mj-column>
        <mj-text font-size="16px" color="#555555">
          If you're interested in learning more about this property or would like to schedule a viewing, please don't hesitate to contact us.
        </mj-text>
        <mj-text font-size="16px" color="#555555">
          Best regards,<br/>
          ${sender}<br/>
          Nest - Homes
        </mj-text>
      </mj-column>
       <mj-column width="100%">
        <mj-image src="https://firebasestorage.googleapis.com/v0/b/nest-773db.appspot.com/o/public%2Fnest-logo.png?alt=media&token=7b74767c-62c5-4512-871a-f29d8b8a2577" alt="Nest Logo" />
      </mj-column>
    </mj-section>

    <mj-section background-color="#f4f4f4">
      <mj-column>
        <mj-text font-size="12px" color="#888888" align="center">
          © 2024 Nest All rights reserved.<br/>
          Nest 21 street Houston Texas<br/>
          @nest-homes.com
        </mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>
  `;
  const shareEmailHtml = mjml(mjmlTemplate).html;
  return shareEmailHtml;
}
