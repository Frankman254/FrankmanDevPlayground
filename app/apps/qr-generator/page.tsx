'use client';

import { useTranslations } from '@/components/providers/locale-provider';
import { SectionHeading } from '@/components/section-heading';
import { QrGeneratorPanel } from '@/features/experiments/qr-generator/QrGeneratorPanel';

export default function QrGeneratorAppPage() {
	const t = useTranslations();

	return (
		<div className="space-y-8">
			<SectionHeading
				description={t.qrGeneratorPage.description}
				eyebrow={t.qrGeneratorPage.eyebrow}
				title={t.qrGeneratorPage.title}
			/>
			<QrGeneratorPanel />
		</div>
	);
}
