import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Transition } from '@headlessui/react';

import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import HeadingSmall from '@/components/heading-small';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Two-Factor Authentication',
        href: '/settings/two-factor-authentication',
    },
];

type FormData = {
    is_two_factor_enabled: boolean;
};

export default function TwoFactorAuthentication() {
    const { auth } = usePage<SharedData>().props;

    const {
        data,
        setData,
        patch,
        processing,
        recentlySuccessful,
    } = useForm<FormData>({
        is_two_factor_enabled: auth.user.is_two_factor_enabled ?? false,
    });

    const toggle2FA = () => {
        patch(route('settings.2fa'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Two-Factor Authentication" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall
                        title="Two-Factor Authentication"
                        description="Add extra security to your account by enabling email-based two-factor authentication."
                    />

                    <div className="flex items-center justify-between border p-4 rounded bg-white shadow-sm">
                        <div>
                            <p className="font-medium">Enable Two-Factor Authentication</p>
                            <p className="text-sm text-muted-foreground">
                                When enabled, a verification code will be sent to your email after login.
                            </p>
                        </div>

                        <Switch
                            checked={data.is_two_factor_enabled}
                            onCheckedChange={(checked: boolean) =>
                                setData('is_two_factor_enabled', checked)
                            }
                            disabled={processing}
                        />
                    </div>

                    <Button
                        onClick={toggle2FA}
                        disabled={processing}
                        variant="default"
                    >
                        Save Changes
                    </Button>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="transition ease-in-out duration-300"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-green-600 mt-4">
                            Two-factor authentication setting updated successfully.
                        </p>
                    </Transition>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
