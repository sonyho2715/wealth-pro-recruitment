export interface DefaultEmailTemplate {
  name: string;
  subject: string;
  body: string;
  category: string;
}

export const DEFAULT_EMAIL_TEMPLATES: DefaultEmailTemplate[] = [
  {
    name: "Initial Introduction",
    subject: "Introduction from {{agentName}}",
    body: `Hi {{firstName}},

My name is {{agentName}}, and I'm a financial professional specializing in helping families and individuals secure their financial future.

I'd love to connect with you to discuss your financial goals and see if there are opportunities where I can provide value. Would you be open to a brief conversation this week?

I look forward to hearing from you.

Best regards,
{{agentName}}`,
    category: "Initial Contact",
  },
  {
    name: "Follow-up After Meeting",
    subject: "Great meeting you, {{firstName}}!",
    body: `Hi {{firstName}},

Thank you for taking the time to meet with me today. I really enjoyed our conversation and learning more about your financial goals.

Here are the key points we discussed:
- Your current situation
- Your financial goals
- Next steps

I'll follow up with the information we discussed. In the meantime, please don't hesitate to reach out if you have any questions.

Best regards,
{{agentName}}`,
    category: "Follow-up",
  },
  {
    name: "Insurance Quote Follow-up",
    subject: "Following up on your insurance quote",
    body: `Hi {{firstName}},

I wanted to follow up on the insurance quote I sent you last week. Have you had a chance to review it?

Based on our conversation, I identified a protection gap of \${{protectionGap}} that we can address with the proposed coverage.

I'd be happy to answer any questions you might have or schedule a call to discuss the details further.

Looking forward to hearing from you.

Best regards,
{{agentName}}`,
    category: "Insurance Quote",
  },
  {
    name: "Career Opportunity Intro",
    subject: "Exciting career opportunity in financial services",
    body: `Hi {{firstName}},

I hope this message finds you well. I wanted to reach out because I think you'd be a great fit for a career in financial services.

Our team is growing, and we're looking for motivated individuals who want to:
- Build their own business
- Help families secure their financial future
- Achieve unlimited income potential
- Work with a supportive team

Would you be interested in learning more about this opportunity? I'd love to schedule a brief call to discuss what this could look like for you.

Best regards,
{{agentName}}`,
    category: "Career Opportunity",
  },
  {
    name: "Thank You After Sale",
    subject: "Congratulations on your new policy!",
    body: `Hi {{firstName}},

Congratulations! I'm so excited that we were able to put your new policy in place.

This is an important step in securing your family's financial future, and I'm honored to be part of that journey with you.

You should receive your policy documents within the next few weeks. In the meantime, if you have any questions, please don't hesitate to reach out.

Thank you for trusting me with your family's financial security.

Best regards,
{{agentName}}`,
    category: "Thank You",
  },
  {
    name: "Policy Delivery",
    subject: "Your policy is now active",
    body: `Hi {{firstName}},

Great news! Your policy is now active and in force.

Here are the important details:
- Policy Number: [To be filled in]
- Coverage Amount: [To be filled in]
- Monthly Premium: [To be filled in]
- Effective Date: [To be filled in]

Please review the attached policy documents carefully. If you have any questions about your coverage, I'm here to help.

Welcome to the family!

Best regards,
{{agentName}}`,
    category: "Policy Delivery",
  },
  {
    name: "Annual Review Reminder",
    subject: "Time for your annual policy review",
    body: `Hi {{firstName}},

I hope this message finds you well! It's been about a year since we put your policy in place, and I wanted to reach out to schedule your annual review.

During this review, we'll:
- Ensure your coverage still meets your needs
- Update any life changes (marriage, children, new home, etc.)
- Review your beneficiaries
- Discuss any new financial goals

This is a great opportunity to make sure you're still on track. Would you be available for a quick call in the next week or two?

Looking forward to connecting.

Best regards,
{{agentName}}`,
    category: "Annual Review",
  },
  {
    name: "Referral Request",
    subject: "Who do you know that I should know?",
    body: `Hi {{firstName}},

I hope you and your family are doing well!

As you know, I'm passionate about helping families secure their financial future. I'm currently looking to connect with more people who could benefit from the work I do.

Would you happen to know anyone, such as friends, family members, or colleagues, who might be interested in reviewing their financial situation?

The best referrals are:
- New parents
- Recent homeowners
- Small business owners
- Anyone concerned about their family's financial security

I'd really appreciate any introductions you can make. Thank you for thinking of me!

Best regards,
{{agentName}}`,
    category: "Referral Request",
  },
];

export const EMAIL_CATEGORIES = [
  "Initial Contact",
  "Follow-up",
  "Insurance Quote",
  "Career Opportunity",
  "Thank You",
  "Policy Delivery",
  "Annual Review",
  "Referral Request",
] as const;

export type EmailCategory = typeof EMAIL_CATEGORIES[number];
