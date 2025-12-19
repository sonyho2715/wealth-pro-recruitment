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
    name: "Warm Market Intro",
    subject: "Quick question for you, {{firstName}}",
    body: `Hey {{firstName}},

Hope you're doing well! I wanted to reach out because I recently started working with a company that helps families with financial planning and protection.

I'm not sure if it's something you'd be interested in, but I thought of you because I know how much you care about your family's future.

Would you be open to a quick chat? No pressure at all. I just want to share what I've been learning.

Talk soon,
{{agentName}}`,
    category: "Initial Contact",
  },
  {
    name: "LinkedIn Connection Follow-up",
    subject: "Great connecting with you!",
    body: `Hi {{firstName}},

Thanks for connecting with me on LinkedIn! I noticed you work in {{industry}} and thought we might have some things in common.

I help professionals like yourself plan for financial security. Whether it's protecting your income, planning for retirement, or building wealth, I'd love to learn more about your goals.

Would you be open to a brief call this week?

Best,
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
  {
    name: "Appointment Confirmation",
    subject: "Confirmed: Our meeting on {{date}}",
    body: `Hi {{firstName}},

This email confirms our meeting scheduled for:

Date: {{date}}
Time: {{time}}
Location/Call: {{location}}

I'm looking forward to discussing your financial goals and exploring how I can help you and your family.

If you need to reschedule, please let me know at least 24 hours in advance.

See you soon!

Best regards,
{{agentName}}`,
    category: "Appointment",
  },
  {
    name: "Appointment Reminder",
    subject: "Reminder: Our meeting tomorrow",
    body: `Hi {{firstName}},

Just a friendly reminder about our meeting tomorrow at {{time}}.

We'll be discussing:
- Your current financial situation
- Your goals and priorities
- Potential solutions to help you achieve them

Please have any relevant documents ready if possible. Looking forward to our conversation!

Best regards,
{{agentName}}`,
    category: "Appointment",
  },
  {
    name: "No-Show Follow-up",
    subject: "We missed you today",
    body: `Hi {{firstName}},

I hope everything is okay! We had a meeting scheduled for today, but I wasn't able to connect with you.

I understand things come up, so no worries at all. Would you like to reschedule for a time that works better for you?

Just let me know your availability, and I'll make it work.

Best regards,
{{agentName}}`,
    category: "Follow-up",
  },
  {
    name: "Happy Birthday",
    subject: "Happy Birthday, {{firstName}}! 🎂",
    body: `Hi {{firstName}},

Wishing you a very happy birthday! 🎂

I hope your day is filled with joy, laughter, and wonderful moments with loved ones.

Here's to another amazing year ahead!

Warm regards,
{{agentName}}`,
    category: "Birthday/Holiday",
  },
  {
    name: "Holiday Greetings",
    subject: "Happy Holidays from {{agentName}}",
    body: `Hi {{firstName}},

As we approach the holiday season, I wanted to take a moment to thank you for your trust and friendship this year.

Wishing you and your family a wonderful holiday season filled with peace, joy, and prosperity.

Here's to a healthy and successful new year!

Warm regards,
{{agentName}}`,
    category: "Birthday/Holiday",
  },
  {
    name: "New Year Check-in",
    subject: "New Year, New Goals?",
    body: `Hi {{firstName}},

Happy New Year! I hope 2025 is off to a great start for you and your family.

The new year is a perfect time to review your financial goals. Have you thought about:
- Increasing your protection coverage?
- Starting or maximizing retirement contributions?
- Building an emergency fund?
- Exploring additional income opportunities?

I'd love to help you make this year your best one yet financially. Would you be open to a quick review call?

Best regards,
{{agentName}}`,
    category: "Annual Review",
  },
  {
    name: "Life Event Check-in",
    subject: "Congratulations! Let's review your coverage",
    body: `Hi {{firstName}},

I heard about your recent {{lifeEvent}}! Congratulations!

Major life changes often mean it's a good time to review your financial plan. Things like:
- Updating beneficiaries
- Adjusting coverage amounts
- Reviewing retirement projections
- Planning for new expenses

Would you have 15 minutes this week to chat? I want to make sure you and your family are fully protected.

Best regards,
{{agentName}}`,
    category: "Follow-up",
  },
  {
    name: "Policy Renewal Notice",
    subject: "Your policy renewal is coming up",
    body: `Hi {{firstName}},

I wanted to give you a heads up that your policy renewal is approaching.

This is a great opportunity to:
- Review your current coverage
- Discuss any life changes that may affect your needs
- Explore potential improvements or cost savings

Let's schedule a quick call to make sure everything is still aligned with your goals.

Best regards,
{{agentName}}`,
    category: "Annual Review",
  },
  {
    name: "Recruitment Follow-up",
    subject: "Still thinking about that opportunity?",
    body: `Hi {{firstName}},

I wanted to follow up on our conversation about a career in financial services.

I know it's a big decision, and I want to make sure you have all the information you need. Here are some things to consider:

- Unlimited earning potential
- Flexible schedule
- Help families while building your own business
- Comprehensive training and support
- No ceiling on your success

Would you be open to meeting some of our successful team members? Sometimes hearing their stories helps put things in perspective.

Let me know what questions you have!

Best regards,
{{agentName}}`,
    category: "Career Opportunity",
  },
  {
    name: "Business Opportunity Presentation Invite",
    subject: "You're invited: Financial Services Career Info Session",
    body: `Hi {{firstName}},

I'm hosting an informational session about career opportunities in financial services, and I'd love for you to attend.

Event Details:
Date: {{date}}
Time: {{time}}
Location: {{location}}

What you'll learn:
- How the financial services industry works
- Income potential and compensation structure
- Training and support provided
- Real success stories from our team

This is a no-pressure event. Just come with an open mind and see if this could be the right fit for you.

RSVP by replying to this email.

Best regards,
{{agentName}}`,
    category: "Career Opportunity",
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
  "Appointment",
  "Birthday/Holiday",
] as const;

export type EmailCategory = typeof EMAIL_CATEGORIES[number];

// SMS Templates
export interface SMSTemplate {
  name: string;
  body: string;
  category: string;
}

export const DEFAULT_SMS_TEMPLATES: SMSTemplate[] = [
  {
    name: "Initial Text Intro",
    body: `Hi {{firstName}}, this is {{agentName}}. I help families with financial planning and protection. Would you be open to a quick chat? No pressure!`,
    category: "Initial Contact",
  },
  {
    name: "Follow-up Text",
    body: `Hey {{firstName}}, just following up on my message. When's a good time for a quick 10-min call this week?`,
    category: "Follow-up",
  },
  {
    name: "Appointment Reminder",
    body: `Hi {{firstName}}, just a reminder about our call tomorrow at {{time}}. Looking forward to chatting! - {{agentName}}`,
    category: "Appointment",
  },
  {
    name: "Same Day Appointment",
    body: `Hey {{firstName}}, looking forward to our call today at {{time}}. Talk soon! - {{agentName}}`,
    category: "Appointment",
  },
  {
    name: "No Show Follow-up",
    body: `Hi {{firstName}}, I missed you for our call. No worries, things happen! Want to reschedule? Let me know what works. - {{agentName}}`,
    category: "Follow-up",
  },
  {
    name: "Quote Ready",
    body: `Hey {{firstName}}, great news! Your quote is ready. Can we chat for 10 mins so I can walk you through it? - {{agentName}}`,
    category: "Insurance Quote",
  },
  {
    name: "Quick Check-in",
    body: `Hi {{firstName}}, just checking in! Any questions about what we discussed? I'm here if you need anything. - {{agentName}}`,
    category: "Follow-up",
  },
  {
    name: "Thank You Text",
    body: `{{firstName}}, thank you so much for your time today! Really enjoyed our conversation. I'll send over the details we discussed. - {{agentName}}`,
    category: "Thank You",
  },
  {
    name: "Policy Approved",
    body: `Great news {{firstName}}! Your policy has been approved! Let's schedule a quick call to finalize everything. - {{agentName}}`,
    category: "Policy Delivery",
  },
  {
    name: "Birthday Wish",
    body: `Happy Birthday {{firstName}}! 🎂 Hope you have an amazing day! - {{agentName}}`,
    category: "Birthday/Holiday",
  },
  {
    name: "Referral Ask",
    body: `Hey {{firstName}}, quick favor! Who do you know that might benefit from financial planning? Even just 1-2 names would be huge! Thanks! - {{agentName}}`,
    category: "Referral Request",
  },
  {
    name: "Career Opportunity Text",
    body: `Hey {{firstName}}, random question - have you ever thought about a career in financial services? We're hiring and I thought of you! Interested in learning more?`,
    category: "Career Opportunity",
  },
  {
    name: "Annual Review Reminder",
    body: `Hi {{firstName}}, it's been a year since we set up your policy! Time for a quick review. When works for a 15-min call? - {{agentName}}`,
    category: "Annual Review",
  },
  {
    name: "Application Status",
    body: `Hey {{firstName}}, just wanted to update you - your application is being processed! I'll keep you posted. Any questions? - {{agentName}}`,
    category: "Policy Delivery",
  },
  {
    name: "Warm Lead Response",
    body: `Hi {{firstName}}, {{referrerName}} mentioned you might be interested in financial planning. Would love to connect! When's a good time for a quick call?`,
    category: "Initial Contact",
  },
];

export const SMS_CATEGORIES = [
  "Initial Contact",
  "Follow-up",
  "Appointment",
  "Insurance Quote",
  "Thank You",
  "Policy Delivery",
  "Birthday/Holiday",
  "Referral Request",
  "Career Opportunity",
  "Annual Review",
] as const;

export type SMSCategory = typeof SMS_CATEGORIES[number];
