import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, useForm, usePage } from '@inertiajs/react';

import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import HeadingSmall from '@/components/heading-small';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Two-Factor Authentication',
        href: '/settings/two-factor-authentication',
    },
];

export default function TwoFactorAuthentication() {
    const { auth } = usePage<SharedData>().props;

    const {
        post,
        delete: destroy,
        processing,
        recentlySuccessful,
    } = useForm();

    const twoFactorEnabled = auth.user.two_factor_enabled;
    const qrCodeSvg = auth.user.qr_code_svg || null;
    const recoveryCodes = auth.user.recovery_codes || [];

    const enableTwoFactor = () => post(route('two-factor.enable'));
    const disableTwoFactor = () => destroy(route('two-factor.disable'));
    const regenerateRecoveryCodes = () => post(route('two-factor.regenerate-recovery-codes'));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Two-Factor Authentication" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Two-Factor Authentication" description="Add extra security to your account using two-factor authentication." />

                    {twoFactorEnabled ? (
                        <>
                            <div className="bg-green-50 border border-green-200 p-4 rounded">
                                <p className="text-green-800">Two-factor authentication is <strong>enabled</strong>.</p>
                            </div>

                            {qrCodeSvg && (
                                <div className="mt-4">
                                    <p className="text-sm text-muted-foreground mb-2">Scan this QR code with your authenticator app:</p>
                                    <div
                                        className="p-4 border rounded bg-white inline-block"
                                        dangerouslySetInnerHTML={{ __html: qrCodeSvg }}
                                    />
                                </div>
                            )}

                            {recoveryCodes.length > 0 && (
                                <div className="mt-4">
                                    <p className="text-sm text-muted-foreground mb-2">Recovery codes:</p>
                                    <div className="grid grid-cols-2 gap-2 font-mono bg-gray-100 p-4 rounded">
                                        {recoveryCodes.map((code, idx) => (
                                            <span key={idx}>{code}</span>
                                        ))}
                                    </div>
                                    <Button
                                        className="mt-4"
                                        onClick={regenerateRecoveryCodes}
                                        disabled={processing}
                                    >
                                        Regenerate Recovery Codes
                                    </Button>
                                </div>
                            )}

                            <Button
                                variant="destructive"
                                className="mt-6"
                                onClick={disableTwoFactor}
                                disabled={processing}
                            >
                                Disable Two-Factor Authentication
                            </Button>
                        </>
                    ) : (
                        <>
                            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
                                <p className="text-yellow-800">Two-factor authentication is currently <strong>disabled</strong>.</p>
                            </div>

                            <Button
                                className="mt-4"
                                onClick={enableTwoFactor}
                                disabled={processing}
                            >
                                Enable Two-Factor Authentication
                            </Button>
                        </>
                    )}

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-green-600 mt-4">Changes saved successfully.</p>
                    </Transition>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
