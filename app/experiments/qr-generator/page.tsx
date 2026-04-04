import { redirect } from 'next/navigation';

export default function LegacyQrGeneratorPage() {
	redirect('/apps/qr-generator');
}
