import type { Priority, Status, Ticket } from '../types';
const customers = [
  [
    'Olivia Rhye',
    'olivia@acme.com',
    'Acme',
    'Unable to access my account',
    'Account',
    'High',
    'Open',
  ],
  [
    'Phoenix Baker',
    'phoenix@layers.design',
    'Layers',
    'Charged twice for my subscription',
    'Billing',
    'High',
    'In Progress',
  ],
  [
    'Lana Steiner',
    'lana@sisyphus.com',
    'Sisyphus',
    'How do I invite my team?',
    'Getting started',
    'Low',
    'Open',
  ],
  [
    'Demi Wilkinson',
    'demi@catalog.studio',
    'Catalog',
    'Export is missing recent orders',
    'Technical',
    'Medium',
    'In Progress',
  ],
  [
    'Drew Cano',
    'drew@circooles.com',
    'Circooles',
    'Update the billing email address',
    'Billing',
    'Low',
    'Resolved',
  ],
  [
    'Natali Craig',
    'natali@hourglass.app',
    'Hourglass',
    'Notifications are not coming through',
    'Technical',
    'Medium',
    'Open',
  ],
  [
    'Orlando Diggs',
    'orlando@command.dev',
    'Command',
    'Need help upgrading our plan',
    'Billing',
    'Medium',
    'Open',
  ],
  [
    'Andi Lane',
    'andi@quotient.co',
    'Quotient',
    'Password reset link has expired',
    'Account',
    'High',
    'Resolved',
  ],
  [
    'Kate Morrison',
    'kate@mint.co',
    'Mint',
    'Dashboard takes too long to load',
    'Technical',
    'High',
    'In Progress',
  ],
  [
    'Arjun Mehta',
    'arjun@frame.co',
    'Frame',
    'Can I change the workspace name?',
    'Account',
    'Low',
    'Open',
  ],
  [
    'Sofia Chen',
    'sofia@bloom.studio',
    'Bloom',
    'Requesting an invoice for last month',
    'Billing',
    'Low',
    'Resolved',
  ],
  [
    'Noah Williams',
    'noah@orbit.io',
    'Orbit',
    'Integration stopped syncing',
    'Technical',
    'High',
    'In Progress',
  ],
  [
    'Isabella Rossi',
    'isabella@forma.design',
    'Forma',
    'Where can I find my order history?',
    'Getting started',
    'Low',
    'Resolved',
  ],
  [
    'Ethan Brooks',
    'ethan@northstar.co',
    'Northstar',
    'Unable to download a PDF report',
    'Technical',
    'Medium',
    'Open',
  ],
  [
    'Ava Patel',
    'ava@fieldwork.co',
    'Fieldwork',
    'Team member cannot edit projects',
    'Account',
    'Medium',
    'In Progress',
  ],
  [
    'Lucas Martin',
    'lucas@folio.app',
    'Folio',
    'Changing from monthly to annual billing',
    'Billing',
    'Low',
    'Resolved',
  ],
  [
    'Mia Thompson',
    'mia@haven.co',
    'Haven',
    'Uploaded images appear blurry',
    'Technical',
    'Medium',
    'Open',
  ],
  [
    'Liam Wilson',
    'liam@pulse.io',
    'Pulse',
    'Two-factor authentication not working',
    'Account',
    'High',
    'In Progress',
  ],
  [
    'Amara Okafor',
    'amara@kinfolk.co',
    'Kinfolk',
    'Help with importing customer data',
    'Getting started',
    'Medium',
    'Open',
  ],
  [
    'Leo Fischer',
    'leo@studiohaus.de',
    'Studiohaus',
    'Cancel a duplicate workspace',
    'Account',
    'Low',
    'Resolved',
  ],
  [
    'Chloe Davis',
    'chloe@weave.app',
    'Weave',
    'Getting an error when saving changes',
    'Technical',
    'High',
    'In Progress',
  ],
  [
    'Oliver Kim',
    'oliver@pathway.co',
    'Pathway',
    'Question about storage limits',
    'Getting started',
    'Low',
    'Resolved',
  ],
  [
    'Zara Ahmed',
    'zara@tidal.studio',
    'Tidal',
    'Webhook events are delayed',
    'Technical',
    'Medium',
    'Open',
  ],
  [
    'James Taylor',
    'james@linearworks.co',
    'Linearworks',
    'Add a tax ID to our invoices',
    'Billing',
    'Low',
    'Open',
  ],
];
const descriptions: Record<string, string> = {
  Account:
    'I need some help with my workspace account. I have already tried signing out and back in, but that did not resolve the issue. Could you take a look and let me know what to do next?',
  Billing:
    'I noticed this while reviewing our workspace billing. Could you please check our account and help me make the necessary changes? Happy to provide any additional information you need.',
  'Getting started':
    'We are getting our team set up and could use a little guidance with this. I checked the available settings but could not find the right option. Could you walk me through the next steps?',
  Technical:
    'This started happening earlier today and is affecting our team’s workflow. I have tried refreshing the page and using a different browser, but the issue is still there. Please help us investigate.',
};
export function createSeedTickets(now = Date.now()): Ticket[] {
  return customers.map(([name, email, company, subject, category, priority, status], index) => {
    const createdAt = new Date(now - (index * 5 + 1) * 3600000).toISOString();
    const description =
      index === 0
        ? 'Hi team, I have been unable to sign in to my account since this morning. After entering my credentials, I see “Something went wrong. Please try again.” I have tried resetting my password and clearing my browser cache, but neither has helped. I need to access our project files for a meeting this afternoon. Could you please help?'
        : descriptions[category];
    const ticket: Ticket = {
      id: `TK-${1048 - index}`,
      customer: { name, email, company },
      subject,
      description,
      category,
      priority: priority as Priority,
      status: status as Status,
      createdAt,
      messages: [
        { id: `msg-${index}-1`, author: name, role: 'customer', body: description, createdAt },
      ],
    };
    if (status !== 'Open')
      ticket.messages.push({
        id: `msg-${index}-2`,
        author: 'Jamie Davis',
        role: 'agent',
        body:
          status === 'Resolved'
            ? 'Thanks for your patience. This has now been taken care of and we have confirmed everything is working. If you need anything else, just reply here and we will be happy to help.'
            : 'Thanks for letting us know. I am looking into this with our team and will share an update as soon as I have more information.',
        createdAt: new Date(new Date(createdAt).getTime() + 1800000).toISOString(),
      });
    return ticket;
  });
}
