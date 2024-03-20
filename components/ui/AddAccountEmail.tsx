/* eslint-disable @next/next/no-img-element */
import { verifyBeforeUpdateEmail } from 'firebase/auth';
import { firebaseAuth } from '@/components/firebase/firebaseAuth';
import { useEffect, useState } from 'react';
import ToastBox from '@/components/ui/ToastBox';
import { useAppDispatch } from '@/components/redux/store';
import { showToast } from '@/components/redux/toast/toastSlice';
import Input from '@/components/ui/Input';
import LoadingButton from '@/components/ui/LoadingButton';
import Logout from './Logout';
import Modal from './Modal';
import Spinner from '../Spinner';

const AddAccountEmail = () => {
    const dispatch = useAppDispatch();
    const [email, setEmail] = useState('');
    const [isSettingEmail, setIsSettingEmail] = useState(false);
    const [waitingForEmailVerification, setWaitingForEmailVerification] = useState(false);

    const handleEmailUpdate = async () => {
        setIsSettingEmail(true);
        const user = firebaseAuth.currentUser;

        if (user == null) {
            dispatch(
                showToast({
                    message: 'User not found',
                    type: 'error',
                })
            );
            return;
        }

        try {
            await verifyBeforeUpdateEmail(user, email);

            dispatch(
                showToast({
                    message: 'Email updated successfully',
                    type: 'success',
                })
            );
            setIsSettingEmail(false);
            setWaitingForEmailVerification(true);
        } catch (error: any) {
            dispatch(
                showToast({
                    message: 'Error sending verification email',
                    type: 'error',
                })
            );
        }
    };

    // Polling to check if the user has verified the email
    useEffect(() => {
        const fetchUserData = async () => {
            const currentUser = firebaseAuth.currentUser;
            currentUser?.reload();

            if (currentUser?.email !== null && waitingForEmailVerification) {
                dispatch(
                    showToast({
                        message: 'Email updated successfully! Please log in to continue!',
                        type: 'success',
                    })
                );
                setWaitingForEmailVerification(false);
            }
        };

        const intervalId = setInterval(fetchUserData, 3000);

        return () => clearInterval(intervalId);
    }, [firebaseAuth]);

    return (
        <div className="flex items-center justify-center min-h-full px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8">
                <div>
                    <img
                        className="w-auto h-12 mx-auto"
                        src="https://tailwindui.com/img/logos/workflow-mark-indigo-600.svg"
                        alt="Workflow"
                    />
                    <h2 className="mt-6 text-3xl font-extrabold text-center text-gray-900">
                        Update account email
                    </h2>
                </div>

                <div className="max-w-xl w-full rounded overflow-hidden shadow-lg pb-10 py-2 px-4">
                    <div className="px-4 flex p-4 pb-10 gap-4 flex-col">
                        <Input
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email"
                            type="email"
                        />
                        <LoadingButton
                            onClick={handleEmailUpdate}
                            loading={isSettingEmail}
                            loadingText="Updating Email"
                        >
                            Update Email
                        </LoadingButton>
                    </div>
                    <div className="flex w-[130px] mx-auto px-4 flex-col">
                        <Logout />
                    </div>
                </div>
                <Modal show={waitingForEmailVerification} setShow={() => {}}>
                    <div className="bg-white flex flex-col p-8 rounded-lg">
                        <p className="font-medium">
                            A verification email has been sent to your email address. Please verify
                            your email to continue.
                        </p>
                        <div className="text-center bg-slate-100 mx-16 rounded-md p-4 mt-4">
                            <span>Checking verification</span> <Spinner />
                        </div>
                        <p className="text-sm text-center mt-4">
                            If logged out, please log back in to continue
                        </p>
                    </div>
                </Modal>
            </div>
            <ToastBox />
        </div>
    );
};

export default AddAccountEmail;
