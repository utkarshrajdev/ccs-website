import { useSearchParams } from 'react-router-dom';
import useSeo from '../hooks/useSeo';
import useSheetData from '../hooks/useSheetData';
import { getServices } from '../services/sheetsService';
import { FORM_TYPES } from '../services/leadService';
import Breadcrumbs from '../components/common/Breadcrumbs';
import LeadForm from '../components/forms/LeadForm';
import Reveal from '../components/common/Reveal';

/** Deep-linkable consultancy enquiry page: /consultancy/enquire?service=Study%20Abroad */
export default function ConsultancyEnquire() {
  const [params] = useSearchParams();
  const service = params.get('service') || '';
  const { data: services } = useSheetData(getServices);

  useSeo({
    title: service ? `Enquire - ${service}` : 'Consultancy Enquiry',
    description: 'Book a consultation for study abroad, career guidance, resume building, interviews and more.',
    path: '/consultancy/enquire',
  });

  const options = (services || []).map((s) => s.title);

  return (
    <div className="container-x section !pt-10">
      <Breadcrumbs items={[{ label: 'Consultancy', path: '/consultancy' }, { label: 'Enquire' }]} />
      <div className="mx-auto max-w-2xl">
        <Reveal>
          <h1 className="mb-2 text-3xl font-bold">Consultancy Enquiry</h1>
          <p className="mb-8 text-slate-500">
            Tell us what you need help with and an expert from the relevant team will call you back.
          </p>
        </Reveal>
        <Reveal delay={0.08}>
          <LeadForm
            formType={FORM_TYPES.CONSULTANCY_ENQUIRY}
            title="Book a Consultation"
            select={{ name: 'service', label: 'Service', options, value: service }}
          />
        </Reveal>
      </div>
    </div>
  );
}
