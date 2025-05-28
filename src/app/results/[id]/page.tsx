import ResultsDisplay from '@/components/ResultsDisplay';

type ResultsPageProps = {
  params: { id: string };
};

export default function ResultsPage({ params }: ResultsPageProps) {
  return (
    <div className="py-8">
      <ResultsDisplay pollId={params.id} />
    </div>
  );
}
