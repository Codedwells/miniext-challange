/* eslint-disable @next/next/no-img-element */
import { RecaptchaVerifier, createUserWithEmailAndPassword } from 'firebase/auth';
import { firebaseAuth } from '@/components/firebase/firebaseAuth';
import { useEffect, useState } from 'react';
import Modal from '@/components/ui/Modal';
import { useRouter } from 'next/navigation';
import ToastBox from '@/components/ui/ToastBox';
import { useAppDispatch } from '@/components/redux/store';
import { showToast } from '@/components/redux/toast/toastSlice';
import Input from '@/components/ui/Input';
import LoadingButton from '@/components/ui/LoadingButton';
import { useAuth } from '../useAuth';
import { LoadingStateTypes } from '../redux/types';
import {
    sendVerificationCode,
    useSendVerificationCodeLoading,
    useVerifyPhoneNumberLoading,
    verifyPhoneNumber,
} from '../redux/auth/verifyPhoneNumber';

const PhoneSignUp = () => {
    const dispatch = useAppDispatch();
    const auth = useAuth();
    const [phoneNumber, setPhoneNumber] = useState('');
    const [OTPCode, setOTPCode] = useState('');
    const [show, setShow] = useState(false);

    const sendVerificationLoading = useSendVerificationCodeLoading();
    const verifyPhoneNumberLoading = useVerifyPhoneNumberLoading();

    const [recaptcha, setRecaptcha] = useState<RecaptchaVerifier | null>(null);
    const [recaptchaResolved, setRecaptchaResolved] = useState(false);
    const [verificationId, setVerificationId] = useState('');
    const router = useRouter();

    // Sending OTP and storing id to verify it later
    const handleSendVerification = async () => {
        const tempEmail = `holdermail-${Math.floor(Math.random() * 1_000_000)}@gmail.com`;
        const tempPassword = Math.floor(Math.random() * 1_000_000);
        // Create a new user with temp email and password random password
        // This is a workaround to create a new user with phone number

        await createUserWithEmailAndPassword(firebaseAuth, tempEmail, String(tempPassword));

        if (auth.type !== LoadingStateTypes.LOADED) return;

        dispatch(
            sendVerificationCode({
                phoneNumber,
                auth,
                recaptcha,
                recaptchaResolved,
                callback: (result) => {
                    if (result.type === 'error') {
                        setRecaptchaResolved(false);
                        return;
                    }
                    setVerificationId(result.verificationId);
                    setShow(true);
                },
            })
        );
    };

    // Validating the filled OTP by user
    const ValidateOtp = async () => {
        if (auth.type !== LoadingStateTypes.LOADED) return;
        dispatch(
            verifyPhoneNumber({
                auth,
                OTPCode,
                verificationId,
                callback: (result) => {
                    if (result.type === 'error') {
                        return;
                    }
                    // needed to reload auth user
                    router.refresh();
                },
            })
        );
    };

    // generating the recaptcha on page render
    useEffect(() => {
        const captcha = new RecaptchaVerifier(firebaseAuth, 'recaptcha-container', {
            size: 'normal',
            callback: () => {
                setRecaptchaResolved(true);
            },

            'expired-callback': () => {
                setRecaptchaResolved(false);
                dispatch(
                    showToast({
                        message: 'Recaptcha Expired, please verify it again',
                        type: 'info',
                    })
                );
            },
        });

        captcha.render();

        setRecaptcha(captcha);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="flex items-center justify-center">
            <div className="w-full max-w-md space-y-8">
                <div className="max-w-xl w-full rounded overflow-hidden py-2 px-4">
                    <div className="px-4 flex p-4 pb-10 gap-4 flex-col">
                        <Input
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="phone number"
                            type="text"
                        />
                        <div id="recaptcha-container" className="mx-auto w-fit" />
                        <LoadingButton
                            onClick={handleSendVerification}
                            loading={sendVerificationLoading}
                            loadingText="Sending OTP"
                        >
                            Send OTP
                        </LoadingButton>
                    </div>
                    <Modal show={show} setShow={setShow}>
                        <div className="max-w-xl w-full bg-white py-6 rounded-lg">
                            <h2 className="text-lg font-semibold text-center mb-10">
                                Enter Code to Verify
                            </h2>
                            <div className="px-4 flex items-center gap-4 pb-10">
                                <Input
                                    value={OTPCode}
                                    type="text"
                                    placeholder="Enter your OTP"
                                    onChange={(e) => setOTPCode(e.target.value)}
                                />

                                <LoadingButton
                                    onClick={ValidateOtp}
                                    loading={verifyPhoneNumberLoading}
                                    loadingText="Verifying..."
                                >
                                    Verify
                                </LoadingButton>
                            </div>
                        </div>
                    </Modal>
                </div>
            </div>
            <ToastBox />
        </div>
    );
};

export default PhoneSignUp;
