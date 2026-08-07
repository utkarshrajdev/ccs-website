import { FaFacebook, FaInstagram, FaLinkedin, FaWhatsapp } from 'react-icons/fa';
import { FiMail, FiMapPin, FiPhone } from 'react-icons/fi';
import useSeo from '../hooks/useSeo';
import useSheetData from '../hooks/useSheetData';
import { getContactInfo } from '../services/sheetsService';
import { FORM_TYPES } from '../services/leadService';
import Breadcrumbs from '../components/common/Breadcrumbs';
import Reveal from '../components/common/Reveal';
import LeadForm from '../components/forms/LeadForm';

export default function Contact() {
  useSeo({ title: 'Contact Us', description: 'Get in touch with Champaran Consultancy Services - phone, email, WhatsApp or visit our office.', path: '/contact' });

  const { data: contact } = useSheetData(getContactInfo);

  const socials = [
    { icon: FaFacebook, href: contact?.facebook, label: 'Facebook' },
    { icon: FaInstagram, href: contact?.instagram, label: 'Instagram' },
    { icon: FaLinkedin, href: contact?.linkedin, label: 'LinkedIn' },
  ].filter((s) => s.href);

  const whatsappNumber = String(contact?.whatsapp || '').replace(/[^0-9]/g, '');

  return (
    <div className="container-x section !pt-10">
      <Breadcrumbs items={[{ label: 'Contact' }]} />
      <div className="mb-10">
        <h1 className="mb-2 text-3xl font-bold md:text-4xl">Contact Us</h1>
        <p className="text-slate-500">We'd love to hear from you. Reach out any way you like.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Info */}
        <Reveal>
          <div className="space-y-5">
            {[
              { icon: FiPhone, label: 'Phone', value: contact?.phone, href: `tel:${contact?.phone}` },
              { icon: FiMail, label: 'Email', value: contact?.email, href: `mailto:${contact?.email}` },
              { icon: FaWhatsapp, label: 'WhatsApp', value: contact?.whatsapp, href: `https://wa.me/${whatsappNumber}` },
              { icon: FiMapPin, label: 'Address', value: contact?.address },
            ]
              .filter((item) => item.value)
              .map(({ icon: Icon, label, value, href }) => (
                <div key={label} className="card flex items-center gap-4 p-5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-900/40">
                    <Icon size={20} aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-400">{label}</p>
                    {href ? (
                      <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className="font-semibold hover:text-primary-600 transition">
                        {value}
                      </a>
                    ) : (
                      <p className="font-semibold">{value}</p>
                    )}
                  </div>
                </div>
              ))}

            {socials.length > 0 && (
              <div className="flex gap-3">
                {socials.map(({ icon: Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-primary-50 hover:text-primary-600 dark:bg-slate-800 transition"
                  >
                    <Icon size={18} aria-hidden="true" />
                  </a>
                ))}
              </div>
            )}

            {contact?.googleMapUrl && (
              <div className="card overflow-hidden">
                <iframe
                  src={contact.googleMapUrl}
                  title="Office location on Google Maps"
                  className="h-64 w-full border-0"
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            )}
          </div>
        </Reveal>

        {/* Lead capture form */}
        <Reveal delay={0.1}>
          <LeadForm
            formType={FORM_TYPES.CONTACT}
            title="Send a Message"
            subtitle="Fill this in and we'll get back to you - usually within 24 hours."
          />
        </Reveal>
      </div>
    </div>
  );
}
