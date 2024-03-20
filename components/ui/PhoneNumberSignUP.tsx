/* eslint-disable @next/next/no-img-element */
import {
    RecaptchaVerifier,
    PhoneAuthProvider,
    signInWithCredential,
    signInWithPhoneNumber,
    ApplicationVerifier,
} from 'firebase/auth';
import { firebaseAuth } from '@/components/firebase/firebaseAuth';
import { useEffect, useState } from 'react';
import Modal from '@/components/ui/Modal';
import ToastBox from '@/components/ui/ToastBox';
import { useAppDispatch } from '@/components/redux/store';
import { showToast } from '@/components/redux/toast/toastSlice';
import Input from '@/components/ui/Input';
import LoadingButton from '@/components/ui/LoadingButton';

const PhoneSignUp = () => {
    const dispatch = useAppDispatch();
    const [phoneNumber, setPhoneNumber] = useState('');
    const [OTPCode, setOTPCode] = useState('');
    const [show, setShow] = useState(false);
    const [sendVerificationLoading, setSendVerificationLoading] = useState(false);
    const [verifyPhoneNumberLoading, setVerifyPhoneNumberLoading] = useState(false);

    const [recaptcha, setRecaptcha] = useState<RecaptchaVerifier | null>(null);
    const [recaptchaResolved, setRecaptchaResolved] = useState(false);
    const [verificationId, setVerificationId] = useState('');

    // Sending OTP and storing id to verify it later
    const handleSendVerification = async () => {
        if (recaptchaResolved === false) {
            dispatch(
                showToast({
                    message: 'Please verify the recaptcha',
                    type: 'info',
                })
            );
            return;
        }

        setSendVerificationLoading(true);

        signInWithPhoneNumber(firebaseAuth, phoneNumber, recaptcha as ApplicationVerifier)
            .then((result) => {
                setShow(true);
                setVerificationId(result.verificationId);
                setSendVerificationLoading(false);
            })
            .catch((error) => {
                setSendVerificationLoading(false);
                console.log('error', error);
            });
    };

    // Validating the filled OTP by user
    const ValidateOtp = async () => {
        setVerifyPhoneNumberLoading(true);
        const credential = PhoneAuthProvider.credential(verificationId, OTPCode);

        try {
            await signInWithCredential(firebaseAuth, credential);
            setVerifyPhoneNumberLoading(false);
        } catch (error: any) {
            setVerifyPhoneNumberLoading(false);
            console.log('error', error.message);
        }
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
                            <div className="px-4 max-w-sm mx-auto flex flex-col items-center gap-4 pb-10">
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
