import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import useSeo from '../hooks/useSeo';
import useSheetData from '../hooks/useSheetData';
import { getTrainings } from '../services/sheetsService';
import { FORM_TYPES } from '../services/leadService';
import { slugify } from '../utils/helpers';
import Breadcrumbs from '../components/common/Breadcrumbs';
import LeadForm from '../components/forms/LeadForm';
import Reveal from '../components/common/Reveal';

/** Deep-linkable training enquiry page: /training/enquire?id=TRN001 */
export default function TrainingEnquire() {
  const [params] = useSearchParams();
  const id = params.get('id') || '';
  const { data: trainings } = useSheetData(getTrainings);

  const selected = useMemo(
    () =>
      (trainings || []).find(
        (t) => String(t.trainingId) === String(id) || slugify(t.title) === id
      ),
    [trainings, id]
  );

  useSeo({
    title: selected ? `Enquire - ${selected.title}` : 'Training Enquiry',
    description: 'Enquire about our training programs. Batch details, fees and counselling - all in one reply.',
    path: '/training/enquire',
  });

  const options = (trainings || []).map((t) => t.title);

  return (
    <div className="container-x section !pt-10">
      <Breadcrumbs items={[{ label: 'Trainings', path: '/trainings' }, { label: 'Enquire' }]} />
      <div className="mx-auto max-w-2xl">
        <Reveal>
          <h1 className="mb-2 text-3xl font-bold">Training Enquiry</h1>
          <p className="mb-8 text-slate-500">
            Tell us which program you're interested in and we'll share batch dates, fees and next steps.
          </p>
        </Reveal>
        <Reveal delay={0.08}>
          <LeadForm
            formType={FORM_TYPES.TRAINING_ENQUIRY}
            title="Enquire About a Training"
            select={{ name: 'training', label: 'Training Program', options, value: selected?.title || '' }}
            prefill={{ trainingId: selected?.trainingId || id }}
          />
        </Reveal>
      </div>
    </div>
  );
}
