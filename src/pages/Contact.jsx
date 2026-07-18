import { useState } from 'react';
import { FaFacebook, FaInstagram, FaLinkedin, FaWhatsapp } from 'react-icons/fa';
import { FiMail, FiMapPin, FiPhone, FiSend } from 'react-icons/fi';
import useSeo from '../hooks/useSeo';
import useSheetData from '../hooks/useSheetData';
import { getContactInfo } from '../services/sheetsService';
import Breadcrumbs from '../components/common/Breadcrumbs';
import Button from '../components/common/Button';
import Reveal from '../components/common/Reveal';
import { useToast } from '../components/common/Toast';

export default function Contact() {
  useSeo({ title: 'Contact Us', description: 'Get in touch with Champaran Consultancy Services — phone, email, WhatsApp or visit our office.', path: '/contact' });

  const { data: contact } = useSheetData(getContactInfo);
  const showToast = useToast();
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });

  const socials = [
    { icon: FaFacebook, href: contact?.facebook, label: 'Facebook' },
    { icon: FaInstagram, href: contact?.instagram, label: 'Instagram' },
    { icon: FaLinkedin, href: contact?.linkedin, label: 'LinkedIn' },
  ].filter((s) => s.href);

  const whatsappNumber = String(contact?.whatsapp || '').replace(/[^0-9]/g, '');

  // Frontend-only form: opens the visitor's email client with a pre-filled message.
  const handleSubmit = (e) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Website enquiry from ${form.name}`);
    const body = encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phone}\n\n${form.message}`);
    window.location.href = `mailto:${contact?.email || ''}?subject=${subject}&body=${body}`;
    showToast('Opening your email app…', 'info');
  };

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

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

        {/* Form */}
        <Reveal delay={0.1}>
          <form onSubmit={handleSubmit} className="card p-7" aria-label="Contact form">
            <h2 className="mb-5 text-xl font-bold">Send a Message</h2>
            <div className="space-y-4">
              <label className="block text-sm font-medium">
                Name
                <input type="text" required value={form.name} onChange={update('name')} className="input mt-1.5" placeholder="Your full name" />
              </label>
              <label className="block text-sm font-medium">
                Email
                <input type="email" required value={form.email} onChange={update('email')} className="input mt-1.5" placeholder="you@example.com" />
              </label>
              <label className="block text-sm font-medium">
                Phone
                <input type="tel" value={form.phone} onChange={update('phone')} className="input mt-1.5" placeholder="+91 …" />
              </label>
              <label className="block text-sm font-medium">
                Message
                <textarea required rows={5} value={form.message} onChange={update('message')} className="input mt-1.5 resize-none" placeholder="How can we help?" />
              </label>
              <Button size="lg" className="w-full" type="submit">
                <FiSend aria-hidden="true" /> Send Message
              </Button>
            </div>
          </form>
        </Reveal>
      </div>
    </div>
  );
}
