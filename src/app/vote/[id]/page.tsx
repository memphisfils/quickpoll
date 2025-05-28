import VotingForm from '@/components/VotingForm';

type VotePageProps = {
  params: { id: string };
};

export default function VotePage({ params }: VotePageProps) {
  return (
    <div className="py-8">
      <VotingForm pollId={params.id} />
    </div>
  );
}
