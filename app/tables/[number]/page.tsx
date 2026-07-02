import TablePageClient from './TablePageClient';

export function generateStaticParams() {
  return Array.from({ length: 12 }, (_, i) => ({
    number: String(i + 1),
  }));
}

export default function TablePage({ params }: { params: { number: string } }) {
  const num = parseInt(params.number) || 1;
  return <TablePageClient num={num} />;
}
