import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

type TwoFactorForm = {
    two_factor_code: string;
};

type Props = {
    user: {
        email: string;
    };
};

export default function VerifyTwoFactor({ user }: Props) {
    const { data, setData, post, processing, errors } = useForm<TwoFactorForm>({
        two_factor_code: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('2fa.verify'));
    };

    return (
        <AuthLayout
            title="Two-Factor Authentication"
            description={`Enter the 6-digit code sent to ${user.email} to verify your identity`}
        >
            <Head title="Verify 2FA" />

            <form onSubmit={submit} className="flex flex-col gap-6">
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="two_factor_code">Authentication Code</Label>
                        <Input
                            id="two_factor_code"
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            autoFocus
                            value={data.two_factor_code}
                            onChange={(e) => setData('two_factor_code', e.target.value)}
                            placeholder="Enter the 6-digit code"
                        />
                        <InputError message={errors.two_factor_code} />
                    </div>

                    <Button type="submit" className="mt-4 w-full" disabled={processing}>
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin mr-2" />}
                        Verify Code
                    </Button>
                </div>
            </form>
        </AuthLayout>
    );
}
