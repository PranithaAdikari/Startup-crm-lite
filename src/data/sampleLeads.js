/**
 * @fileoverview sampleLeads — Default seed data for the Startup CRM Lite.
 *
 * This array is used as the `initialValue` for the leads localStorage key.
 * It is only applied on first load when no persisted data exists for the key
 * `'startup-crm-leads'`. After the first write, localStorage takes over and
 * this file is never consulted again unless the user clears their storage.
 *
 * Status distribution (as per requirements):
 *  - New               × 2  (Arjun Mehta, Kavya Nair)
 *  - Contacted         × 1  (Rohit Sharma)
 *  - Meeting Scheduled × 1  (Priya Iyer)
 *  - Won               × 1  (Suresh Gupta)
 *  - Lost              × 1  (Ananya Krishnan)
 *
 * @module sampleLeads
 */

/**
 * @typedef {Object} Lead
 * @property {string} id           - Unique identifier for the lead.
 * @property {string} name         - Prospect's full name.
 * @property {string} company      - Associated company name.
 * @property {string} email        - Primary contact email.
 * @property {string} phone        - Contact phone number.
 * @property {'New'|'Contacted'|'Meeting Scheduled'|'Proposal Sent'|'Won'|'Lost'} status
 * @property {'Website'|'Referral'|'LinkedIn'|'Cold Call'|'Email Campaign'|'Other'} source
 * @property {string} value        - Estimated deal value.
 * @property {string} createdAt    - ISO 8601 timestamp.
 * @property {string} dateAdded    - YYYY-MM-DD shorthand for table views.
 */

/**
 * Six realistic sample leads with varied pipeline statuses.
 * Used as the initial value when localStorage is empty.
 *
 * @type {Lead[]}
 */
export const SAMPLE_LEADS = [
  {
    // Status: New — inbound inquiry from product website
    id: 'sample-lead-1',
    name: 'Arjun Mehta',
    company: 'BridgeLayer Technologies',
    email: 'arjun.mehta@bridgelayer.in',
    phone: '+91 98201 34567',
    status: 'New',
    source: 'Website',
    value: '₹3,20,000',
    createdAt: '2026-06-23T09:15:00.000Z',
    dateAdded: '2026-06-23',
  },
  {
    // Status: New — cold inbound from LinkedIn ad campaign
    id: 'sample-lead-2',
    name: 'Kavya Nair',
    company: 'Zephyr Analytics Pvt. Ltd.',
    email: 'kavya.nair@zephyranalytics.io',
    phone: '+91 91620 78901',
    status: 'New',
    source: 'LinkedIn',
    value: '₹85,000',
    createdAt: '2026-06-22T14:30:00.000Z',
    dateAdded: '2026-06-22',
  },
  {
    // Status: Contacted — followed up via email, awaiting reply
    id: 'sample-lead-3',
    name: 'Rohit Sharma',
    company: 'Pinnacle FinServ',
    email: 'rohit.sharma@pinnaclefi.com',
    phone: '+91 87654 32109',
    status: 'Contacted',
    source: 'Cold Call',
    value: '₹5,50,000',
    createdAt: '2026-06-20T11:00:00.000Z',
    dateAdded: '2026-06-20',
  },
  {
    // Status: Meeting Scheduled — discovery call booked for next week
    id: 'sample-lead-4',
    name: 'Priya Iyer',
    company: 'NovaSpark Solutions',
    email: 'priya.iyer@novaspark.co.in',
    phone: '+91 99887 76655',
    status: 'Meeting Scheduled',
    source: 'Referral',
    value: '₹1,25,000',
    createdAt: '2026-06-19T16:45:00.000Z',
    dateAdded: '2026-06-19',
  },
  {
    // Status: Won — contract signed, implementation in progress
    id: 'sample-lead-5',
    name: 'Suresh Gupta',
    company: 'Meridian LogiTech',
    email: 's.gupta@meridianlogit.com',
    phone: '+91 70001 23456',
    status: 'Won',
    source: 'Email Campaign',
    value: '₹8,75,000',
    createdAt: '2026-06-15T08:00:00.000Z',
    dateAdded: '2026-06-15',
  },
  {
    // Status: Lost — went with a competitor after pricing negotiation
    id: 'sample-lead-6',
    name: 'Ananya Krishnan',
    company: 'Cloudwave Digital',
    email: 'ananya.k@cloudwave.digital',
    phone: '+91 63390 45678',
    status: 'Lost',
    source: 'LinkedIn',
    value: '₹2,40,000',
    createdAt: '2026-06-10T13:20:00.000Z',
    dateAdded: '2026-06-10',
  },
];

export default SAMPLE_LEADS;
