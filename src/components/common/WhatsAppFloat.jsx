import { FaWhatsapp } from 'react-icons/fa';
import useSheetData from '../../hooks/useSheetData';
import { getContactInfo } from '../../services/sheetsService';

export default function WhatsAppFloat() {
  const { data: contact } = useSheetData(getContactInfo);
  const number = contact?.whatsapp?.toString().replace(/[^0-9]/g, '');
  if (!number) return null;

  return (
    <a
      href={`https://wa.me/${number}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-6 right-5 z-40 flex h-13 w-13 items-center justify-center rounded-full bg-[#25D366] p-3.5 text-white shadow-card-hover transition hover:scale-105"
    >
      <FaWhatsapp size={26} aria-hidden="true" />
    </a>
  );
}
